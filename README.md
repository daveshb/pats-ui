
# pats-website

Frontend for the Pats platform — built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS v4**. Authentication is handled via **AWS Cognito** (SRP flow).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | AWS Cognito SRP |
| Package manager | pnpm |

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_AWS_REGION=
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_ID_LEGACY=
NEXT_PUBLIC_COGNITO_CLIENT_ID_LEGACY=
```

---

## Project Structure

```
pats-website/
├── public/                        # Static assets served at /
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── middleware.ts              # Next.js middleware (auth guards, redirects)
│   ├── app/                      # Next.js App Router — layouts, pages, API routes
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page (/)
│   │   ├── api/                  # API route handlers
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard page (/dashboard)
│   ├── assets/                   # Static files imported in code (images, fonts)
│   ├── components/               # Reusable UI components
│   │   └── auth/
│   │       └── LoginForm.tsx     # Login form component
│   ├── hooks/                    # Custom React hooks (useX naming convention)
│   │   └── useAuth.ts            # Auth guard hook for protected pages
│   ├── interfaces/               # TypeScript contracts — domain types and DTOs
│   │   ├── auth.interfaces.ts    # Auth-related types and error classes
│   │   └── index.ts              # Barrel export
│   ├── services/                 # External API / data-fetching layer
│   │   └── auth.ts               # Cognito SRP auth service
│   ├── store/                    # Global client state
│   └── utils/                    # Pure helper functions (no React)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS / Tailwind configuration
├── eslint.config.mjs             # ESLint configuration
└── package.json
```

---

## Coding Guidelines

### General

- **English only** — all identifiers, comments, commit messages, and PR descriptions must be written in English.
- Follow existing patterns in each folder before introducing new ones.
- Prefer explicit and readable code over clever one-liners.
- Keep files small and focused — one clear responsibility per file.

---

### Components (`src/components/`)

- Use **function declarations** (not arrow functions) for components.
- Name files and components in **PascalCase**: `UserCard.tsx`, `LoginForm.tsx`.
- Single-file components live directly in `components/`. Multi-file components get their own folder with an `index.ts` barrel:

```
components/
└── UserCard/
    ├── UserCard.tsx
    └── index.ts       ← re-exports UserCard
```

- Add `"use client"` only when the component actually needs browser APIs or React state/effects. Server Components are the default.
- Keep JSX clean — extract complex logic into helpers or hooks before the `return`.

---

### Hooks (`src/hooks/`)

- File and export names must start with `use`: `useAuth.ts` → `export function useAuth()`.
- Hooks must be pure with respect to their declared dependencies — no hidden global side effects.
- Export from `src/hooks/index.ts` to keep imports clean.

---

### Interfaces (`src/interfaces/`)

- All shared TypeScript types and interfaces live here — **never** define types inline inside a component or service file unless they are truly local.
- Group by domain: `auth.interfaces.ts`, `orders.interfaces.ts`, etc.
- Use `interface` for object shapes and `type` for unions, intersections, or aliases.
- Export everything through `src/interfaces/index.ts`.

---

### Services (`src/services/`)

- Services handle all communication with external APIs (REST, Cognito, etc.) — **no fetch/SDK calls inside components**.
- One service file per domain: `auth.ts`, `orders.ts`.
- Functions must be pure and return typed values — no side effects like redirects inside services.
- Document required environment variables at the top of the file.

---

### Pages & Routes (`src/app/`)

- Follow the [Next.js App Router file conventions](https://nextjs.org/docs/app/building-your-application/routing): `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
- Route segments use **kebab-case** folder names: `app/user-profile/page.tsx`.
- Keep page files thin — delegate rendering to components and data-fetching to services.
- Protect pages that require authentication with the `useAuth` hook (client) or middleware (server).

---

### Styling

- Use **Tailwind CSS utility classes** directly in JSX. Avoid inline `style` props.
- Do not create one-off CSS files for individual components — Tailwind covers most cases.
- Global overrides go in `src/app/globals.css`.

---

### TypeScript

- `strict` mode is enabled — do not disable it or use `@ts-ignore` without a documented reason.
- Avoid `any`. Use `unknown` and narrow the type explicitly.
- Always type function parameters and return values for exported functions.

---

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve token refresh race condition
chore: update dependencies
refactor: extract auth logic into useAuth hook
```

---

## Maintainer Note

When making significant architectural changes, adding major dependencies, or modifying core flows, also update:
- `CLAUDE.md` — guidance for Claude Code
- `AGENTS.md` — rules for AI coding assistants

**Sync requirement:** If you update coding guidelines or conventions in any of these three files, ensure all three stay in sync.
