-- Partinin müşteri payının emanete bırakılıp bırakılmadığını kaydeder.
--
-- Bilgi şimdiye kadar yalnızca istek gövdesinde (storeCustomerOil) taşınıyor ve
-- hiçbir yere yazılmıyordu; bu yüzden deliverDrums yağın üretim sırasında zaten
-- teslim edilmiş olduğunu anlayamıyor ve müşterinin bakiyesinden ikinci kez
-- düşüyordu.
ALTER TABLE "ProductionBatch"
  ADD COLUMN "storedInEscrow" BOOLEAN NOT NULL DEFAULT false;

-- Geçmiş veriyi en iyi tahminle doldur.
--
-- Emanete bırakılan partilerde müşterinin payı tanka aktarılıyordu, dolayısıyla
-- tankId dolu olan partiler emanettir. Bidonla hemen teslim edilenlerde bidon
-- bağlanıyordu. tankId dolu VE bidonu olmayan partiler emanet kabul edilir.
-- _BatchDrums implicit m2m tablosunda "A" = Drum.id, "B" = ProductionBatch.id.
UPDATE "ProductionBatch" b
SET "storedInEscrow" = true
WHERE b."tankId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "_BatchDrums" d WHERE d."B" = b."id"
  );
