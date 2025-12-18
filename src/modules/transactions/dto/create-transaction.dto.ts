import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { CategoryType } from "../../categories/entities/category.entity";
import { Type } from "class-transformer";

export class CreateTransactionDto {
  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  wallet_id: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  destination_wallet_id?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
