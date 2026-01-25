import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IdGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a hybrid ID format: YY-SEQ-CODE
   * Example: 26-0042-X7K
   */
  async generate(tenantId: string, model: "WeighingTicket" | "ProductionBatch"): Promise<string> {
    // 1. Get Tenant Code (or generate a fallback)
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const tenantCode = tenant?.code || "ZEY";

    // 2. Year (YY)
    const year = new Date().getFullYear().toString().slice(-2);

    // 3. Sequence (Count + 1)
    let count = 0;
    if (model === "WeighingTicket") {
      count = await this.prisma.weighingTicket.count();
    } else {
      count = await this.prisma.productionBatch.count();
    }
    const sequence = (count + 1).toString().padStart(4, "0");

    // 4. Random Code (3 chars)
    const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `${year}-${sequence}-${randomCode}`;
  }
}
