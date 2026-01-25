import { Injectable, OnModuleDestroy, OnModuleInit, Logger, BadRequestException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ContextService } from "../common/context.service";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // TenantId içeren modellerin listesi (Bunlara otomatik filtre uygulanacak)
  private readonly TENANT_MODELS = [
    'Product',
    'Customer',
    'WeighingTicket',
    'ProductionBatch',
    'StockTank',
    'Transaction',
    'SupportTicket',
    'AuditLog', // AuditLog da tenant bazlı
    'Drum',
  ];

  constructor(private readonly contextService: ContextService) {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Veritabanı bağlantısı başarılı.');

      // GLOBAL QUERY MIDDLEWARE
      this.$use(async (params, next) => {
        const tenantId = this.contextService.get("TENANT_ID");
        const isTenantModel = params.model && this.TENANT_MODELS.includes(params.model);
        
        // Debug log for Customer operations
        if (params.model === 'Customer') {
          console.log(`[PrismaService] Customer ${params.action} - tenantId in context:`, tenantId);
          if (params.action === 'create') {
            console.log(`[PrismaService] Customer create - data before middleware:`, JSON.stringify(params.args?.data, null, 2));
          }
          if (params.action === 'findMany') {
            console.log(`[PrismaService] Customer findMany - where clause:`, JSON.stringify(params.args?.where, null, 2));
          }
        }

        // --- GÜVENLİK KURALI: Tenant Modeli Oluşturulurken Tenant ID Zorunluluğu ---
        // Eğer bir Tenant Modeli oluşturuluyorsa (create/createMany)
        // VE Context'te tenantId YOKSA
        // VE Argümanlarda da manuel olarak verilmemişse
        // -> HATA FIRLAT (Bu işlem Global/Bilinmeyen bir kayıt yaratır ve veri sızmasına yol açar)
        
        if (isTenantModel && (params.action === 'create' || params.action === 'createMany')) {
            // Argümanlarda var mı kontrol et
            let hasManualTenantId = false;
            if (params.action === 'create' && params.args.data && params.args.data.tenantId) hasManualTenantId = true;
            if (params.action === 'createMany' && params.args.data && Array.isArray(params.args.data)) {
                // Hepsinin tenantId'si olmalı veya hiçbiri olmamalı (Context dolduracak)
                // Ama Context yoksa, hepsinde olmak zorunda.
                hasManualTenantId = params.args.data.every((d: any) => !!d.tenantId);
            }

            if (!tenantId && !hasManualTenantId) {
                // Ne Context'te ne de manuel olarak verilmiş. Bu bir güvenlik ihlali veya bug.
                // Super Admin bile olsa, bir Tenant modeli (Product/Customer) oluşturuyorsa bir sahip belirtmek zorunda.
                throw new BadRequestException(`Güvenlik Uyarısı: ${params.model} oluşturulurken Fabrika ID (Tenant ID) belirtilmedi. Lütfen bir fabrika seçtiğinizden emin olun.`);
            }
        }

        // --- OTOMATİK ENJEKSİYON (Context varsa) ---
        if (tenantId && isTenantModel) {
          
          // 2. Find, Count, Update, Delete gibi operasyonları yakala
          if (
            ['findUnique', 'findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)
          ) {
            // Args yoksa oluştur
            if (!params.args) {
              params.args = {};
            }
            if (!params.args.where) {
              params.args.where = {};
            }

            // 3. Where tenantId ekle (Eğer zaten varsa elleme - Super Admin override edebilir)
            if (params.args.where.tenantId === undefined) {
              params.args.where.tenantId = tenantId;
            }
          }

          // 4. Create işlemlerinde de tenantId'yi otomatik ekle
          if (params.action === 'create' || params.action === 'createMany') {
              if (!params.args) params.args = {};
              if (params.args.data) {
                  // Array ise (createMany)
                  if (Array.isArray(params.args.data)) {
                      params.args.data.forEach((item: any) => {
                          if (!item.tenantId) {
                              item.tenantId = tenantId;
                              console.log(`[PrismaService] Added tenantId to createMany item:`, tenantId);
                          }
                      });
                  } else {
                      // Tekil ise
                      if (!params.args.data.tenantId) {
                          params.args.data.tenantId = tenantId;
                          console.log(`[PrismaService] Added tenantId to create data:`, tenantId);
                      } else {
                          console.log(`[PrismaService] tenantId already in create data:`, params.args.data.tenantId);
                      }
                  }
              }
          }
        }

        return next(params);
      });

    } catch (error) {
      this.logger.error('Veritabanına bağlanılamadı!', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Veritabanı bağlantısı kapatıldı.');
  }
}
