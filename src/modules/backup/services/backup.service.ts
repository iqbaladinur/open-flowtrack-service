import { Injectable } from "@nestjs/common";
import { WalletsService } from "../../wallets/services/wallets.service";
import { CategoriesService } from "../../categories/services/categories.service";
import { TransactionsService } from "../../transactions/services/transactions.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { User } from "src/modules/users/entities/user.entity";

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
    const transactions = await this.transactionsService.findAll(user.id);
    const budgets = await this.budgetsService.findAll(user.id);

    return {
      wallets,
      categories,
      transactions,
      budgets,
    };
  }

  async restore(user: User, data: any) {
    // Restore wallets
    if (data.wallets) {
      for (const walletData of data.wallets) {
        await this.walletsService.create(walletData, user.id);
      }
    }

    // Restore categories
    if (data.categories) {
      for (const categoryData of data.categories) {
        await this.categoriesService.create(categoryData, user.id);
      }
    }

    // Restore transactions
    if (data.transactions) {
      for (const transactionData of data.transactions) {
        await this.transactionsService.create(transactionData, user.id);
      }
    }

    // Restore budgets
    if (data.budgets) {
      for (const budgetData of data.budgets) {
        await this.budgetsService.create(budgetData, user.id);
      }
    }

    return { message: "Restore successful" };
  }
}
