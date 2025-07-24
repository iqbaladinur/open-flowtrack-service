import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  // NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../users/services/users.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginDto } from "../dto/login.dto";
import * as bcrypt from "bcrypt";
import { User } from "src/modules/users/entities/user.entity";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, "password_hash">> {
    const existingUser = await this.usersService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.usersService.create({
      email: createUserDto.email,
      full_name: createUserDto.full_name,
      password_hash,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordMatching = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );
    if (!user) {
      // Don't reveal that the user doesn't exist
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const password_reset_token = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const password_reset_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.create({
      ...user,
      password_reset_token,
      password_reset_expires,
    });

    // In a real app, you'd send an email with the resetToken
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
  }

  async resetPassword(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const password_reset_token = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user =
      await this.usersService.findOneByResetToken(password_reset_token);

    if (!user || !user.password_reset_expires) {
      throw new UnauthorizedException("Invalid token");
    }

    if (user.password_reset_expires < new Date()) {
      throw new UnauthorizedException("Token expired");
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(resetPasswordDto.password, salt);

    await this.usersService.create({
      ...user,
      password_hash,
      password_reset_token: null,
      password_reset_expires: null,
    });
  }

  async validateUser(userId: string): Promise<User> {
    return this.usersService.findOneById(userId);
  }
}
