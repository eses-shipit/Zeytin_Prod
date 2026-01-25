import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ContextService } from "../context.service";
import { UserRole } from "@prisma/client";

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly contextService: ContextService) {}

  canActivate(context: ExecutionContext): boolean {
    const userRole = this.contextService.get("USER_ROLE");
    
    // Debug log
    console.log("[SuperAdminGuard] USER_ROLE from context:", userRole);
    console.log("[SuperAdminGuard] Expected:", UserRole.SUPER_ADMIN);
    
    if (!userRole) {
      console.error("[SuperAdminGuard] USER_ROLE is undefined. User might not be authenticated.");
      throw new UnauthorizedException("Kullanıcı kimlik doğrulaması yapılmamış.");
    }
    
    if (userRole !== UserRole.SUPER_ADMIN) {
      console.warn("[SuperAdminGuard] User role is not SUPER_ADMIN:", userRole);
      throw new UnauthorizedException("Bu işlem için Super Admin yetkisi gereklidir.");
    }
    
    return true;
  }
}
