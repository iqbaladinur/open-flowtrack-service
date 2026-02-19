import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { McpSessionService } from "./mcp-session.service";
import { AuthService } from "../auth/services/auth.service";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

interface McpOAuthContext {
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  clientId: string;
  state?: string;
}

// ─── .well-known/oauth-authorization-server ──────────────────────────────────

@Controller({ path: ".well-known", version: VERSION_NEUTRAL })
export class McpWellKnownController {
  constructor(private readonly configService: ConfigService) {}

  @Get("oauth-authorization-server")
  getMetadata(@Req() req: Request) {
    const base = `${req.protocol}://${req.get("host")}`;
    return {
      issuer: base,
      authorization_endpoint: `${base}/mcp/authorize`,
      token_endpoint: `${base}/mcp/token`,
      registration_endpoint: `${base}/mcp/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
    };
  }
}

// ─── MCP OAuth endpoints ──────────────────────────────────────────────────────

@Controller({ path: "mcp", version: VERSION_NEUTRAL })
export class McpOAuthController {
  private readonly pendingContexts = new Map<string, McpOAuthContext>();

  constructor(
    private readonly sessionService: McpSessionService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // RFC 7591 dynamic client registration — no persistence needed
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Req() req: Request) {
    const body = req.body ?? {};
    return {
      client_id: randomBytes(16).toString("hex"),
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: body.redirect_uris ?? [],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    };
  }

  // Show login page
  @Get("authorize")
  authorize(@Query() query: Record<string, string>, @Res() res: Response) {
    const {
      redirect_uri,
      code_challenge,
      code_challenge_method,
      client_id,
      state,
      error,
    } = query;

    if (!redirect_uri || !code_challenge) {
      res.status(400).send("Missing required OAuth parameters");
      return;
    }

    const googleParams = new URLSearchParams({
      redirect_uri,
      code_challenge,
      code_challenge_method: code_challenge_method ?? "S256",
      client_id: client_id ?? "",
      state: state ?? "",
    });

    const errorHtml = error
      ? `<div class="alert-error">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Invalid email or password. Please try again.
        </div>`
      : "";

    // Override Helmet's CSP to allow inline styles + Google Fonts
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:",
    );

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowTrack – Sign In</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --sepia-50:  #fdf8f3;
      --sepia-100: #f7f0e6;
      --sepia-300: #e8d5bb;
      --sepia-400: #d9c4a3;
      --sepia-500: #c9b38b;
      --sepia-600: #b39a73;
      --sepia-700: #9d825b;
      --sepia-800: #7a6547;
      --sepia-900: #5a4a35;
      --green-600: #16a34a;
      --neon:      #99E627;

      --bg:                var(--sepia-50);
      --card-bg:           #ffffff;
      --card-border:       var(--sepia-300);
      --text-primary:      var(--sepia-900);
      --text-label:        var(--sepia-800);
      --input-bg:          var(--sepia-50);
      --input-border:      var(--sepia-400);
      --input-focus:       var(--sepia-600);
      --input-focus-ring:  rgba(179,154,115,.25);
      --input-text:        var(--sepia-900);
      --input-placeholder: var(--sepia-500);
      --btn-bg:            var(--sepia-800);
      --btn-text:          var(--sepia-50);
      --btn-hover:         var(--sepia-700);
      --google-bg:         #ffffff;
      --google-border:     var(--sepia-300);
      --google-text:       var(--sepia-800);
      --google-hover:      var(--sepia-100);
      --divider-line:      var(--sepia-200);
      --divider-text:      var(--sepia-500);
      --app-name:          var(--sepia-800);
      --error-bg:          #fef2f2;
      --error-border:      #fecaca;
      --error-text:        #dc2626;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg:                #020617;
        --card-bg:           rgba(30, 41, 59, 0.75);
        --card-border:       rgba(255, 255, 255, 0.08);
        --text-primary:      #f1f5f9;
        --text-label:        #cbd5e1;
        --input-bg:          #1e293b;
        --input-border:      #475569;
        --input-focus:       var(--neon);
        --input-focus-ring:  rgba(153, 230, 39, 0.2);
        --input-text:        #f1f5f9;
        --input-placeholder: #64748b;
        --btn-bg:            var(--neon);
        --btn-text:          #020617;
        --btn-hover:         #adef3a;
        --google-bg:         transparent;
        --google-border:     #334155;
        --google-text:       #cbd5e1;
        --google-hover:      rgba(255,255,255,.05);
        --divider-line:      #1e293b;
        --divider-text:      #475569;
        --app-name:          var(--neon);
        --error-bg:          rgba(239,68,68,.1);
        --error-border:      rgba(239,68,68,.2);
        --error-text:        #f87171;
      }
    }

    body {
      font-family: 'IBM Plex Sans', 'Inter', system-ui, sans-serif;
      background-color: var(--bg);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .wrap {
      width: 100%;
      max-width: 392px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    /* ── Brand ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .logo-icon {
      width: 2rem;
      height: 2rem;
      background: var(--green-600);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .app-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--app-name);
      letter-spacing: -0.015em;
    }

    /* ── Card ── */
    .card {
      width: 100%;
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 12px;
      padding: 1.75rem;
      backdrop-filter: blur(8px);
    }
    .card-title {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.375rem;
    }

    /* ── Error ── */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      border-radius: 8px;
      padding: 0.625rem 0.875rem;
      color: var(--error-text);
      font-size: 0.8125rem;
      margin-bottom: 1.125rem;
    }

    /* ── Form ── */
    .field { margin-bottom: 0.875rem; }
    label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-label);
      margin-bottom: 0.375rem;
    }
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      font-family: inherit;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 8px;
      color: var(--input-text);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    input[type="email"]::placeholder,
    input[type="password"]::placeholder { color: var(--input-placeholder); }
    input[type="email"]:focus,
    input[type="password"]:focus {
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px var(--input-focus-ring);
    }

    /* ── Buttons ── */
    .btn {
      width: 100%;
      padding: 0.5625rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-decoration: none;
      transition: background .18s, border-color .18s, opacity .18s;
    }
    .btn-primary {
      background: var(--btn-bg);
      color: var(--btn-text);
      border-color: var(--btn-bg);
      margin-top: 0.375rem;
    }
    .btn-primary:hover { background: var(--btn-hover); border-color: var(--btn-hover); }
    .btn-google {
      background: var(--google-bg);
      color: var(--google-text);
      border-color: var(--google-border);
    }
    .btn-google:hover { background: var(--google-hover); }

    /* ── Divider ── */
    .divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1rem 0;
    }
    .divider::before,
    .divider::after { content: ''; flex: 1; height: 1px; background: var(--divider-line); }
    .divider span { font-size: 0.75rem; color: var(--divider-text); white-space: nowrap; }
  </style>
</head>
<body>
<div class="wrap">

  <div class="brand">
    <div class="logo-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    </div>
    <span class="app-name">FlowTrack</span>
  </div>

  <div class="card">
    <h1 class="card-title">Sign in to FlowTrack</h1>
    ${errorHtml}
    <form method="POST" action="/mcp/authorize">
      <input type="hidden" name="redirect_uri"           value="${escapeHtml(redirect_uri)}">
      <input type="hidden" name="code_challenge"         value="${escapeHtml(code_challenge)}">
      <input type="hidden" name="code_challenge_method"  value="${escapeHtml(code_challenge_method ?? "S256")}">
      <input type="hidden" name="client_id"              value="${escapeHtml(client_id ?? "")}">
      <input type="hidden" name="state"                  value="${escapeHtml(state ?? "")}">
      <div class="field">
        <label for="email">Email address</label>
        <input type="email" id="email" name="email" placeholder="you@example.com" required autocomplete="email">
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn-primary">Sign In</button>
    </form>
    <div class="divider"><span>or</span></div>
    <a class="btn btn-google" href="/mcp/google?${googleParams.toString()}">
      <svg width="17" height="17" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.4 5.5-5 7.2v6h8c4.7-4.3 7.3-10.7 7.3-17.4z"/>
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8-6c-2.1 1.4-4.8 2.2-7.9 2.2-6.1 0-11.3-4.1-13.1-9.6H2.5v6.2C6.5 42.6 14.7 48 24 48z"/>
        <path fill="#FBBC05" d="M10.9 28.8A14.7 14.7 0 0 1 10 24c0-1.7.3-3.3.9-4.8V13H2.5A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.4-6z"/>
        <path fill="#EA4335" d="M24 9.6c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.4 30.5 0 24 0 14.7 0 6.5 5.4 2.5 13.2l8.4 6C12.7 13.7 17.9 9.6 24 9.6z"/>
      </svg>
      Continue with Google
    </a>
  </div>

</div>
</body>
</html>`);
  }

  // Handle email/password login
  @Post("authorize")
  async authorizePost(@Req() req: Request, @Res() res: Response) {
    const body: Record<string, string> = req.body ?? {};
    const {
      email,
      password,
      redirect_uri,
      code_challenge,
      code_challenge_method,
      client_id,
      state,
    } = body;

    try {
      const result = await this.authService.login({ email, password } as any);

      const code = this.sessionService.generateAuthCode(
        result.user.id,
        result.access_token,
        result.refresh_token,
        code_challenge,
        code_challenge_method ?? "S256",
        redirect_uri,
      );

      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.set("code", code);
      if (state) redirectUrl.searchParams.set("state", state);

      res.redirect(redirectUrl.toString());
    } catch {
      const errorParams = new URLSearchParams({
        redirect_uri,
        code_challenge,
        code_challenge_method: code_challenge_method ?? "S256",
        client_id: client_id ?? "",
        state: state ?? "",
        error: "invalid_credentials",
      });
      res.redirect(`/mcp/authorize?${errorParams.toString()}`);
    }
  }

  // Initiate Google OAuth
  @Get("google")
  googleOAuth(@Query() query: Record<string, string>, @Res() res: Response) {
    const {
      redirect_uri,
      code_challenge,
      code_challenge_method,
      client_id,
      state,
    } = query;

    const contextId = randomBytes(16).toString("hex");
    this.pendingContexts.set(contextId, {
      redirectUri: redirect_uri,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method ?? "S256",
      clientId: client_id ?? "",
      state,
    });
    setTimeout(() => this.pendingContexts.delete(contextId), 10 * 60 * 1000);

    const googleClientId = this.configService.get<string>("google.clientId");
    const mcpCallbackURL = this.configService.get<string>(
      "google.mcpCallbackURL",
    );

    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleUrl.searchParams.set("client_id", googleClientId);
    googleUrl.searchParams.set("redirect_uri", mcpCallbackURL);
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", "email profile");
    googleUrl.searchParams.set("state", contextId);

    res.redirect(googleUrl.toString());
  }

  // Google OAuth callback
  @Get("google/callback")
  async googleCallback(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const { code, state: contextId, error } = query;

    if (error || !code) {
      res.status(400).send(`Google OAuth error: ${escapeHtml(error ?? "missing code")}`);
      return;
    }

    const context = this.pendingContexts.get(contextId);
    if (!context) {
      res.status(400).send("OAuth context expired or invalid. Please try again.");
      return;
    }
    this.pendingContexts.delete(contextId);

    try {
      const googleClientId = this.configService.get<string>("google.clientId");
      const googleClientSecret = this.configService.get<string>("google.clientSecret");
      const mcpCallbackURL = this.configService.get<string>("google.mcpCallbackURL");

      // Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: mcpCallbackURL,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = (await tokenRes.json()) as any;
      if (!tokenRes.ok) {
        throw new Error(tokenData.error_description ?? "Token exchange failed");
      }

      // Get user info from Google
      const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
      );
      const googleUser = (await userRes.json()) as any;

      // Create or find the user in our system
      const authResult = await this.authService.googleLogin({
        user: {
          email: googleUser.email,
          firstName: googleUser.given_name ?? "",
          lastName: googleUser.family_name ?? "",
        },
      });

      const authCode = this.sessionService.generateAuthCode(
        authResult.user.id,
        authResult.access_token,
        authResult.refresh_token,
        context.codeChallenge,
        context.codeChallengeMethod,
        context.redirectUri,
      );

      const redirectUrl = new URL(context.redirectUri);
      redirectUrl.searchParams.set("code", authCode);
      if (context.state) redirectUrl.searchParams.set("state", context.state);

      res.redirect(redirectUrl.toString());
    } catch (err: any) {
      res
        .status(500)
        .send(`Authentication failed: ${escapeHtml(err.message ?? "Unknown error")}`);
    }
  }

  // Token exchange (PKCE)
  @Post("token")
  @HttpCode(HttpStatus.OK)
  async token(@Req() req: Request, @Res() res: Response) {
    const body: Record<string, string> = req.body ?? {};
    const { grant_type, code, redirect_uri, code_verifier } = body;

    if (grant_type !== "authorization_code") {
      res.status(400).json({ error: "unsupported_grant_type" });
      return;
    }

    if (!code || !redirect_uri || !code_verifier) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }

    const authCode = this.sessionService.validateAndConsumeAuthCode(
      code,
      code_verifier,
      redirect_uri,
    );

    if (!authCode) {
      res.status(400).json({ error: "invalid_grant" });
      return;
    }

    res.json({
      access_token: authCode.accessToken,
      refresh_token: authCode.refreshToken,
      token_type: "Bearer",
    });
  }
}
