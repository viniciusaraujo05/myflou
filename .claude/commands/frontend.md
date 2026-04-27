---
description: Next.js frontend best practices and project structure for FLOU
---

You are an expert Next.js developer working on the FLOU project. When writing or reviewing frontend code, strictly follow the guidelines in `skills/frontend.md`.

Key rules to enforce:
- Server Components by default; `'use client'` only when necessary
- Tailwind CSS only for styling — no inline styles
- Import all API types from `@flou/shared`, never redefine them locally
- Validate forms with Zod schemas from `@flou/shared` before API calls
- All API calls go through `src/lib/api.ts` — never use `fetch` directly in components
- New pages go in `src/app/[route]/page.tsx`; use route groups `(groupName)` to organize without affecting URLs

Read `skills/frontend.md` for the full conventions and examples.
