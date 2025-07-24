import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Currency } from "../entities/wallet.entity";

export class UpdateWalletDto {
  @ApiProperty({ example: "My Primary Bank Account", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: Currency, required: false, example: Currency.IDR })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}
