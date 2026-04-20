# Real Estate Transaction Management System

A full-stack application for managing real estate transactions and automating commission distribution between agency and agents.

Built with **NestJS** (backend), **Nuxt 3** (frontend), and **MongoDB Atlas** (database).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Commission Rules](#commission-rules)
- [Seed Data](#seed-data)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

When a property sale or rental agreement is reached, the transaction goes through multiple stages before completion. Once completed, the total service fee (commission) must be distributed between the agency and the involved agents.

This system automates that entire lifecycle:

1. **Track transactions** through four stages: Agreement, Earnest Money, Title Deed, and Completed
2. **Automatically calculate** commission splits when a transaction completes
3. **Provide financial visibility** with detailed breakdowns per transaction and per agent
4. **Visualize the pipeline** with a Kanban-style board and real-time statistics

---

## Features

**Backend**
- RESTful API with full CRUD for agents and transactions
- State machine for transaction stage management (strictly linear, no skip/reverse)
- Event-driven commission auto-calculation on transaction completion
- Financial breakdown with cent-perfect arithmetic (integer cents, no floating-point)
- Aggregation queries for dashboard statistics and top-earning agents
- Input validation with DTOs and class-validator
- Swagger/OpenAPI documentation
- Comprehensive unit tests (37 tests)

**Frontend**
- Dashboard with stats cards, pipeline overview, and top agents
- Kanban board for visualizing transaction stages
- Transaction detail page with progress stepper and commission breakdown
- Agent management with creation forms and earnings history
- Financial reports page with full commission listing
- Toast notifications for user feedback
- Responsive design with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 11, TypeScript, Mongoose 9 |
| **Frontend** | Nuxt 3, Vue 3, Pinia, Tailwind CSS |
| **Database** | MongoDB Atlas |
| **Testing** | Jest (37 unit tests) |
| **API Docs** | Swagger / OpenAPI |

---

## Project Structure

```
real-estate-crm/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── agents/             # Agent CRUD module
│   │   ├── transactions/       # Transaction lifecycle + stage machine
│   │   ├── commissions/        # Commission calculation + event handling
│   │   ├── dashboard/          # Aggregation queries for stats
│   │   ├── common/             # Shared filters, interceptors, pipes
│   │   └── seed/               # Database seed script
│   └── test/
│       └── unit/               # Unit tests
├── frontend/                   # Nuxt 3 application
│   ├── pages/                  # Route pages
│   ├── components/             # Vue components
│   ├── stores/                 # Pinia state management
│   ├── composables/            # Reusable logic (useApi, useFormatCurrency)
│   └── types/                  # TypeScript type definitions
├── DESIGN.md                   # Architecture decisions
├── CHANGELOG.md                # Change history
└── README.md                   # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 22+ (LTS)
- **npm** 10+
- **MongoDB Atlas** account with a cluster (free M0 tier works)

### 1. Clone the repository

```bash
git clone https://github.com/aaliboyaci/real-estate-crm.git
cd real-estate-crm
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/real-estate-crm?retryWrites=true&w=majority
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

Replace `<user>`, `<password>`, and `<cluster>` with your MongoDB Atlas credentials.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

No additional configuration needed — the frontend connects to `http://localhost:3001/api` by default.

### 4. Seed the database (optional but recommended)

This populates the database with 5 agents, 15 transactions, and 5 commission records:

```bash
cd ../backend
npm run seed
```

---

## Running the Application

You need **two terminal windows** — one for each server.

**Terminal 1 — Backend (port 3001):**
```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend (port 3000):**
```bash
cd frontend
npm run dev
```

Then open your browser:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend application |
| http://localhost:3001/api/docs | Swagger API documentation |

---

## Running Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage report
```

**Test coverage:**
- `commission-calculator.spec.ts` — 16 tests covering both commission scenarios, edge cases, input validation, and property-based invariant checks
- `stage-machine.spec.ts` — 21 tests covering all valid transitions, invalid transitions (skip, backward, self), getNextStage, and getStageOrder

---

## API Documentation

Interactive Swagger documentation is available at:

```
http://localhost:3001/api/docs
```

All API responses follow a consistent envelope format:

```json
// Success
{
  "data": { ... },
  "meta": { "total": 15, "page": 1, "limit": 20, "totalPages": 1 }
}

// Error
{
  "statusCode": 400,
  "message": "Cannot transition from \"agreement\" to \"completed\"",
  "error": "BadRequestException",
  "timestamp": "2026-04-18T00:00:00.000Z"
}
```

---

## API Endpoints

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents` | List all agents (paginated) |
| `POST` | `/api/agents` | Create a new agent |
| `GET` | `/api/agents/:id` | Get agent by ID |
| `PATCH` | `/api/agents/:id` | Update agent |
| `DELETE` | `/api/agents/:id` | Delete agent |
| `GET` | `/api/agents/:id/commissions` | Get agent's commission history |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | List transactions (filterable by `?stage=`) |
| `POST` | `/api/transactions` | Create a new transaction |
| `GET` | `/api/transactions/:id` | Get transaction detail |
| `PATCH` | `/api/transactions/:id` | Update transaction |
| `PATCH` | `/api/transactions/:id/stage` | Advance transaction stage |

### Commissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/commissions` | List all commissions |
| `GET` | `/api/commissions/:transactionId` | Get commission for a transaction |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/dashboard/pipeline` | Transactions grouped by stage |

---

## Commission Rules

When a transaction reaches the **completed** stage, the commission is automatically calculated:

| Recipient | Percentage | Amount |
|-----------|-----------|--------|
| **Agency** | 50% | Half of total service fee |
| **Agents** | 50% | Split among involved agents |

**Scenario 1 — Same agent is both listing and selling:**
The agent receives the full 50% agent portion.

**Scenario 2 — Different listing and selling agents:**
Each agent receives 25% of the total service fee.

All calculations use **integer cents** to avoid floating-point precision issues. The invariant `agency + agents === totalServiceFee` is guaranteed for any input.

---

## Seed Data

Running `npm run seed` creates the following demo data:

| Entity | Count | Details |
|--------|-------|---------|
| Agents | 5 | Maria Garcia, Carlos Rodriguez, Ana Martinez, Luis Hernandez, Sofia Lopez |
| Transactions | 15 | 4 in Agreement, 3 in Earnest Money, 3 in Title Deed, 5 Completed |
| Commissions | 5 | Auto-generated for completed transactions |

This includes both same-agent and different-agent commission scenarios.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | — | MongoDB Atlas connection string |
| `PORT` | No | `3001` | API server port |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |

### Frontend

The frontend reads `NUXT_PUBLIC_API_BASE` from environment or defaults to `http://localhost:3001/api`. For deployment, set this to your production API URL.

---

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://frontend-omega-vert-zyuog1jesw.vercel.app |
| **Backend API** | https://backend-topaz-xi-84.vercel.app/api |
| **Swagger Docs** | https://backend-topaz-xi-84.vercel.app/api/docs |

Both are deployed on **Vercel** with **MongoDB Atlas** as the database.

---

## Deployment

### Database

- Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (M0)
- Create a database user and whitelist `0.0.0.0/0` for access from deployment platforms
- Run the seed script against your production database

### Backend

Deploy to [Vercel](https://vercel.com) or any Node.js hosting:

```bash
cd backend
npm run build
npm run start:prod
```

Set the environment variables (`MONGODB_URI`, `PORT`, `CORS_ORIGIN`) on your hosting platform.

### Frontend

Deploy to [Vercel](https://vercel.com) (zero-config for Nuxt 3):

```bash
cd frontend
npm run build
```

Set `NUXT_PUBLIC_API_BASE` to your deployed backend URL (e.g., `https://your-api.vercel.app/api`).
