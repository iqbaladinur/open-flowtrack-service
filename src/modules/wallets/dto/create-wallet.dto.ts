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

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
