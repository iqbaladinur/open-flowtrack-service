import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Wallet } from "../modules/wallets/entities/wallet.entity";
import {
  Category,
  CategoryType,
} from "../modules/categories/entities/category.entity";
import { Transaction } from "../modules/transactions/entities/transaction.entity";

export default class TransactionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const walletsRepository = dataSource.getRepository(Wallet);
    const categoriesRepository = dataSource.getRepository(Category);
    const transactionsRepository = dataSource.getRepository(Transaction);

    const userId = "34d98304-6744-404b-952f-e11c121ff683";

    const wallets = await walletsRepository.find({
      where: { user_id: userId },
    });
    const categories = await categoriesRepository.find({
      where: { user_id: userId },
    });

    if (wallets.length === 0 || categories.length === 0) {
      console.log(
        "Skipping transaction seeder: No wallets or categories found for the specified user.",
      );
      return;
    }

    const incomeCategories = categories.filter(
      (c) => c.type === CategoryType.INCOME,
    );
    const expenseCategories = categories.filter(
      (c) => c.type === CategoryType.EXPENSE,
    );

    const transactions: Partial<Transaction>[] = [];
    for (let i = 0; i < 100; i++) {
      const isIncome = Math.random() > 0.7; // 30% chance of income
      const category = isIncome
        ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
        : expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ];

      const transaction = {
        type: category.type,
        amount: Math.round(Math.random() * (isIncome ? 5000 : 500)) + 1,
        wallet_id: wallets[Math.floor(Math.random() * wallets.length)].id,
        category_id: category.id,
        date: new Date(
          Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
        ), // Random date in the last year
        note: `Seeded transaction ${i + 1}`,
        user_id: userId,
      };
      transactions.push(transaction);
    }

    await transactionsRepository.insert(transactions);
  }
}
