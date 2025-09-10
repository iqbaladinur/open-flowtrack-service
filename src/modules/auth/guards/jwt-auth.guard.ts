import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError } from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err, user, info: Error) {
    if (
      info instanceof JsonWebTokenError &&
      info.name === "TokenExpiredError"
    ) {
      throw new UnauthorizedException({
        message: "Access token has expired",
        error: "TokenExpiredError",
      });
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
