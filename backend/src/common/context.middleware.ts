import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { ContextService } from "./context.service";

/**
 * İstek başına AsyncLocalStorage deposu açar. Başka hiçbir şey yapmaz.
 *
 * Kimlik doğrulama ve tenant çözümlemesi bilinçli olarak JwtAuthGuard'a taşındı.
 * Eskiden bu middleware (tenant.middleware.ts) token'ı kendisi doğruluyor, hata
 * durumunda sessizce yutup `next()` çağırıyordu — yani geçersiz token'lı istek
 * bağlamsız devam ediyor, Prisma katmanı da filtresiz çalışıyordu. Middleware
 * guard'lardan önce çalıştığı için depo, guard yazmaya başladığında hazırdır.
 */
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(_req: Request, _res: Response, next: NextFunction) {
    ContextService.run(() => next());
  }
}
