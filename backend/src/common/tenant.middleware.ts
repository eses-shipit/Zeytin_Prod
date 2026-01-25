import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { ContextService } from "./context.service";
import * as jwt from "jsonwebtoken";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly contextService: ContextService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    // Context'i başlat (Store oluştur)
    ContextService.run(() => {
        // 1. Token'dan Kullanıcı Bilgilerini Al
        const authHeader = req.headers.authorization;
        let user: any = null;

        console.log("[TenantMiddleware] Request:", req.method, req.path);
        console.log("[TenantMiddleware] Authorization header:", authHeader ? "Present" : "Missing");
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
          try {
            const token = authHeader.split(" ")[1];
            // JWT_SECRET environment variable'dan al - AuthService ile aynı olmalı!
            const jwtSecret = process.env.JWT_SECRET || "super-secret-key-change-in-prod";
            // Verify token (signature kontrolü yapar)
            user = jwt.verify(token, jwtSecret) as any;
            console.log("[TenantMiddleware] ✅ Token verified successfully!");
            console.log("[TenantMiddleware] User payload:", JSON.stringify({ 
              id: user?.id || user?.sub, 
              role: user?.role, 
              tenantId: user?.tenantId,
              email: user?.email 
            }, null, 2));
          } catch (e: any) {
            console.error("[TenantMiddleware] ❌ Token verification failed!");
            console.error("[TenantMiddleware] Error type:", e.name);
            console.error("[TenantMiddleware] Error message:", e.message);
            console.error("[TenantMiddleware] Token (first 20 chars):", token?.substring(0, 20));
            console.error("[TenantMiddleware] JWT_SECRET used:", jwtSecret.substring(0, 10) + "...");
            // Token bozuk veya geçersiz
          }
        } else {
          // Login ve register endpoint'leri için token olmaması normal
          if (!req.path.startsWith('/auth/login') && !req.path.startsWith('/auth/register') && !req.path.startsWith('/auth/create-super-admin')) {
            console.warn("[TenantMiddleware] ⚠️ No Authorization header found for:", req.method, req.path);
          }
        }

        // 2. Tenant Context Belirleme
        let contextTenantId = null;

        if (user) {
          if (user.role === 'SUPER_ADMIN') {
            // SUPER ADMIN: Impersonate kontrolü
            const headerTenantId = req.header("x-tenant-id")?.trim();
            console.log("[TenantMiddleware] SUPER_ADMIN detected. Header x-tenant-id:", headerTenantId || "None");
            if (headerTenantId) {
                contextTenantId = headerTenantId;
            }
            // Super Admin kendi panelinde olduğunda tenantId yok (normal)
          } else {
            // NORMAL USER: Token'dan tenantId al
            if (user.tenantId) {
                contextTenantId = user.tenantId;
                console.log("[TenantMiddleware] Normal user, tenantId from token:", contextTenantId);
            } else {
                console.warn("[TenantMiddleware] ⚠️ Normal user but no tenantId in token!");
            }
          }
        }

        // 3. Context'e Yaz
        if (user) {
            // JWT token'da id yerine sub kullanılıyor olabilir
            const userId = user.id || user.sub;
            const userRole = user.role;
            const userTenantId = user.tenantId;
            
            // User bilgilerini context'e yaz
            if (userId) {
                this.contextService.set("USER_ID", userId);
            }
            if (userRole) {
                this.contextService.set("USER_ROLE", userRole);
                console.log("[TenantMiddleware] ✅ Set USER_ROLE to context:", userRole);
            } else {
                console.warn("[TenantMiddleware] ⚠️ User object has no role:", user);
            }
            
            console.log("[TenantMiddleware] Context set - USER_ID:", userId, "USER_ROLE:", userRole, "TENANT_ID:", userTenantId);
        } else {
            console.warn("[TenantMiddleware] ⚠️ No user found in token");
        }

        if (contextTenantId) {
            this.contextService.set("TENANT_ID", contextTenantId);
            console.log("[TenantMiddleware] ✅ Context TENANT_ID set to:", contextTenantId);
            // Uyumluluk için
            req.tenantId = contextTenantId;
        } else {
            if (user && user.role !== 'SUPER_ADMIN') {
                console.warn("[TenantMiddleware] ⚠️ No TENANT_ID in context for non-SuperAdmin user!");
            }
        }

        next();
    });
  }
}
