import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction } from "../../transactions/entities/transaction.entity";
import {
  Category,
  CategoryType,
} from "../../categories/entities/category.entity";
import { Wallet } from "../../wallets/entities/wallet.entity";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async getSummary(userId: string, startDate?: string, endDate?: string) {
    const qb = this.transactionsRepository.createQueryBuilder("transaction");

    qb.select(
      "SUM(CASE WHEN transaction.type = :income THEN transaction.amount ELSE 0 END)",
      "totalIncome",
    )
      .addSelect(
        "SUM(CASE WHEN transaction.type = :expense THEN transaction.amount ELSE 0 END)",
        "totalExpense",
      )
      .where("transaction.user_id = :userId", {
        userId,
        income: CategoryType.INCOME,
        expense: CategoryType.EXPENSE,
      });

    if (startDate) {
      qb.andWhere("transaction.date >= :startDate", { startDate });
    }

    if (endDate) {
      qb.andWhere("transaction.date <= :endDate", { endDate });
    }

    const result = await qb.getRawOne();

    const totalIncome = parseFloat(result.totalIncome) || 0;
    const totalExpense = parseFloat(result.totalExpense) || 0;
    const net = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      net,
    };
  }

  async getCategoryReport(
    userId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const qb = this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("category.name", "name")
      .addSelect("category.color", "color")
      .addSelect("category.icon", "icon")
      .addSelect("SUM(transaction.amount)", "total")
      .innerJoin("transaction.category", "category")
      .where("transaction.user_id = :userId", { userId })
      .andWhere("transaction.type = :expenseType", {
        expenseType: CategoryType.EXPENSE,
      });

    if (startDate) {
      qb.andWhere("transaction.date >= :startDate", { startDate });
    }
    if (endDate) {
      qb.andWhere("transaction.date <= :endDate", { endDate });
    }

    qb.groupBy("category.id")
      .addGroupBy("category.name")
      .addGroupBy("category.color")
      .addGroupBy("category.icon")
      .orderBy("total", "DESC");

    const result = await qb.getRawMany();

    return result.map((item) => ({
      name: item.name,
      color: item.color,
      icon: item.icon,
      total: parseFloat(item.total) || 0,
    }));
  }

  async getWalletReport(userId: string, startDate?: string, endDate?: string) {
    const wallets = await this.walletsRepository.find({
      where: { user_id: userId },
    });

    const reports = [];
    for (const wallet of wallets) {
      // Calculate balance change before start date
      const balanceChangeQb = this.transactionsRepository
        .createQueryBuilder("transaction")
        .select(
          "SUM(CASE WHEN transaction.type = :income THEN transaction.amount ELSE -transaction.amount END)",
          "change",
        )
        .where("transaction.wallet_id = :walletId", { walletId: wallet.id })
        .setParameters({
          income: CategoryType.INCOME,
        });

      if (startDate) {
        balanceChangeQb.andWhere("transaction.date < :startDate", {
          startDate,
        });
      }

      const balanceChangeResult = await balanceChangeQb.getRawOne();
      const balanceChange = parseFloat(balanceChangeResult.change) || 0;
      const initialBalance =
        parseFloat(wallet.initial_balance.toString()) + balanceChange;

      // Calculate income and expense within the date range
      const periodQb = this.transactionsRepository
        .createQueryBuilder("transaction")
        .select(
          "SUM(CASE WHEN transaction.type = :income THEN transaction.amount ELSE 0 END)",
          "totalIncome",
        )
        .addSelect(
          "SUM(CASE WHEN transaction.type = :expense THEN transaction.amount ELSE 0 END)",
          "totalExpense",
        )
        .where("transaction.wallet_id = :walletId", { walletId: wallet.id })
        .setParameters({
          income: CategoryType.INCOME,
          expense: CategoryType.EXPENSE,
        });

      if (startDate) {
        periodQb.andWhere("transaction.date >= :startDate", { startDate });
      }
      if (endDate) {
        periodQb.andWhere("transaction.date <= :endDate", { endDate });
      }

      const periodResult = await periodQb.getRawOne();
      const totalIncome = parseFloat(periodResult.totalIncome) || 0;
      const totalExpense = parseFloat(periodResult.totalExpense) || 0;
      const finalBalance = initialBalance + totalIncome - totalExpense;

      reports.push({
        name: wallet.name,
        initialBalance,
        totalIncome,
        totalExpense,
        finalBalance,
      });
    }

    return reports;
  }
}
