import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { TransactionsService } from "../../transactions/services/transactions.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { AiProvider } from "../../../infrastructure/ai/ai.provider";
import { GenerateAnalyticsDto } from "../dto/generate-analytics.dto";
import { User } from "src/modules/users/entities/user.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "src/modules/config/services/config.service";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly aiProvider: AiProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async generateAnalytics(
    user: User,
    generateAnalyticsDto: GenerateAnalyticsDto,
  ): Promise<any> {
    const config = await this.configService.getCurrencyConfig(user.id);
    if (!config.gemini_api_key) {
      throw new BadRequestException(
        "AI features are not available. Please configure your Gemini API key in settings.",
      );
    }

    const { startDate, endDate } = generateAnalyticsDto;
    const key = {
      st: new Date(startDate).toDateString(),
      en: new Date(endDate).toDateString(),
    };
    const cacheKey = `analytics:${user.id}:${key.st}:${key.en}:`;

    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return {
        analytics: cachedResult,
        source: "cache",
      };
    }

    const transactions = await this.transactionsService.findAll(user.id, {
      start_date: new Date(startDate),
      end_date: new Date(endDate),
    });

    const budgets = await this.budgetsService.findAll(user.id, {});

    const prompt = this.constructPrompt(transactions, budgets);
    const analyticsResult = await this.aiProvider.generateText(
      prompt,
      config.gemini_api_key,
    );

    await this.cacheManager.set(cacheKey, analyticsResult, 1000 * 60 * 60 * 24);

    return {
      analytics: analyticsResult,
      source: "api",
    };
  }

  private constructPrompt(transactions: any[], budgets: any[]): string {
    const transactionsSummary = transactions
      .map((t) => {
        if (t.type === "transfer") {
          return `- ${t.date.toISOString().split("T")[0]}: Transfer of ${
            t.amount
          } from ${t.wallet?.name} to ${t.destinationWallet?.name}`;
        }
        return `- ${t.date.toISOString().split("T")[0]}: ${t.type} of ${
          t.amount
        } for ${t.category.name}[${t.category.id}] (${t.note || "no note"}) on wallet ${t.wallet?.name}`;
      })
      .join("\n");

    const budgetsSummary = budgets
      .map(
        (b) =>
          `- Budget limit for ${b.category.name}[${b.category.id}]: ${b.limit_amount}`,
      )
      .join("\n");

    return `
      Here is my financial data for the selected period:

      Transactions:
      ${transactionsSummary}

      Budgets (if available):
      ${budgetsSummary}

      Please analyze my spending habits in a friendly and insightful way.
      Focus on:
      - Income vs. expenses ratio
      - Spending by category
      - Budget performance (only if budget data is provided)
      - Higlight higest expense and income in total by category id that written in format "[uuid]" inside transaction summary

      Summarize your analysis using short, helpful suggestions or observations.
      Each line should:
      - Use friendly words, do not show any of id format "[uuid]"
      - Be no longer than 130 characters
      - Use some emoticons to laverage emotions
      - Be separated by a "|" character
      - Try to find interesting patterns or anomalies
      - Make it max 8 suggestions

      Do not include any budget-related insight if the budget data is missing.
    `;
  }
}
