import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { TicketStatus } from "@prisma/client";
import { IdGeneratorService } from "../common/id-generator.service";

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: IdGeneratorService,
  ) {}

  async create(tenantId: string, dto: CreateTicketDto) {
    // Net, istemciden gelmez; burada hesaplanır. Bütün pay dağıtımının tek
    // girdisi olduğu için istemciye bırakılamaz.
    if (dto.tareKg > dto.grossKg) {
      throw new BadRequestException("Dara, brüt ağırlıktan büyük olamaz.");
    }
    const netKg = dto.grossKg - dto.tareKg;
    if (netKg === 0) {
      throw new BadRequestException("Net ağırlık 0 olamaz.");
    }

    // Generate Hybrid ID
    const publicId = await this.idGenerator.generate(tenantId, "WeighingTicket");

    return await this.prisma.weighingTicket.create({
      data: {
        ...dto,
        netKg,
        publicId,
        status: "PENDING",
      },
    });
  }

  async findRecent(tenantId: string) {
    return await this.prisma.weighingTicket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { 
        customer: true,
        product: true, 
      },
    });
  }

  async findAll(
    tenantId: string,
    filters: {
      search?: string;
      status?: TicketStatus;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
          { customer: { name: { contains: filters.search, mode: "insensitive" } } },
          { publicId: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return await this.prisma.weighingTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { 
          customer: true,
          product: true, 
      },
    });
  }
}
