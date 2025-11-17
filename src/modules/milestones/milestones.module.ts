import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MilestonesController } from "./controllers/milestones.controller";
import { MilestonesService } from "./services/milestones.service";
import { Milestone } from "./entities/milestone.entity";
import { Wallet } from "../wallets/entities/wallet.entity";
import { Budget } from "../budgets/entities/budget.entity";
import { Transaction } from "../transactions/entities/transaction.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Milestone, Wallet, Budget, Transaction]),
  ],
  controllers: [MilestonesController],
  providers: [MilestonesService],
  exports: [MilestonesService],
})
export class MilestonesModule {}
