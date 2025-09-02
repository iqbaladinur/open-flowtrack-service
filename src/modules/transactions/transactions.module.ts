import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { TransactionsService } from "./services/transactions.service";
import { TransactionsController } from "./controllers/transactions.controller";
import { CategoriesModule } from "../categories/categories.module";
import { AiModule } from "src/infrastructure/ai/ai.module";
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    CategoriesModule,
    AiModule,
    ConfigModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
