import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CategoryType } from "../entities/category.entity";

export class CreateCategoryDto {
  @ApiProperty({ example: "Salary" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.INCOME })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;

  @ApiProperty({ example: "briefcase-outline" })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({ example: "#26de81" })
  @IsString()
  @IsNotEmpty()
  color: string;
}
