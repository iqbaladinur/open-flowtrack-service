import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../services/auth.service";
import { Request } from "express";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refresh_token"),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.refreshSecret"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const refreshToken = req.body.refresh_token;
    const isTokenMatching = await this.authService.isRefreshTokenMatching(
      refreshToken,
      user.refresh_token,
    );
    if (!isTokenMatching) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
