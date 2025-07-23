import { Controller, Get, UseGuards, Request, Res } from "@nestjs/common";
import { ExportService } from "../services/export.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";

@ApiTags("Export")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("export")
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get("transactions/csv")
  @ApiOperation({ summary: "Export user transactions to CSV" })
  async exportTransactions(@Request() req, @Res() res: Response) {
    const csvData = await this.exportService.exportTransactionsToCsv(
      req.user.id,
    );
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    return res.send(csvData);
  }
}
