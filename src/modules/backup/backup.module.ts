import { Module } from "@nestjs/common";
import { BackupController } from "./controllers/backup.controller";
import { BackupService } from "./services/backup.service";
import { WalletsModule } from "../wallets/wallets.module";
import { CategoriesModule } from "../categories/categories.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { MilestonesModule } from "../milestones/milestones.module";
import { BudgetsModule } from "../budgets/budgets.module";

@Module({
  imports: [WalletsModule, CategoriesModule, TransactionsModule, BudgetsModule, MilestonesModule],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
