import { Injectable, Logger } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export interface TokenPayload {
  sub: string;
  id: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  tenantCode?: string;
  /** Set when a SUPER_ADMIN minted this token to act as a tenant. */
  impersonatedBy?: string;
}

/**
 * Tek yetkili JWT kaynağı. Secret yalnızca burada okunur.
 *
 * Boot sırasında secret yoksa veya zayıfsa uygulama başlamaz. Daha önce burada
 * `process.env.JWT_SECRET || "super-secret-key-change-in-prod"` şeklinde bir
 * fallback vardı; secret hiçbir ortamda tanımlı olmadığı için o sabit değer
 * canlıda kullanılıyordu ve kaynak kodda açık olduğu için herkes SUPER_ADMIN
 * token'ı üretebiliyordu.
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly secret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET tanımlı değil. Uygulama başlatılamaz. " +
          "Güçlü bir secret üretin: `openssl rand -base64 48`",
      );
    }
    if (secret.length < 32) {
      throw new Error(
        `JWT_SECRET çok kısa (${secret.length} karakter). En az 32 karakter olmalı.`,
      );
    }
    if (secret === "super-secret-key-change-in-prod") {
      throw new Error(
        "JWT_SECRET, kaynak kodda açığa çıkmış eski varsayılan değere eşit. " +
          "Derhal yeni bir secret üretin: `openssl rand -base64 48`",
      );
    }

    this.secret = secret;
  }

  sign(payload: Omit<TokenPayload, "sub"> & { sub?: string }, expiresIn = "7d"): string {
    return jwt.sign(payload, this.secret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Token'ı doğrular. Geçersizse null döner (fırlatmaz) — çağıran taraf
   * 401 üretmekten sorumludur.
   */
  verify(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch {
      // Sebep bilinçli olarak loglanmıyor: token içeriği hassastır.
      return null;
    }
  }

  /** `Authorization: Bearer <token>` başlığından token'ı çıkarır. */
  static extractBearer(authHeader?: string): string | null {
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
  }
}
