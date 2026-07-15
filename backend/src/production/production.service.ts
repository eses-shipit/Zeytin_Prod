import { Injectable, BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { Prisma, } from "@prisma/client";
import { kg, tl, splitProportionally, KG_DP, TL_DP, ROUND } from "../common/money";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductionBatchDto, ServiceType } from "./dto/create-production-batch.dto";
import { SmsService } from "../sms/sms.service";
import { IdGeneratorService } from "../common/id-generator.service";
import { AuditService } from "../audit/audit.service";
import { ContextService } from "../common/context.service";

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly idGenerator: IdGeneratorService,
    private readonly auditService: AuditService,
    private readonly contextService: ContextService,
  ) {}

  async processBatch(tenantId: string, dto: CreateProductionBatchDto) {
    let tenantName = "ZEYTINSAAS";
    
    // Fetch tenant name for SMS
    try {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (tenant) tenantName = tenant.name;
    } catch (e) {
      // Ignore if tenant fetch fails
    }

    // 1. Validate Tickets
    const tickets = await this.prisma.weighingTicket.findMany({
      where: {
        id: { in: dto.ticketIds },
        status: "PENDING",
      },
      include: {
        customer: true,
      }
    });

    if (tickets.length !== dto.ticketIds.length) {
      throw new BadRequestException("Bazı fişler bulunamadı veya zaten işlenmiş.");
    }

    const totalOliveKg = tickets.reduce((sum, t) => sum + t.netKg, 0);
    if (totalOliveKg === 0) {
        throw new BadRequestException("Toplam zeytin miktarı 0 olamaz.");
    }
    if (dto.totalOilKg <= 0) {
        throw new BadRequestException("Çıkan yağ 0 olamaz.");
    }

    const totalOliveKgD = kg(totalOliveKg);
    const totalOilKgD = kg(dto.totalOilKg);
    const serviceAmountD = new Prisma.Decimal(dto.serviceAmount);

    // Çıkan yağ, giren zeytinden fazla olamaz: fiziksel olarak imkânsız ve
    // pratikte hep veri giriş hatasıdır. Kontrol yokken 100 kg zeytine 10000 kg
    // yağ girilebiliyor ve bakiyeye o şekilde yazılıyordu.
    if (totalOilKgD.gt(totalOliveKgD)) {
        throw new BadRequestException(
            "Çıkan yağ, giren zeytinden fazla olamaz. Girilen değerleri kontrol edin.",
        );
    }

    const yieldRatio = totalOliveKgD.div(totalOilKgD).toDecimalPlaces(3, ROUND); // 1/X formatı

    // 2. Calculate Shares/Fees
    const { factoryShareKg, customerShareKg, totalPrice } = this.calculateServiceFee(
        dto.serviceType,
        serviceAmountD,
        totalOliveKgD,
        totalOilKgD
    );

    // Bidon seçimi sadece müşteri yağı emanete bırakılmadığında zorunlu
    // Çünkü emanete bırakıldığında yağ tanka gidiyor, bidon kullanılmıyor
    let availableDrums: any[] = [];
    if (!dto.storeCustomerOil) {
      if (!dto.drumIds || dto.drumIds.length === 0) {
        throw new BadRequestException("Üretim tamamlanırken en az bir bidon seçilmelidir.");
      }

      availableDrums = await this.prisma.drum.findMany({
        where: {
          id: { in: dto.drumIds },
          status: "AVAILABLE",
        },
      });

      if (availableDrums.length !== dto.drumIds.length) {
        throw new BadRequestException("Seçilen bidonlardan bazıları uygun değil veya bulunamadı.");
      }
    }

    // 3. Generate Public ID
    const publicId = await this.idGenerator.generate(tenantId, "ProductionBatch");

    // 4. Transaction (Atomic Operation)
    return await this.prisma.$transaction(async (tx) => {
      // Create Production Batch
      const batch = await tx.productionBatch.create({
        data: {
          publicId,
          totalOliveKg,
          totalOilKg: totalOilKgD,
          yieldRatio,
          acidRatio: dto.acidRatio,
          factoryShareKg,
          customerShareKg,
          status: "COMPLETED",
          processTemp: dto.processTemp,
          lineId: dto.lineId,
          filtration: dto.filtration ?? false,
          serviceType: dto.serviceType,
          serviceAmount: serviceAmountD,
          totalPrice: totalPrice,
          storedInEscrow: dto.storeCustomerOil ?? false,
          tankId: dto.tankId,
          tickets: {
            connect: tickets.map((t) => ({ id: t.id })),
          },
          ...(dto.drumIds && dto.drumIds.length > 0 && {
            drums: {
              connect: dto.drumIds.map((id) => ({ id })),
            },
          }),
        },
      });

      // Update Tickets Status
      await tx.weighingTicket.updateMany({
        where: { id: { in: dto.ticketIds } },
        data: { status: "COMPLETED" },
      });

      // Update Tank Stock (If selected)
      if (dto.tankId) {
          // Emanette müşterinin payı da tankta bekler; peşin teslimde yalnızca
          // fabrikanın hak yağı tanka girer.
          const amountToAdd = dto.storeCustomerOil ? totalOilKgD : factoryShareKg;

          await tx.stockTank.update({
              where: { id: dto.tankId },
              data: {
                  currentLevel: { increment: amountToAdd }
              }
          });
      }

      // Financial Transactions & Balances
      //
      // Paylar tek tek `toplam * (netKg / totalOliveKg)` ile değil, kalanı son
      // fişe veren bir dağıtımla hesaplanır: aksi halde her pay ayrı yuvarlandığı
      // için payların toplamı partinin toplamına eşit çıkmıyordu.
      const weights = tickets.map((t) => t.netKg);
      const oilParts = splitProportionally(totalOilKgD, weights, KG_DP);
      const customerOilParts = splitProportionally(customerShareKg, weights, KG_DP);
      const factoryOilParts = splitProportionally(factoryShareKg, weights, KG_DP);
      const costParts = splitProportionally(totalPrice, weights, TL_DP);

      for (const [index, ticket] of tickets.entries()) {
        const ticketOil = oilParts[index];
        const ticketCustomerOil = customerOilParts[index];
        const ticketFactoryOil = factoryOilParts[index];
        const ticketCost = costParts[index];

        // A. Add Oil to Customer Balance (Virtual)
        await tx.customer.update({
            where: { id: ticket.customerId },
            data: {
                oliveOilBalance: { increment: ticketCustomerOil }
            }
        });

        // B. Record OIL_IN transaction (Production Result)
        await tx.transaction.create({
            data: {
                customerId: ticket.customerId,
                type: "OIL_IN",
                amountKg: ticketCustomerOil,
                description: `Üretim (Parti #${publicId}) - Pay: ${ticketOil.toFixed(2)}kg`,
                batchId: batch.id
            }
        });

        // C. Handle Service Fee (Debt or Oil Deduction)
        if (dto.serviceType === ServiceType.PERCENTAGE) {
             await tx.transaction.create({
                data: {
                    customerId: ticket.customerId,
                    type: "SERVICE_FEE",
                    amountKg: ticketFactoryOil,
                    description: `Sıkım Bedeli (%${dto.serviceAmount} Yağ) - Parti #${publicId}`,
                    batchId: batch.id
                }
             });
        } else {
            // CASH_PER_KG: Add debt to customer
            await tx.customer.update({
                where: { id: ticket.customerId },
                data: {
                    balanceTL: { increment: ticketCost } 
                }
            });

            await tx.transaction.create({
                data: {
                    customerId: ticket.customerId,
                    type: "SERVICE_FEE",
                    amountTL: ticketCost,
                    description: `Sıkım Bedeli (${dto.serviceAmount} TL/kg) - Parti #${publicId}`,
                    batchId: batch.id
                }
            });
        }
        
        // D. If Customer did NOT leave oil in escrow
        if (!dto.storeCustomerOil) {
            await tx.customer.update({
                where: { id: ticket.customerId },
                data: {
                    oliveOilBalance: { decrement: ticketCustomerOil }
                }
            });

            await tx.transaction.create({
                data: {
                    customerId: ticket.customerId,
                    type: "OIL_OUT",
                    amountKg: ticketCustomerOil,
                    description: `Üretim Sonrası Teslimat (Peşin) - Parti #${publicId}`,
                    batchId: batch.id
                }
            });
        }
      }

      // Update drum status to FILLED (sadece bidon seçildiyse)
      if (dto.drumIds && dto.drumIds.length > 0) {
        await tx.drum.updateMany({
          where: { id: { in: dto.drumIds } },
          data: { status: "FILLED", currentHolderId: null },
        });
      }

      // Send SMS
      let smsSent = false;
      try {
        const uniqueCustomers = new Map();
        tickets.forEach(t => {
            if (t.customer.phone && !uniqueCustomers.has(t.customerId)) {
                uniqueCustomers.set(t.customerId, t.customer);
            }
        });

        for (const customer of uniqueCustomers.values()) {
            const customerTotalOlive = tickets.filter(t => t.customerId === customer.id).reduce((s, t) => s + t.netKg, 0);
            const customerSpecificOil = customerShareKg
                .mul(customerTotalOlive)
                .div(totalOliveKgD)
                .toDecimalPlaces(KG_DP, ROUND);

            const message = `Sn. ${customer.name}, uretim tamamlandi. Giren: ${customerTotalOlive}kg, Cikan: ${customerSpecificOil.toFixed(1)}kg, Randiman: 1/${yieldRatio.toFixed(1)}, Asit: ${dto.acidRatio ?? "-"} . Fabrika: ${tenantName}`;
             
             await this.smsService.queueSms(customer.phone, message);
             
             // Log SMS send to AuditLog
             const userId = this.contextService.get("USER_ID");
             await this.auditService.logAction(
               tenantId,
               userId || null,
               "SMS_SENT",
               batch.id,
               { customerId: customer.id, customerPhone: customer.phone, message },
             );
             
             smsSent = true;
        }
      } catch (err) {
          this.logger.error(
            `SMS kuyruğa alınamadı (batchId=${batch.id}): ${
              err instanceof Error ? err.message : "bilinmeyen hata"
            }`,
          );
      }

      return { ...batch, customerShareKg, factoryShareKg, smsSent };
    });
  }

  async resendSms(tenantId: string, batchId: string) {
      let tenantName = "ZEYTINSAAS";
      
      try {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (tenant) tenantName = tenant.name;
      } catch (e) {}

      const batch = await this.prisma.productionBatch.findUnique({
          where: { id: batchId },
          include: {
              tickets: {
                  include: { customer: true }
              }
          }
      });

      if (!batch) throw new NotFoundException("Parti bulunamadı.");

      // Paylar partide saklı; yeniden hesaplanmıyor. Yeniden hesaplamak, o gün
      // müşteriye bildirilen ve bakiyeye yazılan değerden farklı bir sonuç
      // üretebilirdi (ör. hizmet bedeli kuralı sonradan değişirse).
      const totalOliveKgD = kg(batch.totalOliveKg);
      const customerShareKg = batch.customerShareKg;

      let sentCount = 0;
      const uniqueCustomers = new Map();
      batch.tickets.forEach(t => {
          if (t.customer.phone && !uniqueCustomers.has(t.customerId)) {
              uniqueCustomers.set(t.customerId, t.customer);
          }
      });

      for (const customer of uniqueCustomers.values()) {
          const customerTotalOlive = batch.tickets.filter(t => t.customerId === customer.id).reduce((s, t) => s + t.netKg, 0);
          const customerSpecificOil = customerShareKg
              .mul(customerTotalOlive)
              .div(totalOliveKgD)
              .toDecimalPlaces(KG_DP, ROUND);
          const message = `Sn. ${customer.name}, uretim tamamlandi. Giren: ${customerTotalOlive}kg, Cikan: ${customerSpecificOil.toFixed(1)}kg, Randiman: 1/${batch.yieldRatio.toFixed(1)}, Asit: ${batch.acidRatio ?? "-"}. Fabrika: ${tenantName}`;
           
           await this.smsService.queueSms(customer.phone, message);
           
           // Log SMS resend to AuditLog
           const userId = this.contextService.get("USER_ID");
           await this.auditService.logAction(
             tenantId,
             userId || null,
             "SMS_SENT",
             batchId,
             { customerId: customer.id, customerPhone: customer.phone, message, isResend: true },
           );
           
           sentCount++;
      }

      return { success: sentCount > 0, message: `${sentCount} müşteriye SMS tekrar gönderildi.` };
  }

  async getPendingTickets(tenantId: string) {
    return await this.prisma.weighingTicket.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        customer: {
          select: { name: true },
        },
      },
    });
  }

  async getCompletedBatches(tenantId: string, limit = 20) {
    let tenantName = "ZEYTINSAAS";
    
    try {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (tenant) tenantName = tenant.name;
    } catch (e) {}

    const batches = await this.prisma.productionBatch.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        tickets: {
          include: {
            customer: {
              select: { name: true, phone: true },
            },
            product: true,
          },
        },
        tank: {
          select: { name: true },
        },
      },
    });

    return batches.map(batch => ({
      ...batch,
      factoryName: tenantName
    }));
  }

  async getBatchDetails(tenantId: string, batchId: string) {
    const batch = await this.prisma.productionBatch.findUnique({
      where: { id: batchId },
      include: {
        tickets: {
          include: {
            customer: {
              select: { name: true, phone: true },
            },
            product: true,
          },
        },
        tank: {
          select: { name: true },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException("Üretim partisi bulunamadı.");
    }

    return batch;
  }

  async deliverDrums(tenantId: string, productionId: string, selectedDrumIds?: string[]) {
    const batch = await this.prisma.productionBatch.findUnique({
      where: { id: productionId },
      include: {
        drums: true,
        tickets: {
          include: { customer: true },
        },
      },
    });

    if (!batch) throw new NotFoundException("Üretim bulunamadı.");
    if (batch.status === "DELIVERED") {
      throw new BadRequestException("Bu üretim zaten teslim edildi.");
    }

    // Emanete bırakılmamış partide müşterinin yağı üretim sırasında zaten
    // teslim edilmiş ve bakiyeden düşülmüştür (processBatch, D adımı). Burada
    // ikinci kez düşmek müşterinin hiç sahip olmadığı yağı borç yazmak olur.
    // Eski kodda tek koruma `status === "DELIVERED"` idi ama processBatch
    // partiyi COMPLETED bırakıyordu, dolayısıyla bu çağrı geçiyordu.
    if (!batch.storedInEscrow) {
      throw new BadRequestException(
        "Bu partinin yağı üretim sırasında peşin teslim edildi; tekrar teslim edilemez.",
      );
    }

    const primaryCustomerId = batch.tickets[0]?.customerId ?? null;
    const hasDrums = batch.drums && batch.drums.length > 0;
    const hasSelectedDrums = selectedDrumIds && selectedDrumIds.length > 0;

    // Eğer bidon varsa mevcut bidonları kullan, yoksa seçilen bidonları kullan
    // (Emanete bırakılan ürünler için teslim sırasında bidon seçilebilir)
    const drumsToDeliver = hasDrums 
      ? batch.drums.map((d) => d.id)
      : (hasSelectedDrums ? selectedDrumIds! : []);

    // Seçilen bidonların AVAILABLE olduğunu kontrol et
    if (hasSelectedDrums && !hasDrums) {
      const availableDrums = await this.prisma.drum.findMany({
        where: {
          id: { in: selectedDrumIds! },
          status: "AVAILABLE",
        },
      });

      if (availableDrums.length !== selectedDrumIds!.length) {
        throw new BadRequestException("Seçilen bidonlardan bazıları uygun değil veya bulunamadı.");
      }
    }

    // Müşteri paylarını hesapla (her ticket için)
    const totalOliveKg = batch.totalOliveKg;
    const totalOilKg = batch.totalOilKg;
    const customerShareKg = batch.customerShareKg;
    const factoryShareKg = batch.factoryShareKg;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Partiyi teslim edilmiş olarak "sahiplen".
      //
      // Koşul WHERE içinde: yukarıdaki status kontrolü transaction'ın DIŞINDA
      // kaldığı için eşzamanlı iki çağrı ikisi de geçip bakiyeyi iki kez
      // düşürebiliyordu. Bu tek ifadeyle yalnızca biri kazanır.
      const claimed = await tx.productionBatch.updateMany({
        where: { id: productionId, status: { not: "DELIVERED" } },
        data: { status: "DELIVERED" },
      });
      if (claimed.count === 0) {
        throw new BadRequestException("Bu üretim zaten teslim edildi.");
      }

      // 2. Bidonları batch'e bağla ve güncelle (eğer varsa)
      if (drumsToDeliver.length > 0) {
        // Bidonları batch'e bağla (eğer daha önce bağlı değilse)
        if (!hasDrums && hasSelectedDrums) {
          await tx.productionBatch.update({
            where: { id: productionId },
            data: {
              drums: {
                connect: selectedDrumIds!.map((id) => ({ id })),
              },
            },
          });
        }

        // Bidonları müşteriye teslim et
        await tx.drum.updateMany({
          where: { id: { in: drumsToDeliver } },
          data: { status: "WITH_CUSTOMER", currentHolderId: primaryCustomerId },
        });
      }

      // 3. Her müşteri için emanetteki yağı düş ve transaction kaydı oluştur
      const customerOilParts = splitProportionally(
        customerShareKg,
        batch.tickets.map((t) => t.netKg),
        KG_DP,
      );

      for (const [index, ticket] of batch.tickets.entries()) {
        const ticketCustomerOil = customerOilParts[index];

        // Müşteri yağ bakiyesinden düş. Koşul WHERE içinde: emanetteki yağ bu
        // arada başka bir yoldan (bozdurma/teslimat) azalmış olabilir.
        const debited = await tx.customer.updateMany({
          where: { id: ticket.customerId, oliveOilBalance: { gte: ticketCustomerOil } },
          data: { oliveOilBalance: { decrement: ticketCustomerOil } },
        });
        if (debited.count === 0) {
          throw new BadRequestException(
            `Müşterinin emanet bakiyesi yetersiz (${ticketCustomerOil.toFixed(3)} kg gerekiyor).`,
          );
        }

        await tx.transaction.create({
          data: {
            customerId: ticket.customerId,
            type: "OIL_OUT",
            amountKg: ticketCustomerOil,
            description: `Üretim Sonrası Teslimat - Parti #${batch.publicId || batch.id}`,
            batchId: batch.id,
          },
        });
      }

      // 4. Fiziksel tank stoğundan da düş.
      //
      // Emanette müşterinin payı tanka giriyordu (processBatch) ama teslimatta
      // buradan hiç düşülmüyordu: transactions.createDelivery düşerken bu yol
      // düşmediği için emanetten teslim edilen yağ tank stoğunda sonsuza kadar
      // sayılı kalıyordu. İki teslimat yolu artık aynı şeyi yapıyor.
      if (batch.tankId) {
        const tankDebited = await tx.stockTank.updateMany({
          where: { id: batch.tankId, currentLevel: { gte: customerShareKg } },
          data: { currentLevel: { decrement: customerShareKg } },
        });
        if (tankDebited.count === 0) {
          throw new BadRequestException(
            "Tankta yeterli yağ yok; teslimat kaydı stokla uyuşmuyor.",
          );
        }
      }

      // 4. Güncellenmiş bidon bilgilerini al
      const deliveredDrums = drumsToDeliver.length > 0
        ? await tx.drum.findMany({
            where: { id: { in: drumsToDeliver } },
            select: { code: true, capacity: true, type: true },
          })
        : [];

      const receipt = {
        productionId: batch.publicId || batch.id,
        deliveredAt: new Date(),
        drums: deliveredDrums,
        customers: batch.tickets.map((t) => t.customer?.name).filter(Boolean),
        isStoredOil: drumsToDeliver.length === 0, // Emanete bırakılan yağ (bidon yok)
      };

      return {
        success: true,
        receipt,
        receiptPdf: "PDF generation placeholder",
      };
    });
  }

  async returnDrums(drumIds: string[]) {
    if (!drumIds || drumIds.length === 0) {
      throw new BadRequestException("İade için en az bir bidon seçin.");
    }

    await this.prisma.drum.updateMany({
      where: { id: { in: drumIds } },
      data: { status: "AVAILABLE", currentHolderId: null },
    });

    return { success: true, updated: drumIds.length };
  }

  async listDrums(status?: "AVAILABLE" | "WITH_CUSTOMER") {
    return this.prisma.drum.findMany({
      where: status ? { status } : undefined,
      include: {
        currentHolder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { code: "asc" },
    });
  }

  async createDrum(
    tenantId: string,
    data: { code: string; type: "PLASTIC" | "CHROME" | "TIN"; capacity: number },
  ) {
    if (!data.code || !data.type || !data.capacity) {
      throw new BadRequestException("Kod, tür ve kapasite zorunludur.");
    }

    if (!tenantId) {
      throw new BadRequestException("Fabrika bilgisi bulunamadı. Lütfen giriş yapıp bir fabrika seçin.");
    }

    try {
      return await this.prisma.drum.create({
        data: {
          code: data.code,
          type: data.type,
          capacity: data.capacity,
          status: "AVAILABLE",
          tenant: { connect: { id: tenantId } },
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException("Bu kodla kayıtlı bir bidon zaten var.");
      }
      throw error;
    }
  }

  /**
   * Hizmet bedelini hesaplar.
   *
   * Dikkat — iki modelin matrahı farklıdır ve bu bilinçli bir iş kuralıdır:
   *   PERCENTAGE  : ÇIKAN YAĞIN yüzdesi kadar yağ alınır (hak yağ).
   *   CASH_PER_KG : GİREN ZEYTİNİN kilosu başına para alınır.
   *
   * Yani oran değişmese bile randıman düştüğünde yüzde modelinde fabrikanın
   * geliri düşer, nakit modelinde düşmez. Fabrikalar arasındaki asıl tercih
   * farkı burada; Faz 3'te tenant politikasına bağlanacak.
   */
  private calculateServiceFee(
    type: ServiceType,
    amount: Prisma.Decimal,
    totalOliveKg: Prisma.Decimal,
    totalOilKg: Prisma.Decimal,
  ) {
    let factoryShareKg = kg(0);
    let totalPrice = tl(0);

    if (type === ServiceType.PERCENTAGE) {
      factoryShareKg = kg(totalOilKg.mul(amount).div(100));
    } else {
      // CASH_PER_KG
      totalPrice = tl(totalOliveKg.mul(amount));
    }

    // Çıkarma yuvarlanmış değer üzerinden: paylar toplamı her zaman
    // totalOilKg'ye birebir eşit kalsın.
    const customerShareKg = kg(totalOilKg.sub(factoryShareKg));

    return { factoryShareKg, customerShareKg, totalPrice };
  }
}
