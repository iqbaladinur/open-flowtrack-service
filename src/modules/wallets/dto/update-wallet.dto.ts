import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber } from "class-validator";

export class UpdateWalletDto {
  @ApiProperty({ example: "My Primary Bank Account", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 1500.0, required: false })
  @IsNumber()
  @IsOptional()
  initial_balance?: number;
}
