import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "test@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "password123" })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "John Doe", required: false })
  @IsString()
  @IsOptional()
  full_name?: string;
}
