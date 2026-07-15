import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma, TenantPolicy, ServiceType, FeeBasis, PriceSource } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ContextService } from "../common/context.service";
import { UpdatePolicyDto } from "./dto/update-policy.dto";

/**
 * Fabrikanın çalışma kurallarını çözer ve uygular.
 *
 * Politika SÜRÜMLENİR: güncelleme mevcut satırı değiştirmez, yeni bir sürüm
 * yazar. Parti hesaplanırken yürürlükteki sürümün id'si partiye yazılır
 * (ProductionBatch.policyId), böylece kural sonradan değişse de o partinin
 * makbuzu aynı sayıları üretir.
 */
@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contextService: ContextService,
  ) {}

  /**
   * Yürürlükteki politikayı döndürür.
   *
   * Politikası olmayan fabrika (kayıt akışında yaratılmamışsa) için sessizce
   * varsayılan üretmek yerine hata veriyoruz: sessiz varsayılan, fabrikanın
   * hiç onaylamadığı bir hak yağ oranıyla para hesaplamak demek olurdu.
   */
  async getActivePolicy(tx: Prisma.TransactionClient | PrismaService = this.prisma): Promise<TenantPolicy> {
    const policy = await tx.tenantPolicy.findFirst({
      where: { isActive: true },
      orderBy: { version: "desc" },
    });

    if (!policy) {
      throw new NotFoundException(
        "Fabrika için tanımlı bir çalışma politikası yok. Ayarlar ekranından politikayı oluşturun.",
      );
    }
    return policy;
  }

  /**
   * Yeni fabrika için sürüm 1. Kayıt akışında çağrılır.
   * Varsayılanlar şemadaki @default değerleridir.
   */
  async createInitialPolicy(
    tenantId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<TenantPolicy> {
    return tx.tenantPolicy.create({
      data: { tenantId, version: 1, isActive: true },
    });
  }

  /**
   * Politikayı değiştirir: yeni sürüm yazar, eskisini pasife alır.
   *
   * Eski sürüm silinmez — ona bağlı partiler onun kurallarına göre hesaplandı
   * ve o kayıt ispat niteliğindedir.
   */
  async updatePolicy(dto: UpdatePolicyDto): Promise<TenantPolicy> {
    const tenantId = this.contextService.get("TENANT_ID");
    const userId = this.contextService.get("USER_ID");
    if (!tenantId) throw new BadRequestException("Fabrika bağlamı bulunamadı.");

    this.assertCoherent(dto);

    return this.prisma.$transaction(async (tx) => {
      const current = await this.getActivePolicy(tx);

      await tx.tenantPolicy.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Değiştirilmeyen alanlar bir önceki sürümden taşınır: yeni sürüm eksiksiz
      // bir anlık görüntüdür, öncekine referansla anlam kazanmaz.
      const { id, version, createdAt, effectiveFrom, isActive, createdBy, ...carried } = current;

      return tx.tenantPolicy.create({
        data: {
          ...carried,
          ...this.definedFieldsOf(dto),
          version: current.version + 1,
          isActive: true,
          effectiveFrom: new Date(),
          createdBy: userId ?? null,
        },
      });
    });
  }

  /** Bir fabrikanın politika geçmişi (denetim izi). */
  async getHistory(): Promise<TenantPolicy[]> {
    return this.prisma.tenantPolicy.findMany({ orderBy: { version: "desc" } });
  }

  /**
   * Parti için etkin hizmet bedelini belirler.
   *
   * Operatörün girdiği değer politikaya göre kabul edilir, sınırlanır veya
   * reddedilir. Bugüne kadar serviceAmount her partide serbestçe yazılıyordu:
   * fabrikanın standart oranı diye bir kavram yoktu.
   */
  resolveServiceFee(
    policy: TenantPolicy,
    requested?: { serviceType?: ServiceType; serviceAmount?: number },
  ): { serviceType: ServiceType; serviceAmount: Prisma.Decimal; basis: FeeBasis } {
    const overrideAttempted =
      requested?.serviceAmount !== undefined || requested?.serviceType !== undefined;

    if (overrideAttempted && !policy.allowServiceOverride) {
      throw new BadRequestException(
        "Bu fabrikada hizmet bedeli parti bazında değiştirilemez; fabrika varsayılanı uygulanır.",
      );
    }

    const serviceType = requested?.serviceType ?? policy.defaultServiceType;
    const serviceAmount =
      requested?.serviceAmount !== undefined
        ? new Prisma.Decimal(requested.serviceAmount)
        : policy.defaultServiceAmount;

    if (policy.minServiceAmount && serviceAmount.lt(policy.minServiceAmount)) {
      throw new BadRequestException(
        `Hizmet bedeli fabrika alt sınırının (${policy.minServiceAmount}) altında olamaz.`,
      );
    }
    if (policy.maxServiceAmount && serviceAmount.gt(policy.maxServiceAmount)) {
      throw new BadRequestException(
        `Hizmet bedeli fabrika üst sınırını (${policy.maxServiceAmount}) aşamaz.`,
      );
    }

    return { serviceType, serviceAmount, basis: policy.percentageBasis };
  }

  /** Emanet talebinin politikaya uygunluğu. */
  resolveEscrow(policy: TenantPolicy, requested?: boolean): boolean {
    const storeOil = requested ?? policy.escrowDefault;
    if (storeOil && !policy.escrowEnabled) {
      throw new BadRequestException("Bu fabrikada emanet (yağı bırakma) kapalı.");
    }
    return storeOil;
  }

  /** Çekim/bozdurma miktarının politikaya uygunluğu. */
  assertWithdrawalAllowed(policy: TenantPolicy, amountKg: Prisma.Decimal): void {
    if (policy.minWithdrawalKg && amountKg.lt(policy.minWithdrawalKg)) {
      throw new BadRequestException(
        `En az ${policy.minWithdrawalKg} kg çekebilirsiniz.`,
      );
    }
  }

  /**
   * Bozdurma birim fiyatını belirler.
   *
   * PER_TRANSACTION: operatörün yazdığı fiyat. Aynı gün iki müstahsile farklı
   * kur uygulanabilir; sorumluluk operatördedir.
   * DAILY_TABLE: fabrikanın o gün için tanımladığı fiyat zorunludur ve
   * operatörün yazdığı değer yok sayılmaz — çelişiyorsa reddedilir, çünkü
   * sessizce ezmek operatöre uyguladığını sandığı fiyatı uygulatmaz.
   */
  async resolveLiquidationPrice(
    policy: TenantPolicy,
    requestedUnitPrice?: number,
  ): Promise<Prisma.Decimal> {
    if (policy.liquidationPriceSource === PriceSource.PER_TRANSACTION) {
      if (requestedUnitPrice === undefined) {
        throw new BadRequestException("Birim fiyat zorunludur.");
      }
      return new Prisma.Decimal(requestedUnitPrice);
    }

    // DAILY_TABLE
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const daily = await this.prisma.dailyOilPrice.findFirst({
      where: { date: today },
    });

    if (!daily) {
      throw new BadRequestException(
        "Bugün için yağ fiyatı tanımlanmamış. Bozdurma yapmadan önce günün fiyatını girin.",
      );
    }

    if (
      requestedUnitPrice !== undefined &&
      !daily.pricePerKg.equals(new Prisma.Decimal(requestedUnitPrice))
    ) {
      throw new BadRequestException(
        `Bu fabrikada bozdurma günün fiyatından yapılır (${daily.pricePerKg}). Farklı bir fiyat girilemez.`,
      );
    }

    return daily.pricePerKg;
  }

  /** Günün yağ fiyatını belirler/günceller. */
  async setDailyPrice(pricePerKg: number, date?: Date): Promise<{ date: Date; pricePerKg: Prisma.Decimal }> {
    const tenantId = this.contextService.get("TENANT_ID");
    const userId = this.contextService.get("USER_ID");
    if (!tenantId) throw new BadRequestException("Fabrika bağlamı bulunamadı.");

    const day = date ? new Date(date) : new Date();
    day.setUTCHours(0, 0, 0, 0);

    return this.prisma.dailyOilPrice.upsert({
      where: { tenantId_date: { tenantId, date: day } },
      create: { tenantId, date: day, pricePerKg, createdBy: userId ?? null },
      update: { pricePerKg, createdBy: userId ?? null },
    });
  }

  /** Son N günün fiyat geçmişi. */
  async getDailyPrices(take = 30) {
    return this.prisma.dailyOilPrice.findMany({
      orderBy: { date: "desc" },
      take: Math.min(take, 365),
    });
  }

  /**
   * Kendi içinde çelişen politika kaydedilmesin: alanlar tek tek geçerli olup
   * birlikte anlamsız olabilir.
   */
  private assertCoherent(dto: UpdatePolicyDto): void {
    if (
      dto.minServiceAmount !== undefined &&
      dto.maxServiceAmount !== undefined &&
      dto.minServiceAmount > dto.maxServiceAmount
    ) {
      throw new BadRequestException("Hizmet bedeli alt sınırı üst sınırdan büyük olamaz.");
    }

    if (dto.escrowEnabled === false && dto.escrowDefault === true) {
      throw new BadRequestException(
        "Emanet kapalıyken varsayılan olarak emanete bırakılamaz.",
      );
    }

    if (
      dto.defaultServiceType === ServiceType.PERCENTAGE &&
      dto.defaultServiceAmount !== undefined &&
      dto.defaultServiceAmount >= 100
    ) {
      throw new BadRequestException(
        "Hak yağ oranı %100 veya üzeri olamaz: müstahsile yağ kalmaz.",
      );
    }
  }

  /** undefined alanlar önceki sürümü ezmesin. */
  private definedFieldsOf(dto: UpdatePolicyDto): Record<string, unknown> {
    return Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
  }
}
