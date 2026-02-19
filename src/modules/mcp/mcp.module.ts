import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { McpController } from "./mcp.controller";
import { McpOAuthController, McpWellKnownController } from "./mcp-oauth.controller";
import { McpService } from "./mcp.service";
import { McpSessionService } from "./mcp-session.service";
import { AuthModule } from "../auth/auth.module";
import { WalletsModule } from "../wallets/wallets.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { CategoriesModule } from "../categories/categories.module";
import { BudgetsModule } from "../budgets/budgets.module";
import { ReportsModule } from "../reports/reports.module";
import { MilestonesModule } from "../milestones/milestones.module";
import { AnalyticsModule } from "../analytics/analytics.module";

@Module({
  imports: [
    AuthModule,
    WalletsModule,
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
    ReportsModule,
    MilestonesModule,
    AnalyticsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret"),
        signOptions: { expiresIn: configService.get<string>("jwt.expiresIn") },
      }),
    }),
  ],
  controllers: [McpController, McpOAuthController, McpWellKnownController],
  providers: [McpService, McpSessionService],
})
export class McpModule {}
