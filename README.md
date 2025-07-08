# Expensio API

A TypeScript/Node.js REST API for expense tracking app [Expensio](https://github.com/Freemasoid/react-native-expensio).

This is a very basic API to setup an app and test it's functionality without using Firebase.
It can be easily extended with Clerk authentication & GraphQL.

In case your are using Yaak API client, there's a workspace prepared for this API, check _yaak.json_ in root folder.

## Features

- 📊 Transaction management (income/expense tracking)
- 🏷️ Custom user categories
- 📈 Monthly/yearly transaction organization
- 🛡️ Enhanced security with rate limiting, CORS, and data sanitization

## Tech Stack

- **Framework**: Express.js + TypeScript
- **Database**: MongoDB with Mongoose
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **Logging**: Winston + Morgan

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB instance

### Installation

```bash
# Clone repository
git clone <repository-url>
cd node-expensio-api

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start development server
pnpm dev
```

### Environment Variables

```env
PORT=5174
MONGO_URI=mongodb://localhost:27017/expensio
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Transactions

- `GET /api/transactions/:clerkId` - Get user transactions
- `POST /api/transactions/:clerkId` - Create transaction
- `POST /api/transactions/update/:clerkId` - Update transaction
- `DELETE /api/transactions/:clerkId` - Delete transaction

### User Categories

- `GET /api/userCategories/:clerkId` - Get user categories
- `POST /api/userCategories/:clerkId` - Create/add category
- `DELETE /api/userCategories/:clerkId` - Delete category

## Scripts

```bash
pnpm dev      # Development server
pnpm build    # Build for production
pnpm start    # Start production server
```

## Project Structure

```
src/
├── controllers/    # Business logic
├── models/        # MongoDB schemas
├── routes/        # API routes
├── middleware/    # Custom middleware
├── utils/         # Utility functions
├── config/        # App configuration
├── db/           # Database connection
├── errors/       # Error handling
└── types/        # TypeScript types
```
