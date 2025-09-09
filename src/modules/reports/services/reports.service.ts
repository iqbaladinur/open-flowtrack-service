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

  async getSummary(
    userId: string,
    startDate?: string,
    endDate?: string,
    includeHidden?: boolean,
  ) {
    const qb = this.transactionsRepository.createQueryBuilder("transaction");

    qb.select(
      "SUM(CASE WHEN transaction.type = :income THEN transaction.amount ELSE 0 END)",
      "totalIncome",
    )
      .addSelect(
        "SUM(CASE WHEN transaction.type = :expense THEN transaction.amount ELSE 0 END)",
        "totalExpense",
      )
      .addSelect(
        "SUM(CASE WHEN transaction.type = :transfer THEN transaction.amount ELSE 0 END)",
        "totalTransfer",
      )
      .innerJoin("transaction.wallet", "wallet")
      .where("transaction.user_id = :userId", {
        userId,
        income: CategoryType.INCOME,
        expense: CategoryType.EXPENSE,
        transfer: CategoryType.TRANSFER,
      });

    const shouldIncludeHidden = String(includeHidden) === "true";
    if (!shouldIncludeHidden) {
      qb.andWhere("wallet.hidden = :hidden", { hidden: false });
    }

    if (startDate) {
      qb.andWhere("transaction.date >= :startDate", { startDate });
    }

    if (endDate) {
      qb.andWhere("transaction.date <= :endDate", { endDate });
    }

    const result = await qb.getRawOne();

    const totalIncome = parseFloat(result.totalIncome) || 0;
    const totalExpense = parseFloat(result.totalExpense) || 0;
    const totalTransfer = parseFloat(result.totalTransfer) || 0;
    const net = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      totalTransfer,
      net,
    };
  }

  async getCategoryReport(
    userId: string,
    startDate?: string,
    endDate?: string,
    includeHidden?: boolean,
  ) {
    const qb = this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("category.name", "name")
      .addSelect("category.color", "color")
      .addSelect("category.icon", "icon")
      .addSelect("SUM(transaction.amount)", "total")
      .addSelect("transaction.type", "type")
      .innerJoin("transaction.category", "category")
      .innerJoin("transaction.wallet", "wallet")
      .where("transaction.user_id = :userId", { userId });

    const shouldIncludeHidden = String(includeHidden) === "true";
    if (!shouldIncludeHidden) {
      qb.andWhere("wallet.hidden = :hidden", { hidden: false });
    }

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
      .addGroupBy("transaction.type")
      .addOrderBy("transaction.type")
      .addOrderBy("total", "DESC");

    const result = await qb.getRawMany();

    const reports = result.reduce((acc, item) => {
      const { name, color, icon, total, type } = item;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({
        name,
        color,
        icon,
        total: parseFloat(total) || 0,
      });
      return acc;
    }, {});

    return reports;
  }

  async getWalletReport(
    userId: string,
    startDate?: string,
    endDate?: string,
    includeHidden?: boolean,
  ) {
    const shouldIncludeHidden = String(includeHidden) === "true";
    const wallets = await this.walletsRepository.find({
      where: {
        user_id: userId,
        ...(shouldIncludeHidden ? {} : { hidden: false }),
      },
    });

    const reports = [];
    for (const wallet of wallets) {
      // Calculate balance change before start date
      const balanceChangeQb = this.transactionsRepository
        .createQueryBuilder("transaction")
        .select(
          `SUM(
          CASE
            WHEN transaction.wallet_id = :walletId AND transaction.type = :income THEN transaction.amount
            WHEN transaction.wallet_id = :walletId AND transaction.type = :expense THEN -transaction.amount
            WHEN transaction.wallet_id = :walletId AND transaction.type = :transfer THEN -transaction.amount
            WHEN transaction.destination_wallet_id = :walletId AND transaction.type = :transfer THEN transaction.amount
            ELSE 0
          END
        )`,
          "change",
        )
        .where("transaction.user_id = :userId", { userId })
        .andWhere(
          "(transaction.wallet_id = :walletId OR transaction.destination_wallet_id = :walletId)",
        )
        .setParameters({
          walletId: wallet.id,
          income: CategoryType.INCOME,
          expense: CategoryType.EXPENSE,
          transfer: CategoryType.TRANSFER,
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
          `SUM(
          CASE
            WHEN transaction.type = :income AND transaction.wallet_id = :walletId THEN transaction.amount
            WHEN transaction.type = :transfer AND transaction.destination_wallet_id = :walletId THEN transaction.amount
            ELSE 0
          END
        )`,
          "totalIncome",
        )
        .addSelect(
          `SUM(
          CASE
            WHEN transaction.type = :expense AND transaction.wallet_id = :walletId THEN transaction.amount
            WHEN transaction.type = :transfer AND transaction.wallet_id = :walletId THEN transaction.amount
            ELSE 0
          END
        )`,
          "totalExpense",
        )
        .where("transaction.user_id = :userId", { userId })
        .andWhere(
          "(transaction.wallet_id = :walletId OR transaction.destination_wallet_id = :walletId)",
        )
        .setParameters({
          walletId: wallet.id,
          income: CategoryType.INCOME,
          expense: CategoryType.EXPENSE,
          transfer: CategoryType.TRANSFER,
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
