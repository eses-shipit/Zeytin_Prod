import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeliveryDto, CreateLiquidationDto, CreatePaymentDto } from "./dto/transaction.dto";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Yağ Teslimatı (Delivery)
  async createDelivery(tenantId: string, customerId: string, dto: CreateDeliveryDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Müşteri bakiyesi kontrol
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new BadRequestException("Müşteri bulunamadı.");
      
      if (customer.oliveOilBalance < dto.amountKg) {
        throw new BadRequestException("Yetersiz yağ bakiyesi.");
      }

      // Tank kontrolü ve düşüşü
      if (dto.tankId) {
        const tank = await tx.stockTank.findUnique({ where: { id: dto.tankId } });
        if (!tank) throw new BadRequestException("Tank bulunamadı.");
        
        if (tank.currentLevel < dto.amountKg) {
          throw new BadRequestException("Tankta yeterli yağ yok.");
        }

        await tx.stockTank.update({
          where: { id: dto.tankId },
          data: { currentLevel: { decrement: dto.amountKg } },
        });
      }

      // Müşteri bakiyesinden düş
      await tx.customer.update({
        where: { id: customerId },
        data: { oliveOilBalance: { decrement: dto.amountKg } },
      });

      // Transaction kaydı (tenantId manuel ekleniyor)
      return await tx.transaction.create({
        data: {
          customerId,
          type: "OIL_OUT",
          amountKg: dto.amountKg,
          tankId: dto.tankId,
          description: dto.description || "Yağ teslimatı",
          tenantId: tenantId, // Manuel ekleme
        },
      });
    });
  }

  // 2. Bozdurma (Liquidation)
  async createLiquidation(tenantId: string, customerId: string, dto: CreateLiquidationDto) {
    return await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new BadRequestException("Müşteri bulunamadı.");

      if (customer.oliveOilBalance < dto.amountKg) {
        throw new BadRequestException("Yetersiz yağ bakiyesi.");
      }

      const totalTL = dto.amountKg * dto.unitPrice;

      await tx.customer.update({
        where: { id: customerId },
        data: {
          oliveOilBalance: { decrement: dto.amountKg },
          balanceTL: { increment: totalTL },
        },
      });

      // Transaction kaydı (tenantId manuel ekleniyor)
      return await tx.transaction.create({
        data: {
          customerId,
          type: "LIQUIDATION",
          amountKg: dto.amountKg,
          amountTL: totalTL,
          unitPrice: dto.unitPrice,
          description: dto.description || "Yağ bozdurma",
          tenantId: tenantId, // Manuel ekleme
        },
      });
    });
  }

  // 3. Tahsilat / Ödeme Alma (Payment)
  async createPayment(tenantId: string, customerId: string, dto: CreatePaymentDto) {
    return await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new BadRequestException("Müşteri bulunamadı.");
      
      await tx.customer.update({
        where: { id: customerId },
        data: {
          balanceTL: { decrement: dto.amountTL },
        },
      });

      // Transaction kaydı (PAYMENT) (tenantId manuel ekleniyor)
      return await tx.transaction.create({
        data: {
          customerId,
          type: "PAYMENT",
          amountTL: dto.amountTL,
          description: dto.description || "Tahsilat",
          tenantId: tenantId, // Manuel ekleme
        },
      });
    });
  }

  // 4. Müşteri Hareketleri
  async getHistory(tenantId: string, customerId: string) {
    return await this.prisma.transaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }
}
