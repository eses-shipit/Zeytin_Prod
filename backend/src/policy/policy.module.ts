import { Global, Module } from "@nestjs/common";
import { PolicyController } from "./policy.controller";
import { PolicyService } from "./policy.service";
import { DrumSizeController } from "./drum-size.controller";
import { DrumSizeService } from "./drum-size.service";
import { PrismaService } from "../prisma/prisma.service";

// Global: üretim, işlemler ve kayıt akışı politikayı okumak zorunda.
@Global()
@Module({
  controllers: [PolicyController, DrumSizeController],
  providers: [PolicyService, DrumSizeService, PrismaService],
  exports: [PolicyService, DrumSizeService],
})
export class PolicyModule {}
