import { Injectable } from "@nestjs/common";
import { WalletsService } from "../../wallets/services/wallets.service";
import { CategoriesService } from "../../categories/services/categories.service";
import { TransactionsService } from "../../transactions/services/transactions.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { User } from "src/modules/users/entities/user.entity";
import { CategoryType } from "src/modules/categories/entities/category.entity";

@Injectable()
export class BackupService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly categoriesService: CategoriesService,
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
  ) {}

  async backup(user: User) {
    const wallets = await this.walletsService.findAll(user.id);
    const categories = await this.categoriesService.findAll(user.id);
    const transactions = await this.transactionsService.findAll(user.id, {});
    const budgets = await this.budgetsService.findAll(user.id, {});

    return {
      wallets,
      categories,
      transactions,
      budgets,
    };
  }

  async restore(user: User, data: any) {
    const walletIdMap = new Map<string, string>();
    const categoryIdMap = new Map<string, string>();

    // Restore wallets
    if (data.wallets) {
      for (const walletData of data.wallets) {
        const newWallet = await this.walletsService.create(
          {
            name: walletData.name,
            initial_balance: walletData.initial_balance,
          },
          user.id,
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
          user.id,
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
              is_recurring: transactionData.is_recurring,
              recurring_pattern: transactionData.recurring_pattern,
            },
            user.id,
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
              is_recurring: transactionData.is_recurring,
              recurring_pattern: transactionData.recurring_pattern,
            },
            user.id,
          );
        }
      }
    }

    // Restore budgets
    if (data.budgets) {
      for (const budgetData of data.budgets) {
        const newCategoryIds = budgetData.category_ids
          ? budgetData.category_ids.map((id) => categoryIdMap.get(id)).filter(Boolean)
          : [];

        if (newCategoryIds.length > 0) {
          await this.budgetsService.create(
            {
              name: budgetData.name,
              category_ids: newCategoryIds,
              limit_amount: budgetData.limit_amount,
              start_date: budgetData.start_date,
              end_date: budgetData.end_date,
            },
            user.id,
          );
        }
      }
    }

    return { message: "Restore successful" };
  }
}
