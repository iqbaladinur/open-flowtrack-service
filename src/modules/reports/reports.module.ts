import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportsService } from "./services/reports.service";
import { ReportsController } from "./controllers/reports.controller";
import { Transaction } from "../transactions/entities/transaction.entity";
import { Category } from "../categories/entities/category.entity";
import { Wallet } from "../wallets/entities/wallet.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category, Wallet])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
