# Backend Best Practices — @flou/api (Fastify + DDD)

## Architecture Overview

The backend follows **Domain-Driven Design (DDD)** in three layers:

```
HTTP Request
     ↓
Infrastructure/HTTP  ← Parse input (Zod), call use case, return response
     ↓
Application          ← Use cases orchestrate domain + repositories
     ↓
Domain               ← Business rules, entities, value objects (zero framework deps)
     ↑
Infrastructure/Persistence  ← Prisma implementations of domain interfaces
```

---

## Project Structure

```
apps/api/src/
├── domain/                              ← Pure business logic — no Fastify, no Prisma
│   ├── shared/
│   │   └── domain-error.ts             ← Base DomainError + isDomainError()
│   ├── user/
│   │   ├── user.entity.ts              ← User entity with toDTO()
│   │   ├── user.repository.ts          ← IUserRepository interface (port)
│   │   ├── user.errors.ts              ← EmailAlreadyInUseError, UserNotFoundError
│   │   └── value-objects/
│   │       ├── email.vo.ts             ← Zod-validated Email VO
│   │       └── password.vo.ts          ← bcrypt HashedPassword VO
│   └── auth/
│       ├── token.service.ts            ← ITokenService interface
│       ├── refresh-token.repository.ts ← IRefreshTokenRepository interface
│       └── auth.errors.ts             ← InvalidCredentialsError, InvalidTokenError
│
├── application/                         ← Use cases
│   ├── auth/
│   │   ├── register.usecase.ts
│   │   ├── login.usecase.ts
│   │   ├── refresh.usecase.ts
│   │   └── logout.usecase.ts
│   └── user/
│       └── get-me.usecase.ts
│
└── infrastructure/
    ├── persistence/                     ← Prisma implementations
    │   ├── prisma-user.repository.ts
    │   └── prisma-refresh-token.repository.ts
    ├── auth/
    │   └── jwt-token.service.ts        ← JWT via @fastify/jwt
    ├── http/
    │   ├── plugins/                    ← Fastify plugins (cors, jwt, cookie, helmet, rate-limit, prisma, env)
    │   ├── routes/                     ← Thin HTTP adapters
    │   │   ├── auth.routes.ts
    │   │   ├── user.routes.ts
    │   │   └── index.ts
    │   └── schemas/
    │       └── auth.http-schema.ts     ← Zod schemas for HTTP boundary
    └── container/
        └── index.ts                    ← DI: wires repos + use cases, decorates app
```

---

## Conventions

### Domain layer rules
- **No framework imports** in `domain/` — no Fastify, no Prisma, no Express
- Value objects validate their own invariants using Zod internally
- Domain errors extend `DomainError` — they carry a `code` string and are mapped to HTTP status in `app.ts`
- Repositories are **interfaces** in `domain/` — implementations live in `infrastructure/persistence/`

```ts
// Good — domain stays pure
export class Email {
  static create(raw: string): Email {
    const result = EmailSchema.safeParse(raw)
    if (!result.success) throw new InvalidEmailError(raw) // DomainError
    return new Email(result.data.toLowerCase())
  }
}

// Bad — framework leak into domain
import { PrismaClient } from '@prisma/client' // Never in domain/
```

### Use cases
- One file per operation; constructor-injected dependencies only
- Orchestrate domain objects and repositories; never touch HTTP details
- Throw `DomainError` subclasses — the global error handler in `app.ts` maps them to HTTP status codes

```ts
export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(input: { email: string; password: string }) {
    const email = Email.create(input.email)         // throws InvalidEmailError
    const password = await HashedPassword.fromPlain(input.password) // throws WeakPasswordError
    const existing = await this.userRepo.findByEmail(email.value)
    if (existing) throw new EmailAlreadyInUseError()
    // ...
  }
}
```

### Routes are thin adapters
- Parse input with Zod at the HTTP boundary
- Call the use case from `app.container`
- Return the result — no business logic

```ts
app.post('/register', async (request, reply) => {
  const parsed = RegisterBodySchema.safeParse(request.body)
  if (!parsed.success) return reply.status(400).send({ ... })

  const { user, tokenPair } = await app.container.auth.register.execute(parsed.data)
  return reply.status(201).send({ user })
  // DomainErrors thrown by the use case bubble up to the global error handler in app.ts
})
```

### Global error handler
Registered in `app.ts` BEFORE plugins. Maps `DomainError.code` to HTTP status:

| Code | Status |
|---|---|
| `EMAIL_ALREADY_IN_USE` | 409 |
| `INVALID_CREDENTIALS` | 401 |
| `USER_NOT_FOUND` | 404 |
| `INVALID_EMAIL` | 400 |
| `WEAK_PASSWORD` | 400 |
| `INVALID_TOKEN` | 401 |
| `MISSING_TOKEN` | 401 |

### Adding a new DomainError
1. Add the class to the appropriate `domain/*/errors.ts` file
2. Add its `code → status` mapping to `DOMAIN_STATUS_MAP` in `app.ts`

### Plugin registration order (app.ts)
```
setErrorHandler → env → helmet → rate-limit → cors → cookie → jwt → prisma → container → routes
```

`setErrorHandler` must be first so it applies to all child scopes.

---

## Adding a New Feature (end-to-end)

**Example: POST /posts — create a post**

1. **Domain** — add `Post` entity, `IPostRepository`, `PostErrors`
2. **Application** — add `CreatePostUseCase`
3. **Infrastructure/persistence** — add `PrismaPostRepository`
4. **Infrastructure/container** — add `post: { create: new CreatePostUseCase(...) }` to container
5. **Infrastructure/http/routes** — add `post.routes.ts`, register in `index.ts`
6. **Prisma** — add `Post` model, run `db:migrate`
7. **@flou/shared** — add shared types/Zod schemas if needed on the frontend

## Adding a New Database Model

1. Edit `apps/api/prisma/schema.prisma`
2. `pnpm --filter @flou/api db:migrate`
3. `pnpm --filter @flou/api db:generate`
4. Add types to `packages/shared/src/types/`
5. Add Zod schemas to `packages/shared/src/schemas/`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 16 chars; min 32 in production |
| `PORT` | No | Default `3001` |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Default `http://localhost:3000` |
