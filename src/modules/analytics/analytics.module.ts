import { Module } from "@nestjs/common";
import { AnalyticsController } from "./controllers/analytics.controller";
import { AnalyticsService } from "./services/analytics.service";
import { TransactionsModule } from "../transactions/transactions.module";
import { BudgetsModule } from "../budgets/budgets.module";
import { AiProvider } from "src/infrastructure/ai/ai.provider";
import { GeminiAiProvider } from "src/infrastructure/ai/gemini.provider";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [TransactionsModule, BudgetsModule, ConfigModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    {
      provide: AiProvider,
      useClass: GeminiAiProvider,
    },
  ],
})
export class AnalyticsModule {}
