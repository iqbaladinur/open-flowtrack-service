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
import { ConfigService } from "../../config/services/config.service";
import { Config } from "../../config/entities/config.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async googleLogin(req): Promise<{
    access_token: string;
    user: Omit<User, "password_hash">;
    config: Config;
  }> {
    if (!req.user) {
      throw new UnauthorizedException("No user from google");
    }

    const { email, firstName, lastName } = req.user;
    let user = await this.usersService.findOneByEmail(email);
    let config: Config;
    if (!user) {
      const newUser = {
        email,
        full_name: `${firstName} ${lastName}`,
        provider: "google",
      };
      user = await this.usersService.create(newUser);
      config = await this.configService.getCurrencyConfig(user.id);
    } else {
      config = await this.configService.getCurrencyConfig(user.id);
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return {
      access_token,
      user: result,
      config,
    };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: Omit<User, "password_hash">; config: Config }> {
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
    const config = await this.configService.getCurrencyConfig(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return { user: result, config };
  }

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    user: Omit<User, "password_hash">;
    config: Config;
  }> {
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

    const config = await this.configService.getCurrencyConfig(user.id);
    const payload = { sub: user.id, email: user.email };
    const { password_hash, ...result } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
      config,
    };
  }

  async getProfile(
    userId: string,
  ): Promise<{ user: Omit<User, "password_hash">; config: Config }> {
    const user = await this.usersService.findOneById(userId);
    const config = await this.configService.getCurrencyConfig(userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return { user: result, config };
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
