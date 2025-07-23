import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from "class-validator";

export class CreateBudgetDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @IsNotEmpty()
  limit_amount: number;

  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  @IsNotEmpty()
  year: number;
}
