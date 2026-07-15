import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { CreateTicketMessageDto } from "./dto/create-ticket-message.dto";
import { TicketPriority, SupportTicketStatus, UserRole } from "@prisma/client";

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSupportTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        tenantId,
        subject: dto.subject,
        priority: dto.priority as TicketPriority,
        messages: {
          create: {
            message: dto.message,
            sender: "CUSTOMER",
          },
        },
      },
    });
  }

  async findAll(user: { tenantId?: string; role?: UserRole }, filters?: { status?: SupportTicketStatus; priority?: TicketPriority }) {
    // VERİ İZOLASYONU:
    // 1. SUPER_ADMIN -> tenant filtresi yok (hepsini görür)
    // 2. Normal kullanıcı/admin -> user.tenantId ile filtrelenir
    //
    // Rol artık çağıran taraftan sabit olarak değil, doğrulanmış bağlamdan
    // gelir; bu dalın açılması RolesGuard ile kısıtlıdır.
    if (user.role === UserRole.SUPER_ADMIN) {
        return this.prisma.supportTicket.findMany({
            where: {
                ...(filters?.status && { status: filters.status }),
                ...(filters?.priority && { priority: filters.priority }),
            },
            include: {
                tenant: { select: { name: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    if (!user.tenantId) {
        // Safety check: Non-super admin must have a tenantId
        return [];
    }

    return this.prisma.supportTicket.findMany({
      where: { 
          tenantId: user.tenantId,
          ...(filters?.status && { status: filters.status }), // Optional filters for tenant too
          ...(filters?.priority && { priority: filters.priority }),
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, tenantId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Destek talebi bulunamadı.");
    }

    return ticket;
  }

  /** ADMIN gönderiminde tenantId null'dır: talep, sahibi fabrikadan bağımsız yanıtlanır. */
  async addMessage(tenantId: string | null, ticketId: string, dto: CreateTicketMessageDto, sender: "CUSTOMER" | "ADMIN") {
    // Müşteri gönderiminde talebin sahipliği doğrulanır
    if (sender === "CUSTOMER") {
      const ticket = await this.findOne(tenantId!, ticketId);
      if (!ticket) throw new NotFoundException("Ticket not found");
      
      // Re-open ticket if closed and customer replies
      if (ticket.status === "RESOLVED") {
          await this.prisma.supportTicket.update({
              where: { id: ticketId },
              data: { status: "OPEN", resolvedAt: null }
          });
      }
    }

    return this.prisma.ticketMessage.create({
      data: {
        ticketId,
        message: dto.message,
        sender,
      },
    });
  }
  
  // Admin Methods - Merged into findAll logic above


  async updateStatus(id: string, status: SupportTicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    });
  }
  
  async getDashboardStats() {
      const tickets = await this.prisma.supportTicket.findMany({
          where: { status: 'RESOLVED', resolvedAt: { not: null } },
          select: { createdAt: true, resolvedAt: true }
      });
      
      let totalTime = 0;
      let slaCompliantCount = 0;
      
      tickets.forEach(t => {
          if (t.resolvedAt) {
              const diffMs = t.resolvedAt.getTime() - t.createdAt.getTime();
              const diffHours = diffMs / (1000 * 60 * 60);
              totalTime += diffHours;
              
              if (diffHours <= 24) slaCompliantCount++;
          }
      });
      
      const avgResolutionTime = tickets.length > 0 ? totalTime / tickets.length : 0;
      const slaComplianceRate = tickets.length > 0 ? (slaCompliantCount / tickets.length) * 100 : 100;
      
      const openTickets = await this.prisma.supportTicket.count({ where: { status: 'OPEN' } });
      const urgentTickets = await this.prisma.supportTicket.count({ where: { priority: 'URGENT', status: 'OPEN' } });
      
      return {
          avgResolutionTime: parseFloat(avgResolutionTime.toFixed(1)),
          slaComplianceRate: parseFloat(slaComplianceRate.toFixed(1)),
          openTickets,
          urgentTickets
      };
  }
}

