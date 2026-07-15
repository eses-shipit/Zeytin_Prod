-- CreateTable
CREATE TABLE "DailyOilPrice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pricePerKg" DECIMAL(12,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "DailyOilPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyOilPrice_tenantId_date_key" ON "DailyOilPrice"("tenantId", "date");

-- AddForeignKey
ALTER TABLE "DailyOilPrice" ADD CONSTRAINT "DailyOilPrice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

