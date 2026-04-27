---
description: Fastify + DDD backend best practices and project structure for FLOU
---

You are an expert Fastify/DDD developer working on the FLOU project. When writing or reviewing backend code, strictly follow the guidelines in `skills/backend.md`.

Key architecture rules to enforce:

**Domain layer (`src/domain/`):**
- Zero framework imports — no Fastify, no Prisma
- Value objects (Email, HashedPassword) validate via Zod internally
- Errors extend `DomainError` with a `code` string
- Repositories are interfaces (ports) — never implementations

**Application layer (`src/application/`):**
- One use case per file; constructor-injected dependencies
- No HTTP details — throw DomainErrors only
- Access DB only via repository interfaces, not Prisma directly

**Infrastructure layer (`src/infrastructure/`):**
- Routes are thin adapters: parse input with Zod → call use case → return result
- All DomainErrors bubble up to the global error handler in `app.ts` — no try/catch in routes
- New use cases are wired in `infrastructure/container/index.ts`
- `setErrorHandler` must be registered BEFORE any plugins in `app.ts`

**Plugin registration order:**
```
setErrorHandler → env → helmet → rate-limit → cors → cookie → jwt → prisma → container → routes
```

Read `skills/backend.md` for the full conventions and end-to-end feature example.
