import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BackupController } from "./controllers/backup.controller";
import { BackupService } from "./services/backup.service";
import { WalletsModule } from "../wallets/wallets.module";
import { CategoriesModule } from "../categories/categories.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { MilestonesModule } from "../milestones/milestones.module";
import { BudgetsModule } from "../budgets/budgets.module";
import { Wallet } from "../wallets/entities/wallet.entity";
import { Category } from "../categories/entities/category.entity";
import { Transaction } from "../transactions/entities/transaction.entity";
import { Budget } from "../budgets/entities/budget.entity";
import { Milestone } from "../milestones/entities/milestone.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Category, Transaction, Budget, Milestone]),
    WalletsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    MilestonesModule,
  ],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
