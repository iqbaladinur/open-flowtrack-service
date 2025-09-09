import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { TransactionsService } from "./services/transactions.service";
import { TransactionsController } from "./controllers/transactions.controller";
import { CategoriesModule } from "../categories/categories.module";
import { AiModule } from "src/infrastructure/ai/ai.module";
import { ConfigModule } from "../config/config.module";
import { Wallet } from "../wallets/entities/wallet.entity";
import { Category } from "../categories/entities/category.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet, Category]),
    CategoriesModule,
    AiModule,
    ConfigModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
