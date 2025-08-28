import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTransactionByTextDto {
  @ApiProperty({
    example: "i just eat burger for 10 dollar",
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
