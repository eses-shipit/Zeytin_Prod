import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { DrumSize } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ContextService } from "../common/context.service";
import { CreateDrumSizeDto, UpdateDrumSizeDto } from "./dto/drum-size.dto";

/**
 * Fabrikanın bidon kataloğu.
 *
 * Tenant.defaultDrumWeight yerine geçer: o tek bir Float'tı, hiçbir iş mantığı
 * okumuyordu ve iki ekranda farklı varsayılanla (50 / 60) gösteriliyordu.
 * Fabrikalar farklı boyut ve malzemede bidon kullanıyor.
 */
@Injectable()
export class DrumSizeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contextService: ContextService,
  ) {}

  async findAll(includeInactive = false): Promise<DrumSize[]> {
    return this.prisma.drumSize.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ isDefault: "desc" }, { capacityKg: "asc" }],
    });
  }

  async findOne(id: string): Promise<DrumSize> {
    const size = await this.prisma.drumSize.findFirst({ where: { id } });
    if (!size) throw new NotFoundException("Bidon tipi bulunamadı.");
    return size;
  }

  async create(dto: CreateDrumSizeDto): Promise<DrumSize> {
    this.assertTareBelowCapacity(dto.tareKg, dto.capacityKg);

    // tenantId'yi middleware zaten enjekte ediyor ama Prisma'nın tipi zorunlu
    // kılıyor; bağlamdan açıkça okumak cast'tan daha güvenli.
    const tenantId = this.contextService.get("TENANT_ID");
    if (!tenantId) throw new BadRequestException("Fabrika bağlamı bulunamadı.");

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) await this.clearDefault(tx);
      return tx.drumSize.create({ data: { ...dto, tenantId, tareKg: dto.tareKg ?? 0 } });
    });
  }

  async update(id: string, dto: UpdateDrumSizeDto): Promise<DrumSize> {
    const existing = await this.findOne(id);
    this.assertTareBelowCapacity(
      dto.tareKg ?? Number(existing.tareKg),
      dto.capacityKg ?? Number(existing.capacityKg),
    );

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) await this.clearDefault(tx);
      return tx.drumSize.update({ where: { id }, data: dto });
    });
  }

  /**
   * Kullanımdaki bidon tipi silinmez, pasife alınır.
   *
   * Silmek, o tipe bağlı geçmiş bidonların hangi kapasitede olduğunu
   * belirsizleştirirdi.
   */
  async deactivate(id: string): Promise<DrumSize> {
    await this.findOne(id);
    return this.prisma.drumSize.update({ where: { id }, data: { isActive: false } });
  }

  private async clearDefault(tx: any): Promise<void> {
    // Tek bir varsayılan olur: iki "varsayılan" tip formda hangisinin geleceğini
    // belirsiz bırakırdı.
    await tx.drumSize.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  private assertTareBelowCapacity(tareKg: number | undefined, capacityKg: number): void {
    if (tareKg !== undefined && tareKg >= capacityKg) {
      throw new BadRequestException(
        "Bidonun darası kapasitesinden küçük olmalı; aksi halde net yağ negatif çıkar.",
      );
    }
  }
}
