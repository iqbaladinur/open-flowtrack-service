import { Injectable } from "@nestjs/common";
import { TransactionsService } from "../../transactions/services/transactions.service";

@Injectable()
export class ExportService {
  constructor(private readonly transactionsService: TransactionsService) {}

  async exportTransactionsToCsv(userId: string): Promise<string> {
    const transactions = await this.transactionsService.findAll(userId, {});
    if (transactions.length === 0) {
      return "";
    }

    const header =
      "id,amount,type,description,transaction_date,created_at,updated_at\n";
    const rows = transactions
      .map(
        (t) =>
          `${t.id},${t.amount},${t.type},"${t.description}",${t.transaction_date},${t.created_at},${t.updated_at}`,
      )
      .join("\n");

    return header + rows;
  }
}
