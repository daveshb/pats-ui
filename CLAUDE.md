# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Keeping Documentation Current

Update this file, `AGENTS.md`, and `README.md` when you:
- Add or change major dependencies (auth providers, state management, UI libraries)
- Introduce new architectural patterns or flows (e.g., new API integration, caching layer)
- Modify the authentication or session handling logic
- Add new environment variables
- Change build/dev commands or tooling
- Modify project structure conventions

**Sync requirement:** If you update `AGENTS.md` or `README.md` with new rules, conventions, or architectural info, reflect those changes here. All three files must stay in sync.

## Important: Next.js 16 Breaking Changes

This project uses **Next.js 16** which has breaking changes from earlier versions. Before writing any code, consult the documentation in `node_modules/next/dist/docs/` and pay attention to deprecation notices.

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

## Architecture

### Authentication Flow

The app uses AWS Cognito with SRP (Secure Remote Password) authentication, supporting both a new and legacy user pool for migration purposes.

**Key files:**
- `src/services/auth.ts` - Cognito SRP auth, token refresh, session storage
- `src/middleware.ts` - Server-side route protection via `vantage_auth` cookie
- `src/hooks/useAuth.ts` - Client-side auth guard for protected pages

**Session handling:**
- `keepLoggedIn=false`: Memory-only session (cleared on refresh)
- `keepLoggedIn=true`: Persistent cookie stores refresh token; on page reload, tokens are restored via `restoreFromPersistentSession()`
- Protected routes check for `vantage_auth` cookie in middleware; unauthenticated requests redirect to `/`

**Migration flow:** If login to new pool fails, the app tries the legacy pool and redirects to `/migrate` to complete user migration.

### Path Aliases

Use `@/*` for imports from `src/*`:
```typescript
import { useAuth } from "@/hooks/useAuth";
import { SessionUser } from "@/interfaces";
```

## Code Conventions

### Components (`src/components/`)
- Use **function declarations** (not arrow functions) for components
- **PascalCase** for files and component names: `LoginForm.tsx`
- Add `"use client"` only when the component needs browser APIs or React state/effects

### Hooks (`src/hooks/`)
- Files and exports start with `use`: `useAuth.ts` → `export function useAuth()`
- Export from `src/hooks/index.ts`

### Interfaces (`src/interfaces/`)
- All shared TypeScript types live here, grouped by domain: `auth.interfaces.ts`
- Use `interface` for object shapes, `type` for unions/intersections
- Export everything through `src/interfaces/index.ts`

### Services (`src/services/`)
- One service file per domain: `auth.ts`
- No fetch/SDK calls inside components — delegate to services
- Document required environment variables at the top of each service file

### Pages (`src/app/`)
- Follow Next.js App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Route folders use **kebab-case**: `app/user-profile/page.tsx`
- Keep pages thin — delegate to components and services

### Styling
- Use Tailwind CSS utility classes directly in JSX
- Global overrides in `src/app/globals.css`

### TypeScript
- `strict` mode is enabled — avoid `any`, use `unknown` and narrow explicitly
- Always type function parameters and return values for exported functions

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user profile page
fix: resolve token refresh race condition
chore: update dependencies
refactor: extract auth logic into useAuth hook
```
