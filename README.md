# 🎯 Generate Backend App like Monefy (Personal Finance Tracker)

Saya ingin kamu membuat backend lengkap untuk aplikasi pencatat keuangan pribadi seperti **Monefy** dengan kriteria sebagai berikut:

---

## 📦 Tech Stack
- **Node.js** backend dengan framework modular & scalable (seperti NestJS atau Fastify)
- **PostgreSQL** sebagai database utama
- ORM: **TypeORM** atau **Prisma**
- Arsitektur: **Domain Driven Design (DDD)**
- Dokumentasi otomatis dengan **Swagger / OpenAPI**
- Containerized dengan **Docker** dan **Docker Compose**
- Bahasa: **TypeScript**
- Validasi dan error handling yang baik

---

## 📁 Fitur yang Harus Diimplementasikan

### 1. 🧑 User Authentication
- Register / Login / Logout
- JWT token-based auth
- Middleware / guard untuk endpoint yang perlu login
- Optional: role-based access control
- Login with Google

---

### 2. 💼 Wallet Management
- CRUD dompet pengguna (cash, bank, e-wallet)
- Tiap wallet punya:
  - `id`, `name`, `initialBalance`, `hidden`, `is_main_wallet`, `userId`, `createdAt`, `updatedAt`
- Support multi-wallet per user
- Support transfer antar-wallet

---

### 3. 🗂️ Category Management
- CRUD kategori pengeluaran/pemasukan
- Default category saat user baru dibuat
- Field: `id`, `name`, `type` (income/expense), `icon`, `color`, `userId`, `createdAt`
- Support bulk-create kategori

---

### 4. 💸 Transactions
- CRUD transaksi (income & expense)
- Support recurring transaction:
  - daily, weekly, monthly, yearly
- Field:
  - `id`, `type`, `amount`, `walletId`, `categoryId`, `date`, `note`, `isRecurring`, `recurringPattern`, `userId`
- Support create transaction by text (AI-powered)

---

### 5. 🎯 Budgets
- User dapat menetapkan limit budget per kategori
- Sistem menghitung progress penggunaan
- Notifikasi logika jika mendekati limit
- Field: `categoryId`, `limitAmount`, `month`, `year`, `userId`

---

### 6. 📊 Reports
- Endpoint untuk:
  - Ringkasan pengeluaran / pemasukan
  - Pie chart data (total per kategori)
  - Cashflow per wallet
  - Filter waktu: daily, weekly, monthly, custom

---

### 6.1. 📈 Analytics
- Endpoint untuk:
  - Generate analytics from transactions data (AI-powered)

---

### 7. 📤 Export / Import
- Export transaksi sebagai file `.csv`
- Import kembali dari format `.json`
- Filter berdasarkan date range, kategori, wallet

---

### 8. 🔐 Security
- Input validation (e.g. Joi or Zod)
- Rate limiting, helmet, cors
- SQL injection-safe
- Environment variable management

---

## 📚 API Documentation
- Gunakan **Swagger / OpenAPI** otomatis
- Endpoint dokumentasi tersedia di: `/docs` atau `/swagger`
- Sertakan contoh input/output, validasi, dan auth info di dokumentasi

---

## 🧱 Folder Struktur (DDD)

Contoh struktur:
src/
├── modules/
│ ├── auth/
│ ├── users/
│ ├── wallets/
│ ├── categories/
│ ├── transactions/
│ ├── budgets/
│ ├── reports/
│ └── export/
├── shared/
│ ├── utils/
│ ├── middlewares/
│ ├── interceptors/
│ └── guards/
├── infrastructure/
│ ├── config/
│ └── database/
├── main.ts
└── app.module.ts

yaml
Copy
Edit

---

## 🐳 Containerization Setup

**Mohon generate file berikut:**

### 1. `Dockerfile`  
- Untuk backend service  
- Base image: `node:20-alpine`  
- Jalankan `npm run build` dan `npm start`  
- Salin `.env` saat build jika dibutuhkan  

### 2. `docker-compose.yml`
- Service untuk:
  - `backend` (Node.js app)
  - `db` (PostgreSQL)
- Pastikan volume diset untuk persistence data
- Healthcheck untuk PostgreSQL
- Port `3000` terbuka untuk backend
- Contoh konfigurasi:
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: finance
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://admin:admin@db:5432/finance
      JWT_SECRET: supersecure
    depends_on:
      - db

volumes:
  postgres_data:
3. .env.example
env
Copy
Edit
POSTGRES_DB=finance
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
DATABASE_URL=postgresql://admin:admin@db:5432/finance
JWT_SECRET=supersecure
JWT_EXPIRES_IN=1d
PORT=3000
✅ Output yang Saya Harapkan
Kode sumber backend full (modular, scalable, DDD-ready)

File Dockerfile, docker-compose.yml, dan .env.example

Dokumentasi API Swagger otomatis (/docs)

File README.md dengan:

Cara menjalankan dengan Docker Compose

Contoh penggunaan API (login, transaksi, dll)

(Opsional) Script seed database

📌 Catatan Akhir
Gunakan TypeScript

Modular & mudah dikembangkan

Clean code dan documented

Pastikan semua endpoint memiliki validasi dan dokumentasi swagger

---

## Google Authentication Setup

To enable Google authentication, you need to create a project in the Google Cloud Platform Console and get the client ID and client secret.

1.  Go to the [Google Cloud Platform Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Go to **APIs & Services > Credentials**.
4.  Click **Create Credentials > OAuth client ID**.
5.  Select **Web application** as the application type.
6.  Add `http://localhost:3000` to the **Authorized JavaScript origins**.
7.  Add `http://localhost:3000/auth/google/callback` to the **Authorized redirect URIs**.
8.  Click **Create**.
9.  Copy the **Client ID** and **Client Secret**.
10. Add the following environment variables to your `.env` file:

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

Kalau kamu sudah masukkan ini ke AI Agent dan mendapatkan hasil awalnya, kirim saja ke saya jika ingi