import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { AnalyticsService } from "../services/analytics.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { GenerateAnalyticsDto } from "../dto/generate-analytics.dto";

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate financial analytics using AI" })
  @ApiResponse({
    status: 200,
    description: "The analytics has been successfully generated.",
  })
  generateAnalytics(
    @Request() req,
    @Body() generateAnalyticsDto: GenerateAnalyticsDto,
  ) {
    return this.analyticsService.generateAnalytics(
      req.user.id,
      generateAnalyticsDto,
    );
  }
}
