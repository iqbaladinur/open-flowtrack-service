import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { CategoryType } from "../../categories/entities/category.entity";
import { RecurringPattern } from "../entities/transaction.entity";

export class UpdateTransactionDto {
  @ApiProperty({ enum: CategoryType, required: false })
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  wallet_id?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  is_recurring?: boolean;

  @ApiProperty({ enum: RecurringPattern, required: false })
  @IsEnum(RecurringPattern)
  @IsOptional()
  recurring_pattern?: RecurringPattern;
}
