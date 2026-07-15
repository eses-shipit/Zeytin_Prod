import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeliveryDto, CreateLiquidationDto, CreatePaymentDto } from "./dto/transaction.dto";

/**
 * Bakiye düşen her işlem "koşullu UPDATE" ile yapılır: kontrol WHERE içindedir.
 *
 * Eskiden desen şuydu — bakiyeyi oku, JS'te karşılaştır, sonra decrement et.
 * $transaction içinde olması bunu kurtarmıyordu: PostgreSQL'in varsayılan
 * READ COMMITTED seviyesinde predicate yeniden değerlendirilmez. 100 kg
 * bakiyeye karşı eşzamanlı iki 60 kg teslimat ikisi de 100 okur, ikisi de
 * kontrolü geçer, ikisi de düşer ve bakiye -20'ye iner.
 *
 * `UPDATE ... WHERE id = ? AND oliveOilBalance >= ?` tek ifadedir: ikinci
 * işlem satır kilidinde bekler, kilit çözülünce satırı YENİDEN okur ve
 * koşulu tekrar değerlendirir (EvaluatePlanQual), eşleşmez, count = 0 döner.
 * Veritabanındaki CHECK kısıtları da son savunma hattı olarak durur.
 */
@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Yağ Teslimatı (Delivery)
  async createDelivery(customerId: string, dto: CreateDeliveryDto) {
    const amountKg = this.toKg(dto.amountKg);

    return this.prisma.$transaction(async (tx) => {
      if (dto.tankId) {
        const tankUpdated = await tx.stockTank.updateMany({
          where: { id: dto.tankId, currentLevel: { gte: amountKg } },
          data: { currentLevel: { decrement: amountKg } },
        });
        if (tankUpdated.count === 0) {
          await this.assertTankExists(tx, dto.tankId);
          throw new BadRequestException("Tankta yeterli yağ yok.");
        }
      }

      const customerUpdated = await tx.customer.updateMany({
        where: { id: customerId, oliveOilBalance: { gte: amountKg } },
        data: { oliveOilBalance: { decrement: amountKg } },
      });
      if (customerUpdated.count === 0) {
        await this.assertCustomerExists(tx, customerId);
        throw new BadRequestException("Yetersiz yağ bakiyesi.");
      }

      return tx.transaction.create({
        data: {
          customerId,
          type: "OIL_OUT",
          amountKg,
          tankId: dto.tankId,
          description: dto.description || "Yağ teslimatı",
        },
      });
    });
  }

  // 2. Bozdurma (Liquidation)
  async createLiquidation(customerId: string, dto: CreateLiquidationDto) {
    const amountKg = this.toKg(dto.amountKg);
    const unitPrice = new Prisma.Decimal(dto.unitPrice);
    // Tutar kuruşa yuvarlanarak saklanır; aksi halde kayıtlı tutar ile
    // bakiyeye eklenen değer birbirini tutmaz.
    const totalTL = amountKg.mul(unitPrice).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    return this.prisma.$transaction(async (tx) => {
      // Yağ düşüşü ve TL alacağı tek ifadede: biri olup diğeri olmayamaz.
      const updated = await tx.customer.updateMany({
        where: { id: customerId, oliveOilBalance: { gte: amountKg } },
        data: {
          oliveOilBalance: { decrement: amountKg },
          balanceTL: { increment: totalTL },
        },
      });
      if (updated.count === 0) {
        await this.assertCustomerExists(tx, customerId);
        throw new BadRequestException("Yetersiz yağ bakiyesi.");
      }

      return tx.transaction.create({
        data: {
          customerId,
          type: "LIQUIDATION",
          amountKg,
          amountTL: totalTL,
          unitPrice,
          description: dto.description || "Yağ bozdurma",
        },
      });
    });
  }

  // 3. Tahsilat / Ödeme Alma (Payment)
  async createPayment(customerId: string, dto: CreatePaymentDto) {
    const amountTL = new Prisma.Decimal(dto.amountTL).toDecimalPlaces(
      2,
      Prisma.Decimal.ROUND_HALF_UP,
    );

    return this.prisma.$transaction(async (tx) => {
      // Borçtan fazla tahsilat kasıtlı olarak engellenmiyor: negatif balanceTL
      // avans/alacak demektir ve geçerli bir iş durumudur. Fabrikaların bir
      // kısmı avans almak istemeyebilir — bu, Faz 3'teki tenant politikasına
      // bağlanacak bir kural.
      await tx.customer.updateMany({
        where: { id: customerId },
        data: { balanceTL: { decrement: amountTL } },
      });
      await this.assertCustomerExists(tx, customerId);

      return tx.transaction.create({
        data: {
          customerId,
          type: "PAYMENT",
          amountTL,
          description: dto.description || "Tahsilat",
        },
      });
    });
  }

  // 4. Müşteri Hareketleri
  async getHistory(customerId: string, take = 100, skip = 0) {
    return this.prisma.transaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: Math.min(take, 500),
      skip,
    });
  }

  private toKg(value: number): Prisma.Decimal {
    return new Prisma.Decimal(value).toDecimalPlaces(3, Prisma.Decimal.ROUND_HALF_UP);
  }

  /**
   * count === 0 iki sebepten olabilir: kayıt yok (veya başka fabrikanın) ya da
   * bakiye yetersiz. Çağıran taraf doğru hatayı verebilsin diye ayırt edilir.
   */
  private async assertCustomerExists(tx: Prisma.TransactionClient, customerId: string) {
    const exists = await tx.customer.findFirst({
      where: { id: customerId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException("Müşteri bulunamadı.");
  }

  private async assertTankExists(tx: Prisma.TransactionClient, tankId: string) {
    const exists = await tx.stockTank.findFirst({ where: { id: tankId }, select: { id: true } });
    if (!exists) throw new NotFoundException("Tank bulunamadı.");
  }
}
