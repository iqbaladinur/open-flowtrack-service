import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Milestone, MilestoneStatus } from "../entities/milestone.entity";
import { CreateMilestoneDto } from "../dto/create-milestone.dto";
import { UpdateMilestoneDto } from "../dto/update-milestone.dto";
import { UpdateStatusDto } from "../dto/update-status.dto";
import {
  FindAllMilestonesDto,
  SortBy,
  Order,
} from "../dto/find-all-milestones.dto";
import {
  ConditionType,
  ConditionWithProgress,
  WalletBalanceConfig,
  BudgetControlConfig,
  TransactionAmountConfig,
  PeriodTotalConfig,
  NetWorthConfig,
  CategorySpendingConfig,
  Operator,
  BudgetConditionType,
  PeriodType,
  TransactionType,
} from "../interfaces/condition.interface";
import { Wallet } from "../../wallets/entities/wallet.entity";
import { Budget } from "../../budgets/entities/budget.entity";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private milestonesRepository: Repository<Milestone>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(
    createMilestoneDto: CreateMilestoneDto,
    userId: string,
  ): Promise<any> {
    // Add IDs to conditions
    const conditionsWithIds = createMilestoneDto.conditions.map(
      (condition) => ({
        id: uuidv4(),
        ...condition,
      }),
    );

    const milestone = this.milestonesRepository.create({
      ...createMilestoneDto,
      conditions: conditionsWithIds,
      user_id: userId,
    });

    const savedMilestone = await this.milestonesRepository.save(milestone);
    return savedMilestone;
  }

  async findAll(
    userId: string,
    query: FindAllMilestonesDto,
  ): Promise<any[]> {
    const whereClause: any = { user_id: userId };

    if (query.status) {
      whereClause.status = query.status;
    }

    const orderClause: any = {};
    const sortBy = query.sort_by || SortBy.TARGET_DATE;
    const order = query.order || Order.ASC;
    orderClause[sortBy] = order;

    const milestones = await this.milestonesRepository.find({
      where: whereClause,
      order: orderClause,
    });

    // Calculate progress for all milestones
    const milestonesWithProgress = await Promise.all(
      milestones.map((milestone) => this.calculateProgress(milestone, userId)),
    );

    return milestonesWithProgress;
  }

  async findOne(id: string, userId: string): Promise<any> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    return this.calculateProgress(milestone, userId);
  }

  async update(
    id: string,
    updateMilestoneDto: UpdateMilestoneDto,
    userId: string,
  ): Promise<any> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    // If conditions are updated, add IDs to new conditions
    if (updateMilestoneDto.conditions) {
      updateMilestoneDto.conditions = updateMilestoneDto.conditions.map(
        (condition: any) => ({
          id: condition.id || uuidv4(),
          ...condition,
        }),
      );
    }

    Object.assign(milestone, updateMilestoneDto);
    const updated = await this.milestonesRepository.save(milestone);

    return this.calculateProgress(updated, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    await this.milestonesRepository.remove(milestone);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    userId: string,
  ): Promise<any> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    milestone.status = updateStatusDto.status;

    if (updateStatusDto.status === MilestoneStatus.ACHIEVED) {
      milestone.achieved_at = new Date();
    }

    const updated = await this.milestonesRepository.save(milestone);
    return this.calculateProgress(updated, userId);
  }

  async checkProgress(id: string, userId: string): Promise<any> {
    return this.findOne(id, userId);
  }

  // Calculate progress for a milestone
  private async calculateProgress(
    milestone: Milestone,
    userId: string,
  ): Promise<any> {
    const conditionsWithProgress: ConditionWithProgress[] = await Promise.all(
      milestone.conditions.map((condition) =>
        this.calculateConditionProgress(condition, userId),
      ),
    );

    // Calculate overall progress
    const overallProgress =
      conditionsWithProgress.reduce(
        (sum, c) => sum + c.progress_percentage,
        0,
      ) / conditionsWithProgress.length;

    // Determine status
    const allMet = conditionsWithProgress.every((c) => c.is_met);
    const anyProgress = conditionsWithProgress.some(
      (c) => c.progress_percentage > 0,
    );

    let status = milestone.status;
    let achievedAt = milestone.achieved_at;

    // Only skip recalculation for CANCELLED status (manual user action)
    // Allow recalculation for ACHIEVED status when conditions are modified
    if (status !== MilestoneStatus.CANCELLED) {
      if (allMet) {
        status = MilestoneStatus.ACHIEVED;
        achievedAt = achievedAt || new Date();
        // Update in database
        await this.milestonesRepository.update(milestone.id, {
          status,
          achieved_at: achievedAt,
        });
      } else if (anyProgress) {
        status = MilestoneStatus.IN_PROGRESS;
        await this.milestonesRepository.update(milestone.id, { status });
      } else if (new Date(milestone.target_date) < new Date()) {
        status = MilestoneStatus.FAILED;
        await this.milestonesRepository.update(milestone.id, { status });
      } else {
        status = MilestoneStatus.PENDING;
      }
    }

    return {
      id: milestone.id,
      name: milestone.name,
      description: milestone.description,
      icon: milestone.icon,
      color: milestone.color,
      conditions: conditionsWithProgress,
      target_date: milestone.target_date,
      achieved_at: achievedAt,
      status,
      overall_progress: Math.round(overallProgress * 100) / 100,
      user_id: milestone.user_id,
      created_at: milestone.created_at,
      updated_at: milestone.updated_at,
    };
  }

  // Calculate progress for individual condition
  private async calculateConditionProgress(
    condition: any,
    userId: string,
  ): Promise<ConditionWithProgress> {
    switch (condition.type) {
      case ConditionType.WALLET_BALANCE:
        return this.calculateWalletBalanceProgress(condition, userId);
      case ConditionType.BUDGET_CONTROL:
        return this.calculateBudgetControlProgress(condition, userId);
      case ConditionType.TRANSACTION_AMOUNT:
        return this.calculateTransactionAmountProgress(condition, userId);
      case ConditionType.PERIOD_TOTAL:
        return this.calculatePeriodTotalProgress(condition, userId);
      case ConditionType.NET_WORTH:
        return this.calculateNetWorthProgress(condition, userId);
      case ConditionType.CATEGORY_SPENDING:
        return this.calculateCategorySpendingProgress(condition, userId);
      default:
        throw new BadRequestException(`Unknown condition type: ${condition.type}`);
    }
  }

  // Wallet Balance Progress
  private async calculateWalletBalanceProgress(
    condition: any,
    userId: string,
  ): Promise<ConditionWithProgress> {
    const config: WalletBalanceConfig = condition.config;

    let currentBalance = 0;

    if (config.wallet_id) {
      const wallet = await this.walletsRepository.findOne({
        where: { id: config.wallet_id, user_id: userId },
      });
      if (wallet) {
        currentBalance = await this.getWalletBalance(wallet.id, userId);
      }
    } else {
      // All wallets
      const wallets = await this.walletsRepository.find({
        where: { user_id: userId },
      });
      for (const wallet of wallets) {
        currentBalance += await this.getWalletBalance(wallet.id, userId);
      }
    }

    const targetValue = config.target_amount;
    const progressPercentage = Math.min(
      (currentBalance / targetValue) * 100,
      100,
    );
    const isMet = this.evaluateOperator(
      currentBalance,
      config.operator,
      targetValue,
    );

    return {
      id: condition.id,
      type: condition.type,
      config: condition.config,
      current_value: currentBalance,
      target_value: targetValue,
      progress_percentage: Math.round(progressPercentage * 100) / 100,
      is_met: isMet,
    };
  }

  // Budget Control Progress
  private async calculateBudgetControlProgress(
    condition: any,
    userId: string,
  ): Promise<ConditionWithProgress> {
    const config: BudgetControlConfig = condition.config;
    const consecutiveMonths = config.consecutive_months || 1;

    const budget = await this.budgetsRepository.findOne({
      where: { id: config.budget_id, user_id: userId },
    });

    if (!budget) {
      return this.createEmptyProgress(condition, 0, consecutiveMonths);
    }

    let metMonths = 0;
    const today = new Date();
    const startDate = new Date(budget.start_date);

    // Check each month from start date to now or budget end date
    for (let i = 0; i < consecutiveMonths; i++) {
      const monthStart = new Date(startDate);
      monthStart.setMonth(monthStart.getMonth() + i);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      if (monthStart > today) break;

      const spent = await this.calculateBudgetSpent(
        budget,
        monthStart,
        monthEnd < today ? monthEnd : today,
        userId,
      );

      let monthMet = false;
      if (config.condition === BudgetConditionType.NO_OVERSPEND) {
        monthMet = spent <= budget.limit_amount;
      } else if (config.condition === BudgetConditionType.UNDER_PERCENTAGE) {
        const threshold = (budget.limit_amount * config.percentage!) / 100;
        monthMet = spent <= threshold;
      }

      if (monthMet) {
        metMonths++;
      } else {
        // Break on first failed month for consecutive check
        break;
      }
    }

    const progressPercentage = (metMonths / consecutiveMonths) * 100;
    const isMet = metMonths >= consecutiveMonths;

    return {
      id: condition.id,
      type: condition.type,
      config: condition.config,
      current_value: metMonths,
      target_value: consecutiveMonths,
      progress_percentage: Math.round(progressPercentage * 100) / 100,
      is_met: isMet,
    };
  }

  // Transaction Amount Progress
  private async calculateTransactionAmountProgress(
    condition: any,
    userId: string,
  ): Promise<ConditionWithProgress> {
    const config: TransactionAmountConfig = condition.config;

    const whereClause: any = {
      user_id: userId,
      type: config.transaction_type,
    };

    if (config.category_id) {
      whereClause.category_id = config.category_id;
    }

    // For EQUAL operator, directly filter by exact amount
    if (config.operator === Operator.EQUAL) {
      whereClause.amount = config.amount;
    }

    // Determine sort order based on operator
    let orderDirection: "ASC" | "DESC" = "DESC";
    if (
      config.operator === Operator.LESS_THAN ||
      config.operator === Operator.LESS_THAN_EQUAL
    ) {
      orderDirection = "ASC"; // Get smallest transaction for <= or <
    }

    const transactions = await this.transactionsRepository.find({
      where: whereClause,
      order: { amount: orderDirection },
      take: 1,
    });

    const currentValue = transactions.length > 0 ? Number(transactions[0].amount) : 0;
    const targetValue = config.amount;

    // Evaluate if condition is met
    const isMet = this.evaluateOperator(
      currentValue,
      config.operator,
      targetValue,
    );

    // Progress is binary: either met (100%) or not met (0%)
    // This is because we're checking "has user EVER made a transaction"
    // not accumulating values over time
    const progressPercentage = transactions.length > 0 && isMet ? 100 : 0;

    return {
      id: condition.id,
      type: condition.type,
      config: condition.config,
      current_value: currentValue,
      target_value: targetValue,
      progress_percentage: Math.round(progressPercentage * 100) / 100,
      is_met: isMet,
    };
  }

  // Period Total Progress
  private async calculatePeriodTotalProgress(
    condition: any,
    userId: string,
  ): Promise<ConditionWithProgress> {
    const config: PeriodTotalConfig = condition.config;

    const { startDate, endDate } = this.getPeriodDates(
      config.period,
      config.start_date,
      config.end_date,
    );

    const whereClause: any = {
      user_id: userId,
      type: config.transaction_type,
      date: Between(startDate, endDate),
    };

    if (config.category_id) {
      whereClause.category_id = config.category_id;
    }

    const result = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where(whereClause)
      .getRawOne();

    const currentValue = result?.total ? Number(result.total) : 0;
    const targetValue = config.amount;
    const progressPercentage = Math.min((currentValue / targetValue) * 100, 100);
    const isMet = this.evaluateOperator(
      currentValue,
      config.operator,
      targetValue,
    );

    return {
      id: condition.id,
      type: condition.type,
      config: condition.config,
      current_value: currentValue,
      target_value: targetValue,
      progress_percentage: Math.round(progressPercentage * 100) / 100,
      is_met: isMet,
    };
  }

  // Net Worth Progress
  private async calculateNetWorthProgress(
    condition: any,
    userId: string,
  ): Promise<ConditionWithProgress> {
    const config: NetWorthConfig = condition.config;

    const whereClause: any = { user_id: userId };
    if (!config.include_hidden_wallets) {
      whereClause.hidden = false;
    }

    const wallets = await this.walletsRepository.find({ where: whereClause });

    let totalBalance = 0;
    for (const wallet of wallets) {
      totalBalance += await this.getWalletBalance(wallet.id, userId);
    }

    const targetValue = config.target_amount;
    const progressPercentage = Math.min((totalBalance / targetValue) * 100, 100);
    const isMet = this.evaluateOperator(
      totalBalance,
      config.operator,
      targetValue,
    );

    return {
      id: condition.id,
      type: condition.type,
      config: condition.config,
      current_value: totalBalance,
      target_value: targetValue,
      progress_percentage: Math.round(progressPercentage * 100) / 100,
      is_met: isMet,
    };
  }

  // Category Spending Progress
  private async calculateCategorySpendingProgress(
    condition: any,
    userId: string,
  ): Promise<ConditionWithProgress> {
    const config: CategorySpendingConfig = condition.config;

    const { startDate, endDate } = this.getPeriodDates(config.period);

    const result = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where({
        user_id: userId,
        type: TransactionType.EXPENSE,
        category_id: config.category_id,
        date: Between(startDate, endDate),
      })
      .getRawOne();

    const currentValue = result?.total ? Number(result.total) : 0;
    const targetValue = config.amount;

    // For <= operator, progress is inverse (less spending = more progress)
    let progressPercentage: number;
    if (
      config.operator === Operator.LESS_THAN_EQUAL ||
      config.operator === Operator.LESS_THAN
    ) {
      progressPercentage = currentValue <= targetValue ? 100 : 0;
    } else {
      progressPercentage = Math.min((currentValue / targetValue) * 100, 100);
    }

    const isMet = this.evaluateOperator(
      currentValue,
      config.operator,
      targetValue,
    );

    return {
      id: condition.id,
      type: condition.type,
      config: condition.config,
      current_value: currentValue,
      target_value: targetValue,
      progress_percentage: Math.round(progressPercentage * 100) / 100,
      is_met: isMet,
    };
  }

  // Helper: Get wallet balance (initial + transactions)
  private async getWalletBalance(
    walletId: string,
    userId: string,
  ): Promise<number> {
    const wallet = await this.walletsRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) return 0;

    let balance = Number(wallet.initial_balance);

    // Add income
    const income = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where({
        user_id: userId,
        wallet_id: walletId,
        type: "income",
      })
      .getRawOne();

    balance += income?.total ? Number(income.total) : 0;

    // Subtract expense
    const expense = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where({
        user_id: userId,
        wallet_id: walletId,
        type: "expense",
      })
      .getRawOne();

    balance -= expense?.total ? Number(expense.total) : 0;

    // Handle transfers
    const transferOut = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where({
        user_id: userId,
        wallet_id: walletId,
        type: "transfer",
      })
      .getRawOne();

    balance -= transferOut?.total ? Number(transferOut.total) : 0;

    const transferIn = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where({
        user_id: userId,
        destination_wallet_id: walletId,
        type: "transfer",
      })
      .getRawOne();

    balance += transferIn?.total ? Number(transferIn.total) : 0;

    return balance;
  }

  // Helper: Calculate budget spent
  private async calculateBudgetSpent(
    budget: Budget,
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<number> {
    const result = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where({
        user_id: userId,
        type: "expense",
        date: Between(startDate, endDate),
      })
      .andWhere("transaction.category_id = ANY(:categoryIds)", {
        categoryIds: budget.category_ids,
      })
      .getRawOne();

    return result?.total ? Number(result.total) : 0;
  }

  // Helper: Get period dates
  private getPeriodDates(
    period: PeriodType,
    customStart?: string,
    customEnd?: string,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case PeriodType.MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case PeriodType.QUARTER:
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case PeriodType.YEAR:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case PeriodType.CUSTOM:
        if (!customStart || !customEnd) {
          throw new BadRequestException(
            "Custom period requires start_date and end_date",
          );
        }
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
        break;
      default:
        throw new BadRequestException(`Unknown period type: ${period}`);
    }

    return { startDate, endDate };
  }

  // Helper: Evaluate operator
  private evaluateOperator(
    current: number,
    operator: Operator,
    target: number,
  ): boolean {
    switch (operator) {
      case Operator.GREATER_THAN_EQUAL:
        return current >= target;
      case Operator.GREATER_THAN:
        return current > target;
      case Operator.LESS_THAN_EQUAL:
        return current <= target;
      case Operator.LESS_THAN:
        return current < target;
      case Operator.EQUAL:
        return current === target;
      default:
        return false;
    }
  }

  // Helper: Create empty progress
  private createEmptyProgress(
    condition: any,
    currentValue: number,
    targetValue: number,
  ): ConditionWithProgress {
    return {
      id: condition.id,
      type: condition.type,
      config: condition.config,
      current_value: currentValue,
      target_value: targetValue,
      progress_percentage: 0,
      is_met: false,
    };
  }
}
