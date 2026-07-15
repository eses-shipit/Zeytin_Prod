import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { LicenseStatus, TenantStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { TokenService } from "../common/token.service";
import { AuditService } from "../audit/audit.service";
import { PolicyService } from "../policy/policy.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
    private readonly policyService: PolicyService,
  ) {}

  // KALDIRILDI: recoverPassword()
  // Saklanan parolayı doğrudan HTTP yanıtında döndürüyordu ve tek koşulu lisans
  // kodunu bilmekti. Parolalar artık hash'lendiği için zaten geri döndürülemez.
  // Yerine imzalı, tek kullanımlık, kısa ömürlü sıfırlama token'ı gelecek
  // (Faz 5). Frontend'deki /auth/forgot-password sayfası bu akışı bekliyor.

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

          const passwordHash = await bcrypt.hash(dto.password, 12);
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

          // D. Fabrikanın ilk çalışma politikası (sürüm 1).
          // Aynı transaction içinde: politikasız bir fabrika üretim yapamaz,
          // dolayısıyla kaydın yarısı oluşup yarısı oluşmamalı.
          await this.policyService.createInitialPolicy(tenant.id, tx);

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
        // Kayıt gövdesi (şifre/PII içerir) loglanmaz; sadece hata bilgisi.
        this.logger.error(`Register transaction failed: ${error?.code ?? "UNKNOWN"} - ${error?.message}`, error?.stack);
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
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { tenant: true }
    });

    if (!user) {
      throw new UnauthorizedException("E-posta veya şifre hatalı.");
    }

    // Sadece bcrypt karşılaştırması: düz metin kayıtlı şifre hiçbir zaman eşleşmez.
    const passwordOk = await bcrypt.compare(dto.password, user.password);

    if (!passwordOk) {
      throw new UnauthorizedException("E-posta veya şifre hatalı.");
    }

    // Super Admin için tenant kontrolü yapma
    if (user.role !== UserRole.SUPER_ADMIN && user.tenant && user.tenant.status !== TenantStatus.ACTIVE) {
        throw new UnauthorizedException("Üyeliğiniz aktif değil veya süresi dolmuş.");
    }

    // Token Üret
    const token = this.generateToken(user, user.tenant?.code);

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

  // KALDIRILDI: createSuperAdmin()
  // Platform sahibi oluşturmak kimlik doğrulaması olmayan bir HTTP yüzeyinde
  // durmamalı. Yerine CLI: `npm run seed:super-admin`.

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
    //
    // Token, kimin adına açıldığını (impersonatedBy) taşır: aksi halde
    // simüle edilmiş oturumda yapılan işlem gerçek yöneticininkinden
    // ayırt edilemez.
    const token = this.generateToken(targetUser, targetUser.tenant?.code, adminId);

    await this.auditService.logAction(
      tenantId,
      adminId,
      "IMPERSONATE",
      targetUser.id,
      { targetEmail: targetUser.email },
    );

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

    // Sadece bcrypt karşılaştırması: düz metin kayıtlı şifre hiçbir zaman eşleşmez.
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException("Eski şifre hatalı.");
    }

    // Yeni şifre eski şifreyle aynı olamaz
    if (oldPassword === newPassword) {
      throw new BadRequestException("Yeni şifre eski şifreyle aynı olamaz.");
    }

    // Yeni şifreyi hash'le ve güncelle
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    });

    return {
      success: true,
      message: "Şifre başarıyla değiştirildi.",
    };
  }

  /**
   * @param impersonatedBy Token'ı bir SUPER_ADMIN başkası adına açtıysa onun id'si.
   */
  private generateToken(user: any, tenantCode?: string, impersonatedBy?: string) {
      return this.tokenService.sign({
          sub: user.id,
          id: user.id, // Hem sub hem id ekle (uyumluluk için)
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantCode,
          ...(impersonatedBy && { impersonatedBy }),
      });
  }
}
