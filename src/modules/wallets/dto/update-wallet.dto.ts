import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class UpdateWalletDto {
  @ApiProperty({ example: "My Primary Bank Account", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 1500.0, required: false })
  @IsNumber()
  @IsOptional()
  initial_balance?: number;

  @ApiProperty({ example: "wallet", required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_main_wallet?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_saving?: boolean;
}
