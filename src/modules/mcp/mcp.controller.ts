import { All, Controller, Req, Res, VERSION_NEUTRAL } from "@nestjs/common";
import { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { McpService } from "./mcp.service";

@Controller({ path: "mcp", version: VERSION_NEUTRAL })
export class McpController {
  constructor(
    private readonly mcpService: McpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @All()
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Stateless mode: authenticate on every request via Bearer JWT.
    // This is required for serverless deployments where in-memory session
    // state is lost between requests.
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

    // sessionIdGenerator: undefined → stateless (no Mcp-Session-Id header)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    const server = this.mcpService.createServer(userId);
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
}
