import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { UserRole } from "@prisma/client";
import { ContextService } from "../context.service";
import { TokenService } from "../token.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * Global kimlik doğrulama guard'ı (APP_GUARD).
 *
 * Bu guard eklenmeden önce projede HİÇBİR auth guard yoktu; yalnızca
 * admin.controller üzerinde SuperAdminGuard vardı. Sonuç olarak token'sız
 * `GET /customers` isteği 200 dönüp bütün fabrikaların müşterilerini
 * (TCKN, telefon, bakiye dahil) sızdırıyordu.
 *
 * Tasarım: varsayılan KAPALI. Route açıkça @Public() ile işaretlenmediyse
 * geçerli token zorunludur. İstek bağlamı (USER_ID / USER_ROLE / TENANT_ID)
 * yalnızca burada, doğrulanmış token'dan yazılır.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly contextService: ContextService,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();

    const token = TokenService.extractBearer(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedException("Kimlik doğrulama token'ı gereklidir.");
    }

    const payload = this.tokenService.verify(token);
    if (!payload) {
      throw new UnauthorizedException("Token geçersiz veya süresi dolmuş.");
    }

    const userId = payload.sub ?? payload.id;
    if (!userId || !payload.role) {
      throw new UnauthorizedException("Token içeriği eksik.");
    }

    this.contextService.set("USER_ID", userId);
    this.contextService.set("USER_ROLE", payload.role);

    this.contextService.set("TENANT_ID", this.resolveTenantId(payload, req));

    return true;
  }

  /**
   * Etkin tenant'ı belirler.
   *
   * Normal kullanıcı: yalnızca token'daki tenantId. İstemciden gelen
   * `x-tenant-id` başlığı bilinçli olarak yok sayılır — aksi halde herhangi bir
   * kullanıcı başka bir fabrikanın verisine geçebilirdi.
   *
   * SUPER_ADMIN: `x-tenant-id` ile bir fabrika bağlamına girebilir.
   */
  private resolveTenantId(
    payload: { role: UserRole; tenantId: string | null },
    req: Request,
  ): string | null {
    if (payload.role === UserRole.SUPER_ADMIN) {
      return req.header("x-tenant-id")?.trim() || null;
    }

    if (!payload.tenantId) {
      // SUPER_ADMIN olmayan bir kullanıcının tenant'ı olmak zorunda. Aksi halde
      // tenant bağlamı boş kalır ve Prisma katmanı isteği reddeder; burada
      // açıkça hata vermek teşhisi kolaylaştırır.
      throw new ForbiddenException("Kullanıcı bir fabrikaya bağlı değil.");
    }

    return payload.tenantId;
  }
}
