import { All, Controller, Req, Res, VERSION_NEUTRAL } from "@nestjs/common";
import { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { McpService } from "./mcp.service";
import { McpSessionService } from "./mcp-session.service";

@Controller({ path: "mcp", version: VERSION_NEUTRAL })
export class McpController {
  constructor(
    private readonly mcpService: McpService,
    private readonly sessionService: McpSessionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @All()
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    // Reuse existing session
    if (sessionId) {
      const session = this.sessionService.getSession(sessionId);
      if (!session) {
        res.status(404).json({ error: "Session not found or expired" });
        return;
      }
      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    // New connection — require Bearer JWT
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let userId: string;
    try {
      const payload = await this.jwtService.verifyAsync(authHeader.slice(7), {
        secret: this.configService.get<string>("jwt.secret"),
      });
      userId = payload.sub;
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        this.sessionService.setSession(sid, { transport, userId });
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        this.sessionService.deleteSession(transport.sessionId);
      }
    };

    const server = this.mcpService.createServer(userId);
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
}
