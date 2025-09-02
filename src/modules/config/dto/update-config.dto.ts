import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateConfigDto {
  @ApiProperty({ example: "USD", required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  fractions?: number;

  @ApiProperty({ example: "ysgdjsyhgdjshdgajs", required: false })
  @IsString()
  @IsOptional()
  gemini_api_key?: string;
}
