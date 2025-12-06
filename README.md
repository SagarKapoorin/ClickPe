# The Loan Picks Dashboard

AI-assisted loan discovery dashboard built with Next.js App Router, TypeScript, Tailwind, shadcn-style UI, Supabase, Zod, and OpenAI.

## Architecture

High-level layout:

```text
Browser (Next.js App Router)
├─ Pages
│  ├─ /dashboard        → Top 5 loan picks ("Best Match" + Ask AI)
│  ├─ /products         → All products + filters
│  ├─ /products/[id]    → Product detail + AI chat
│  ├─ /auth             → Email/password login & signup
│  └─ /conversations    → Per-user AI chat history
│
├─ UI Layer
│  ├─ components/ui/*   → Button, Card, Badge, Input, Sheet, Slider, etc.
│  └─ components/chat/* → ChatSheet (Ask AI), message bubbles
│
├─ Data & Types
│  ├─ types/index.ts       → Zod schemas + TS types for products, users, chat
│  ├─ lib/supabase-client  → Browser Supabase client (anon key)
│  └─ lib/supabase-server  → Simple server Supabase client (no cookies)
│
├─ API Routes
│  └─ /api/ai/ask       → Grounded product Q&A with OpenAI, chat persistence
│
└─ Database (Supabase / Postgres)
   ├─ products          → Loan catalog
   ├─ users             → Auth-linked user profiles
   └─ ai_chat_messages  → Per-user, per-product AI chat history
```

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase project, schema, and seed data

1. Create a Supabase project.
2. In the Supabase SQL editor, run `supabase/schema.sql` to create:
   - `products`
   - `users`
   - `ai_chat_messages`
3. Then run `supabase/seed.sql` to insert 10+ sample products covering multiple banks and loan types.

### 3. Environment variables

Create `.env.local` in the project root based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL (from **Project Settings → API**).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – the **anon public** key (never the service_role key).
- `OPENAI_API_KEY` – your OpenAI key (optional but recommended; without it, the AI chat uses a local fallback summary).

### 4. Auth configuration

In the Supabase dashboard:

- Go to **Authentication → Providers → Email**.
- Disable "Confirm email" so signup is immediate and login/signup in `/auth` works without email verification.

The app uses Supabase Auth (email + password). On signup/login, the Supabase Auth user is mirrored into the `users` table via `id`, `email`, `display_name`.

### 5. Run the app

```bash
npm run dev
```

Key routes:

- `/`              → Redirects to `/dashboard`.
- `/dashboard`     → Top 5 loan picks ("Best Match" + Ask AI).
- `/products`      → All products with filters and Ask AI.
- `/products/[id]` → Product detail + persisted AI chat.
- `/auth`          → Login / signup.
- `/conversations` → Per-user conversation overview.

## Route Protection & Auth

- `middleware.ts` protects:
  - `/dashboard/:path*`
  - `/products/:path*`
  - `/conversations/:path*`
- The middleware checks for a Supabase auth session cookie whose name matches `sb-*-auth-token`. If no session is found, the user is redirected to `/auth?redirectTo=<original-path>`.
- API routes (including `/api/ai/ask`) currently rely on the client to pass an optional `userId` in the request body for persistence; they do not enforce auth on the server.

## Badge Logic

### ProductCard badges

From `components/ui/product-card.tsx`, badges are derived from `Product` fields:

- `Low APR`           → `rate_apr < 10`
- `Fast Disbursal`    → `disbursal_speed === "fast"`
- `Low Docs`          → `docs_level === "low"`
- `No Prepayment Fee` → `prepayment_allowed === true`

These badges are shown both on product cards and inside the AI chat sheet header so the user sees key differentiators immediately.

### "Best Match" badge on dashboard

In `app/dashboard/page.tsx`:

- Products are fetched as:

  ```ts
  supabase
    .from("products")
    .select("*")
    .order("rate_apr", { ascending: true })
    .limit(5);
  ```

- The first product in this sorted list (`index === 0`) is passed to `ProductCard` with `highlight={true}`.
- `ProductCard` renders a `Badge` with label **Best Match** when `highlight` is true.

This is currently a simple "lowest APR is best" rule; more advanced personalization can be added later.

## AI Grounding Strategy

The AI integration is intentionally narrow and grounded in the `products` table data.

### 1. Request validation and fetching

- `ChatSheet` posts to `POST /api/ai/ask` with a body validated by `aiAskRequestSchema`:
  - `productId` (UUID)
  - `message` (user’s latest question)
  - `history` (structured `{ role, content }[]`)
  - `userId` (optional UUID for persistence)
- The route constructs a Supabase server client with `createSupabaseServerClient()`, fetches the product by `productId`, and validates it with `productSchema` to get a strongly typed `Product`.

### 2. System prompt grounding

- `buildSystemPrompt(product)` constructs a strict system message:
  - Identifies the assistant as "The Loan Picks Dashboard" helper.
  - Embeds the full product JSON as `"PRODUCT DATA"` via `JSON.stringify(product, null, 2)`.
  - Enforces:
    - Answer **only** from product data.
    - Do not make assumptions or use outside knowledge.
    - Keep answers concise, professional, and easy to read.

### 3. Messages and OpenAI call

- `buildMessages(systemPrompt, history, message)` builds the chat:
  - First message: `system` with the grounded prompt.
  - Then prior local chat history (`user` / `assistant` turns).
  - Finally the latest `user` question.
- The AI call (when `OPENAI_API_KEY` is set):

  ```ts
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.2,
  });
  ```

- If OpenAI is not configured, a deterministic fallback summary is built from `Product` fields and returned instead.

### 4. Persistence

- After generating an answer, `/api/ai/ask` writes two rows into `ai_chat_messages`:
  - `{ user_id: userId, product_id, role: "user", content: parsed.message }`
  - `{ user_id: userId, product_id, role: "assistant", content: answer }`
  - `userId` may be `null` if the chat runs unauthenticated; those rows are not associated with a user.
- On the client:
  - `ChatSheet` uses `supabaseClient.auth.getUser()` to load the current Supabase user (if logged in).
  - If a user is present, it preloads chat history for that `user_id + product_id` from `ai_chat_messages` and uses it as the initial `history` state.
  - `/conversations` aggregates `ai_chat_messages` joined to `products` to show a per-user "My AI Conversations" overview.

This design keeps the AI responses grounded in Supabase product data, provides a clear badge and dashboard story, and uses middleware to protect the main dashboard and browsing experience, while allowing the AI endpoint itself to be used in both authenticated and unauthenticated modes.
