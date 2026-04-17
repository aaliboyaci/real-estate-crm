# Changelog

All notable changes to this project will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

## [Unreleased]

### Added — Phase 1: Backend Foundation
- **Project scaffolding:** NestJS 11 + TypeScript strict mode, Mongoose 9, MongoDB Atlas config
- **Global infrastructure:** ValidationPipe, HttpExceptionFilter, TransformInterceptor, ParseObjectIdPipe
- **Swagger/OpenAPI** documentation at `/api/docs`
- **Agent module:** CRUD operations with schema, DTOs, service, controller
- **Transaction module:** Full lifecycle management with stage machine
- **Stage machine:** Pure function — strictly linear transitions (agreement → earnest_money → title_deed → completed), 21 unit tests
- **Commission module:** Pure function calculator + event-driven auto-calculation on completion, 16 unit tests
- **Dashboard module:** Aggregation queries for stats, pipeline view, top agents, agency revenue
- **Seed script:** 5 agents, 15 transactions (across all stages), 5 commission records
- **37 unit tests passing** (commission calculator + stage machine)

### Added — Phase 2: Frontend
- **Nuxt 3 scaffolding:** Tailwind CSS 4, Pinia stores, runtimeConfig for API base URL
- **Layout:** Sidebar navigation, header with page title, toast notification system
- **Dashboard page:** Stats cards (total/active transactions, agency revenue, top agent), pipeline mini-view, top agents table
- **Transaction pipeline:** Kanban board with 4 stage columns, transaction cards with agent names and service fee
- **Transaction detail:** Horizontal stepper, property/agent info, stage advance button with confirmation, full stage history
- **Commission breakdown:** Visual stacked bar (agency vs agents), detailed row-by-row amounts, total verification
- **Agent pages:** Card grid listing, create form modal, detail page with commission history and total earnings
- **Reports page:** Full commission listing with agency/agent splits per transaction
- **Composables:** useApi ($fetch wrapper), useFormatCurrency (cents → EUR), useToast (notification system)
- **Type definitions:** Transaction, Agent, Commission TypeScript interfaces shared across stores and components

### Added — Phase 3: Documentation
- **README.md:** Comprehensive setup guide, API reference with all endpoints, commission rules, seed data description, environment variables, deployment instructions
- **DESIGN.md:** Architecture decisions with rationale — integer cents, hybrid commission storage, strictly linear stage machine, event-driven calculation, API envelope pattern, frontend state management, testing strategy, trade-offs and future considerations

### Planned
- Deployment: Live API URL (Railway) + Live Frontend URL (Vercel) + MongoDB Atlas
