import { Injectable } from "@nestjs/common";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { WalletsService } from "src/modules/wallets/services/wallets.service";
import { TransactionsService } from "src/modules/transactions/services/transactions.service";
import { CategoriesService } from "src/modules/categories/services/categories.service";
import { BudgetsService } from "src/modules/budgets/services/budgets.service";
import { ReportsService } from "src/modules/reports/services/reports.service";
import { MilestonesService } from "src/modules/milestones/services/milestones.service";
import { AnalyticsService } from "src/modules/analytics/services/analytics.service";

@Injectable()
export class McpService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly transactionsService: TransactionsService,
    private readonly categoriesService: CategoriesService,
    private readonly budgetsService: BudgetsService,
    private readonly reportsService: ReportsService,
    private readonly milestonesService: MilestonesService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  createServer(userId: string): McpServer {
    const server = new McpServer({ name: "wallport", version: "1.0.0" });

    this.registerWalletTools(server, userId);
    this.registerTransactionTools(server, userId);
    this.registerCategoryTools(server, userId);
    this.registerBudgetTools(server, userId);
    this.registerReportTools(server, userId);
    this.registerMilestoneTools(server, userId);
    this.registerAnalyticsTools(server, userId);

    return server;
  }

  private ok(data: any) {
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  }

  private err(message: string) {
    return {
      content: [{ type: "text" as const, text: `Error: ${message}` }],
      isError: true,
    };
  }

  // ─── Wallets ──────────────────────────────────────────────────────────────

  private registerWalletTools(server: McpServer, userId: string) {
    server.tool(
      "list_wallets",
      "Get all wallets with current balance. Optionally filter by date range.",
      {
        start_date: z.string().optional().describe("ISO date string"),
        end_date: z.string().optional().describe("ISO date string"),
      },
      async ({ start_date, end_date }) => {
        try {
          const data = await this.walletsService.findAll(
            userId,
            start_date ? new Date(start_date) : undefined,
            end_date ? new Date(end_date) : undefined,
          );
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "get_wallet",
      "Get a specific wallet by ID with its current balance.",
      {
        id: z.string().uuid(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
      },
      async ({ id, start_date, end_date }) => {
        try {
          const data = await this.walletsService.findOne(
            id,
            userId,
            start_date ? new Date(start_date) : undefined,
            end_date ? new Date(end_date) : undefined,
          );
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "create_wallet",
      "Create a new wallet.",
      {
        name: z.string(),
        initial_balance: z.number(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        is_main_wallet: z.boolean().optional(),
        is_saving: z.boolean().optional(),
      },
      async (dto) => {
        try {
          const data = await this.walletsService.create(dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "update_wallet",
      "Update an existing wallet.",
      {
        id: z.string().uuid(),
        name: z.string().optional(),
        initial_balance: z.number().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        is_main_wallet: z.boolean().optional(),
        is_saving: z.boolean().optional(),
      },
      async ({ id, ...dto }) => {
        try {
          const data = await this.walletsService.update(id, dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "delete_wallet",
      "Delete a wallet by ID.",
      { id: z.string().uuid() },
      async ({ id }) => {
        try {
          await this.walletsService.remove(id, userId);
          return this.ok({ success: true });
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );
  }

  // ─── Transactions ─────────────────────────────────────────────────────────

  private registerTransactionTools(server: McpServer, userId: string) {
    server.tool(
      "list_transactions",
      "Get all transactions with optional filters for date, wallet, category, and type.",
      {
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        wallet_id: z.string().optional(),
        category_id: z.string().optional(),
        type: z.enum(["income", "expense", "transfer"]).optional(),
        sortBy: z.enum(["ASC", "DESC"]).optional().default("DESC"),
      },
      async (query) => {
        try {
          const data = await this.transactionsService.findAll(userId, query as any);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "get_transaction",
      "Get a specific transaction by ID.",
      { id: z.string().uuid() },
      async ({ id }) => {
        try {
          const data = await this.transactionsService.findOne(id, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "create_transaction",
      "Create a single transaction (income, expense, or transfer).",
      {
        type: z.enum(["income", "expense", "transfer"]),
        amount: z.number().positive(),
        wallet_id: z.string().uuid(),
        date: z.string().describe("ISO date string, e.g. 2025-01-15"),
        category_id: z.string().uuid().optional(),
        destination_wallet_id: z.string().uuid().optional().describe("Required for transfers"),
        note: z.string().optional(),
      },
      async (dto) => {
        try {
          const data = await this.transactionsService.create(dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "create_transaction_from_text",
      "Create one or more expense transactions from a natural language description. Example: 'spent 50k on lunch and 30k on coffee today'.",
      {
        content: z.string().describe("Natural language description of spending"),
      },
      async ({ content }) => {
        try {
          const data = await this.transactionsService.createByText({ content }, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "create_recurring_transactions",
      "Create multiple transactions at once with a recurring pattern (e.g. monthly rent for 12 months).",
      {
        type: z.enum(["income", "expense", "transfer"]),
        amount: z.number().positive(),
        wallet_id: z.string().uuid(),
        date: z.string().describe("Start date, ISO format"),
        recurring_pattern: z.enum(["daily", "weekly", "monthly", "yearly"]),
        category_id: z.string().uuid().optional(),
        note: z.string().optional(),
        recurring_count: z.number().int().positive().optional().describe("Number of occurrences"),
        recurring_until: z.string().optional().describe("End date for recurrence, ISO format"),
      },
      async (dto) => {
        try {
          const data = await this.transactionsService.createBulkRecurring(dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "update_transaction",
      "Update an existing transaction.",
      {
        id: z.string().uuid(),
        type: z.enum(["income", "expense", "transfer"]).optional(),
        amount: z.number().positive().optional(),
        wallet_id: z.string().uuid().optional(),
        category_id: z.string().uuid().optional(),
        destination_wallet_id: z.string().uuid().optional(),
        date: z.string().optional(),
        note: z.string().optional(),
      },
      async ({ id, ...dto }) => {
        try {
          const data = await this.transactionsService.update(id, dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "delete_transaction",
      "Delete a transaction by ID.",
      { id: z.string().uuid() },
      async ({ id }) => {
        try {
          await this.transactionsService.remove(id, userId);
          return this.ok({ success: true });
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  private registerCategoryTools(server: McpServer, userId: string) {
    server.tool(
      "list_categories",
      "Get all categories (user-created and system defaults). Optionally filter by type.",
      {
        type: z.enum(["income", "expense", "transfer"]).optional(),
      },
      async ({ type }) => {
        try {
          const data = await this.categoriesService.findAll(userId, type as any);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "create_category",
      "Create a new transaction category.",
      {
        name: z.string(),
        type: z.enum(["income", "expense", "transfer"]),
        icon: z.string().describe("Icon identifier, e.g. 'cart-outline'"),
        color: z.string().describe("Hex color code, e.g. '#26de81'"),
      },
      async (dto) => {
        try {
          const data = await this.categoriesService.create(dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );
  }

  // ─── Budgets ──────────────────────────────────────────────────────────────

  private registerBudgetTools(server: McpServer, userId: string) {
    server.tool(
      "list_budgets",
      "Get all budgets with how much has been spent against each.",
      {
        start_date: z.string().optional(),
        end_date: z.string().optional(),
      },
      async (query) => {
        try {
          const data = await this.budgetsService.findAll(userId, query as any);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "get_budget",
      "Get a specific budget with its spending details.",
      { id: z.string().uuid() },
      async ({ id }) => {
        try {
          const data = await this.budgetsService.findOne(id, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "create_budget",
      "Create a spending budget for one or more categories.",
      {
        name: z.string(),
        category_ids: z.array(z.string().uuid()),
        limit_amount: z.number().positive(),
        start_date: z.string().describe("ISO date string"),
        end_date: z.string().describe("ISO date string"),
      },
      async (dto) => {
        try {
          const data = await this.budgetsService.create(dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );
  }

  // ─── Reports ──────────────────────────────────────────────────────────────

  private registerReportTools(server: McpServer, userId: string) {
    const reportParams = {
      startDate: z.string().optional().describe("YYYY-MM-DD"),
      endDate: z.string().optional().describe("YYYY-MM-DD"),
      includeHidden: z.boolean().optional().describe("Include hidden wallets"),
    };

    server.tool(
      "get_summary_report",
      "Get total income, total expenses, and net for a given date range.",
      reportParams,
      async ({ startDate, endDate, includeHidden }) => {
        try {
          const data = await this.reportsService.getSummary(userId, startDate, endDate, includeHidden);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "get_category_report",
      "Get a breakdown of income and expenses grouped by category.",
      reportParams,
      async ({ startDate, endDate, includeHidden }) => {
        try {
          const data = await this.reportsService.getCategoryReport(userId, startDate, endDate, includeHidden);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "get_wallet_report",
      "Get a balance summary per wallet (initial balance, income, expenses, final balance).",
      reportParams,
      async ({ startDate, endDate, includeHidden }) => {
        try {
          const data = await this.reportsService.getWalletReport(userId, startDate, endDate, includeHidden);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );
  }

  // ─── Milestones ───────────────────────────────────────────────────────────

  private registerMilestoneTools(server: McpServer, userId: string) {
    server.tool(
      "list_milestones",
      "Get all financial milestones with their progress.",
      {
        status: z
          .enum(["pending", "in_progress", "achieved", "failed", "cancelled"])
          .optional(),
        sort_by: z.enum(["target_date", "created_at", "name"]).optional(),
        order: z.enum(["ASC", "DESC"]).optional(),
      },
      async (query) => {
        try {
          const data = await this.milestonesService.findAll(userId, query as any);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "create_milestone",
      "Create a financial milestone with one or more conditions to track.",
      {
        name: z.string().min(1).max(200),
        target_date: z.string().describe("ISO date string"),
        conditions: z
          .array(
            z.object({
              type: z.enum([
                "wallet_balance",
                "budget_control",
                "transaction_amount",
                "period_total",
                "net_worth",
                "category_spending",
              ]),
              config: z.record(z.string(), z.any()).describe("Condition-specific configuration"),
            }),
          )
          .min(1)
          .max(10),
        description: z.string().max(1000).optional(),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      },
      async (dto) => {
        try {
          const data = await this.milestonesService.create(dto as any, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );

    server.tool(
      "check_milestone_progress",
      "Force a fresh progress recalculation for a specific milestone.",
      { id: z.string().uuid() },
      async ({ id }) => {
        try {
          const data = await this.milestonesService.checkProgress(id, userId);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  private registerAnalyticsTools(server: McpServer, userId: string) {
    server.tool(
      "generate_analytics",
      "Generate AI-powered financial analytics and insights for a given period. Requires a Gemini API key configured in user settings.",
      {
        startDate: z.string().describe("Start date YYYY-MM-DD"),
        endDate: z.string().describe("End date YYYY-MM-DD"),
      },
      async (dto) => {
        try {
          const data = await this.analyticsService.generateAnalytics(userId, dto);
          return this.ok(data);
        } catch (e: any) {
          return this.err(e.message);
        }
      },
    );
  }
}
