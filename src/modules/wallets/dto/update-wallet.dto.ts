import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateWalletDto {
  @ApiProperty({ example: "My Primary Bank Account", required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
