-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('OIL_IN', 'OIL_OUT', 'LIQUIDATION', 'PAYMENT');

-- AlterTable
ALTER TABLE "ProductionBatch" ADD COLUMN     "tankId" TEXT;

-- CreateTable
CREATE TABLE "StockTank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amountKg" DOUBLE PRECISION,
    "amountTL" DOUBLE PRECISION,
    "unitPrice" DOUBLE PRECISION,
    "tankId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "StockTank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "StockTank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
