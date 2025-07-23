import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateWalletDto {
  @ApiProperty({ example: "My Bank Account" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "USD" })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 1000.0 })
  @IsNumber()
  @IsNotEmpty()
  initial_balance: number;
}
