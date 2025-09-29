import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString } from "class-validator";

export class FindAllBudgetsDto {
  @ApiPropertyOptional({
    description: "Filter budgets by start date",
    example: "2025-01-01",
  })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiPropertyOptional({
    description: "Filter budgets by end date",
    example: "2025-12-31",
  })
  @IsOptional()
  @IsDateString()
  end_date?: Date;
}
