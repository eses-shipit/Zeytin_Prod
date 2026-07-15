import { Global, Module } from "@nestjs/common";
import { PolicyController } from "./policy.controller";
import { PolicyService } from "./policy.service";
import { PrismaService } from "../prisma/prisma.service";

// Global: üretim, işlemler ve kayıt akışı politikayı okumak zorunda.
@Global()
@Module({
  controllers: [PolicyController],
  providers: [PolicyService, PrismaService],
  exports: [PolicyService],
})
export class PolicyModule {}
