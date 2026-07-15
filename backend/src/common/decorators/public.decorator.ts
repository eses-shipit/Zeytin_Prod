import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Bir route'u kimlik doğrulamasından muaf tutar.
 *
 * Varsayılan olarak JwtAuthGuard tüm route'ları korur (fail-closed). Yeni bir
 * endpoint eklendiğinde hiçbir şey yapılmazsa korumalı olur; açmak bilinçli bir
 * karar gerektirir.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
