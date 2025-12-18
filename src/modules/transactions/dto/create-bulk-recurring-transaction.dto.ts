import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateTransactionDto } from "./create-transaction.dto";

export enum RecurringPattern {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export class CreateBulkRecurringTransactionDto extends CreateTransactionDto {
  @ApiProperty({
    enum: RecurringPattern,
    example: RecurringPattern.MONTHLY,
    description: "Recurring pattern for bulk transaction creation",
  })
  @IsEnum(RecurringPattern)
  @IsNotEmpty()
  recurring_pattern: RecurringPattern;

  @ApiProperty({
    example: 12,
    required: false,
    description: "Number of times to repeat the transaction",
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @ValidateIf((o) => !o.recurring_until)
  recurring_count?: number;

  @ApiProperty({
    required: false,
    description: "End date for recurring transactions",
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ValidateIf((o) => !o.recurring_count)
  recurring_until?: Date;
}
