import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { CreateBudgetDto } from "./create-budget.dto";

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}
