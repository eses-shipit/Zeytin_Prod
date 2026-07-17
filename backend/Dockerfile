# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app
# Prisma engine'leri için OpenSSL gerekir.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
# --include=dev ZORUNLU: Coolify build sırasında NODE_ENV=production geçirir,
# bu da normal `npm ci`'de devDependencies'i (tsc, prisma CLI) atlatır.
RUN npm ci --include=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
# node_modules'ı build'ten aynen taşıyoruz: Prisma CLI (migrate deploy için) ve
# üretilmiş client burada. Ayrıca prune etmiyoruz ki entrypoint migrate deploy
# çalıştırabilsin.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3001
CMD ["./docker-entrypoint.sh"]
