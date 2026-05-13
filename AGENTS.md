<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Keeping Documentation Current

When making significant changes to the codebase, update this file, `CLAUDE.md`, and `README.md`:
- New authentication flows or session handling changes
- New major libraries or frameworks
- New architectural patterns (caching, state management, API layers)
- Changes to file organization conventions
- New environment variables or configuration requirements

**Sync requirement:** If you update `CLAUDE.md` or `README.md` with new rules, conventions, or architectural info, reflect those changes here. All three files must stay in sync.

# Agent Instructions

## Tech Stack
- **Next.js 16** (App Router) with **TypeScript 5**
- **Tailwind CSS v4** for styling
- **AWS Cognito** (SRP flow) for authentication
- **pnpm** as package manager

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Required Environment Variables

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_AWS_REGION=
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_ID_LEGACY=
NEXT_PUBLIC_COGNITO_CLIENT_ID_LEGACY=
```

## Critical Rules

### Authentication
- Never make API/SDK calls directly in components — use `src/services/auth.ts`
- Session tokens are stored in memory by default; persistent sessions use cookies with refresh tokens only (JWTs are too large for cookies)
- The `vantage_auth` cookie is a presence flag for middleware; it contains no token data
- Protected pages must use the `useAuth` hook or middleware guards

**Key files:**
- `src/services/auth.ts` — Cognito SRP auth, token refresh, session storage
- `src/middleware.ts` — Server-side route protection via `vantage_auth` cookie
- `src/hooks/useAuth.ts` — Client-side auth guard for protected pages

**Session handling:**
- `keepLoggedIn=false`: Memory-only session (cleared on refresh)
- `keepLoggedIn=true`: Persistent cookie stores refresh token; on page reload, tokens are restored via `restoreFromPersistentSession()`

**Migration flow:** If login to new pool fails, the app tries the legacy pool and redirects to `/migrate` to complete user migration.

### Server vs Client Components
- Components are Server Components by default
- Only add `"use client"` when the component needs browser APIs, React state, or effects
- Keep page files (`page.tsx`) thin — they should delegate to components

### File Organization
- **Components**: `src/components/` — PascalCase, function declarations
- **Hooks**: `src/hooks/` — must start with `use`, export via `index.ts`
- **Types**: `src/interfaces/` — grouped by domain, export via `index.ts`
- **Services**: `src/services/` — one file per domain, document env vars at top
- **Routes**: `src/app/` — kebab-case folders

### Imports
Always use the `@/*` path alias for `src/*` imports:
```typescript
import { useAuth } from "@/hooks/useAuth";
import type { SessionUser } from "@/interfaces";
```

### TypeScript
- `strict` mode is enabled — do not use `any` or `@ts-ignore`
- Use `unknown` and narrow types explicitly
- Type all parameters and return values for exported functions

### Styling
- Use Tailwind utility classes directly in JSX
- No inline `style` props or one-off CSS files
- Global styles only in `src/app/globals.css`

## Public Routes
Routes that skip auth: `/`, `/signup`, `/forgot-password`, `/reset-password`, `/migrate`

All other routes require authentication.

## Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user profile page
fix: resolve token refresh race condition
chore: update dependencies
refactor: extract auth logic into useAuth hook
```
