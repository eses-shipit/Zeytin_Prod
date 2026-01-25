/*
  Warnings:

  - You are about to drop the column `acidRate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `factoryRate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `yieldPercentage` on the `ProductionBatch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicId,tenantId]` on the table `ProductionBatch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,tenantId]` on the table `StockTank` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId,tenantId]` on the table `WeighingTicket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `yieldRatio` to the `ProductionBatch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED');

-- CreateEnum
CREATE TYPE "DrumType" AS ENUM ('PLASTIC', 'CHROME', 'TIN');

-- CreateEnum
CREATE TYPE "DrumStatus" AS ENUM ('AVAILABLE', 'FILLED', 'WITH_CUSTOMER');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('UNUSED', 'USED');

-- CreateEnum
CREATE TYPE "OliveQuality" AS ENUM ('TREE', 'GROUND', 'MIXED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PERCENTAGE', 'CASH_PER_KG');

-- CreateEnum
CREATE TYPE "OilType" AS ENUM ('ACID_03', 'ACID_05', 'ACID_08', 'VIRGIN', 'LAMPANTE');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'SERVICE_FEE';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ProductionBatch" DROP COLUMN "acidRate",
DROP COLUMN "factoryRate",
DROP COLUMN "yieldPercentage",
ADD COLUMN     "acidRatio" DOUBLE PRECISION,
ADD COLUMN     "filtration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lineId" INTEGER,
ADD COLUMN     "processTemp" INTEGER,
ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "serviceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "serviceType" "ServiceType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "status" "ProductionStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "yieldRatio" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "StockTank" ADD COLUMN     "acidRatio" DOUBLE PRECISION,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "type" "OilType" NOT NULL DEFAULT 'ACID_05';

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "defaultDrumWeight" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
ADD COLUMN     "officialName" TEXT,
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "taxId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "WeighingTicket" ADD COLUMN     "containerNos" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "quality" "OliveQuality",
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "variety" TEXT;

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'UNUSED',
    "planDurationDays" INTEGER NOT NULL DEFAULT 365,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drum" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DrumType" NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "status" "DrumStatus" NOT NULL DEFAULT 'AVAILABLE',
    "tenantId" TEXT NOT NULL,
    "currentHolderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BatchDrums" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "License_code_key" ON "License"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_tenantId_key" ON "Product"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Drum_code_tenantId_key" ON "Drum"("code", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "_BatchDrums_AB_unique" ON "_BatchDrums"("A", "B");

-- CreateIndex
CREATE INDEX "_BatchDrums_B_index" ON "_BatchDrums"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBatch_publicId_tenantId_key" ON "ProductionBatch"("publicId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "StockTank_name_tenantId_key" ON "StockTank"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WeighingTicket_publicId_tenantId_key" ON "WeighingTicket"("publicId", "tenantId");

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighingTicket" ADD CONSTRAINT "WeighingTicket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighingTicket" ADD CONSTRAINT "WeighingTicket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTank" ADD CONSTRAINT "StockTank_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drum" ADD CONSTRAINT "Drum_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drum" ADD CONSTRAINT "Drum_currentHolderId_fkey" FOREIGN KEY ("currentHolderId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchDrums" ADD CONSTRAINT "_BatchDrums_A_fkey" FOREIGN KEY ("A") REFERENCES "Drum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchDrums" ADD CONSTRAINT "_BatchDrums_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
