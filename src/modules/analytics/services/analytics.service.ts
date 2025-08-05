import { Injectable } from "@nestjs/common";
import { TransactionsService } from "../../transactions/services/transactions.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { AiProvider } from "../../../infrastructure/ai/ai.provider";
import { GenerateAnalyticsDto } from "../dto/generate-analytics.dto";
import { User } from "src/modules/users/entities/user.entity";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly aiProvider: AiProvider,
  ) {}

  async generateAnalytics(
    user: User,
    generateAnalyticsDto: GenerateAnalyticsDto,
  ): Promise<any> {
    const { startDate, endDate } = generateAnalyticsDto;

    const transactions = await this.transactionsService.findAll(user.id, {
      start_date: new Date(startDate),
      end_date: new Date(endDate),
    });

    const budgets = await this.budgetsService.findAll(user.id, {});

    const prompt = this.constructPrompt(transactions, budgets);

    const analyticsResult = await this.aiProvider.generateText(prompt);

    return {
      analytics: analyticsResult,
    };
  }

  private constructPrompt(transactions: any[], budgets: any[]): string {
    const transactionsSummary = transactions
      .map(
        (t) =>
          `- ${t.date.toISOString().split("T")[0]}: ${t.type} of ${
            t.amount
          } for ${t.category.name} (${t.note || "no note"})`,
      )
      .join("\n");

    const budgetsSummary = budgets
      .map((b) => `- Budget for ${b.category.name}: ${b.limit_amount}`)
      .join("\n");

    return `
      Here is my financial data for a period:

      Transactions:
      ${transactionsSummary}

      Budgets:
      ${budgetsSummary}

      Based on this data, please provide a friendly and insightful analysis of my spending habits. 
      Include observations about my income vs. expenses, spending by category, and how I'm doing against my budgets.
      Summarize as sugestive information with short explanation. make it max 100 character every line, separate by | character for every summarize.
    `;
  }
}
