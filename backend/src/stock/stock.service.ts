import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStockTankDto } from "./dto/create-stock-tank.dto";

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateStockTankDto) {
    // İsim kontrolü
    const existing = await this.prisma.stockTank.findFirst({
      where: { name: dto.name }, // Middleware tenantId ekleyecek
    });
    if (existing) throw new ConflictException("Bu isimde bir tank zaten var.");

    return await this.prisma.stockTank.create({
      data: {
        ...dto,
        acidRatio: dto.acidRatio || undefined,
      },
    });
  }

  async findAll(tenantId: string) {
    return await this.prisma.stockTank.findMany({
      orderBy: { name: "asc" },
    });
  }

  async update(tenantId: string, id: string, dto: Partial<CreateStockTankDto>) {
    const tank = await this.prisma.stockTank.findUnique({ where: { id } });
    if (!tank) throw new NotFoundException("Tank bulunamadı.");

    // İsim değişiyorsa kontrol et
    if (dto.name && dto.name !== tank.name) {
      const existing = await this.prisma.stockTank.findFirst({
        where: { name: dto.name },
      });
      if (existing) throw new ConflictException("Bu isimde bir tank zaten var.");
    }

    return await this.prisma.stockTank.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.currentLevel !== undefined && { currentLevel: dto.currentLevel }),
        ...(dto.type && { type: dto.type }),
        ...(dto.acidRatio !== undefined && { acidRatio: dto.acidRatio || null }),
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const tank = await this.prisma.stockTank.findUnique({ where: { id } });
    if (!tank) throw new NotFoundException("Tank bulunamadı.");

    await this.prisma.stockTank.delete({ where: { id } });
    return { success: true, message: "Tank silindi." };
  }
}
