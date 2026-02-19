# Wallport API v1.0

Personal Finance Tracker API.

## Authentication

All protected endpoints require a Bearer JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Schemas

### CreateUserDto
| Field | Type | Required |
|-------|------|----------|
| email | string | yes |
| password | string | yes |
| full_name | string | no |

### LoginDto
| Field | Type | Required |
|-------|------|----------|
| email | string | yes |
| password | string | yes |

### RefreshTokenDto
| Field | Type | Required |
|-------|------|----------|
| refresh_token | string | yes |

### ForgotPasswordDto
| Field | Type | Required |
|-------|------|----------|
| email | string | yes |

### ResetPasswordDto
| Field | Type | Required |
|-------|------|----------|
| password | string | yes |

### UpdateConfigDto
| Field | Type | Required |
|-------|------|----------|
| currency | string | no |
| fractions | number | no |
| gemini_api_key | string | no |

### CreateWalletDto
| Field | Type | Required | Default |
|-------|------|----------|---------|
| name | string | yes | |
| initial_balance | number | yes | |
| icon | string | no | "" |
| hidden | boolean | no | false |
| is_main_wallet | boolean | no | false |
| is_saving | boolean | no | false |

### UpdateWalletDto
| Field | Type | Required |
|-------|------|----------|
| name | string | no |
| initial_balance | number | no |
| icon | string | no |
| hidden | boolean | no |
| is_main_wallet | boolean | no |
| is_saving | boolean | no |

### CreateCategoryDto
| Field | Type | Required | Values |
|-------|------|----------|--------|
| name | string | yes | |
| type | string | yes | `income`, `expense`, `transfer` |
| icon | string | yes | |
| color | string | yes | |

### UpdateCategoryDto
| Field | Type | Required | Values |
|-------|------|----------|--------|
| name | string | no | |
| type | string | no | `income`, `expense`, `transfer` |
| icon | string | no | |
| color | string | no | |

### BulkCreateCategoryDto
| Field | Type | Required |
|-------|------|----------|
| categories | CreateCategoryDto[] | yes |

### CreateTransactionDto
| Field | Type | Required | Values |
|-------|------|----------|--------|
| type | string | yes | `income`, `expense`, `transfer` |
| amount | number | yes | |
| wallet_id | string | yes | |
| category_id | string | no | |
| destination_wallet_id | string | no | (for transfers) |
| date | datetime | yes | |
| note | string | no | |

### UpdateTransactionDto
Same fields as CreateTransactionDto, all optional.

### CreateBulkRecurringTransactionDto
Same fields as CreateTransactionDto, plus:
| Field | Type | Required | Values |
|-------|------|----------|--------|
| recurring_pattern | string | yes | `daily`, `weekly`, `monthly`, `yearly` |
| recurring_count | number | no | |
| recurring_until | datetime | no | |

### CreateTransactionByTextDto
| Field | Type | Required |
|-------|------|----------|
| content | string | yes |

### CreateBudgetDto
| Field | Type | Required |
|-------|------|----------|
| name | string | yes |
| category_ids | string[] | yes |
| limit_amount | number | yes |
| start_date | datetime | yes |
| end_date | datetime | yes |

### UpdateBudgetDto
Same as CreateBudgetDto, all optional.

### ConditionDto
| Field | Type | Required | Values |
|-------|------|----------|--------|
| type | string | yes | `wallet_balance`, `budget_control`, `transaction_amount`, `period_total`, `net_worth`, `category_spending` |
| config | object | yes | varies by condition type |

### CreateMilestoneDto
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | yes | 1–200 chars |
| description | string | no | max 1000 chars |
| icon | string | no | max 50 chars |
| color | string | no | hex `#RRGGBB` |
| conditions | ConditionDto[] | yes | 1–10 items |
| target_date | datetime | yes | |

### UpdateMilestoneDto
Same as CreateMilestoneDto, all optional.

### UpdateStatusDto
| Field | Type | Required | Values |
|-------|------|----------|--------|
| status | string | yes | `achieved`, `failed`, `cancelled` |

### GenerateAnalyticsDto
| Field | Type | Required | Format |
|-------|------|----------|--------|
| startDate | string | yes | YYYY-MM-DD |
| endDate | string | yes | YYYY-MM-DD |

---

## Endpoints

### Authentication

#### `GET /auth/google`
Redirect to Google for OAuth authentication. No auth required.

**Response:** 200

---

#### `GET /auth/google/callback`
Google OAuth callback. No auth required.

**Response:** 200

---

#### `POST /auth/register`
Register a new user. No auth required.

**Body:** `CreateUserDto`

**Responses:**
- `201` — User registered. Returns `{ user, config }`.
- `409` — Email already registered.

---

#### `POST /auth/login`
Log in a user. No auth required.

**Body:** `LoginDto`

**Responses:**
- `200` — Returns `{ access_token, refresh_token, user, config }`.
- `401` — Invalid credentials.

---

#### `POST /auth/refresh`
Refresh the access token. No auth required.

**Body:** `RefreshTokenDto`

**Response:** 200

---

#### `POST /auth/forgot-password`
Send a password reset link. No auth required.

**Body:** `ForgotPasswordDto`

**Response:** `200` — Reset link sent.

---

#### `POST /auth/reset-password/{token}`
Reset user password. No auth required.

**Path params:** `token` (string)

**Body:** `ResetPasswordDto`

**Responses:**
- `200` — Password reset.
- `401` — Invalid or expired token.

---

#### `GET /auth/profile`
Get the authenticated user's profile. **Auth required.**

**Response:** `200` — Returns `{ user, config }`.

---

### Config

#### `GET /config`
Get currency configuration for the current user. **Auth required.**

**Response:** `200` — Returns `{ id, currency, fractions, gemini_api_key, user_id }`.

---

#### `PUT /config`
Update currency configuration for the current user. **Auth required.**

**Body:** `UpdateConfigDto`

**Response:** `200` — Returns updated config.

---

### Wallets

#### `POST /wallets`
Create a new wallet. **Auth required.**

**Body:** `CreateWalletDto`

**Response:** `201` — Returns created wallet.

---

#### `GET /wallets`
Get all wallets for the current user, with calculated current balance. **Auth required.**

**Query params:**
| Param | Type | Required |
|-------|------|----------|
| start_date | datetime | no |
| end_date | datetime | no |

**Response:** `200` — Returns array of wallets with `current_balance`.

---

#### `GET /wallets/{id}`
Get a specific wallet by ID with current balance. **Auth required.**

**Path params:** `id` (string)

**Query params:** `start_date`, `end_date` (optional datetime)

**Response:** `200` — Returns wallet with `current_balance`.

---

#### `PATCH /wallets/{id}`
Update a wallet. **Auth required.**

**Path params:** `id` (string)

**Body:** `UpdateWalletDto`

**Response:** `200` — Returns updated wallet.

---

#### `DELETE /wallets/{id}`
Delete a wallet. **Auth required.**

**Path params:** `id` (string)

**Response:** `204`

---

### Categories

#### `POST /categories`
Create a new category. **Auth required.**

**Body:** `CreateCategoryDto`

**Response:** `201` — Returns created category.

---

#### `GET /categories`
Get all categories for the current user (including defaults). **Auth required.**

**Query params:**
| Param | Type | Required | Values |
|-------|------|----------|--------|
| type | string | no | `income`, `expense`, `transfer` |

**Response:** `200` — Returns array of categories.

---

#### `POST /categories/bulk`
Create multiple categories in bulk. **Auth required.**

**Body:** `BulkCreateCategoryDto`

**Response:** `201` — Returns array of created categories.

---

#### `GET /categories/{id}`
Get a specific category by ID. **Auth required.**

**Path params:** `id` (string)

**Response:** `200` — Returns category.

---

#### `PATCH /categories/{id}`
Update a category. **Auth required.**

**Path params:** `id` (string)

**Body:** `UpdateCategoryDto`

**Response:** `200` — Returns updated category.

---

#### `DELETE /categories/{id}`
Delete a category. **Auth required.**

**Path params:** `id` (string)

**Response:** `204`

---

### Transactions

#### `POST /transactions/bulk-expense`
Create one or more expense transactions from a natural language text description using AI. **Auth required.**

**Body:** `CreateTransactionByTextDto`

**Response:** `201`

---

#### `POST /transactions`
Create a new transaction. **Auth required.**

**Body:** `CreateTransactionDto`

**Response:** `201` — Returns created transaction.

---

#### `GET /transactions`
Get all transactions for the current user. **Auth required.**

**Query params:**
| Param | Type | Required | Values |
|-------|------|----------|--------|
| start_date | datetime | no | |
| end_date | datetime | no | |
| wallet_id | string | no | |
| category_id | string | no | |
| type | string | no | `income`, `expense`, `transfer` |
| sortBy | string | no | `ASC`, `DESC` (default: `DESC`) |

**Response:** `200` — Returns array of transactions.

---

#### `POST /transactions/bulk-recurring`
Create multiple recurring transactions in bulk. **Auth required.**

**Body:** `CreateBulkRecurringTransactionDto`

**Response:** `201` — Returns array of created transactions.

---

#### `GET /transactions/{id}`
Get a specific transaction by ID. **Auth required.**

**Path params:** `id` (string)

**Response:** `200` — Returns transaction.

---

#### `PATCH /transactions/{id}`
Update a transaction. **Auth required.**

**Path params:** `id` (string)

**Body:** `UpdateTransactionDto`

**Response:** `200` — Returns updated transaction.

---

#### `DELETE /transactions/{id}`
Delete a transaction. **Auth required.**

**Path params:** `id` (string)

**Response:** `204`

---

### Budgets

#### `POST /budgets`
Create a new budget. **Auth required.**

**Body:** `CreateBudgetDto`

**Response:** `201`

---

#### `GET /budgets`
Get all budgets for the current user with spent amounts. **Auth required.**

**Query params:**
| Param | Type | Required |
|-------|------|----------|
| start_date | datetime | no |
| end_date | datetime | no |

**Response:** `200` — Returns list of budgets with spent amounts.

---

#### `GET /budgets/{id}`
Get a specific budget by ID with spent amount. **Auth required.**

**Path params:** `id` (string)

**Response:** `200`

---

#### `PATCH /budgets/{id}`
Update a budget. **Auth required.**

**Path params:** `id` (string)

**Body:** `UpdateBudgetDto`

**Response:** `200`

---

#### `DELETE /budgets/{id}`
Delete a budget. **Auth required.**

**Path params:** `id` (string)

**Response:** `204`

---

### Reports

#### `GET /reports/summary`
Get a summary report of total income, expenses, and net. **Auth required.**

**Query params:**
| Param | Type | Required | Format |
|-------|------|----------|--------|
| startDate | string | no | YYYY-MM-DD |
| endDate | string | no | YYYY-MM-DD |
| includeHidden | boolean | no | |

**Response:** `200` — Returns `{ totalIncome, totalExpense, net }`.

---

#### `GET /reports/by-category`
Get transactions grouped by category. **Auth required.**

**Query params:** `startDate`, `endDate` (YYYY-MM-DD), `includeHidden` (boolean) — all optional.

**Response:** `200` — Returns `{ income: [{ name, color, icon, total }], expense: [...] }`.

---

#### `GET /reports/by-wallet`
Get transactions grouped by wallet. **Auth required.**

**Query params:** `startDate`, `endDate` (YYYY-MM-DD), `includeHidden` (boolean) — all optional.

**Response:** `200` — Returns array of `{ name, initialBalance, totalIncome, totalExpense, finalBalance }`.

---

### Export

#### `GET /export/transactions/csv`
Export all user transactions as a CSV file. **Auth required.**

**Response:** `200` — CSV file download.

---

### Backup & Restore

#### `GET /backup`
Backup all user data. **Auth required.**

**Response:** `200`

---

#### `POST /backup/restore`
Restore user data from a backup file. **Auth required.**

**Body:** `multipart/form-data` with field `file` (binary).

**Response:** `201`

---

### Milestones

#### `POST /milestones`
Create a new milestone with conditions. **Auth required.**

**Body:** `CreateMilestoneDto`

**Response:** `201`

---

#### `GET /milestones`
Get all milestones with calculated progress for each condition. **Auth required.**

**Query params:**
| Param | Type | Required | Values |
|-------|------|----------|--------|
| status | string | no | `pending`, `in_progress`, `achieved`, `failed`, `cancelled` |
| sort_by | string | no | `target_date`, `created_at`, `name` |
| order | string | no | `ASC`, `DESC` |

**Response:** `200` — Returns list of milestones with progress.

---

#### `GET /milestones/{id}`
Get a specific milestone with progress. **Auth required.**

**Path params:** `id` (string)

**Response:** `200`

---

#### `PATCH /milestones/{id}`
Update a milestone. **Auth required.**

**Path params:** `id` (string)

**Body:** `UpdateMilestoneDto`

**Response:** `200`

---

#### `DELETE /milestones/{id}`
Delete a milestone. **Auth required.**

**Path params:** `id` (string)

**Response:** `204`

---

#### `PATCH /milestones/{id}/status`
Manually update the status of a milestone. **Auth required.**

**Path params:** `id` (string)

**Body:** `UpdateStatusDto`

**Response:** `200`

---

#### `GET /milestones/{id}/check-progress`
Force a progress recalculation for a milestone. **Auth required.**

**Path params:** `id` (string)

**Response:** `200` — Returns milestone with freshly calculated progress.

---

### Analytics

#### `POST /analytics/generate`
Generate AI-powered financial analytics for a given period. **Auth required.**

**Body:** `GenerateAnalyticsDto`

**Response:** `200`
