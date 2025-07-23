import { Module } from "@nestjs/common";
import { ExportController } from "./controllers/export.controller";
import { ExportService } from "./services/export.service";
import { TransactionsModule } from "../transactions/transactions.module";

@Module({
  imports: [TransactionsModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
