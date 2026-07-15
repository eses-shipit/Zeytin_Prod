import { Body, Controller, Get, Patch } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PolicyService } from "./policy.service";
import { UpdatePolicyDto } from "./dto/update-policy.dto";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("policy")
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  /** Yürürlükteki politika. Operatör ekranı varsayılanları buradan gelir. */
  @Get()
  getActive() {
    return this.policyService.getActivePolicy();
  }

  /** Politika geçmişi: hangi kural ne zaman, kim tarafından değişti. */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get("history")
  getHistory() {
    return this.policyService.getHistory();
  }

  /**
   * Yeni sürüm oluşturur. Fabrikanın para kurallarını değiştirdiği için
   * yalnızca yöneticiye açık.
   */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch()
  update(@Body() dto: UpdatePolicyDto) {
    return this.policyService.updatePolicy(dto);
  }
}
