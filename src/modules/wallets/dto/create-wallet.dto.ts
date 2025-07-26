import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Currency } from "../entities/currency.enum";

export class CreateWalletDto {
  @ApiProperty({ example: "My Bank Account" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @ApiProperty({ example: 1000.0 })
  @IsNumber()
  @IsNotEmpty()
  initial_balance: number;
}
