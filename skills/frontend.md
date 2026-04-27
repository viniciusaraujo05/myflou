# Frontend Best Practices — @flou/web (Next.js)

## Project Structure

```
apps/web/src/
├── app/                    ← App Router (Next.js 14+)
│   ├── layout.tsx          ← Root layout (fonts, global providers)
│   ├── page.tsx            ← Home page (/)
│   ├── globals.css         ← Tailwind base styles
│   └── (auth)/             ← Route group — no URL segment
│       ├── login/page.tsx
│       └── register/page.tsx
├── components/             ← Reusable UI components
│   ├── ui/                 ← Primitive components (Button, Input, etc.)
│   └── [feature]/          ← Feature-scoped components
└── lib/
    ├── api.ts              ← Typed fetch client
    └── auth.ts             ← JWT token helpers
```

---

## Conventions

### File & folder naming
- Folders: `kebab-case`
- Components: `PascalCase.tsx`
- Utilities/hooks: `camelCase.ts`
- Use route groups `(groupName)` to organize pages without affecting URLs

### Components
- **Server Components by default** — only add `'use client'` when you need browser APIs, event handlers, or React state
- Keep components small and focused. If a component exceeds ~100 lines, extract sub-components
- Co-locate styles, types, and logic with the component file when possible

```tsx
// Good — server component, no 'use client' needed
export default async function UserProfile({ id }: { id: string }) {
  const user = await getUser(id) // direct server-side fetch
  return <div>{user.email}</div>
}

// Only use 'use client' when truly needed
'use client'
export function LoginForm() {
  const [email, setEmail] = useState('')
  ...
}
```

### Data fetching
- **Server Components**: fetch directly, no `useEffect`
- **Client Components**: use `useEffect` or a state management solution
- Always type API responses using types from `@flou/shared`

```tsx
import type { User } from '@flou/shared'
import { api } from '@/lib/api'

// api.ts handles all communication with the Fastify backend
const user = await api.getMe(token) // returns typed User
```

### Forms & validation
- Import Zod schemas from `@flou/shared` — same schemas used in the backend
- Validate on the client before sending the request to avoid unnecessary round-trips

```tsx
import { LoginSchema } from '@flou/shared'

const parsed = LoginSchema.safeParse({ email, password })
if (!parsed.success) {
  setError(parsed.error.errors[0]?.message)
  return
}
```

### Styling
- **Tailwind CSS only** — no inline styles, no CSS modules unless absolutely necessary
- Use utility classes directly on elements; extract to components when patterns repeat
- Class order: layout → spacing → sizing → color → typography → state

```tsx
// Good
<button className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">

// Avoid: mixing inline styles with Tailwind
<button style={{ marginTop: '8px' }} className="bg-blue-600">
```

### TypeScript
- Avoid `any` — use `unknown` and narrow with type guards
- Prefer `interface` for object shapes, `type` for unions/intersections
- Import shared types from `@flou/shared`, never redefine them locally

---

## Adding a New Page

1. Create `src/app/[route]/page.tsx`
2. If it needs authentication, add a redirect at the top using `next/navigation`
3. If it has a form, import the matching Zod schema from `@flou/shared`
4. Call `api.ts` methods for backend communication

## Adding a New API Call

1. Open `src/lib/api.ts`
2. Add a typed method to the `ApiClient` class
3. Use types from `@flou/shared` for request/response shapes

```ts
async updateUser(token: string, data: UpdateUserInput): Promise<User> {
  return this.request<User>('/users/me', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
}
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Fastify API base URL | Yes |

- Prefix public variables with `NEXT_PUBLIC_`
- Never expose secrets in `NEXT_PUBLIC_*` variables
- Copy `.env.example` → `.env.local` for local development
