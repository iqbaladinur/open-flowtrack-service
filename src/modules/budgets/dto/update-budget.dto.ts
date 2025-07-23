import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class UpdateBudgetDto {
  @ApiProperty({ example: 600.0, required: false })
  @IsNumber()
  @IsOptional()
  limit_amount?: number;
}
