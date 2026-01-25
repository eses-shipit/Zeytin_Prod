import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto, UpdateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        isActive: dto.isActive,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      orderBy: { name: "asc" },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
