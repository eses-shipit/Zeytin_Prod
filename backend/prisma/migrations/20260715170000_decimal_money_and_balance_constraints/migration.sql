-- Para ve yağ alanlarını Float (double precision) -> Decimal'e taşır ve
-- bakiyeler için veritabanı seviyesinde koruma ekler.
--
-- Neden: Float ikili kayan nokta hatası biriktirir. Bakiyeler sürekli
-- increment/decrement edildiği için hata kalıcıdır; ayrıca parti başına pay
-- dağıtımı `ratio = ticket.netKg / totalOliveKg` ile yapıldığından paylar
-- toplamı partinin toplamına birebir dönmüyordu.

-- 1) Tip dönüşümleri. USING ile mevcut değerler korunur.
ALTER TABLE "Tenant"
  ALTER COLUMN "defaultDrumWeight" TYPE DECIMAL(8,3) USING "defaultDrumWeight"::DECIMAL(8,3),
  ALTER COLUMN "defaultDrumWeight" SET DEFAULT 50;

ALTER TABLE "Customer"
  ALTER COLUMN "oliveOilBalance" TYPE DECIMAL(12,3) USING "oliveOilBalance"::DECIMAL(12,3),
  ALTER COLUMN "oliveOilBalance" SET DEFAULT 0,
  ALTER COLUMN "balanceTL" TYPE DECIMAL(14,2) USING "balanceTL"::DECIMAL(14,2),
  ALTER COLUMN "balanceTL" SET DEFAULT 0;

ALTER TABLE "ProductionBatch"
  ALTER COLUMN "totalOilKg" TYPE DECIMAL(12,3) USING "totalOilKg"::DECIMAL(12,3),
  ALTER COLUMN "acidRatio" TYPE DECIMAL(5,2) USING "acidRatio"::DECIMAL(5,2),
  ALTER COLUMN "yieldRatio" TYPE DECIMAL(8,3) USING "yieldRatio"::DECIMAL(8,3),
  ALTER COLUMN "serviceAmount" TYPE DECIMAL(10,3) USING "serviceAmount"::DECIMAL(10,3),
  ALTER COLUMN "serviceAmount" SET DEFAULT 0,
  ALTER COLUMN "totalPrice" TYPE DECIMAL(14,2) USING "totalPrice"::DECIMAL(14,2),
  ALTER COLUMN "totalPrice" SET DEFAULT 0,
  ALTER COLUMN "factoryShareKg" TYPE DECIMAL(12,3) USING "factoryShareKg"::DECIMAL(12,3),
  ALTER COLUMN "customerShareKg" TYPE DECIMAL(12,3) USING "customerShareKg"::DECIMAL(12,3);

ALTER TABLE "StockTank"
  ALTER COLUMN "currentLevel" TYPE DECIMAL(12,3) USING "currentLevel"::DECIMAL(12,3),
  ALTER COLUMN "currentLevel" SET DEFAULT 0,
  ALTER COLUMN "acidRatio" TYPE DECIMAL(5,2) USING "acidRatio"::DECIMAL(5,2);

ALTER TABLE "Transaction"
  ALTER COLUMN "amountKg" TYPE DECIMAL(12,3) USING "amountKg"::DECIMAL(12,3),
  ALTER COLUMN "amountTL" TYPE DECIMAL(14,2) USING "amountTL"::DECIMAL(14,2),
  ALTER COLUMN "unitPrice" TYPE DECIMAL(12,4) USING "unitPrice"::DECIMAL(12,4);

ALTER TABLE "Drum"
  ALTER COLUMN "capacity" TYPE DECIMAL(8,3) USING "capacity"::DECIMAL(8,3);

-- 2) Bakiye korumaları.
--
-- Uygulama katmanında yarış koşulu koşullu UPDATE ile kapatıldı; bu
-- kısıtlar son savunma hattıdır: yeni bir kod yolu kontrolü atlarsa
-- veritabanı işlemi reddeder.
--
-- NOT VALID: kısıt yalnızca yeni/güncellenen satırlara uygulanır, mevcut
-- satırlar taranmaz. Eski demo verisinde yarış koşulundan kalma negatif
-- bakiye varsa migration patlamaz. Veri temizlendikten sonra:
--   ALTER TABLE "Customer" VALIDATE CONSTRAINT "Customer_oliveOilBalance_non_negative";
--
-- balanceTL'ye kısıt YOK: negatif bakiye alacak/avans anlamına gelir ve
-- geçerli bir iş durumudur.
ALTER TABLE "Customer"
  ADD CONSTRAINT "Customer_oliveOilBalance_non_negative"
  CHECK ("oliveOilBalance" >= 0) NOT VALID;

ALTER TABLE "StockTank"
  ADD CONSTRAINT "StockTank_currentLevel_non_negative"
  CHECK ("currentLevel" >= 0) NOT VALID;

-- Yön `type` alanında tutulur; tutarlar her zaman pozitiftir.
ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_amounts_non_negative"
  CHECK (
    ("amountKg" IS NULL OR "amountKg" >= 0) AND
    ("amountTL" IS NULL OR "amountTL" >= 0) AND
    ("unitPrice" IS NULL OR "unitPrice" >= 0)
  ) NOT VALID;
