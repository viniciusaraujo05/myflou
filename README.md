# FLOU

Full-stack monorepo — **Fastify** backend + **Next.js** frontend.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Backend | Fastify, Prisma, PostgreSQL, JWT |
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Shared | Zod schemas + TypeScript types (`@flou/shared`) |
| DevOps | Docker, docker-compose, GitHub Actions CI |

---

## Project Structure

```
FLOU/
├── apps/
│   ├── api/               ← Fastify backend (port 3001)
│   └── web/               ← Next.js frontend (port 3000)
├── packages/
│   ├── shared/            ← @flou/shared — types + Zod schemas
│   └── tsconfig/          ← Shared TypeScript configs
├── skills/
│   ├── backend.md         ← Backend conventions & best practices
│   └── frontend.md        ← Frontend conventions & best practices
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Prerequisites

Make sure the following are installed on your machine:

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+ — `npm install -g pnpm`
- [Docker](https://www.docker.com/) + Docker Compose (for the database or full containerized setup)

---

## Getting Started

### Option A — Local development (recommended for dev)

#### 1. Clone the repository

```bash
git clone <repo-url>
cd FLOU
```

#### 2. Install all dependencies

```bash
pnpm install
```

This installs dependencies for all apps and packages in the monorepo at once.

#### 3. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env` and set a strong `JWT_SECRET`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flou_dev"
JWT_SECRET="your-long-random-secret-here"
PORT=3001
NODE_ENV=development
```

#### 4. Start the database

```bash
docker-compose up db -d
```

This starts only the PostgreSQL container in the background.

#### 5. Run database migrations

```bash
pnpm --filter @flou/api db:migrate
```

This applies all Prisma migrations and generates the Prisma client.

#### 6. Start all apps

```bash
pnpm dev
```

Turborepo starts both apps in parallel:

| App | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (Fastify) | http://localhost:3001 |
| API Health check | http://localhost:3001/health |

---

### Option B — Docker (full containerized setup)

#### 1. Clone the repository

```bash
git clone <repo-url>
cd FLOU
```

#### 2. Create an environment file for secrets

```bash
echo 'JWT_SECRET=your-long-random-secret-here' > .env
```

#### 3. Build and start all services

```bash
docker-compose up --build
```

This starts three services:
- `db` — PostgreSQL on port `5432`
- `api` — Fastify on port `3001`
- `web` — Next.js on port `3000`

#### 4. Run database migrations (first time only)

```bash
docker-compose exec api npx prisma migrate deploy
```

The app is now running at http://localhost:3000.

---

## Available Scripts

Run from the **root** of the monorepo:

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Type-check all packages |
| `pnpm format` | Format all files with Prettier |

Run scoped to a specific app with `pnpm --filter`:

```bash
pnpm --filter @flou/api db:migrate      # Run Prisma migrations
pnpm --filter @flou/api db:studio       # Open Prisma Studio
pnpm --filter @flou/api db:generate     # Regenerate Prisma client
pnpm --filter @flou/web build           # Build only the frontend
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/register` | No | Create a new account |
| `POST` | `/auth/login` | No | Login and receive a JWT |
| `GET` | `/users/me` | Yes | Get the current user |

### Example: Register

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret123"}'
```

### Example: Protected request

```bash
curl http://localhost:3001/users/me \
  -H "Authorization: Bearer <your-token>"
```

---

## Adding Features

### New backend route
1. Create `apps/api/src/routes/[resource].ts`
2. Register it in `apps/api/src/routes/index.ts`
3. Add shared types/schemas to `packages/shared/src/`

See `skills/backend.md` for full conventions.

### New frontend page
1. Create `apps/web/src/app/[route]/page.tsx`
2. Add typed API methods to `apps/web/src/lib/api.ts` if needed

See `skills/frontend.md` for full conventions.

### New database model
1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm --filter @flou/api db:migrate`
3. Run `pnpm --filter @flou/api db:generate`
4. Add types to `packages/shared/src/types/`

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

- Lint — `pnpm turbo lint`
- Type-check — `pnpm turbo type-check`
- Build — `pnpm turbo build`

Workflow file: `.github/workflows/ci.yml`

---

## Environment Variables Reference

### `apps/api/.env`

| Variable | Default | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | — | Yes | PostgreSQL connection string |
| `JWT_SECRET` | — | Yes | Secret for signing JWTs (min. 32 chars in prod) |
| `PORT` | `3001` | No | API server port |
| `NODE_ENV` | `development` | No | Environment mode |
| `CORS_ORIGIN` | `http://localhost:3000` | No | Allowed CORS origin |

### `apps/web/.env.local`

| Variable | Default | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Yes | Fastify API base URL |
