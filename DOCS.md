# FLOU — Application Documentation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 (App Router) |
| UI library | React 19 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Interactive components | Headless UI v2 |
| Rich text editor | Tiptap 3 |
| Backend framework | Fastify 5 |
| ORM | Prisma 7 + PostgreSQL |
| Auth | JWT (@fastify/jwt) + httpOnly cookies |
| Password hashing | bcryptjs (cost 12) |
| Validation | Zod 4 |
| AI | OpenAI SDK (gpt-4o-mini) |
| Security | @fastify/helmet, @fastify/rate-limit, @fastify/cors |
| Monorepo | Turborepo + pnpm workspaces |

---

## Architecture Overview

The app uses a **BFF (Backend-for-Frontend)** pattern:

```
Browser → Next.js BFF routes (/api/*) → Fastify API → PostgreSQL
```

The browser never directly calls Fastify. All API calls go through Next.js proxy routes that forward the `access_token` cookie as a Bearer token and relay responses back. This keeps credentials out of the browser and simplifies CORS.

Authentication uses **rotating httpOnly cookies**: a 15-minute access token and a long-lived refresh token. Refresh tokens rotate on every use and support theft detection — replaying an already-rotated token revokes the entire family.

---

## Menus

### Home

**Path:** `/home`

The dashboard. Shows a summary of the user's data across all features and provides a quick capture tool powered by AI.

**What it does:**
- Displays count cards for: Tasks (today), Notes, Links, Passwords
- Shows recent items from each category
- Quick action buttons to jump to any section
- **AI Quick Capture**: paste any free-form text and the AI will classify it into notes, tasks, links, or credentials — shows a preview before saving

**Technologies:**
- Server component fetches all data in parallel on load (tasks, notes, links, credentials)
- OpenAI (gpt-4o-mini) via `POST /ai/classify` and `POST /ai/save`
- Rate limited: 10 classify requests / 15 min, 20 save requests / 15 min

---

### Calendar

**Path:** `/calendar`

Visual calendar for managing tasks by date.

**What it does:**
- Displays tasks on a monthly/weekly calendar view
- Tasks are fetched by date range (`?from=YYYY-MM-DD&to=YYYY-MM-DD`)
- Create and manage tasks directly from the calendar

**Technologies:**
- Client component (`CalendarView`)
- Fastify `GET /tasks` with date range query parameters

---

### Notes

**Path:** `/notes`

A full note-taking workspace with folder organization and rich text editing.

**What it does:**
- Two-panel layout: folder + note list sidebar, editor main area
- Create, rename, and delete folders (each with a custom color)
- Create, edit, and delete notes
- Notes auto-save while typing (800 ms debounce)
- Search notes by title across all folders or within a selected folder
- Export notes/folders to PDF
- Mobile view collapses to a dropdown selector

**Technologies:**
- **Tiptap 3** for the WYSIWYG editor (supports headings, bold/italic, highlights, links, images, task lists)
- Note content stored as **Tiptap JSON** in PostgreSQL
- Auto-save via debounced `PATCH /notes/:id`
- PDF export via browser print / HTML generation from Tiptap JSON
- Fastify routes: `GET/POST /notes`, `GET/PATCH/DELETE /notes/:id`, `GET/POST /folders`, `PATCH/DELETE /folders/:id`

---

### Links

**Path:** `/links`

A categorized bookmark manager.

**What it does:**
- Displays links as cards: favicon/initial, title, domain, category badge
- Filter links by category using pill tabs
- Add/edit links with: title, URL, description, category, and optional login credentials (username + password)
- Create and manage categories (each with a custom color)
- Click a card to open the link in a new tab

**Technologies:**
- Fully client-side component with local state
- **Headless UI v2** dialogs for add/edit forms
- Links can optionally store credentials (encrypted at rest via `ENCRYPTION_KEY`)
- Fastify routes: `GET/POST /links`, `PATCH/DELETE /links/:id`, `GET/POST /link-categories`, `PATCH/DELETE /link-categories/:id`

---

### Passwords

**Path:** `/passwords`

A unified password manager that combines standalone credentials and login info stored inside links.

**What it does:**
- Lists all saved credentials and links that have a username/password
- Search by service name or username
- Toggle show/hide password
- Copy password to clipboard with visual feedback
- Badge distinguishes "Saved" credentials from "Link" entries
- Edit/delete standalone credentials; link credentials redirect to the Links page
- Open the associated URL if one exists

**Technologies:**
- Fully client-side component
- Credentials encrypted in the database using AES (via `ENCRYPTION_KEY` env var)
- Clipboard API for copy-to-clipboard
- Fastify routes: `GET/POST /credentials`, `PATCH/DELETE /credentials/:id`

---

### Profile & Settings

**Path:** `/profile`

User account settings.

**What it does:**
- Shows avatar (initials) and email address
- Update display name
- Set or change account password
  - If no password is set (e.g., Google OAuth user), shows a "Set Password" form
  - If a password exists, requires the current password before allowing a change
  - Password requirements: min 8 chars, 1 uppercase, 1 number, 1 special character
- Success and error feedback for all operations

**Technologies:**
- Client component with form state
- Fastify routes: `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password`
- Password hashed with **bcryptjs cost 12**

---

## Navigation

### Sidebar (desktop)

Vertical navigation on the left side. Shows icon + label for each section. Active route is highlighted. Collapses to icon-only mode on narrow viewports.

Items: **Home · Calendar · Notes · Links · Passwords**

### Bottom Nav (mobile)

Fixed bottom bar with icon + label. Visible only on screens below `lg` breakpoint (`< 1024 px`). Same items as the sidebar.

### User Menu

Top-right corner. Shows the user's email/avatar. Contains:
- **Profile & Settings** — links to `/profile`
- **Sign out** — calls `POST /auth/logout`, clears cookies, redirects to `/login`

---

## Security Model

| Concern | Implementation |
|---|---|
| Auth tokens | httpOnly cookies, never exposed to JS |
| Token rotation | Each refresh issues a new token; old one marked `rotated=true` |
| Token theft detection | Replaying a rotated token revokes the entire token family |
| Ownership enforcement | Use case layer checks `userId`; DB layer enforces it via `updateMany/deleteMany({ where: { id, userId } })` |
| Credential encryption | Passwords stored encrypted with AES using `ENCRYPTION_KEY` |
| Rate limiting | Auth endpoints: 5–10 req / 15 min; AI: 10–20 req / 15 min |
| CSP | Set by Next.js headers; Fastify (JSON API) does not set HTML-level CSP |
| Google OAuth | `frame-src https://accounts.google.com` + `unsafe-eval` in CSP for OAuth popup compatibility |
