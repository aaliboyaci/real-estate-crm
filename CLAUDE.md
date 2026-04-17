# Real Estate Transaction Management System

Full-stack real estate transaction management system. Automates post-agreement transaction lifecycle (earnest money, title deeds, payments) and automatically distributes commissions between agency and agents.

## Tech Stack

- **Backend:** NestJS 11 + TypeScript 5 + Mongoose + MongoDB Atlas + Jest
- **Frontend:** Nuxt 3 + Pinia + Tailwind CSS 4
- **Monorepo:** `backend/` and `frontend/` folders at root

## Commands

```bash
# Backend
cd backend && npm run start:dev     # Dev server (port 3001)
cd backend && npm test              # Run all tests
cd backend && npm run test:watch    # Watch mode
cd backend && npm run test:cov      # Coverage report
cd backend && npm run lint          # Lint + fix
cd backend && npm run build         # Production build
cd backend && npm run seed          # Seed demo data

# Frontend
cd frontend && npm run dev          # Dev server (port 3000)
cd frontend && npm run build        # Production build
cd frontend && npm run lint         # Lint
```

## Architecture Rules

1. **All monetary values stored as integer cents** — never floating point. EUR 1,500.00 = 150000. Display layer formats with `Intl.NumberFormat`.
2. **Commission calculation is a PURE FUNCTION** in `commissions/helpers/commission-calculator.ts` — zero dependencies, easily testable.
3. **Stage transitions validated by pure function** in `transactions/helpers/stage-machine.ts` — strictly linear: agreement → earnest_money → title_deed → completed.
4. **Event-driven:** `transaction.completed` event triggers auto-commission calculation via `@nestjs/event-emitter`. Transaction module doesn't know about commission module.
5. **DTOs use class-validator** decorators for input validation. Global ValidationPipe is configured with whitelist + transform.
6. **API responses wrapped** in `{ data, meta? }` format by TransformInterceptor.
7. **Consistent error format:** `{ statusCode, message, error, timestamp }` via HttpExceptionFilter.

## Module Structure (Backend)

- `common/` — Shared infrastructure (filters, interceptors, pipes, DTOs)
- `agents/` — Agent CRUD (firstName, lastName, email, phone)
- `transactions/` — Transaction lifecycle + stage machine
- `commissions/` — Commission calculation + event listener + financial breakdown
- `dashboard/` — Aggregation queries for stats and pipeline view

## Business Rules

- Transaction stages: `agreement → earnest_money → title_deed → completed` (strictly linear, no skip, no reverse)
- Commission split: 50% agency, 50% agents
  - Same agent for listing + selling → that agent gets full 50%
  - Different agents → 25% listing + 25% selling
- Commission auto-calculated when transaction reaches `completed` stage
- **INVARIANT:** `agency + listing + selling === totalServiceFee` (cent-perfect, always)

## Coding Conventions

- No `any` types — use proper typing everywhere
- One module per domain entity
- Schemas in `schemas/` subfolder, DTOs in `dto/`, pure functions in `helpers/`
- Tests in `test/unit/` and `test/integration/` (not colocated)
- Frontend: composables for reusable logic, Pinia stores for global state
- Tailwind CSS only for styling — no CSS files, no component libraries
- Conventional commit messages
