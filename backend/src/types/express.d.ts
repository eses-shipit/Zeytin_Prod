import type { PrismaClient } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    tenantId?: string;
    prisma?: PrismaClient;
  }
}

