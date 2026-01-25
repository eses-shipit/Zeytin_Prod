import { Body, Controller, Post, Patch, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ContextService } from "../common/context.service";

@Controller("auth")
@Throttle({ short: { limit: 10, ttl: 60000 } }) // Auth route'ları için 10 istek/60 saniye
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly contextService: ContextService,
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("recover-password")
  recoverPassword(@Body() body: { email: string; licenseCode: string }) {
    return this.authService.recoverPassword(body.email, body.licenseCode);
  }

  @Post("check-license")
  checkLicense(@Body() body: { code: string }) {
    return this.authService.checkLicense(body.code);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("create-super-admin")
  async createSuperAdmin(@Body() body: { email: string; password: string; name?: string }) {
    return this.authService.createSuperAdmin(body.email, body.password, body.name);
  }

  @Patch("profile")
  async updateProfile(@Body() dto: { name?: string; email?: string; phone?: string }) {
    const userId = this.contextService.get("USER_ID");
    if (!userId) {
      throw new Error("Kullanıcı kimliği bulunamadı.");
    }
    return this.authService.updateProfile(userId, dto);
  }

  @Patch("change-password")
  async changePassword(@Body() body: { oldPassword: string; newPassword: string }) {
    const userId = this.contextService.get("USER_ID");
    if (!userId) {
      throw new Error("Kullanıcı kimliği bulunamadı.");
    }
    return this.authService.changePassword(userId, body.oldPassword, body.newPassword);
  }
}

