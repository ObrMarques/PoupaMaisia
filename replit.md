# PoupaMais

Aplicativo premium de gestão financeira pessoal com interface em português do Brasil. Inclui controle de transações, carteiras, metas, relatórios e a PoupaAI — assistente financeiro inteligente com GPT.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations (OpenAI proxy, auto-provisioned)
- Required secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase project credentials
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase keys exposed to Vite frontend

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Tailwind CSS, shadcn/ui, wouter, TanStack Query
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Auth: Supabase Auth (email/password + Google OAuth, custom sign-in/sign-up pages in pt-BR)
- AI: OpenAI GPT via Replit AI Integrations (`lib/integrations-openai-ai-server`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle ORM schema (source of truth for DB)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — generated React Query hooks (from Orval)
- `lib/api-zod/` — generated Zod schemas (from Orval)
- `lib/integrations-openai-ai-server/` — OpenAI SDK client + batch/image/audio utils
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/poupamaix/src/pages/` — React page components
- `artifacts/poupamaix/src/lib/supabase.ts` — Supabase browser client
- `artifacts/api-server/src/lib/supabase.ts` — Supabase admin client (JWT verification)
- `artifacts/poupamaix/src/components/layout.tsx` — sidebar + mobile nav

## Architecture decisions

- PoupaAI uses SSE streaming (`/api/ai/stream`) for real-time typing effect; raw `fetch` + `ReadableStream` on client since Orval can't generate hooks for SSE
- AI financial context built at request time from DB: last 50 transactions, wallets, goals, categories — injected as system prompt alongside conversation history (last 20 messages)
- Auth uses Supabase Auth with custom pt-BR pages; Google OAuth redirects to `/auth/callback`
- All routes are protected by `authMiddleware` (Supabase JWT via `supabaseAdmin.auth.getUser(token)`); user resolved via `getUser(req)` helper
- Frontend sets `Authorization: Bearer <access_token>` on every API request via `setAuthTokenGetter` from the custom fetch lib
- DB `users` table uses `supabase_id` (UUID) to link Supabase auth users — JIT-provisioned on first request
- DB uses `aiConversationsTable` + `aiMessagesTable` for chat history; conversations are user-scoped

## Product

- Dashboard with spending summary, monthly trend chart, and category breakdown
- Transactions: add, edit, filter, recurring/installments
- Wallets: multiple accounts with balance tracking
- Goals: financial goals with progress bars and deadlines
- Reports: visual spending analytics
- PoupaAI: streaming AI chat assistant that reads user's real financial data and gives personalized advice, insights, and alerts in pt-BR

## User preferences

- Portuguese Brazil interface throughout — all copy, errors, and AI responses in pt-BR
- Premium minimalist design: black/white branding, dark/light theme
- Freemium model: free plan has limits (2 carteiras, 2 metas, PoupaAI bloqueado, Alertas bloqueados). Premium R$ 9,90/mês. `useSubscription()` returns `isPremium: false` by default — flip to `true` to enable premium. UpgradeModal component in `src/components/upgrade-modal.tsx`
- Mobile-first responsive layout

## Gotchas

- Run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the OpenAI lib needs to emit declarations first
- The `/ai/stream` endpoint returns SSE — do NOT wrap in React Query; use raw fetch on the client
- Supabase Google OAuth requires the redirect URL `<your-domain>/auth/callback` to be added in Supabase Dashboard → Authentication → URL Configuration

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk v6 Future API details
