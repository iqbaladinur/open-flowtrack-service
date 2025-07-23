import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  UseGuards,
} from "@nestjs/common";
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

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered." })
  @ApiResponse({ status: 409, description: "Email already registered." })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in a user" })
  @ApiResponse({ status: 200, description: "User successfully logged in." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully.",
  })
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...user } = req.user;
    return user;
  }
}
