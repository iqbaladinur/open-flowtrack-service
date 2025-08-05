import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty } from "class-validator";

export class GenerateAnalyticsDto {
  @ApiProperty({
    description: "The start date for the analytics period (YYYY-MM-DD)",
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: "The end date for the analytics period (YYYY-MM-DD)",
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
