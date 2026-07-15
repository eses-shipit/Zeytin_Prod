import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaClient, Prisma, UserRole } from "@prisma/client";
import { ContextService } from "../common/context.service";

/**
 * `tenantId` alanı olan modeller DMMF'ten türetilir; elle liste tutulmaz.
 * Şemaya yeni bir tenant modeli eklendiğinde otomatik kapsama girer — eski elle
 * yazılan liste model eklemeyi unutmaya açıktı.
 */
function deriveTenantModels(): Set<string> {
  return new Set(
    Prisma.dmmf.datamodel.models
      .filter((m) => m.fields.some((f) => f.name === "tenantId"))
      .map((m) => m.name),
  );
}

/**
 * Tenant kapsamı DIŞINDA bırakılan modeller.
 *
 * `User` ve `License` şemada `tenantId` taşır ama global erişim gerektirir:
 * login e-postayla kullanıcı arar ve o noktada henüz tenant bağlamı yoktur;
 * kayıt akışı da lisans kodunu global arar. İkisine yalnızca @Public auth
 * route'ları veya SUPER_ADMIN korumalı route'lar üzerinden erişilir.
 *
 * TODO: auth.service'teki global aramaları `runAsSystem` ile sarmalayıp bu iki
 * modeli de kapsama al.
 */
const UNSCOPED_MODELS = new Set<string>(["User", "License"]);

/** `where` enjekte edilerek kapsanan operasyonlar. */
const FILTER_ACTIONS: ReadonlySet<string> = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  // aggregate/groupBy eski allowlist'te YOKTU: her fabrikanın panosu diğer
  // fabrikaların ciro ve alacak toplamlarını görüyordu.
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
]);

/** `data` enjekte edilerek kapsanan operasyonlar. */
const CREATE_ACTIONS: ReadonlySet<string> = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly tenantModels: Set<string>;

  constructor(private readonly contextService: ContextService) {
    super();
    this.tenantModels = deriveTenantModels();
    for (const excluded of UNSCOPED_MODELS) this.tenantModels.delete(excluded);

    // Middleware constructor'da kurulur. Daha önce onModuleInit içindeki
    // try/catch'in içindeydi: $connect() hata verirse middleware hiç kurulmuyor,
    // hata da yutulduğu için uygulama yine ayağa kalkıyor ve tenant izolasyonu
    // tamamen devre dışı kalıyordu.
    this.$use(async (params, next) => this.scopeToTenant(params, next));
  }

  async onModuleInit() {
    // Bağlantı hatası artık yutulmuyor: izolasyonsuz bir uygulamanın ayakta
    // kalmasındansa hiç başlamaması gerekir.
    await this.$connect();
    this.logger.log("Veritabanı bağlantısı başarılı.");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async scopeToTenant(
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<unknown>,
  ): Promise<unknown> {
    if (!params.model || !this.tenantModels.has(params.model)) {
      return next(params);
    }

    // HTTP isteği dışındaki işler (seed, bakım görevleri) için açık kaçış yolu.
    if (this.contextService.get("SYSTEM_TASK") === true) {
      return next(params);
    }

    const tenantId = this.contextService.get("TENANT_ID") as string | undefined;
    const userRole = this.contextService.get("USER_ROLE") as UserRole | undefined;

    if (tenantId) {
      this.injectTenant(params, tenantId);
      return next(params);
    }

    // --- Buradan aşağısı: tenant bağlamı YOK ---

    if (userRole === UserRole.SUPER_ADMIN) {
      // Platform operatörünün global paneli. Kimliği JwtAuthGuard doğruladı,
      // rolü RolesGuard kontrol etti; bu bilinçli bir yetkidir. Yazma yine de
      // sahipsiz kayıt üretemez: tenantId ya bağlamdan ya da açıkça gelmeli.
      if (CREATE_ACTIONS.has(params.action) && !this.createDataCarriesTenant(params)) {
        throw new BadRequestException(
          `${params.model} oluşturulurken Fabrika (Tenant) belirtilmedi. Lütfen bir fabrika seçin.`,
        );
      }
      return next(params);
    }

    // Fail-closed. Eski kod burada `if (tenantId && ...)` ile hiçbir filtre
    // uygulamadan sorguyu geçiriyordu; token'sız `GET /customers` bütün
    // fabrikaların müşterilerini döndürüyordu.
    throw new ForbiddenException("Tenant bağlamı olmadan veri erişimi reddedildi.");
  }

  /**
   * Bağlamda tenant yokken (SUPER_ADMIN) yazma isteğinin sahibini açıkça
   * belirtip belirtmediğini söyler. Boş string sahip sayılmaz.
   */
  private createDataCarriesTenant(params: Prisma.MiddlewareParams): boolean {
    const data = params.args?.data;
    if (!data) return false;

    const owned = (item: any) => Boolean(item?.tenantId) || Boolean(item?.tenant);
    return Array.isArray(data) ? data.length > 0 && data.every(owned) : owned(data);
  }

  private injectTenant(params: Prisma.MiddlewareParams, tenantId: string): void {
    params.args ??= {};

    if (FILTER_ACTIONS.has(params.action)) {
      params.args.where = { ...(params.args.where ?? {}), tenantId };
      return;
    }

    if (CREATE_ACTIONS.has(params.action)) {
      const data = params.args.data;
      if (data) {
        params.args.data = Array.isArray(data)
          ? data.map((item) => this.withTenant(item, tenantId))
          : this.withTenant(data, tenantId);
      }
      return;
    }

    if (params.action === "upsert") {
      params.args.where = { ...(params.args.where ?? {}), tenantId };
      if (params.args.create) {
        params.args.create = this.withTenant(params.args.create, tenantId);
      }
      return;
    }

    // Tanımadığımız bir operasyonu kapsayamayız, o yüzden geçirmiyoruz. Eski
    // allowlist yaklaşımı bilinmeyen operasyonları sessizce filtresiz
    // geçiriyordu — aggregate/groupBy sızıntısı tam olarak böyle oluştu.
    throw new InternalServerErrorException(
      `Tenant kapsamı uygulanamayan Prisma operasyonu: ${params.model}.${params.action}`,
    );
  }

  /**
   * `tenantId`'yi koşulsuz yazar.
   *
   * Eski kod yalnızca alan tanımsızsa yazıyordu ("Super Admin override
   * edebilsin" gerekçesiyle); istemciden gelen bir `tenantId` olduğu gibi
   * korunuyordu. Bağlam tek doğruluk kaynağıdır.
   *
   * `tenant: { connect: ... }` verilmişse Prisma ikisini birlikte kabul etmez;
   * o durumda ilişkiye dokunmayız.
   */
  private withTenant(data: Record<string, unknown>, tenantId: string): Record<string, unknown> {
    if (data.tenant) return data;
    return { ...data, tenantId };
  }
}
