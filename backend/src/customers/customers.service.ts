import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

/**
 * Tenant kapsamı PrismaService middleware'i tarafından uygulanır: her sorguya
 * bağlamdaki tenantId eklenir, bağlam yoksa sorgu reddedilir. Bu yüzden
 * servis metodları tenantId almaz.
 */
@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id } });
    // Başka bir fabrikanın müşterisi de burada "bulunamadı" olur: middleware
    // tenantId'yi eklediği için sorgu eşleşmez. Varlığını sızdırmamak için
    // ayrı bir 403 üretmiyoruz.
    if (!customer) throw new NotFoundException("Müşteri bulunamadı.");
    return customer;
  }

  async getSummary(id: string) {
    await this.findOne(id); // tenant kapsamı + varlık kontrolü

    const oliveSum = await this.prisma.weighingTicket.aggregate({
      where: { customerId: id },
      _sum: { netKg: true },
    });

    return {
      totalOliveKg: oliveSum._sum.netKg || 0,
    };
  }

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: dto, // tenantId middleware tarafından eklenir
    });
  }

  async update(id: string, dto: CreateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
