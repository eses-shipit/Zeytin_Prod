import { Body, Controller, Post, Patch, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { CheckLicenseDto } from "./dto/check-license.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/password-reset.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ContextService } from "../common/context.service";
import { Public } from "../common/decorators/public.decorator";

@Controller("auth")
@Throttle({ short: { limit: 10, ttl: 60000 } }) // Auth route'ları için 10 istek/60 saniye
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly contextService: ContextService,
  ) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("check-license")
  checkLicense(@Body() dto: CheckLicenseDto) {
    return this.authService.checkLicense(dto.code);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  // KALDIRILDI: POST /auth/recover-password
  // Kullanıcının saklanan parolasını HTTP yanıtında dönüyordu ve tek koşulu
  // lisans kodu bilmekti — lisans kodu ise fabrikadaki herkesçe bilinir.
  // Yerine imzalı, tek kullanımlık, kısa ömürlü sıfırlama token'ı gelecek.

  // KALDIRILDI: POST /auth/create-super-admin
  // Kimlik doğrulaması olmayan bir platform sahibi oluşturma yolu HTTP
  // yüzeyinde durmamalı. Yerine: `npm run seed:super-admin`.

  @Patch("profile")
  async updateProfile(@Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(this.requireUserId(), dto);
  }

  @Patch("change-password")
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      this.requireUserId(),
      dto.oldPassword,
      dto.newPassword,
    );
  }

  /**
   * JwtAuthGuard bu route'lara token'sız erişime zaten izin vermez; bu kontrol
   * yalnızca bağlamın beklendiği gibi dolu olduğunu doğrular. Eskiden burada
   * çıplak `throw new Error(...)` vardı ve istemciye 401 yerine 500 dönüyordu.
   */
  private requireUserId(): string {
    const userId = this.contextService.get("USER_ID");
    if (!userId) throw new UnauthorizedException("Kullanıcı kimliği bulunamadı.");
    return userId;
  }
}
