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
- **CLAUDE.md:** Agent-friendly project context for AI-assisted development
- **37 unit tests passing** (commission calculator + stage machine)

### Planned
- Frontend: Nuxt 3 with Kanban pipeline, stepper, commission breakdown
- Deployment: Railway (backend) + Vercel (frontend) + MongoDB Atlas
