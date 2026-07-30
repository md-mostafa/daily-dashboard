import { Controller, Post, Body, Req, HttpCode, HttpStatus } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.register(dto, ipAddress, userAgent);

    return {
      data: result,
      message: "Account created successfully. Please verify your email.",
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.login(dto, ipAddress, userAgent);

    return {
      data: result,
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.refreshToken(dto.refreshToken, ipAddress, userAgent);

    return {
      data: result,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    await this.authService.logout(body.refreshToken ?? "", ipAddress, userAgent);

    return {
      data: { message: "Logged out successfully" },
    };
  }

  @Post("logout/all")
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    // Extract user from access token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return { data: { message: "Logged out from all devices" } };
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await this.authService.verifyToken(token);
    await this.authService.logoutAll(payload.sub, ipAddress, userAgent);

    return {
      data: { message: "Logged out from all devices" },
    };
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() body: { token: string },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    await this.authService.verifyEmail(body.token, ipAddress, userAgent);

    return {
      data: { message: "Email verified successfully" },
    };
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() body: { email: string },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    await this.authService.forgotPassword(body.email, ipAddress, userAgent);

    return {
      data: { message: "If the account exists, a password reset link has been sent." },
    };
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { token: string; password: string },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip ?? "unknown";
    const userAgent = req.headers["user-agent"];

    await this.authService.resetPassword(body.token, body.password, ipAddress, userAgent);

    return {
      data: { message: "Password reset successfully. Please log in with your new password." },
    };
  }
}
