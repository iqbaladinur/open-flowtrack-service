# FlowTrack API

**FlowTrack** is a powerful and intuitive open-source API for a personal finance tracker application, designed to help you manage your finances with ease. Built with a modern tech stack, it provides a secure, scalable, and feature-rich backend for all your financial tracking needs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **User Authentication**: Secure user registration and login with JWT-based authentication, including Google OAuth2 integration.
- **Wallet Management**: Create, read, update, and delete wallets to manage your cash, bank accounts, and e-wallets.
- **Category Management**: Organize your transactions with customizable categories for income and expenses, including bulk creation.
- **Transaction Tracking**: Record your income and expenses with support for recurring transactions and AI-powered transaction creation from text.
- **Budgeting**: Set monthly budgets for different categories and track your spending to stay on top of your financial goals.
- **Financial Reports**: Get insights into your spending habits with detailed reports, including summaries, category breakdowns, and wallet cash flows.
- **Data Export/Import**: Export your transaction data to CSV and back up your entire financial history to a JSON file.
- **AI-Powered Analytics**: Leverage the power of AI to get smart insights and analytics on your financial data.
- **Secure**: Built with security in mind, including input validation, rate limiting, and protection against common vulnerabilities.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL](https://www.postgresql.org/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/flowtrack-service.git
   cd flowtrack-service
   ```

2. **Create a `.env` file** from the example and update the environment variables as needed:

   ```bash
   cp .env.example .env
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the database migration:**

   ```bash
   npm run migrate
   ```

5. **Start the application:**

   ```bash
   npm run start:dev
   ```

### 🐳 Running with Docker

1. **Build and start the containers:**

   ```bash
   docker-compose up -d --build
   ```

2. **Run database migrations:**

   ```bash
   docker-compose exec backend npm run migrate
   ```

The application will be available at `http://localhost:3000`.

## 📚 API Documentation

The API documentation is automatically generated using Swagger and is available at `/docs`.

- **Swagger UI**: `http://localhost:3000/docs`
- **Swagger JSON**: `http://localhost:3000/docs-json`

## 🛠️ Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) (Node.js)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Authentication**: [JWT](https://jwt.io/), [Passport](http://www.passportjs.org/)
- **API Documentation**: [Swagger (OpenAPI)](https://swagger.io/)
- **Containerization**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any changes.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
