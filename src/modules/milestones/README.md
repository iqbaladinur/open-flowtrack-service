# Milestones Module

Financial journey timeline feature that allows users to define milestone moments with conditional achievements.

## Overview

This module implements a milestone tracking system where users can:
- Create milestones with multiple conditions
- Track progress automatically (on-demand when FE requests)
- View timeline of financial journey
- Compare target dates vs actual achievement dates

## Quick Start

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/milestones` | Create new milestone |
| GET | `/milestones` | Get all milestones with progress |
| GET | `/milestones/:id` | Get single milestone with progress |
| PATCH | `/milestones/:id` | Update milestone |
| DELETE | `/milestones/:id` | Delete milestone |
| PATCH | `/milestones/:id/status` | Manually update status |
| GET | `/milestones/:id/check-progress` | Force refresh progress |

### Example Request

**Create Milestone:**
```bash
POST /milestones
Authorization: Bearer {token}

{
  "name": "Emergency Fund Complete",
  "description": "Build emergency fund untuk 6 bulan pengeluaran",
  "icon": "shield-checkmark-outline",
  "color": "#26de81",
  "conditions": [
    {
      "type": "wallet_balance",
      "config": {
        "wallet_id": "wallet-uuid",
        "operator": ">=",
        "target_amount": 30000000
      }
    }
  ],
  "target_date": "2025-12-31"
}
```

## Available Condition Types

### 1. `wallet_balance`
Check if wallet balance reaches target amount.

**Config:**
```json
{
  "wallet_id": "uuid or null for all wallets",
  "operator": ">= | > | <= | < | =",
  "target_amount": 100000000
}
```

### 2. `budget_control`
Check if budget is maintained without overspending.

**Config:**
```json
{
  "budget_id": "uuid",
  "condition": "no_overspend | under_percentage",
  "consecutive_months": 3,
  "percentage": 80
}
```

### 3. `transaction_amount`
Check if there's a single transaction meeting criteria.

**Config:**
```json
{
  "transaction_type": "income | expense",
  "operator": ">= | > | <= | < | =",
  "amount": 10000000,
  "category_id": "uuid (optional)"
}
```

### 4. `period_total`
Check if total income/expense in period meets target.

**Config:**
```json
{
  "transaction_type": "income | expense",
  "operator": ">= | > | <= | < | =",
  "amount": 50000000,
  "period": "month | quarter | year | custom",
  "start_date": "2025-01-01 (for custom)",
  "end_date": "2025-12-31 (for custom)",
  "category_id": "uuid (optional)"
}
```

### 5. `net_worth`
Check if total net worth reaches target.

**Config:**
```json
{
  "operator": ">= | > | <= | < | =",
  "target_amount": 500000000,
  "include_hidden_wallets": false
}
```

### 6. `category_spending`
Check if spending on category stays within limit.

**Config:**
```json
{
  "category_id": "uuid",
  "operator": ">= | > | <= | < | =",
  "amount": 5000000,
  "period": "month | quarter | year"
}
```

## Module Structure

```
milestones/
├── controllers/
│   └── milestones.controller.ts    # API endpoints
├── services/
│   └── milestones.service.ts       # Business logic & progress calculation
├── entities/
│   └── milestone.entity.ts         # Database entity
├── dto/
│   ├── condition.dto.ts            # Condition DTOs
│   ├── create-milestone.dto.ts     # Create DTO
│   ├── update-milestone.dto.ts     # Update DTO
│   ├── update-status.dto.ts        # Status update DTO
│   └── find-all-milestones.dto.ts  # Query DTO
├── interfaces/
│   └── condition.interface.ts      # TypeScript interfaces
└── milestones.module.ts            # Module definition
```

## Progress Calculation

Progress is calculated **on-demand** when frontend requests milestone data. The service:

1. Fetches milestone from database
2. Calculates current value for each condition
3. Determines if condition is met
4. Calculates overall progress (average of all conditions)
5. Updates status automatically based on progress

**Status Logic:**
- `pending`: No progress (0%)
- `in_progress`: Some progress (1-99%)
- `achieved`: All conditions met
- `failed`: Target date passed, not achieved
- `cancelled`: Manually cancelled by user

## Response Example

```json
{
  "id": "milestone-123",
  "name": "Emergency Fund Complete",
  "description": "Build emergency fund untuk 6 bulan pengeluaran",
  "icon": "shield-checkmark-outline",
  "color": "#26de81",
  "conditions": [
    {
      "id": "cond_1",
      "type": "wallet_balance",
      "config": {
        "wallet_id": "wallet-123",
        "operator": ">=",
        "target_amount": 30000000
      },
      "current_value": 18500000,
      "target_value": 30000000,
      "progress_percentage": 61.67,
      "is_met": false
    }
  ],
  "target_date": "2025-12-31",
  "achieved_at": null,
  "status": "in_progress",
  "overall_progress": 61.67,
  "user_id": "user-123",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

## Documentation

For complete documentation including all condition types, examples, and validation rules, see:
- [MILESTONE-SPECS.md](../../../../MILESTONE-SPECS.md) - Complete feature specification
- [DB-SPECS.md](../../../../DB-SPECS.md) - Database schema

## Testing

Run tests:
```bash
npm run test
```

## Notes

- Progress calculation is **on-demand** (not real-time)
- Multiple conditions are supported (1-10 conditions per milestone)
- Each condition has unique ID for tracking
- Status is auto-updated based on progress when data is requested
