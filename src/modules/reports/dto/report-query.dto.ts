import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsBooleanString } from "class-validator";

export class ReportQueryDto {
  @ApiProperty({
    description: "The start date for the report period (YYYY-MM-DD)",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "The end date for the report period (YYYY-MM-DD)",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Include hidden wallets in the report",
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBooleanString()
  includeHidden?: boolean;
}
