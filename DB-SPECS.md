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
| `user_id` | uuid | FOREIGN KEY to `users.id` | The user who owns this wallet. |
| `created_at` | date | | Timestamp of when the wallet was created. |
| `updated_at` | date | | Timestamp of when the wallet was last updated. |

**Relations:**
*   Belongs to one `user`

---

### `categories`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the category. |
| `name` | string | | Name of the category. |
| `type` | enum('income', 'expense') | | Type of the category. |
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
| `type` | enum('income', 'expense') | | Type of the transaction. |
| `amount` | decimal(15,2) | | Amount of the transaction. |
| `wallet_id` | uuid | FOREIGN KEY to `wallets.id` | The wallet used for this transaction. |
| `category_id` | uuid | FOREIGN KEY to `categories.id` | The category of this transaction. |
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

---

### `budgets`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY | Unique identifier for the budget. |
| `category_id` | uuid | FOREIGN KEY to `categories.id` | The category for this budget. |
| `limit_amount` | decimal(10,2) | | The budget limit amount. |
| `month` | number | | The month for this budget. |
| `year` | number | | The year for this budget. |
| `user_id` | uuid | FOREIGN KEY to `users.id` | The user who owns this budget. |
| `created_at` | date | | Timestamp of when the budget was created. |
| `updated_at` | date | | Timestamp of when the budget was last updated. |

**Constraints:**
*   UNIQUE on (`user_id`, `category_id`, `month`, `year`)

**Relations:**
*   Belongs to one `user`
*   Belongs to one `category`
