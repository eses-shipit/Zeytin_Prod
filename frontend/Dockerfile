# syntax=docker/dockerfile:1

# ---------- deps ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
# --include=dev ZORUNLU: next build için typescript/tailwind/postcss devDep'tir;
# NODE_ENV=production altında normal `npm ci` bunları atlar.
RUN npm ci --include=dev

# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* değişkenleri build sırasında istemci paketine GÖMÜLÜR.
# Bu yüzden API adresi burada (build arg) verilmeli, çalışma anında değil.
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runner ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# standalone: kendi kendine yeten sunucu (server.js) + statik varlıklar + public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
