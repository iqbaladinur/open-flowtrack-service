import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BudgetsController } from "./controllers/budgets.controller";
import { BudgetsService } from "./services/budgets.service";
import { Budget } from "./entities/budget.entity";
import { Transaction } from "../transactions/entities/transaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Transaction])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
