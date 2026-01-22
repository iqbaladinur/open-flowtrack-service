import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreateWalletDto {
  @ApiProperty({ example: "My Bank Account" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1000.0 })
  @IsNumber()
  @IsNotEmpty()
  initial_balance: number;

  @ApiProperty({ example: "wallet", required: false, default: "" })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_main_wallet?: boolean;
}
