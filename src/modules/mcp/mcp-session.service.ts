import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

interface AuthCode {
  userId: string;
  accessToken: string;
  refreshToken: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  redirectUri: string;
  expiresAt: Date;
}

export interface McpSession {
  transport: StreamableHTTPServerTransport;
  userId: string;
}

@Injectable()
export class McpSessionService {
  private readonly authCodes = new Map<string, AuthCode>();
  private readonly sessions = new Map<string, McpSession>();

  generateAuthCode(
    userId: string,
    accessToken: string,
    refreshToken: string,
    codeChallenge: string,
    codeChallengeMethod: string,
    redirectUri: string,
  ): string {
    const code = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    this.authCodes.set(code, {
      userId,
      accessToken,
      refreshToken,
      codeChallenge,
      codeChallengeMethod,
      redirectUri,
      expiresAt,
    });

    setTimeout(() => this.authCodes.delete(code), 5 * 60 * 1000);
    return code;
  }

  validateAndConsumeAuthCode(
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): AuthCode | null {
    const authCode = this.authCodes.get(code);
    if (!authCode) return null;
    if (authCode.expiresAt < new Date()) {
      this.authCodes.delete(code);
      return null;
    }
    if (authCode.redirectUri !== redirectUri) return null;

    if (authCode.codeChallengeMethod === "S256") {
      const challenge = createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");
      if (challenge !== authCode.codeChallenge) return null;
    } else {
      if (codeVerifier !== authCode.codeChallenge) return null;
    }

    this.authCodes.delete(code);
    return authCode;
  }

  setSession(sessionId: string, session: McpSession): void {
    this.sessions.set(sessionId, session);
  }

  getSession(sessionId: string): McpSession | undefined {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
