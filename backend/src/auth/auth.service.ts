import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { LicenseStatus, TenantStatus, UserRole } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

  constructor(private readonly prisma: PrismaService) {}

  async recoverPassword(email: string, licenseCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user || !user.tenantId) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }

    const license = await this.prisma.license.findFirst({
        where: {
            code: licenseCode,
            tenantId: user.tenantId,
            status: LicenseStatus.USED
        }
    });

    if (!license) {
        throw new BadRequestException("Lisans kodu bu kullanıcıyla eşleşmiyor.");
    }

    return {
        success: true,
        password: user.password 
    };
  }

  async checkLicense(code: string) {
    const license = await this.prisma.license.findUnique({
      where: { code },
    });

    if (!license) {
      throw new NotFoundException("Lisans kodu bulunamadı.");
    }

    if (license.status === LicenseStatus.USED) {
      throw new BadRequestException("Bu lisans kodu zaten kullanılmış.");
    }

    return {
      success: true,
      message: "Lisans geçerli.",
      planDurationDays: license.planDurationDays
    };
  }

  async register(dto: RegisterDto) {
    // 1. Lisans Kontrolü
    const license = await this.prisma.license.findUnique({
      where: { code: dto.licenseCode },
    });

    if (!license) {
      throw new NotFoundException("Lisans kodu geçersiz.");
    }

    if (license.status === LicenseStatus.USED) {
      throw new BadRequestException("Bu lisans kodu daha önce kullanılmış.");
    }

    // 2. Fabrika Kodu (Unique) Kontrolü
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { code: dto.factoryShortCode },
    });

    if (existingTenant) {
      throw new BadRequestException("Bu fabrika kodu (kısa kod) zaten alınmış.");
    }

    // 3. Email Kontrolü
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException("Bu e-posta adresi zaten kayıtlı.");
    }

    // 4. Transaction ile Tenant, User ve Lisans güncelleme
    try {
        return await this.prisma.$transaction(async (tx) => {
          // A. Tenant Oluştur
          const subscriptionEndDate = new Date();
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + license.planDurationDays);

          const tenant = await tx.tenant.create({
            data: {
              name: dto.factoryName,
              code: dto.factoryShortCode,
              officialName: dto.officialName,
              taxId: dto.taxId,
              address: dto.address,
              city: dto.city,
              status: TenantStatus.ACTIVE,
              subscriptionEndDate,
            },
          });

          // B. User Oluştur (ADMIN rolüyle) - bcrypt hash
          if (!dto.acceptedTerms) {
            throw new BadRequestException("Kullanım koşullarını ve Aydınlatma metnini onaylamanız gerekmektedir.");
          }

          const passwordHash = await bcrypt.hash(dto.password, 10);
          const user = await tx.user.create({
            data: {
              name: dto.userName,
              email: dto.email,
              phone: dto.phone, 
              password: passwordHash, 
              role: UserRole.ADMIN,
              tenantId: tenant.id,
              acceptedTermsAt: new Date(), // KVKK ve Kullanım Koşulları onay tarihi
            },
          });

          // C. Lisansı Güncelle
          await tx.license.update({
            where: { id: license.id },
            data: {
              status: LicenseStatus.USED,
              tenantId: tenant.id,
            },
          });

          // Token Üret
          const token = this.generateToken(user, tenant.code);

          return {
            success: true,
            message: "Kurulum tamamlandı. Giriş yapabilirsiniz.",
            token, // Token Eklendi
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: tenant.id
            }
          };
        });
    } catch (error: any) {
        console.error("Register Transaction Error:", error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('email')) {
                throw new BadRequestException("Bu e-posta adresi zaten kayıtlı.");
            }
            if (target?.includes('code')) { 
                throw new BadRequestException("Bu fabrika kodu zaten kullanımda.");
            }
        }
        throw new BadRequestException("Kayıt işlemi sırasında bir hata oluştu. Lütfen bilgileri kontrol edip tekrar deneyin.");
    }
  }

  async login(dto: LoginDto) {
    console.log("[AuthService] Login attempt for email:", dto.email);
    
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { tenant: true }
    });

    console.log("[AuthService] User found:", user ? "Yes" : "No");
    if (user) {
      console.log("[AuthService] User details:", {
        id: user.id,
        email: user.email,
        role: user.role,
        passwordMatch: user.password === dto.password
      });
    }

    if (!user) {
      console.error("[AuthService] ❌ Login failed: Invalid credentials");
      throw new UnauthorizedException("E-posta veya şifre hatalı.");
    }

    // Password check: support both legacy plaintext and bcrypt hashes
    const isBcryptHash = typeof user.password === "string" && user.password.startsWith("$2");
    const passwordOk = isBcryptHash ? await bcrypt.compare(dto.password, user.password) : user.password === dto.password;

    if (!passwordOk) {
      console.error("[AuthService] ❌ Login failed: Invalid credentials");
      throw new UnauthorizedException("E-posta veya şifre hatalı.");
    }

    // Super Admin için tenant kontrolü yapma
    if (user.role !== UserRole.SUPER_ADMIN && user.tenant && user.tenant.status !== TenantStatus.ACTIVE) {
        throw new UnauthorizedException("Üyeliğiniz aktif değil veya süresi dolmuş.");
    }

    // Token Üret
    const token = this.generateToken(user, user.tenant?.code);
    
    console.log("[AuthService] Login successful for user:", {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    });
    console.log("[AuthService] Token generated:", token ? "Yes" : "No");

    return {
      success: true,
      token, // Token Eklendi
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantCode: user.tenant?.code,
        tenant: user.tenant ? {
            name: user.tenant.name,
            officialName: user.tenant.officialName,
            address: user.tenant.address,
            city: user.tenant.city,
            taxId: user.tenant.taxId,
            phone: user.phone
        } : null
      }
    };
  }

  async createSuperAdmin(email: string, password: string, name?: string) {
    // Sadece hiç Super Admin yoksa oluştur
    const existingSuperAdmin = await this.prisma.user.findFirst({
      where: { role: UserRole.SUPER_ADMIN },
    });

    if (existingSuperAdmin) {
      throw new BadRequestException("Super Admin zaten mevcut. Yeni Super Admin oluşturulamaz.");
    }

    // Email kontrolü
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("Bu e-posta adresi zaten kayıtlı.");
    }

    // Super Admin oluştur
    const passwordHash = await bcrypt.hash(password, 10);
    const superAdmin = await this.prisma.user.create({
      data: {
        email,
        name: name || "Super Admin",
        password: passwordHash,
        role: UserRole.SUPER_ADMIN,
        tenantId: null,
      },
    });

    return {
      success: true,
      message: "Super Admin başarıyla oluşturuldu.",
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
      },
    };
  }

  async impersonate(adminId: string, tenantId: string) {
    const targetUser = await this.prisma.user.findFirst({
        where: {
            tenantId: tenantId,
            role: UserRole.ADMIN
        },
        include: { tenant: true }
    });

    if (!targetUser) {
        throw new NotFoundException("Hedef fabrikada yönetici kullanıcısı bulunamadı.");
    }

    // Token Üret (Hedef kullanıcı adına)
    // NOT: Bu token'da rol ADMIN olacak, Super Admin değil.
    // Ancak Super Admin kendi oturumunu (token'ını) localStorage'da yedekliyor.
    // Impersonate bitince yedeği geri yüklüyor.
    // Bu yüzden burada targetUser için token üretmek mantıklı.
    const token = this.generateToken(targetUser, targetUser.tenant?.code);

    return {
        success: true,
        message: "Yönetici girişi simüle edildi.",
        token, // Token Eklendi
        user: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
            tenantId: targetUser.tenantId,
            tenantCode: targetUser.tenant?.code,
            isImpersonated: true,
            tenant: targetUser.tenant ? {
                name: targetUser.tenant.name,
                officialName: targetUser.tenant.officialName,
                address: targetUser.tenant.address,
                city: targetUser.tenant.city,
                taxId: targetUser.tenant.taxId,
                phone: targetUser.phone
            } : null
        }
    };
  }

  async updateProfile(userId: string, dto: { name?: string; email?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }

    // Email değişiyorsa, başka kullanıcıda kullanılmamış olmalı
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new BadRequestException("Bu e-posta adresi zaten kayıtlı.");
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return {
      success: true,
      message: "Profil bilgileri güncellendi.",
      user: updatedUser,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }

    // Eski şifre kontrolü (bcrypt compare)
    // Hem bcrypt hash'li hem de plain text şifreleri destekle (geçiş dönemi için)
    let isOldPasswordValid = false;
    
    if (user.password.startsWith("$2")) {
      // Bcrypt hash'li şifre
      isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    } else {
      // Plain text şifre (eski kayıtlar için)
      isOldPasswordValid = user.password === oldPassword;
    }

    if (!isOldPasswordValid) {
      throw new UnauthorizedException("Eski şifre hatalı.");
    }

    // Yeni şifre eski şifreyle aynı olamaz
    if (oldPassword === newPassword) {
      throw new BadRequestException("Yeni şifre eski şifreyle aynı olamaz.");
    }

    // Yeni şifreyi hash'le ve güncelle
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    });

    return {
      success: true,
      message: "Şifre başarıyla değiştirildi.",
    };
  }

  private generateToken(user: any, tenantCode?: string) {
      const payload = {
          sub: user.id,
          id: user.id, // Hem sub hem id ekle (uyumluluk için)
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantCode: tenantCode
      };
      console.log("[AuthService] Generating token with payload:", payload);
      const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '7d' });
      console.log("[AuthService] Token generated successfully, length:", token.length);
      return token;
  }
}
