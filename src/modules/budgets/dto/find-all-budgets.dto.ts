import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class FindAllBudgetsDto {
  @ApiPropertyOptional({
    description: "Filter budgets by year",
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  year?: number;
}
