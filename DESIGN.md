# Design Document

This document explains the key architectural decisions, data modeling choices, and trade-offs made throughout the system.

---

## 1. High-Level Architecture

```
┌─────────────┐     HTTP/REST      ┌──────────────────────────┐     Mongoose     ┌────────────┐
│   Nuxt 3    │ ←────────────────→ │       NestJS API         │ ←──────────────→ │  MongoDB   │
│  Frontend   │    JSON / fetch    │                          │                  │   Atlas    │
│  (Pinia)    │                    │  Agents │ Transactions   │                  │            │
│             │                    │  Commissions │ Dashboard │                  │            │
└─────────────┘                    └──────────────────────────┘                  └────────────┘
                                            │
                                    EventEmitter
                                            │
                                   transaction.completed
                                            ↓
                                   CommissionsService
                                   (auto-calculate)
```

The system follows a **modular monolith** pattern on the backend. Each domain (agents, transactions, commissions, dashboard) is an independent NestJS module with its own controller, service, schema, and DTOs.

**Why modular monolith over microservices?** For a system of this scope, separate services would add network overhead, deployment complexity, and operational burden without meaningful benefit. The module boundaries are clean enough that extraction to microservices would be straightforward if scale demanded it.

---

## 2. Data Modeling

### 2.1 Monetary Values as Integer Cents

All monetary fields (`propertyPriceCents`, `serviceFeeCents`, `agencyAmountCents`, etc.) are stored as **integers representing cents**.

**Why not floating-point?**

Floating-point arithmetic introduces rounding errors that are unacceptable in financial calculations:

```javascript
// Floating-point problem
0.1 + 0.2 === 0.3  // false (0.30000000000000004)

// Integer cents — always exact
10 + 20 === 30      // true
```

The display layer converts cents to human-readable currency using `Intl.NumberFormat`. This is a standard practice in payment systems (Stripe, Adyen, and most banking software use integer cents).

### 2.2 Commission Storage: Hybrid Approach

Commissions are stored in **two places**:

1. **Dedicated `commissions` collection** — the source of truth for financial data
2. **Embedded `commissionSummary`** on the transaction document — a denormalized snapshot for fast reads

**Why hybrid instead of just one?**

| Approach | Read performance | Query flexibility | Consistency |
|----------|-----------------|-------------------|-------------|
| Embedded only | Fast (single read) | Poor (can't aggregate across transactions) | Simple |
| Separate only | Requires join/populate | Full (agent-level reports, date ranges) | Simple |
| **Hybrid** | Fast reads + full queries | Both | Small redundancy (acceptable) |

The transaction detail page needs the commission summary — embedding it avoids a second query. Agent earnings reports and dashboard statistics need to aggregate across many commissions — the separate collection enables efficient `$group` pipelines.

The embedded snapshot is written atomically when the commission is created, so they never diverge.

### 2.3 Agent Schema

```typescript
{
  firstName, lastName   // Required, trimmed
  email                 // Unique, lowercase
  phone                 // Optional
  isActive              // Soft-delete capability
}
```

Minimal by design. An agent's identity is all the system needs to track commission distributions. The `isActive` flag supports soft-deletion — an agent with completed transactions cannot be hard-deleted without breaking financial records.

### 2.4 Transaction Schema

```typescript
{
  propertyAddress       // Human-readable location
  type                  // 'sale' | 'rental'
  propertyPriceCents    // Property value
  serviceFeeCents       // Total commission to distribute
  listingAgent          // ObjectId ref → Agent
  sellingAgent          // ObjectId ref → Agent
  currentStage          // Enum: agreement | earnest_money | title_deed | completed
  stageHistory          // Array of { from, to, transitionedAt, note }
  commissionSummary     // Embedded snapshot (null until completed)
}
```

**`stageHistory` as audit trail:** Real estate transactions have legal significance. Recording every stage transition with a timestamp and optional note creates a compliance-ready audit trail. This is not just a nice-to-have — in a real system, you would need to prove when each stage occurred.

**`commissionSummary` nullable:** This field is `null` until the transaction reaches `completed`. The UI uses this to conditionally render the commission breakdown — a clear, type-safe signal of "commission not yet calculated."

---

## 3. Transaction Stage Machine

### Design: Strictly Linear Transitions

```
agreement → earnest_money → title_deed → completed
```

No stage skipping, no backward transitions, `completed` is terminal.

**Why strictly linear?**

In real estate, these stages follow a legal sequence:
- You cannot issue a **title deed** before **earnest money** is received
- You cannot **complete** a transaction before the **title deed** is processed
- A **completed** transaction represents a finalized legal transfer — reopening it would create compliance issues

The stage machine is implemented as a **pure function** (`canTransition`, `getNextStage`, `getStageOrder`) with zero dependencies. This makes it:
- Trivially testable (21 unit tests, no mocks needed)
- Framework-independent (could be extracted to a shared package)
- Easy to reason about (a simple lookup table)

**Why not allow backward transitions?** While there are edge cases where a transaction might "fall through" (e.g., earnest money is returned), modeling that as a backward stage transition conflates two different concepts: the transaction lifecycle and its outcome. A better approach (out of scope) would be a separate `status` field (active/cancelled) orthogonal to the stage.

---

## 4. Commission Calculation

### 4.1 The Calculator: A Pure Function

```typescript
calculateCommission({ serviceFeeCents, listingAgentId, sellingAgentId }): CommissionResult
```

This function has **no dependencies** — no database access, no framework imports, no side effects. It takes numbers and strings in, returns numbers out.

**Why pure?**
- Testing requires zero mocks (16 unit tests run in 0.3s)
- The business rule is readable in one place
- It can be shared across contexts (API, CLI, batch processing)

### 4.2 Cent-Perfect Arithmetic

The rounding strategy ensures the **sum always equals the input**:

```typescript
agencyAmountCents = Math.round(serviceFeeCents * 0.5)
agentPoolCents = serviceFeeCents - agencyAmountCents     // remainder, not recalculated
listingAgentCents = Math.round(agentPoolCents / 2)
sellingAgentCents = agentPoolCents - listingAgentCents    // remainder gets the last cent
```

The key insight: the last recipient always gets `total - sum_of_others`. This guarantees `agency + listing + selling === totalServiceFee` for any input, including odd amounts like 3 cents or 99,999 cents.

This invariant is verified by property-based tests that run 100 random inputs per scenario.

### 4.3 Event-Driven Trigger

Commission calculation is triggered by a `transaction.completed` event, not by the transaction service directly.

```
TransactionsService.advanceStage() → emit('transaction.completed')
                                              ↓
                              CommissionsService.@OnEvent('transaction.completed')
                                              ↓
                                    calculateCommission() → persist
```

**Why event-driven?**

- **Loose coupling:** The transaction module doesn't import or know about the commission module
- **Single responsibility:** The transaction service manages lifecycle; the commission service manages money
- **Extensibility:** Adding future listeners (notifications, invoice generation) requires no changes to the transaction module
- **Idempotency:** The handler checks for existing commissions before creating — safe to retry

---

## 5. API Design

### 5.1 Response Envelope

All successful responses are wrapped by `TransformInterceptor`:

```json
{
  "data": { ... },
  "meta": { "total": 15, "page": 1, "limit": 20, "totalPages": 1 }
}
```

**Why an envelope?** It provides a consistent contract for the frontend. Paginated and non-paginated responses have the same outer shape. The `meta` field is only present for paginated endpoints.

### 5.2 Error Format

All errors are formatted by `HttpExceptionFilter`:

```json
{
  "statusCode": 400,
  "message": "Cannot transition from \"agreement\" to \"completed\"",
  "error": "BadRequestException",
  "timestamp": "2026-04-18T00:00:00.000Z"
}
```

**Why consistent errors?** The frontend can rely on a single error shape for all endpoints, simplifying error handling in the `useApi` composable.

### 5.3 Stage Advancement Endpoint

```
PATCH /api/transactions/:id/stage
Body: { "targetStage": "earnest_money", "note": "Deposit received" }
```

The client explicitly specifies the target stage rather than a generic "advance" action. This prevents race conditions where two users might advance a transaction simultaneously, and makes the API self-documenting.

---

## 6. Frontend Architecture

### 6.1 State Management with Pinia

Three stores, each owning a single domain:

- **`transactions`** — list, current, pipeline (computed), CRUD actions
- **`agents`** — list, current, CRUD actions
- **`dashboard`** — stats (fetched from aggregation endpoint)

Stores use the Composition API style (`defineStore` with setup function) for better TypeScript inference and more natural reactive code.

**Why not fetch directly in components?** The pipeline view, transaction cards, and detail page all share the same transaction data. A store prevents redundant API calls and keeps the UI consistent when mutations occur.

### 6.2 Composables

- **`useApi`** — Wraps `$fetch` with base URL, response unwrapping, and typed methods (`get`, `post`, `patch`, `del`). All API calls go through this single point.
- **`useFormatCurrency`** — Converts integer cents to human-readable currency (`150000` → `€1,500.00`). Uses `Intl.NumberFormat` for locale-aware formatting.
- **`useToast`** — Simple reactive toast notification system for user feedback.

### 6.3 UI Design Decisions

**Kanban board for transaction pipeline:** Real estate agents think about transactions in terms of "where they are in the process." A Kanban board with four columns (Agreement, Earnest Money, Title Deed, Completed) maps directly to this mental model.

**Stage-based color coding:** Each stage has a distinct color (blue, amber, purple, emerald) that is consistent across the entire application — badges, pipeline columns, stepper, and charts. This creates immediate visual recognition.

**Commission breakdown visualization:** A horizontal stacked bar shows the percentage split at a glance, followed by a detailed table with exact amounts. The bar makes the 50/50 or 50/25/25 split immediately obvious.

---

## 7. Testing Strategy

### What is Tested

| Test Target | Why | Tests |
|-------------|-----|-------|
| Commission calculator | Core business rule, must be correct for any input | 16 |
| Stage machine | Prevents invalid state transitions | 21 |

### What is Not Tested (and Why)

- **Controller HTTP layer:** Covered implicitly by Swagger documentation and manual testing. Adding controller tests would duplicate the validation already done by DTOs and NestJS pipes.
- **Database queries:** These are thin wrappers around Mongoose. Testing them would test Mongoose, not our logic.
- **Frontend components:** For a project of this scope, manual testing provides better ROI than setting up a component test framework.

### Property-Based Testing

The commission calculator tests include an invariant check:

```typescript
for (let i = 0; i < 100; i++) {
  const serviceFeeCents = Math.floor(Math.random() * 1_000_000) + 1;
  const result = calculateCommission({ ... });
  const total = result.agencyAmountCents + sum(result.agentBreakdowns);
  expect(total).toBe(serviceFeeCents);  // MUST hold for every input
}
```

This catches edge cases that example-based tests miss (e.g., what happens with 1 cent? With 99,999 cents?).

---

## 8. Trade-offs and Future Considerations

### Decisions Made For Simplicity

1. **No authentication/authorization.** The case focuses on transaction and commission logic. Auth would add complexity without demonstrating domain understanding.

2. **No real-time updates (WebSocket/SSE).** The Kanban board refreshes on navigation and after actions. For a multi-user production system, real-time updates would prevent stale views.

3. **No transaction cancellation/rollback.** The strictly linear stage machine doesn't support "undo." A production system would need a `status` field (active/cancelled) separate from the `stage`.

### What Would Change at Scale

1. **Commission calculation** would move to an async job queue (Bull/BullMQ) to handle high throughput without blocking the event loop.

2. **The `stageHistory` array** would be extracted to a separate collection if transactions accumulate thousands of history entries.

3. **The dashboard aggregation** queries would use MongoDB materialized views or a read-optimized cache to avoid scanning all documents on every request.

4. **The frontend** would add optimistic updates, skeleton loading states, and error boundaries for a production-grade UX.
