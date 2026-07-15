import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";

/** Route'u yalnızca verilen rollere açar. JwtAuthGuard'dan sonra çalışır. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
