import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ContextService } from "../context.service";
import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Rol kontrolü. JwtAuthGuard'ın doğruladığı bağlamı okur, token'a doğrudan
 * bakmaz. @Roles() yoksa route'a karışmaz (kimlik doğrulaması yine zorunludur).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly contextService: ContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const userRole = this.contextService.get("USER_ROLE") as UserRole | undefined;
    if (!userRole || !required.includes(userRole)) {
      throw new ForbiddenException("Bu işlem için yetkiniz bulunmuyor.");
    }
    return true;
  }
}
