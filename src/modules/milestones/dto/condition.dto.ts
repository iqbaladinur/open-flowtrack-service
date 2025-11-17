import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import {
  ConditionType,
  Operator,
  BudgetConditionType,
  PeriodType,
  TransactionType,
} from "../interfaces/condition.interface";

// Base Condition DTO
export class ConditionDto {
  @ApiProperty({
    enum: ConditionType,
    example: ConditionType.WALLET_BALANCE,
  })
  @IsEnum(ConditionType)
  @IsNotEmpty()
  type: ConditionType;

  @ApiProperty({
    type: "object",
    description: "Configuration object based on condition type",
  })
  @IsObject()
  @IsNotEmpty()
  config: any;
}

// Wallet Balance Config DTO
export class WalletBalanceConfigDto {
  @ApiProperty({
    required: false,
    nullable: true,
    description: "Wallet ID or null for all wallets",
  })
  @IsOptional()
  @IsUUID()
  wallet_id: string | null;

  @ApiProperty({ enum: Operator, example: Operator.GREATER_THAN_EQUAL })
  @IsEnum(Operator)
  @IsNotEmpty()
  operator: Operator;

  @ApiProperty({ example: 100000000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  target_amount: number;
}

// Budget Control Config DTO
export class BudgetControlConfigDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  budget_id: string;

  @ApiProperty({ enum: BudgetConditionType })
  @IsEnum(BudgetConditionType)
  @IsNotEmpty()
  condition: BudgetConditionType;

  @ApiProperty({ required: false, minimum: 1, maximum: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  consecutive_months?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentage?: number;
}

// Transaction Amount Config DTO
export class TransactionAmountConfigDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  transaction_type: TransactionType;

  @ApiProperty({ enum: Operator })
  @IsEnum(Operator)
  @IsNotEmpty()
  operator: Operator;

  @ApiProperty({ example: 10000000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;
}

// Period Total Config DTO
export class PeriodTotalConfigDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  transaction_type: TransactionType;

  @ApiProperty({ enum: Operator })
  @IsEnum(Operator)
  @IsNotEmpty()
  operator: Operator;

  @ApiProperty({ example: 50000000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: PeriodType })
  @IsEnum(PeriodType)
  @IsNotEmpty()
  period: PeriodType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;
}

// Net Worth Config DTO
export class NetWorthConfigDto {
  @ApiProperty({ enum: Operator })
  @IsEnum(Operator)
  @IsNotEmpty()
  operator: Operator;

  @ApiProperty({ example: 500000000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  target_amount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsNotEmpty()
  include_hidden_wallets: boolean;
}

// Category Spending Config DTO
export class CategorySpendingConfigDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ enum: Operator })
  @IsEnum(Operator)
  @IsNotEmpty()
  operator: Operator;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: PeriodType })
  @IsEnum(PeriodType)
  @IsNotEmpty()
  period: PeriodType;
}
