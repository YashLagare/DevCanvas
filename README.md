# DevCanvas

## Project Description
DevCanvas is a community snippet library where authenticated users can browse code snippets, star (bookmark) snippets, and add/delete comments. Users can also run/submit code executions and view execution history and aggregated statistics on their profile.

The backend uses **Convex** for queries/mutations and **Convex HTTP routes** for webhook ingestion.

Authentication is implemented using **Clerk**, integrated into Convex via `ConvexProviderWithClerk`.

Subscription state (**Pro**) is updated via **Lemon Squeezy webhooks** (signature/HMAC verification), enabling server-side gating for code execution language usage.

<img width="1901" height="915" alt="image" src="https://github.com/user-attachments/assets/35d4732a-dbfc-4900-b6b1-173ddba2621a" />


---

# 1. EXECUTIVE SUMMARY

## Project Purpose
Provide an authenticated, community-driven code snippet experience with engagement features (stars + comments) and monetization through Pro subscription-based gating.

## Core Features (from code)
- Snippet browsing page with client-side search/filter and grid/list view
- Snippet detail page with read-only Monaco editor and comment thread
- Star/unstar snippets (auth-required)
- Add/delete comments (auth-required; comment deletion restricted to comment author)
- Profile page with:
  - Paginated execution history
  - Aggregated execution/language statistics
  - Starred snippets
- Pro gating for code execution language usage enforced in backend (`saveExecution`)
- Webhook-based user provisioning/sync (Clerk) and Pro updates (Lemon Squeezy)

## Technology Summary
- Frontend: Next.js (App Router) + React + TypeScript + Tailwind CSS + Monaco editor
- Backend: Convex (queries/mutations) + Convex HTTP webhook routes
- Auth: Clerk integrated with Convex
- Webhooks: Svix (Clerk) + HMAC-SHA256 (Lemon Squeezy)

## Architecture Overview
Client uses Convex React hooks (`useQuery`, `useMutation`, `usePaginatedQuery`) to call Convex operations. Webhook events are ingested through Convex HTTP routes in `convex/http.ts`, which verify signatures and then invoke Convex mutations to update Convex tables.

## Business Value
- Community engagement loops (browse → star → comment → profile stats)
- Monetization via Pro gating with server-side enforcement
- Operational simplicity using webhook-driven user/pro provisioning

---

# 2. PROJECT OVERVIEW

## Project Name
DevCanvas

## Objective
Enable authenticated users to share and discover code snippets with interactive social features and subscription-based access control for code execution.

## Scope (verified from code)
Included:
- Snippet listing and detail display
- Star/unstar
- Comment add/delete with author-only delete
- Profile stats and paginated execution history
- Clerk webhook user sync
- Lemon Squeezy webhook Pro updates
- Backend Pro enforcement for execution language usage

Not implemented (explicitly absent from code):
- No password-based auth flow (Clerk only)
- No custom JWT issuance/verification
- No server-side snippet search/indexing (listing loads all snippets and filters client-side)
- No real code execution service in this repo: `runCode()` is simulated as “execution unavailable” in the editor store

## Main Functionalities
- Home editor:
  - Language selection + editor persistence in localStorage
  - “Run Code” simulation (execution service discontinued message)
  - “Share” dialog creates a snippet from editor code
- Snippets:
  - Listing with client-side search/filter by title, language, and author
- Snippet detail:
  - Monaco read-only code viewer
  - Comment thread
- Profile:
  - Execution history pagination
  - Stats aggregation
  - Starred snippets view

## Business Use Case
A developer community platform to share snippets and encourage engagement, with Pro subscriptions enabling additional execution language support.

## Target Audience
- Authenticated developers using Clerk
- Pro subscribers who unlock additional capabilities
---

# 3. TECHNOLOGY STACK

## Frontend
- Framework: Next.js (App Router)
- Runtime: Node.js (Next.js)
- Language: TypeScript
- UI Technologies:
  - Tailwind CSS
  - Monaco editor (`@monaco-editor/react`) for read-only snippet viewing and editor panel
- Libraries/Utilities (detected):
  - `convex/react` hooks (`useQuery`, `useMutation`, `usePaginatedQuery`)
  - `@clerk/nextjs`
  - `framer-motion`
  - `lucide-react`
  - `react-hot-toast`
  - `react-syntax-highlighter`
  - `zustand` (editor state)

State Management
- Zustand store: `src/store/useCodeEditorStore.ts`
- React local state for UI behavior (filters, dialogs, form state)

Build Tools
- Next.js scripts in `package.json` (`dev`, `build`, `start`, `lint`)

## Backend
- Runtime/Platform: Convex managed environment
- Framework: Convex operations (`query`, `mutation`, `internalAction`) + Convex HTTP router
- API Technologies:
  - Convex functions in `convex/*.ts`
  - Convex HTTP routes in `convex/http.ts`
- Middleware:
  - Clerk middleware for Next.js route protection (`src/proxy.ts`)

## Database
- Database Type: Convex tables
- ORM/ODM: N/A (Convex database API)
- Storage Strategy (from schema):
  - `users`, `snippets`, `snippetComments`, `stars`, `codeExecutions`
  - Denormalized fields: `userName` stored in snippet/comment rows for easier rendering

## Authentication
- Provider: Clerk
- Integration method:
  - Frontend wraps app with ClerkProvider
  - Convex client uses `ConvexProviderWithClerk` + `useAuth`
  - Convex mutations/queries requiring auth call `ctx.auth.getUserIdentity()`
- Token Strategy: not implemented explicitly (no custom JWT logic in this repo)

## DevOps & Deployment
- Hosting: not specified in code
- Backend hosting: Convex (by convention for Convex)
- Webhook flow requires secrets in environment variables.

---

# 4. FEATURES LIST

> All features below are derived directly from existing code.

## 4.1 Snippet browsing
- Purpose: browse community snippets
- User Benefit: discover snippets with filters
- Related Components:
  - `src/app/snippets/page.tsx`
  - Convex query: `api.snippets.getSnippets`

## 4.2 Snippet detail viewer
- Purpose: show snippet metadata and code
- User Benefit: read-only code viewing with syntax highlighting
- Related Components:
  - `src/app/snippets/[snippet]/page.tsx`
  - Monaco read-only editor (`@monaco-editor/react`)
  - Convex queries: `getSnippetById`, `getComments`

## 4.3 Commenting (add/delete)
- Purpose: discussion on snippet pages
- User Benefit: collaborate around code snippets
- Related Components:
  - `src/app/snippets/[snippet]/_components/Comments.tsx`
  - `src/app/snippets/[snippet]/_components/CommentForm.tsx`
  - `src/app/snippets/[snippet]/_components/Comment.tsx`
  - Convex mutations: `api.snippets.addComment`, `api.snippets.deleteComment`

## 4.4 Stars (star/unstar)
- Purpose: bookmark snippets
- User Benefit: save snippets for later
- Related Components:
  - `src/components/StarButton.tsx`
  - `src/app/profile/page.tsx` for starred listing
  - Convex mutation: `api.snippets.starSnippet`
  - Convex queries: `isSnippetStarred`, `getSnippetStarCount`, `getStarredSnippets`

## 4.5 Profile dashboard
- Purpose: show execution history and aggregated stats
- User Benefit: track personal activity and languages
- Related Components:
  - `src/app/profile/page.tsx`
  - Convex query: `api.codeExecutions.getUserExecutions` (paginated)
  - Convex query: `api.codeExecutions.getUserStats`
  - Convex query: `api.snippets.getStarredSnippets`
  - Convex query: `api.users.getUser`

## 4.6 Webhook-driven user sync (Clerk)
- Purpose: keep Convex `users` table synchronized
- User Benefit: automatic onboarding
- Related Components:
  - Convex HTTP route: `POST /clerk-webhook` in `convex/http.ts`
  - Signature verification: `svix` using `CLERK_WEBHOOK_SECRET`
  - Convex mutation: `api.users.syncUser`

## 4.7 Webhook-driven Pro upgrades (Lemon Squeezy)
- Purpose: mark users as Pro
- User Benefit: unlock gated functionality
- Related Components:
  - Convex HTTP route: `POST /lemon-squeezy-webhook` in `convex/http.ts`
  - HMAC verification: `convex/lemonSqueezy.ts` using `LEMON_SQUEEZY_WEBHOOK_SECRET`
  - Convex mutation: `api.users.upgradeToPro`

## 4.8 Pro gating for execution language usage
- Purpose: enforce Pro subscription server-side
- User Benefit: prevents unauthorized execution language usage
- Related Components:
  - Convex mutation: `api.codeExecutions.saveExecution`
  - Gating rule: user is Pro unless `language === "javascript"`

## 4.9 Code execution UX (discontinued execution service)
- Purpose: provide editor UX and persistence
- Verified behavior:
  - `runCode()` sets `error` with “public code execution service … has been discontinued” message
- Related Components:
  - `src/store/useCodeEditorStore.ts`
  - `src/app/(home)/_components/RunButton.tsx`
  - `src/app/(home)/_components/OutputPanel.tsx`

---

# 5. FOLDER STRUCTURE

```text
dev-canvas/
├── convex/
│   ├── auth.config.ts
│   ├── codeExecutions.ts
│   ├── http.ts
│   ├── lemonSqueezy.ts
│   ├── schema.ts
│   ├── snippets.ts
│   ├── users.ts
│   ├── README.md
│   └── _generated/
├── public/
│   ├── logo.png
│   └── (language icons like javascript.png, typescript.png, etc.)
└── src/
    ├── proxy.ts
    ├── store/
    │   └── useCodeEditorStore.ts
    ├── hooks/
    │   ├── useMounted.tsx
    │   └── useScreenSize.ts
    ├── components/
    │   ├── NavigationHeader.tsx
    │   ├── LoginButton.tsx
    │   ├── StarButton.tsx
    │   ├── ToastProvider.tsx
    │   └── providers/
    │       └── ConvexClientProvider.tsx
    └── app/
        ├── (home)/
        │   ├── page.tsx
        │   ├── _constants/index.ts
        │   └── _components/
        │       ├── Header.tsx
        │       ├── EditorPanel.tsx
        │       ├── OutputPanel.tsx
        │       ├── RunButton.tsx
        │       ├── LanguageSelector.tsx
        │       └── ThemeSelector.tsx
        ├── pricing/page.tsx
        ├── privacy/page.tsx
        ├── profile/page.tsx
        ├── snippets/page.tsx
        ├── snippets/[snippet]/page.tsx
        ├── snippets/[snippet]/_components/
        │   ├── Comments.tsx
        │   ├── CommentForm.tsx
        │   ├── Comment.tsx
        │   └── CommentContent.tsx
        └── terms/page.tsx
```

---

# 6. SYSTEM ARCHITECTURE

Architecture pattern: Client → Convex (queries/mutations) → Convex tables. Webhooks are handled through Convex HTTP routes.

```text
User (Browser)
  │
  ▼
Next.js Frontend (React)
  │  (Convex hooks: useQuery/useMutation/usePaginatedQuery)
  ▼
Convex Backend
  │ \ 
  │  \─ Convex HTTP Webhooks
  │     - POST /clerk-webhook
  │     - POST /lemon-squeezy-webhook
  ▼
Convex Tables (schema.ts)
```

Request lifecycle (typical):
1. Next.js route renders a page/component.
2. Client uses Convex hooks to call queries/mutations.
3. Convex operations validate args and (when required) enforce Clerk auth via `ctx.auth.getUserIdentity()`.
4. Convex reads/writes tables and returns the result.

---

# 7. DATABASE DESIGN

All table definitions are in `convex/schema.ts`.

## 7.1 users
Purpose: Store Clerk user data and Pro subscription state.

Fields (types from schema):
- `userId: string` (Clerk id)
- `email: string`
- `name: string`
- `isPro: boolean`
- `proSince?: number`
- `lemonSqueezyCustomerId?: string`
- `lemonSqueezyOrderId?: string`

Index:
- `by_user_id` on `userId`

## 7.2 codeExecutions
Purpose: Persist code execution logs (language, code, output/error).

Fields:
- `userId: string`
- `language: string`
- `code: string`
- `output?: string`
- `error?: string`

Index:
- `by_user_id` on `userId`

## 7.3 snippets
Purpose: Store user-created code snippets.

Fields:
- `userId: string`
- `title: string`
- `language: string`
- `code: string`
- `userName: string` (denormalized display name)

Index:
- `by_user_id` on `userId`

## 7.4 snippetComments
Purpose: Store comments/discussion for snippets.

Fields:
- `snippetId: v.id("snippets")`
- `userId: string`
- `userName: string` (denormalized)
- `content: string` (stored as HTML per comment in code/schema)

Index:
- `by_snippet_id` on `snippetId`

## 7.5 stars
Purpose: Join table representing star relationships between users and snippets.

Fields:
- `userId: string`
- `snippetId: v.id("snippets")`

Indexes:
- `by_user_id`
- `by_snippet_id`
- `by_user_id_and_snippet_id`

---

# 8. ENTITY RELATIONSHIP DIAGRAM (ERD)

```text
users
├── userId
└── isPro

     1:N
users ─────────────► codeExecutions
                     ├── userId
                     ├── language
                     ├── code
                     ├── output
                     └── error

     1:N
users ─────────────► snippets
                     ├── userId
                     ├── title
                     ├── language
                     ├── code
                     └── userName

snippets 1:N ─────► snippetComments
                   ├── snippetId
                   ├── userId
                   ├── userName
                   └── content

users 1:N ─────► stars
               ├── userId
               └── snippetId

snippets 1:N ──► stars
               ├── snippetId
               └── userId
```

---

# 9. SECURITY ARCHITECTURE

## Authentication (verified)
- Implemented provider: **Clerk**.
- Convex integration: `ConvexProviderWithClerk` uses Clerk’s `useAuth`.
- Auth enforcement: Convex operations call `ctx.auth.getUserIdentity()`.

## Authorization
Enforced inside Convex functions:
- `createSnippet`, `deleteSnippet`, `starSnippet`, `addComment`, `deleteComment`, `isSnippetStarred`, `getStarredSnippets`, `saveExecution` require auth identity.
- Ownership checks:
  - `deleteSnippet`: `snippet.userId === identity.subject`
  - `deleteComment`: `comment.userId === identity.subject`

## Pro gating
- `api.codeExecutions.saveExecution` enforces:
  - If user is not Pro AND `language !== "javascript"` → throws `Pro subscription required to use this language`

## Webhook security
- Clerk webhook:
  - Route `POST /clerk-webhook`
  - Signature verification using Svix `Webhook` and `CLERK_WEBHOOK_SECRET`
  - Verifies `svix-id`, `svix-timestamp`, `svix-signature`
- Lemon Squeezy webhook:
  - Route `POST /lemon-squeezy-webhook`
  - HMAC-SHA256 verification using `LEMON_SQUEEZY_WEBHOOK_SECRET`
  - Signature compared against `X-Signature`

## Validation
- Convex arg validators via `v.string()`, `v.number()`, `paginationOptsValidator`, etc.

---

# 10. AUTHENTICATION FLOW

```text
User signs in (Clerk UI)
  │
  ▼
Next.js loads Clerk context
  │
  ▼
Frontend calls Convex operation (useQuery/useMutation)
  │
  ▼
Convex operation calls ctx.auth.getUserIdentity()
  │
  ▼
Authorization checks (ownership / Pro gating where applicable)
  │
  ▼
Convex returns data or throws (UI displays error)
```

Auth-required Convex operations (from code):
- `api.snippets.createSnippet` (mutation)
- `api.snippets.deleteSnippet` (mutation)
- `api.snippets.starSnippet` (mutation)
- `api.snippets.addComment` (mutation)
- `api.snippets.deleteComment` (mutation)
- `api.snippets.isSnippetStarred` (query)
- `api.snippets.getStarredSnippets` (query)
- `api.codeExecutions.saveExecution` (mutation)

---

# 11. APPLICATION FLOW

```text
Application Start
  │
  ▼
Next.js RootLayout (ClerkProvider + ConvexClientProvider)
  │
  ▼
Route Rendering
  │
  ├─ /snippets → SnippetsPage
  │     └─ useQuery(getSnippets)
  │     └─ client-side filter/search
  │
  ├─ /snippets/[snippet] → SnippetDetailPage
  │     └─ useQuery(getSnippetById)
  │     └─ useQuery(getComments)
  │
  └─ /profile → ProfilePage
        └─ useUser() (Clerk)
        └─ useQuery(getUserStats) + useQuery(getUser) + usePaginatedQuery(getUserExecutions)
        └─ useQuery(getStarredSnippets)

Webhook Updates (async)
  │
  ▼
Convex HTTP Routes
  ├─ POST /clerk-webhook → syncUser mutation
  └─ POST /lemon-squeezy-webhook → upgradeToPro mutation
```

---

# 12. BACKEND INTERNAL FLOW

Convex internal flow (typical):

```text
Convex Function
  │
  ▼
Arg validation (v.*)
  │
  ▼
Auth check (ctx.auth.getUserIdentity) when required
  │
  ▼
Business logic (ownership/pro gating)
  │
  ▼
Database operations (ctx.db query/insert/patch/delete)
  │
  ▼
Response
```

Webhook route flow:

```text
HTTP Request → Convex HTTP Router
  │
  ▼
Read raw body + required headers
  │
  ▼
Verify signature
  │
  ▼
If event matches:
  - runMutation (syncUser / upgradeToPro)
  │
  ▼
Return HTTP 200
```

---

# 13. FRONTEND INTERNAL FLOW

```text
Entry Point: Next.js App Router
  │
  ▼
Layout providers:
  - ClerkProvider
  - ConvexClientProvider (ConvexProviderWithClerk)
  │
  ▼
Page component
  │
  ▼
Convex hooks (useQuery/useMutation/usePaginatedQuery)
  │
  ▼
State updates / UI rendering
```

Key UI internal flows:
- Snippet list: load all snippets → filter client-side
- Snippet detail: load snippet + comments → render Monaco read-only editor + comment thread
- Profile: load user + stats + paginated executions + starred snippets

---

# 14. API DOCUMENTATION

## 14.1 Convex operations (queries/mutations)

> Note: Convex “endpoints” here are operations under `api.<namespace>.<operation>` generated for the frontend.

### Snippets (`api.snippets`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|---|---|---|---|---|---|
| mutation | `api.snippets.createSnippet` | Create snippet for authenticated user | Yes | `{ title: string, language: string, code: string }` | `snippetId` |
| mutation | `api.snippets.deleteSnippet` | Delete snippet and dependent comments/stars | Yes | `{ snippetId }` | void |
| mutation | `api.snippets.starSnippet` | Toggle star/unstar | Yes | `{ snippetId }` | void |
| mutation | `api.snippets.addComment` | Add comment to snippet | Yes | `{ snippetId, content }` | insert return |
| mutation | `api.snippets.deleteComment` | Delete comment (author-only) | Yes | `{ commentId }` | void |
| query | `api.snippets.getSnippets` | Get all snippets (ordered desc) | No | `{}` | `snippets[]` |
| query | `api.snippets.getSnippetById` | Get snippet by id | No | `{ snippetId }` | snippet |
| query | `api.snippets.getComments` | Get comments by snippet id (desc) | No | `{ snippetId }` | `snippetComments[]` |
| query | `api.snippets.isSnippetStarred` | Check if current user starred snippet | Yes | `{ snippetId }` | boolean |
| query | `api.snippets.getSnippetStarCount` | Count stars for snippet | No | `{ snippetId }` | number |
| query | `api.snippets.getStarredSnippets` | List starred snippets for current user | Yes | `{}` | `snippets[]` |

#### Endpoint detail: `api.snippets.deleteComment`
- Purpose: author-only deletion
- Auth requirements: requires `ctx.auth.getUserIdentity()`
- Authorization logic:
  - checks `comment.userId !== identity.subject`
- Request parameters:
  - `commentId: Id<"snippetComments">`
- Success response:
  - void
- Error response (from code):
  - `Not authenticated`, `Comment not found`, `Not authorized to delete this comment`

### Users (`api.users`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|---|---|---|---|---|---|
| mutation | `api.users.syncUser` | Sync user from Clerk webhook | No (webhook secret) | `{ userId, email, name }` | void |
| query | `api.users.getUser` | Fetch user by userId | No | `{ userId }` | user or null |
| mutation | `api.users.upgradeToPro` | Upgrade user to Pro from Lemon Squeezy webhook | No (webhook secret) | `{ email, lemonSqueezyCustomerId, lemonSqueezyOrderId, amount }` | `{ success: true }` |

### Code Executions (`api.codeExecutions`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|---|---|---|---|---|---|
| mutation | `api.codeExecutions.saveExecution` | Save execution record with Pro gating | Yes | `{ language, code, output?, error? }` | void |
| query | `api.codeExecutions.getUserExecutions` | Get executions with pagination | No (expects userId) | `{ userId, paginationOpts }` | paginated result |
| query | `api.codeExecutions.getUserStats` | Aggregate language usage + last 24h count | No (expects userId) | `{ userId }` | stats object |

#### Endpoint detail: `api.codeExecutions.saveExecution`
- Purpose: Pro-gated execution logging
- Auth requirements: requires `ctx.auth.getUserIdentity()`
- Pro gating logic:
  - if `!user?.isPro && args.language !== "javascript"` → throws `ConvexError("Pro subscription required to use this language")`
- Request body fields:
  - `language`, `code`, optional `output`, `error`
- Success response:
  - void

## 14.2 Convex HTTP webhook endpoints

Implemented in `convex/http.ts`.

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/clerk-webhook` | Clerk webhook handler (Svix verification) | No session auth (secret verification) | Raw request text | 200 or 400/500 |
| POST | `/lemon-squeezy-webhook` | Lemon Squeezy webhook handler (HMAC verification) | No session auth (secret verification) | Raw request text | 200 or 400/500 |

---

# 15. THIRD-PARTY INTEGRATIONS

## Clerk
- Used for: authentication and user identity.
- Where:
  - Frontend uses Clerk components (`SignedIn`, `SignedOut`, `UserButton`, `SignInButton`)
  - Convex auth via `ConvexProviderWithClerk`
  - Webhook ingestion at `POST /clerk-webhook` verified via Svix.

## Svix
- Used for: verifying Clerk webhooks.
- Implementation: `new Webhook(CLERK_WEBHOOK_SECRET)` and `wh.verify(body, headers)`.

## Lemon Squeezy
- Used for: Pro subscription updates.
- Implementation:
  - Webhook route `POST /lemon-squeezy-webhook`
  - HMAC verification using `LEMON_SQUEEZY_WEBHOOK_SECRET`
  - On `event_name === "order_created"`: calls `api.users.upgradeToPro`.

## Monaco Editor
- Used for:
  - Snippet detail read-only code viewer (`Editor` with `readOnly: true`)
  - Home editor panel.

## react-hot-toast
- Used for: UI toast notifications (e.g., comment errors and snippet deletion errors).

---

# 16. ENVIRONMENT VARIABLES

Detected env vars referenced in code.

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Public Convex URL used by `ConvexReactClient` and `ConvexHttpClient` | Yes |
| `CLERK_WEBHOOK_SECRET` | Svix secret used to verify Clerk webhook events | Yes |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | HMAC secret used to verify Lemon Squeezy webhook signatures | Yes |
| `NEXT_PUBLIC_CHECKOUT_URL` | Checkout URL for “Upgrade to Pro” link | Yes (non-null asserted) |

---

# 17. DEPENDENCIES

## Frontend dependencies (from `package.json`)
- `next`, `react`, `react-dom`
- `convex`
- `@clerk/nextjs`
- `@monaco-editor/react`
- `framer-motion`
- `lucide-react`
- `react-hot-toast`
- `react-syntax-highlighter`
- `zustand`
- `@icons-pack/react-simple-icons`

## Backend dependencies (from `package.json` + Convex code)
- `convex`
- `svix`
- Node `crypto` (built-in)

---

# 18. INSTALLATION GUIDE

## 1) Prerequisites
- Node.js installed
- Clerk application configured
- Convex project configured and available
- Lemon Squeezy and Svix webhook secrets available

## 2) Setup
```bash
cd "d:/MY-PROJECTS/DevCanvas — Your Coding Workspace/dev-canvas"
npm install
```

## 3) Environment setup
Create `.env.local` in the project root with:
```env
NEXT_PUBLIC_CONVEX_URL=
CLERK_WEBHOOK_SECRET=
LEMON_SQUEEZY_WEBHOOK_SECRET=
NEXT_PUBLIC_CHECKOUT_URL=
```

## 4) Run development
```bash
npm run dev
```

---

# 19. DEPLOYMENT GUIDE

## Recommended deployment model (verified from architecture)
- Frontend: Next.js hosting
- Backend: Convex deployment (queries/mutations + HTTP routes)
- Authentication: Clerk
- Webhooks:
  - Clerk sends events to Convex `POST /clerk-webhook`
  - Lemon Squeezy sends events to Convex `POST /lemon-squeezy-webhook`

## Production build
```bash
npm run build
npm run start
```

---

# 20. RUNTIME FLOW

```text
Request enters Next.js
  │
  ▼
Route loads component
  │
  ▼
Convex hooks execute queries/mutations
  │
  ▼
Convex enforces auth/authorization where required
  │
  ▼
Convex reads/writes Convex tables
  │
  ▼
UI renders results

Async background
  └─ Webhooks call Convex HTTP routes → verify signature → update Convex tables
```

---

# 21. CHALLENGES & LEARNINGS

## Technical Challenges (verified from code)
- Snippet listing loads all snippets (`getSnippets` collects all records) and filters client-side.
- Denormalized userName stored in snippets/comments (can become stale if Clerk profile changes).
- Execution service is intentionally unavailable in the current client store (`runCode()` returns “discontinued” message), while execution logging still exists via `saveExecution`.

## Solutions Implemented
- Convex arg validation via `v.*` validators.
- Server-side Pro gating enforced in `saveExecution`.
- Webhook verification implemented for both Clerk (Svix) and Lemon Squeezy (HMAC).

## Key Learnings
- Centralizing security checks in Convex functions simplifies correctness.
- Webhook signature verification is mandatory for trust.

---

# 22. COMMON ERRORS & TROUBLESHOOTING

1) Convex connection issues
- Symptom: Convex queries fail
- Cause: missing/incorrect `NEXT_PUBLIC_CONVEX_URL`

2) Clerk webhook failures
- Symptom: `/clerk-webhook` returns 500
- Cause: missing `CLERK_WEBHOOK_SECRET` or invalid Svix headers

3) Lemon Squeezy webhook failures
- Symptom: `/lemon-squeezy-webhook` returns 500
- Cause: missing/invalid `LEMON_SQUEEZY_WEBHOOK_SECRET` or invalid `X-Signature`

4) Auth errors
- Symptom: Convex mutation throws `Not authenticated`
- Fix: ensure user is signed in using Clerk

5) Pro gating errors
- Symptom: `Pro subscription required to use this language`
- Fix: upgrade user to Pro so `users.isPro === true`

---

# 23. PERFORMANCE ANALYSIS

## Current optimizations (from code)
- Convex indexes used in multiple places:
  - `users.by_user_id`
  - `snippets.by_user_id`
  - `snippetComments.by_snippet_id`
  - `stars.by_user_id_and_snippet_id`
  - `codeExecutions.by_user_id`
- Execution history uses `paginate` via `usePaginatedQuery`.

## Potential bottlenecks (from code)
- `api.snippets.getSnippets` returns all snippets without pagination.
- `api.codeExecutions.getUserStats` collects all executions and aggregates in memory.
- `getUserStats` loads starred snippet details via `Promise.all` of `ctx.db.get`.

## Scalability recommendations
- Add pagination/search for snippets list.
- Consider incremental/denormalized stats for large execution datasets.

---

# 24. SECURITY REVIEW

## Existing security measures (verified)
- Clerk-based auth for protected Convex operations.
- Ownership checks for deletion operations.
- Pro gating enforced in backend.
- Webhook signature verification:
  - Svix for Clerk
  - HMAC for Lemon Squeezy

## Security risks / observations
- Some queries accept userId as input and do not verify the caller identity inside Convex code (e.g., `getUserExecutions`, `getUserStats`). The frontend typically passes `user?.id`, but server-side enforcement is not present in these specific queries.
- Snippet/comment `content` is stored as a string described as HTML in schema comments; rendering behavior should be reviewed carefully (this repo uses parsing/splitting for comments and does not blindly inject HTML, but the stored format is HTML-like).

## Recommended improvements (realistic)
- Add auth enforcement to user-specific queries where privacy is desired (compare identity.subject to args.userId).
- Ensure comment rendering does not use unsafe HTML injection.

---

# 25. FUTURE ENHANCEMENTS

Realistic improvements based on current architecture:
- Pagination for snippet listing and server-side filtering.
- Auth enforcement for `getUserExecutions` and `getUserStats` if they should be private.
- Improve stats calculation performance for large histories.
- If code execution service returns, integrate a proper execution backend path and adjust Pro gating accordingly.

---

# 26. DEVELOPER NOTES

## Architecture decisions (verified)
- Convex used as backend datastore + function layer.
- Clerk for authentication and identity.
- Webhook-driven sync and Pro updates.
- Monaco editor for code viewing/editing.

## Maintainability notes
- Keep schema changes in `convex/schema.ts`.
- Keep authorization checks inside Convex functions.

## Refactoring opportunities
- Align auth behavior across queries (decide which queries are public vs user-private).
- Introduce pagination/filtering server-side for snippets list.

## Technical debt observations (verified)
- Listing loads all snippets and filters client-side.
- Execution service currently simulated/unavailable, but execution logging still exists.

---

Written by Yash Lagare

