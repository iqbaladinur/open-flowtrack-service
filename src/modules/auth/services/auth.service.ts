import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../users/services/users.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginDto } from "../dto/login.dto";
import * as bcrypt from "bcrypt";
import { User } from "src/modules/users/entities/user.entity";

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

  async validateUser(userId: string): Promise<User> {
    return this.usersService.findOneById(userId);
  }
}
