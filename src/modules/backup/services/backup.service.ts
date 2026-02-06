import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WalletsService } from "../../wallets/services/wallets.service";
import { CategoriesService } from "../../categories/services/categories.service";
import { TransactionsService } from "../../transactions/services/transactions.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { CategoryType } from "src/modules/categories/entities/category.entity";
import { MilestonesService } from "../../milestones/services/milestones.service";
import { Wallet } from "../../wallets/entities/wallet.entity";
import { Category } from "../../categories/entities/category.entity";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { Budget } from "../../budgets/entities/budget.entity";
import { Milestone } from "../../milestones/entities/milestone.entity";

@Injectable()
export class BackupService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly categoriesService: CategoriesService,
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly milestonesService: MilestonesService,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,
    @InjectRepository(Milestone)
    private readonly milestonesRepository: Repository<Milestone>,
  ) {}

  private async clearAllUserData(userId: string): Promise<void> {
    // Delete in order to handle foreign key constraints
    // 1. Milestones (no dependencies)
    await this.milestonesRepository.delete({ user_id: userId });
    // 2. Budgets (no FK constraints)
    await this.budgetsRepository.delete({ user_id: userId });
    // 3. Transactions (references wallets and categories)
    await this.transactionsRepository.delete({ user_id: userId });
    // 4. Categories
    await this.categoriesRepository.delete({ user_id: userId });
    // 5. Wallets
    await this.walletsRepository.delete({ user_id: userId });
  }

  async backup(userId: string) {
    const wallets = await this.walletsService.findAll(userId);
    const categories = await this.categoriesService.findAll(userId);
    const transactions = await this.transactionsService.findAll(userId, {});
    const budgets = await this.budgetsService.findAll(userId, {});
    const milestones = await this.milestonesService.findAll(userId, {});

    return {
      wallets,
      categories,
      transactions,
      budgets,
      milestones,
    };
  }

  async restore(userId: string, data: any) {
    // Clear all existing user data first (agnostic restore)
    await this.clearAllUserData(userId);

    const walletIdMap = new Map<string, string>();
    const categoryIdMap = new Map<string, string>();
    const budgetIdMap = new Map<string, string>();

    // Restore wallets
    if (data.wallets) {
      for (const walletData of data.wallets) {
        const newWallet = await this.walletsService.create(
          {
            name: walletData.name,
            initial_balance: walletData.initial_balance,
            icon: walletData.icon,
            hidden: walletData.hidden,
            is_main_wallet: walletData.is_main_wallet,
            is_saving: walletData.is_saving,
          },
          userId,
        );
        walletIdMap.set(walletData.id, newWallet.id);
      }
    }

    // Restore categories
    if (data.categories) {
      for (const categoryData of data.categories) {
        const newCategory = await this.categoriesService.create(
          {
            name: categoryData.name,
            type: categoryData.type,
            icon: categoryData.icon,
            color: categoryData.color,
          },
          userId,
        );
        categoryIdMap.set(categoryData.id, newCategory.id);
      }
    }

    // Restore transactions
    if (data.transactions) {
      for (const transactionData of data.transactions) {
        const newWalletId = walletIdMap.get(transactionData.wallet_id);
        if (!newWalletId) continue;

        if (transactionData.type === CategoryType.TRANSFER) {
          const newDestinationWalletId = walletIdMap.get(
            transactionData.destination_wallet_id,
          );
          if (!newDestinationWalletId) continue;

          await this.transactionsService.create(
            {
              type: transactionData.type,
              amount: transactionData.amount,
              wallet_id: newWalletId,
              destination_wallet_id: newDestinationWalletId,
              date: transactionData.date,
              note: transactionData.note,
            },
            userId,
          );
        } else {
          const newCategoryId = categoryIdMap.get(transactionData.category_id);
          if (!newCategoryId) continue;

          await this.transactionsService.create(
            {
              type: transactionData.type,
              amount: transactionData.amount,
              wallet_id: newWalletId,
              category_id: newCategoryId,
              date: transactionData.date,
              note: transactionData.note,
            },
            userId,
          );
        }
      }
    }

    // Restore budgets
    if (data.budgets) {
      for (const budgetData of data.budgets) {
        const newCategoryIds = budgetData.category_ids
          ? budgetData.category_ids
              .map((id: string) => categoryIdMap.get(id))
              .filter(Boolean)
          : [];

        if (newCategoryIds.length > 0) {
          const newBudget = await this.budgetsService.create(
            {
              name: budgetData.name,
              category_ids: newCategoryIds,
              limit_amount: budgetData.limit_amount,
              start_date: budgetData.start_date,
              end_date: budgetData.end_date,
            },
            userId,
          );
          budgetIdMap.set(budgetData.id, newBudget.id);
        }
      }
    }

    // Restore milestonesoke
    if (data.milestones) {
      for (const milestoneData of data.milestones) {
        // Map IDs in conditions to new IDs
        const mappedConditions =
          milestoneData.conditions
            ?.map((c: { type: string; config: any }) => {
              const newConfig = { ...c.config };

              // Map wallet_id (for wallet_balance condition)
              if (newConfig.wallet_id) {
                newConfig.wallet_id =
                  walletIdMap.get(newConfig.wallet_id) || null;
              }

              // Map budget_id (for budget_control condition)
              if (newConfig.budget_id) {
                const newBudgetId = budgetIdMap.get(newConfig.budget_id);
                if (!newBudgetId) {
                  // Skip this condition if budget not found
                  return null;
                }
                newConfig.budget_id = newBudgetId;
              }

              // Map category_id (for transaction_amount, period_total, category_spending conditions)
              if (newConfig.category_id) {
                const newCategoryId = categoryIdMap.get(newConfig.category_id);
                if (!newCategoryId) {
                  // Skip this condition if category not found
                  return null;
                }
                newConfig.category_id = newCategoryId;
              }

              return {
                type: c.type,
                config: newConfig,
              };
            })
            .filter(Boolean) || [];

        // Only create milestone if it has valid conditions
        if (mappedConditions.length > 0) {
          await this.milestonesService.create(
            {
              name: milestoneData.name,
              description: milestoneData.description,
              icon: milestoneData.icon,
              color: milestoneData.color,
              conditions: mappedConditions,
              target_date: milestoneData.target_date,
            },
            userId,
          );
        }
      }
    }

    return { message: "Restore successful" };
  }
}
