import { Inject, Injectable } from "@nestjs/common";
import { TransactionsService } from "../../transactions/services/transactions.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { AiProvider } from "../../../infrastructure/ai/ai.provider";
import { GenerateAnalyticsDto } from "../dto/generate-analytics.dto";
import { User } from "src/modules/users/entities/user.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly aiProvider: AiProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async generateAnalytics(
    user: User,
    generateAnalyticsDto: GenerateAnalyticsDto,
  ): Promise<any> {
    const { startDate, endDate } = generateAnalyticsDto;
    const cacheKey = `analytics:${user.id}:${startDate}:${endDate}`;

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
    const analyticsResult = await this.aiProvider.generateText(prompt);

    await this.cacheManager.set(cacheKey, analyticsResult);

    return {
      analytics: analyticsResult,
      source: "api",
    };
  }

  private constructPrompt(transactions: any[], budgets: any[]): string {
    const transactionsSummary = transactions
      .map(
        (t) =>
          `- ${t.date.toISOString().split("T")[0]}: ${t.type} of ${
            t.amount
          } for ${t.category.name}[${t.category.id}] (${t.note || "no note"}) on wallet ${t.wallet?.name}`,
      )
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
      - Income vs. expenses
      - Spending by category
      - Budget performance (only if budget data is provided)
      - Higlight higest expense and income in total by category id that written in format "[uuid]" inside transaction summary

      Summarize your analysis using short, helpful suggestions or observations.
      Each line should:
      - Be no longer than 100 characters
      - Be separated by a "|" character

      Do not include any budget-related insight if the budget data is missing.
    `;
  }
}
