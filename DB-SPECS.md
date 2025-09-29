# Database Schema

This document outlines the database schema for the Wallport API.

## Tables

*   [users](#users)
*   [configs](#configs)
*   [wallets](#wallets)
*   [categories](#categories)
*   [transactions](#transactions)
*   [budgets](#budgets)

---

### `users`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the user. |
| `email` | string | UNIQUE | User's email address. |
| `password_hash` | string | NULLABLE | Hashed password for the user. |
| `full_name` | string | NULLABLE | User's full name. |
| `provider` | string | NULLABLE | Authentication provider (e.g., 'google'). |
| `password_reset_token` | string | NULLABLE | Token for password reset functionality. |
| `password_reset_expires` | date | NULLABLE | Expiry date for the password reset token. |
| `refresh_token` | string | NULLABLE | Token for refreshing access tokens. |
| `created_at` | date | | Timestamp of when the user was created. |
| `updated_at` | date | | Timestamp of when the user was last updated. |

**Relations:**
*   Has many `wallets`
*   Has many `categories`
*   Has many `transactions`
*   Has many `budgets`

---

### `configs`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the configuration. |
| `currency` | string | DEFAULT: 'IDR' | The currency preference for the user. |
| `fractions` | number | DEFAULT: 2 | The number of decimal places for currency. |
| `gemini_api_key` | string | NULLABLE | Gemini API key for the user. |
| `user_id` | uuid | UNIQUE, FOREIGN KEY to `users.id` | The user associated with this configuration. |

**Relations:**
*   Belongs to one `user`

---

### `wallets`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the wallet. |
| `name` | string | | Name of the wallet. |
| `initial_balance` | decimal(15,2) | | The starting balance of the wallet. |
| `hidden` | boolean | DEFAULT: false | Whether the wallet is hidden. |
| `is_main_wallet` | boolean | DEFAULT: false | Whether this is the user's main wallet. |
| `user_id` | uuid | FOREIGN KEY to `users.id` | The user who owns this wallet. |
| `created_at` | date | | Timestamp of when the wallet was created. |
| `updated_at` | date | | Timestamp of when the wallet was last updated. |

**Constraints:**
*   UNIQUE on (`user_id`) where `is_main_wallet` is true.

**Relations:**
*   Belongs to one `user`

---

### `categories`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the category. |
| `name` | string | | Name of the category. |
| `type` | enum('income', 'expense', 'transfer') | | Type of the category. |
| `icon` | string | | Icon for the category. |
| `color` | string | | Color for the category. |
| `user_id` | uuid | NULLABLE, FOREIGN KEY to `users.id` | The user who owns this category (null for default categories). |
| `created_at` | date | | Timestamp of when the category was created. |
| `updated_at` | date | | Timestamp of when the category was last updated. |

**Relations:**
*   Belongs to one `user`

---

### `transactions`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the transaction. |
| `type` | enum('income', 'expense', 'transfer') | | Type of the transaction. |
| `amount` | decimal(15,2) | | Amount of the transaction. |
| `wallet_id` | uuid | FOREIGN KEY to `wallets.id` | The wallet used for this transaction. |
| `category_id` | uuid | NULLABLE, FOREIGN KEY to `categories.id` | The category of this transaction. |
| `destination_wallet_id` | uuid | NULLABLE, FOREIGN KEY to `wallets.id` | The destination wallet for transfer transactions. |
| `date` | date | | Date of the transaction. |
| `note` | string | NULLABLE | Optional note for the transaction. |
| `is_recurring` | boolean | DEFAULT: false | Whether the transaction is recurring. |
| `recurring_pattern` | enum('daily', 'weekly', 'monthly', 'yearly') | NULLABLE | The pattern for recurring transactions. |
| `user_id` | uuid | FOREIGN KEY to `users.id` | The user who made this transaction. |
| `created_at` | date | | Timestamp of when the transaction was created. |
| `updated_at` | date | | Timestamp of when the transaction was last updated. |

**Relations:**
*   Belongs to one `user`
*   Belongs to one `wallet`
*   Belongs to one `category`
*   Belongs to one `wallet` (as destination)

---

### `budgets`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the budget. |
| `name` | string | | Name of the budget. |
| `category_ids` | uuid[] | | The categories associated with this budget. |
| `limit_amount` | decimal(10,2) | | The budget limit amount. |
| `start_date` | date | | The start date for this budget period. |
| `end_date` | date | | The end date for this budget period. |
| `user_id` | uuid | FOREIGN KEY to `users.id` | The user who owns this budget. |
| `created_at` | date | | Timestamp of when the budget was created. |
| `updated_at` | date | | Timestamp of when the budget was last updated. |

**Constraints:**
*   UNIQUE on (`user_id`, `name`)

**Relations:**
*   Belongs to one `user`