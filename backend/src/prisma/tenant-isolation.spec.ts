import { ForbiddenException, BadRequestException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { ContextService } from "../common/context.service";

/**
 * Tenant izolasyonunun fail-closed kaldığını doğrular.
 *
 * Bu testler PrismaService'in $use middleware'ini gerçek Prisma motoru olmadan
 * çalıştırır: `next` yerine parametreleri yakalayan bir casus veriyoruz. Böylece
 * "sorguya hangi where/data gitti" sorusuna veritabanı olmadan cevap verilir.
 *
 * Kapatılan hata: eski middleware `if (tenantId && isTenantModel)` diyordu,
 * yani bağlam yoksa filtre UYGULAMADAN sorguyu geçiriyordu.
 */
describe("PrismaService tenant izolasyonu", () => {
  let context: ContextService;
  let service: PrismaService;
  let scope: (params: any) => Promise<any>;
  let captured: any;

  beforeEach(() => {
    captured = undefined;
    context = new ContextService();
    service = new PrismaService(context);
    // Middleware private; testte davranışı doğrulamak için doğrudan çağırıyoruz.
    scope = (params: any) =>
      (service as any).scopeToTenant(params, async (p: any) => {
        captured = p;
        return [];
      });
  });

  afterAll(async () => {
    await service.$disconnect().catch(() => undefined);
  });

  const run = (fn: () => Promise<unknown>) =>
    new Promise((resolve, reject) => {
      ContextService.run(() => {
        fn().then(resolve, reject);
      });
    });

  describe("bağlam yokken (kimliği doğrulanmamış istek)", () => {
    it("tenant modelinde okumayı REDDEDER", async () => {
      await expect(
        run(() => scope({ model: "Customer", action: "findMany", args: {} })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("silmeyi de reddeder", async () => {
      await expect(
        run(() => scope({ model: "Customer", action: "delete", args: { where: { id: "x" } } })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("aggregate'i reddeder (eski allowlist'te yoktu, panolar sızdırıyordu)", async () => {
      await expect(
        run(() => scope({ model: "WeighingTicket", action: "aggregate", args: {} })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("groupBy'ı reddeder", async () => {
      await expect(
        run(() => scope({ model: "ProductionBatch", action: "groupBy", args: {} })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe("tenant bağlamı varken", () => {
    const asTenant = (fn: () => Promise<unknown>) =>
      new Promise((resolve, reject) => {
        ContextService.run(() => {
          context.set("TENANT_ID", "t_a");
          context.set("USER_ROLE", UserRole.ADMIN);
          fn().then(resolve, reject);
        });
      });

    it("findMany'ye tenantId ekler", async () => {
      await asTenant(() => scope({ model: "Customer", action: "findMany", args: {} }));
      expect(captured.args.where).toEqual({ tenantId: "t_a" });
    });

    it("aggregate'e de tenantId ekler", async () => {
      await asTenant(() =>
        scope({ model: "WeighingTicket", action: "aggregate", args: { _sum: { netKg: true } } }),
      );
      expect(captured.args.where).toEqual({ tenantId: "t_a" });
    });

    it("groupBy'a da tenantId ekler", async () => {
      await asTenant(() => scope({ model: "ProductionBatch", action: "groupBy", args: {} }));
      expect(captured.args.where).toEqual({ tenantId: "t_a" });
    });

    it("istemcinin gönderdiği tenantId'yi EZER (override edilemez)", async () => {
      await asTenant(() =>
        scope({ model: "Customer", action: "findMany", args: { where: { tenantId: "t_rakip" } } }),
      );
      expect(captured.args.where.tenantId).toBe("t_a");
    });

    it("mevcut where koşullarını korur", async () => {
      await asTenant(() =>
        scope({ model: "Customer", action: "findFirst", args: { where: { id: "c1" } } }),
      );
      expect(captured.args.where).toEqual({ id: "c1", tenantId: "t_a" });
    });

    it("create'e tenantId yazar", async () => {
      await asTenant(() =>
        scope({ model: "Customer", action: "create", args: { data: { name: "Ali" } } }),
      );
      expect(captured.args.data.tenantId).toBe("t_a");
    });

    it("create'te istemcinin tenantId'sini ezer", async () => {
      await asTenant(() =>
        scope({
          model: "Customer",
          action: "create",
          args: { data: { name: "Ali", tenantId: "t_rakip" } },
        }),
      );
      expect(captured.args.data.tenantId).toBe("t_a");
    });

    it("createMany'de her kaydı damgalar", async () => {
      await asTenant(() =>
        scope({
          model: "Customer",
          action: "createMany",
          args: { data: [{ name: "Ali" }, { name: "Veli" }] },
        }),
      );
      expect(captured.args.data.every((d: any) => d.tenantId === "t_a")).toBe(true);
    });

    it("tenant modeli olmayanlara dokunmaz", async () => {
      await asTenant(() => scope({ model: "Tenant", action: "findMany", args: {} }));
      expect(captured.args.where).toBeUndefined();
    });
  });

  describe("SUPER_ADMIN", () => {
    const asSuperAdmin = (fn: () => Promise<unknown>) =>
      new Promise((resolve, reject) => {
        ContextService.run(() => {
          context.set("USER_ROLE", UserRole.SUPER_ADMIN);
          fn().then(resolve, reject);
        });
      });

    it("tenant seçmeden global okuyabilir (platform paneli)", async () => {
      await asSuperAdmin(() => scope({ model: "Customer", action: "findMany", args: {} }));
      expect(captured.args.where).toBeUndefined();
    });

    it("sahipsiz kayıt oluşturamaz", async () => {
      await expect(
        asSuperAdmin(() =>
          scope({ model: "Customer", action: "create", args: { data: { name: "Ali" } } }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("tenantId'yi açıkça verirse oluşturabilir", async () => {
      await asSuperAdmin(() =>
        scope({
          model: "Customer",
          action: "create",
          args: { data: { name: "Ali", tenantId: "t_b" } },
        }),
      );
      expect(captured.args.data.tenantId).toBe("t_b");
    });

    it("bir fabrikayı seçtiğinde o fabrikayla sınırlanır", async () => {
      await new Promise((resolve, reject) => {
        ContextService.run(() => {
          context.set("USER_ROLE", UserRole.SUPER_ADMIN);
          context.set("TENANT_ID", "t_b");
          scope({ model: "Customer", action: "findMany", args: {} }).then(resolve, reject);
        });
      });
      expect(captured.args.where).toEqual({ tenantId: "t_b" });
    });
  });

  it("SYSTEM_TASK kapsamı atlar (seed/bakım işleri)", async () => {
    await ContextService.runAsSystem(async () => {
      await scope({ model: "Customer", action: "findMany", args: {} });
    });
    expect(captured.args.where).toBeUndefined();
  });
});
