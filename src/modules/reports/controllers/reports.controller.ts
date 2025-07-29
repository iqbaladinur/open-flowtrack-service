import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ReportsService } from "../services/reports.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ReportQueryDto } from "../dto/report-query.dto";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("summary")
  @ApiResponse({
    status: 200,
    description: "A summary of income, expense, and net.",
    schema: {
      example: {
        totalIncome: 5000.0,
        totalExpense: 2500.0,
        net: 2500.0,
      },
    },
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "YYYY-MM-DD",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "YYYY-MM-DD",
  })
  getSummary(@Request() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getSummary(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }

  @Get("by-category")
  @ApiResponse({
    status: 200,
    description: "A report of transactions grouped by category.",
    schema: {
      example: {
        income: [
          {
            name: "Salary",
            color: "#26de81",
            icon: "briefcase-outline",
            total: 5000.0,
          },
        ],
        expense: [
          {
            name: "Groceries",
            color: "#ff4757",
            icon: "cart-outline",
            total: 1500.0,
          },
        ],
      },
    },
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "YYYY-MM-DD",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "YYYY-MM-DD",
  })
  getCategoryReport(@Request() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getCategoryReport(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }

  @Get("by-wallet")
  @ApiResponse({
    status: 200,
    description: "A report of transactions grouped by wallet.",
    schema: {
      example: [
        {
          name: "My Bank Account",
          initialBalance: 1000.0,
          totalIncome: 2000.0,
          totalExpense: 500.0,
          finalBalance: 2500.0,
        },
      ],
    },
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "YYYY-MM-DD",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "YYYY-MM-DD",
  })
  getWalletReport(@Request() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getWalletReport(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }
}
