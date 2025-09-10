import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  UseGuards,
  Param,
  Req,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "../services/auth.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginDto } from "../dto/login.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { JwtRefreshGuard } from "../guards/jwt-refresh.guard";
import { RefreshTokenDto } from "../dto/refresh-token.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Redirect to Google for authentication" })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google callback for authentication" })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { access_token, refresh_token, user, config } =
      await this.authService.googleLogin(req);
    const frontendUrl = this.configService.get<string>("frontend.url");
    const userWithConfig = { ...user, config };
    const redirectUrl = `${frontendUrl}/auth/callback?token=${access_token}&refresh_token=${refresh_token}&user=${JSON.stringify(
      userWithConfig,
    )}`;
    res.redirect(redirectUrl);
  }

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User successfully registered.",
    schema: {
      example: {
        user: {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          email: "test@example.com",
          full_name: "John Doe",
          provider: "local",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
        },
        config: {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          currency: "IDR",
          fractions: 2,
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: "Email already registered." })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in a user" })
  @ApiResponse({
    status: 200,
    description: "User successfully logged in.",
    schema: {
      example: {
        access_token: "your_jwt_token",
        refresh_token: "your_refresh_token",
        user: {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          email: "test@example.com",
          full_name: "John Doe",
          provider: "local",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
        },
        config: {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          currency: "IDR",
          fractions: 2,
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh authentication token" })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refreshToken(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send password reset link" })
  @ApiResponse({ status: 200, description: "Password reset link sent." })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password/:token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset user password" })
  @ApiResponse({ status: 200, description: "Password successfully reset." })
  @ApiResponse({ status: 401, description: "Invalid or expired token." })
  async resetPassword(
    @Param("token") token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully.",
    schema: {
      example: {
        user: {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          email: "test@example.com",
          full_name: "John Doe",
          provider: "local",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
        },
        config: {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          currency: "IDR",
          fractions: 2,
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        },
      },
    },
  })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
