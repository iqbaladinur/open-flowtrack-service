export enum ConditionType {
  WALLET_BALANCE = "wallet_balance",
  BUDGET_CONTROL = "budget_control",
  TRANSACTION_AMOUNT = "transaction_amount",
  PERIOD_TOTAL = "period_total",
  NET_WORTH = "net_worth",
  CATEGORY_SPENDING = "category_spending",
}

export enum Operator {
  GREATER_THAN_EQUAL = ">=",
  GREATER_THAN = ">",
  LESS_THAN_EQUAL = "<=",
  LESS_THAN = "<",
  EQUAL = "=",
}

export enum BudgetConditionType {
  NO_OVERSPEND = "no_overspend",
  UNDER_PERCENTAGE = "under_percentage",
}

export enum PeriodType {
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
  CUSTOM = "custom",
}

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

// Base Condition
export interface BaseCondition {
  type: ConditionType;
  config: any;
}

// Wallet Balance Condition
export interface WalletBalanceConfig {
  wallet_id: string | null; // null = all wallets
  operator: Operator;
  target_amount: number;
}

// Budget Control Condition
export interface BudgetControlConfig {
  budget_id: string;
  condition: BudgetConditionType;
  consecutive_months?: number;
  percentage?: number;
}

// Transaction Amount Condition
export interface TransactionAmountConfig {
  transaction_type: TransactionType;
  operator: Operator;
  amount: number;
  category_id?: string;
}

// Period Total Condition
export interface PeriodTotalConfig {
  transaction_type: TransactionType;
  operator: Operator;
  amount: number;
  period: PeriodType;
  start_date?: string;
  end_date?: string;
  category_id?: string;
}

// Net Worth Condition
export interface NetWorthConfig {
  operator: Operator;
  target_amount: number;
  include_hidden_wallets: boolean;
}

// Category Spending Condition
export interface CategorySpendingConfig {
  category_id: string;
  operator: Operator;
  amount: number;
  period: PeriodType;
}

// Condition with Progress
export interface ConditionWithProgress {
  id: string;
  type: ConditionType;
  config: any;
  current_value: number | boolean;
  target_value: number | boolean;
  progress_percentage: number;
  is_met: boolean;
}
