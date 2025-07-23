import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { CategoryType } from "../entities/category.entity";

export class UpdateCategoryDto {
  @ApiProperty({ example: "Freelance Income", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.INCOME,
    required: false,
  })
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;

  @ApiProperty({ example: "laptop-outline", required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ example: "#45aaf2", required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
