import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ example: "newPassword123" })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
