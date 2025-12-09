import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { TransactionsService } from "../../transactions/services/transactions.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { AiProvider } from "../../../infrastructure/ai/ai.provider";
import { GenerateAnalyticsDto } from "../dto/generate-analytics.dto";
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
    userId: string,
    generateAnalyticsDto: GenerateAnalyticsDto,
  ): Promise<any> {
    const config = await this.configService.getCurrencyConfig(userId);
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
    const cacheKey = `analytics:${userId}:${key.st}:${key.en}:`;

    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return {
        analytics: cachedResult,
        source: "cache",
      };
    }

    const transactions = await this.transactionsService.findAll(userId, {
      start_date: new Date(startDate),
      end_date: new Date(endDate),
    });

    const budgets = await this.budgetsService.findAll(userId, {});

    if (transactions.length === 0) {
      return {
        analytics: "No data transactions to analyze.",
        source: "cache",
      };
    }

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
            Number(t.amount).toFixed(2)
          } from ${t.wallet?.name} to ${t.destinationWallet?.name}`;
        }
        return `- ${t.date.toISOString().split("T")[0]}: ${t.type} of ${
          Number(t.amount).toFixed(2)
        } for ${t.category.name}[${t.category.id}] (${t.note || "no note"}) on wallet ${t.wallet?.name}`;
      })
      .join("\n");

    const budgetsSummary = budgets
      .map(
        (b) =>
          `- Budget limit for ${b.categories?.map((a) => `${a.name}[${a.id}]`).join(",")}: ${Number(b.limit_amount).toFixed(2)}`,
      )
      .join("\n");

    return `
You are a financial analyst. Analyze the following transaction data and provide insights.

TRANSACTION DATA:
${transactionsSummary}

BUDGET DATA:
${budgetsSummary || "No budget data available"}

ANALYSIS REQUIREMENTS:
1. Analyze income vs expenses ratio
2. Identify spending patterns by category
3. Highlight highest expense and income categories
4. Find interesting patterns or anomalies
5. Include budget performance ONLY if budget data exists

OUTPUT FORMAT RULES (MUST FOLLOW STRICTLY):
- Output ONLY the insights, no introduction, no conclusion
- Each insight must be separated by " | " (pipe with spaces)
- Maximum 8 insights
- Each insight maximum 130 characters
- Use friendly, conversational tone
- Include relevant emoticons (😊 💰 📊 🎯 ⚠️ 💡 etc)
- Do NOT include any ID in format [uuid]
- Do NOT mention budget if no budget data available

OUTPUT EXAMPLE:
Your income is 2x your expenses this month 💰 | Food spending increased 15% compared to last week 🍔 | Great job staying under budget! 🎯

NOW GENERATE THE OUTPUT:
    `;
  }
}
