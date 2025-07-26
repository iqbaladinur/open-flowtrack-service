import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsNumber } from "class-validator";
import { Currency } from "../entities/currency.enum";

export class UpdateWalletDto {
  @ApiProperty({ example: "My Primary Bank Account", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: Currency, required: false, example: Currency.IDR })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiProperty({ example: 1500.0, required: false })
  @IsNumber()
  @IsOptional()
  initial_balance?: number;
}
