-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "balanceTL" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "oliveOilBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WeighingTicket" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ProductionBatch" (
    "id" TEXT NOT NULL,
    "totalOliveKg" INTEGER NOT NULL,
    "totalOilKg" DOUBLE PRECISION NOT NULL,
    "factoryShareKg" DOUBLE PRECISION NOT NULL,
    "customerShareKg" DOUBLE PRECISION NOT NULL,
    "yieldPercentage" DOUBLE PRECISION NOT NULL,
    "factoryRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionBatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeighingTicket" ADD CONSTRAINT "WeighingTicket_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
