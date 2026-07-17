#!/bin/sh
set -e

# Üretim veritabanına bekleyen migration'ları uygula (yalnızca ileri; veri
# kaybı yapmaz). İlk deploy'da EmailOtp tablosu burada oluşur.
echo "[entrypoint] prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] NestJS başlıyor..."
exec node dist/main.js
