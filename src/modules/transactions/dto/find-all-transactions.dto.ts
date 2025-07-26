import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsIn, IsDate, IsString } from "class-validator";
import { CategoryType } from "../../categories/entities/category.entity";
import { Type } from "class-transformer";

export class FindAllTransactionsDto {
  @ApiProperty({
    required: false,
    description: "The start date for the transactions.",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @ApiProperty({
    required: false,
    description: "The end date for the transactions.",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;

  @ApiProperty({ required: false, description: "Filter by wallet ID." })
  @IsOptional()
  @IsString()
  wallet_id?: string;

  @ApiProperty({ required: false, description: "Filter by category ID." })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({
    required: false,
    enum: CategoryType,
    description: "Filter by transaction type.",
  })
  @IsOptional()
  @IsIn([CategoryType.INCOME, CategoryType.EXPENSE])
  type?: CategoryType;

  @ApiProperty({
    required: false,
    enum: ["ASC", "DESC"],
    default: "DESC",
    description: "Sort by date.",
  })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortBy?: "ASC" | "DESC" = "DESC";
}
