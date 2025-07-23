import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
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
