import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  ValidateNested,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";
import { ConditionDto } from "./condition.dto";

export class CreateMilestoneDto {
  @ApiProperty({
    example: "Emergency Fund Complete",
    description: "Name of the milestone",
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    required: false,
    example: "Build emergency fund untuk 6 bulan pengeluaran",
    description: "Detailed description of the milestone",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    required: false,
    example: "shield-checkmark-outline",
    description: "Icon identifier for UI",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    required: false,
    example: "#26de81",
    description: "Hex color code",
    pattern: "^#[0-9A-Fa-f]{6}$",
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: "Color must be a valid hex color code (e.g., #26de81)",
  })
  color?: string;

  @ApiProperty({
    type: [ConditionDto],
    description: "Array of conditions (minimum 1, maximum 10)",
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions: ConditionDto[];

  @ApiProperty({
    example: "2025-12-31",
    description: "Target date when milestone should be achieved",
  })
  @IsDateString()
  @IsNotEmpty()
  target_date: Date;
}
