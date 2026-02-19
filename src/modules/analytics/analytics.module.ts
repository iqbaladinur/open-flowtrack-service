import { Module } from "@nestjs/common";
import { AnalyticsController } from "./controllers/analytics.controller";
import { AnalyticsService } from "./services/analytics.service";
import { TransactionsModule } from "../transactions/transactions.module";
import { BudgetsModule } from "../budgets/budgets.module";
import { AiProvider } from "src/infrastructure/ai/ai.provider";
import { GeminiAiProvider } from "src/infrastructure/ai/gemini.provider";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [
    TransactionsModule,
    BudgetsModule,
    NestConfigModule,
    ConfigModule,
    CacheModule.register({
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    }),
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    {
      provide: AiProvider,
      useClass: GeminiAiProvider,
    },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
