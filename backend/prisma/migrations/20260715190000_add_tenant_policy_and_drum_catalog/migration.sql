-- CreateEnum
CREATE TYPE "FeeBasis" AS ENUM ('OIL_OUT', 'OLIVE_IN');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('PER_TRANSACTION', 'DAILY_TABLE');

-- CreateEnum
CREATE TYPE "EscrowModel" AS ENUM ('FUNGIBLE', 'LOT_TRACKED');

-- AlterTable
ALTER TABLE "Drum" ADD COLUMN     "drumSizeId" TEXT;

-- AlterTable
ALTER TABLE "ProductionBatch" ADD COLUMN     "policyId" TEXT;

-- CreateTable
CREATE TABLE "TenantPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultServiceType" "ServiceType" NOT NULL DEFAULT 'PERCENTAGE',
    "defaultServiceAmount" DECIMAL(10,3) NOT NULL DEFAULT 10,
    "percentageBasis" "FeeBasis" NOT NULL DEFAULT 'OIL_OUT',
    "minServiceAmount" DECIMAL(10,3),
    "maxServiceAmount" DECIMAL(10,3),
    "allowServiceOverride" BOOLEAN NOT NULL DEFAULT true,
    "escrowEnabled" BOOLEAN NOT NULL DEFAULT true,
    "escrowDefault" BOOLEAN NOT NULL DEFAULT true,
    "escrowModel" "EscrowModel" NOT NULL DEFAULT 'FUNGIBLE',
    "escrowStorageFeePerKgPerMonth" DECIMAL(10,4),
    "escrowExpiryDays" INTEGER,
    "minWithdrawalKg" DECIMAL(12,3),
    "allowNegativeBalance" BOOLEAN NOT NULL DEFAULT true,
    "liquidationPriceSource" "PriceSource" NOT NULL DEFAULT 'PER_TRANSACTION',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "kgDecimalPlaces" INTEGER NOT NULL DEFAULT 3,
    "tlDecimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "yieldAsRatio" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "TenantPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrumSize" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacityKg" DECIMAL(8,3) NOT NULL,
    "tareKg" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "type" "DrumType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrumSize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantPolicy_tenantId_isActive_idx" ON "TenantPolicy"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPolicy_tenantId_version_key" ON "TenantPolicy"("tenantId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "DrumSize_name_tenantId_key" ON "DrumSize"("name", "tenantId");

-- AddForeignKey
ALTER TABLE "TenantPolicy" ADD CONSTRAINT "TenantPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrumSize" ADD CONSTRAINT "DrumSize_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "TenantPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drum" ADD CONSTRAINT "Drum_drumSizeId_fkey" FOREIGN KEY ("drumSizeId") REFERENCES "DrumSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Veri taşıma: mevcut fabrikalara sürüm 1 politikası ve bidon kataloğu.
--
-- Bu blok olmadan, migration'dan sonra mevcut her fabrika politikasız kalır ve
-- PolicyService yeni parti hesaplayamaz. Varsayılanlar, kodun bugüne kadar
-- sabit olarak varsaydığı davranışı birebir yansıtır — yani migration hiçbir
-- fabrikanın çalışma şeklini değiştirmez, sadece görünür/değiştirilebilir yapar.
-- ---------------------------------------------------------------------------

INSERT INTO "TenantPolicy" (
  "id", "tenantId", "version", "isActive",
  "defaultServiceType", "defaultServiceAmount", "percentageBasis",
  "escrowEnabled", "escrowDefault", "escrowModel",
  "allowNegativeBalance", "liquidationPriceSource",
  "currency", "kgDecimalPlaces", "tlDecimalPlaces", "yieldAsRatio",
  "effectiveFrom", "createdAt"
)
SELECT
  -- gen_random_uuid() pgcrypto/PG13+ ile gelir; cuid üretemediğimiz için
  -- uygulama tarafındaki id'lerden ayırt edilebilir olması sorun değil.
  gen_random_uuid()::text,
  t."id",
  1,
  true,
  'PERCENTAGE',   -- kodun varsayılanı
  10,             -- yaygın hak yağ oranı; fabrika ilk girişte düzeltir
  'OIL_OUT',      -- kod bugüne kadar matrahı ÇIKAN YAĞ varsayıyordu
  true,
  true,
  'FUNGIBLE',     -- yağ tankta havuzlanıyor (mevcut davranış)
  true,           -- borçtan fazla tahsilat engellenmiyordu
  'PER_TRANSACTION', -- bozdurma fiyatı istek başına giriliyordu
  'TRY',
  3,
  2,
  true,           -- randıman "1/X" olarak gösteriliyordu
  t."createdAt",  -- politika fabrikanın kuruluşundan beri yürürlükte sayılır
  now()
FROM "Tenant" t
WHERE NOT EXISTS (SELECT 1 FROM "TenantPolicy" p WHERE p."tenantId" = t."id");

-- Tenant.defaultDrumWeight kataloğa taşınır: tek bir sayı olarak hiçbir iş
-- mantığı okumuyordu, ama fabrikanın girdiği değer kaybolmasın.
INSERT INTO "DrumSize" (
  "id", "tenantId", "name", "capacityKg", "tareKg", "type",
  "isActive", "isDefault", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  t."id",
  'Varsayılan bidon',
  t."defaultDrumWeight",
  0,
  'PLASTIC',
  true,
  true,
  now(),
  now()
FROM "Tenant" t
WHERE t."defaultDrumWeight" > 0
  AND NOT EXISTS (SELECT 1 FROM "DrumSize" d WHERE d."tenantId" = t."id");

-- Mevcut partiler bilinçli olarak policyId = NULL bırakılır: politika sistemi
-- yokken hesaplandılar ve o günkü sayıları kayıtlı. Onlara sonradan bir sürüm
-- iliştirmek, hiç uygulanmamış bir kuralı uygulanmış gibi göstermek olurdu.
