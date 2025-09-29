import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsString,
  IsArray,
  IsDateString,
} from "class-validator";

export class CreateBudgetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID("all", { each: true })
  @IsNotEmpty()
  category_ids: string[];

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @IsNotEmpty()
  limit_amount: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  end_date: Date;
}
