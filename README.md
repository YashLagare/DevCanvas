PROJECT_DOCUMENTATION.txt

Written by Yash Lagare

============================================================
## Project Name

### DevCanvas

### Project Description
DevCanvas is a community code snippet library where authenticated users can create, browse, and manage code snippets. Users can star (bookmark) snippets, add/delete comments on snippets, view snippet details, and view their personal execution history and language statistics. The backend persists data in Convex and synchronizes/updates user records via Clerk webhooks. A Pro subscription concept is supported through Lemon Squeezy webhooks and is enforced for code execution language restrictions.

### Business Problem Solved
Provide an authenticated, community-driven snippet experience (sharing + engagement via stars and comments) while enforcing subscription-based restrictions for certain capabilities (code execution language gating).

### Target Users
- Developers who want to share code snippets
- Developers who want to browse and star community snippets
- Authenticated users who want to comment on snippets
- Users who optionally upgrade to Pro to unlock additional execution languages

### Key Benefits
- Authenticated community snippet browsing
- Star and discussion features to drive engagement
- Read-only code viewing using Monaco editor
- Subscription gating for execution languages enforced server-side
- Webhook-driven user/pro state synchronization (Clerk + Lemon Squeezy)

Project Screenshot Placeholder:
[INSERT_PROJECT_COVER_SCREENSHOT_HERE]

============================================================
# 1. EXECUTIVE SUMMARY

## Project Purpose
DevCanvas delivers a community library for creating and discovering code snippets with social interaction (stars and comments) and Pro-based feature gating.

## Core Features
- Browse snippets (with UI filtering by title, language, and author name)
- View a snippet detail page with a Monaco read-only editor
- Add and delete snippet comments (author-only delete)
- Star/unstar snippets
- User profile page showing:
  - Code execution history (paginated)
  - Aggregated execution statistics (language usage, favorites, last 24 hours)
  - Starred snippets
- Pro subscription enforcement for code execution language usage
- Webhook-based user synchronization (Clerk) and Pro upgrades (Lemon Squeezy)

## Technology Summary
- Frontend: Next.js (App Router) + React + Tailwind CSS + Monaco editor
- Backend: Convex (queries/mutations + HTTP webhook routes)
- Authentication: Clerk (integrated with Convex via ConvexProviderWithClerk)
- External Integrations: Clerk webhooks via Svix verification; Lemon Squeezy webhooks via HMAC verification

## Architecture Overview
Client (Next.js) communicates with Convex for data via declarative hooks. Convex functions enforce auth/authorization using `ctx.auth.getUserIdentity()` for protected operations and provide HTTP webhook endpoints for third-party event ingestion.

## Business Value
- Increases developer engagement and retention via community browsing, stars, and comments
- Creates monetization leverage via Pro subscription gating
- Provides maintainable backend logic centralized in Convex with webhook-managed user state

============================================================
# 2. PROJECT OVERVIEW

## Project Name
DevCanvas

## Objective
Enable authenticated users to share and discover code snippets with interactive features and subscription-based access control for execution capabilities.

## Scope
- Implemented snippet CRUD operations, stars, and comments
- Implemented user profile stats and execution history retrieval
- Implemented webhook-driven user sync and Pro upgrade updates
- Implemented auth-aware Convex operations for protected mutations

Explicitly not assumed / not invented:
- No custom password-based authentication flows exist in this repo.
- No JWT issuance/verification flow is implemented.
- No external snippet search service exists; filtering is performed client-side in the snippet listing page.

## Main Functionalities
- Snippet listing and detail viewing
- Comment creation and deletion
- Star/unstar of snippets
- User profile stats and starred listing
- Webhook ingestion:
  - Clerk: `user.created` → sync user to Convex
  - Lemon Squeezy: `order_created` → set user as Pro

## Business Use Case
A community platform where developers share and engage with code snippets while Pro subscription unlocks additional language execution capabilities.

## Target Audience
Authenticated developers (Clerk users), plus Pro subscribers.

Project Screenshot Placeholder:
[INSERT_PROJECT_OVERVIEW_SCREENSHOT_HERE]

============================================================
# 3. TECHNOLOGY STACK

## Frontend
- Framework: Next.js (App Router)
- Runtime: Node.js (Next.js-managed)
- Language: TypeScript
- UI/Styling:
  - Tailwind CSS
  - Custom global styles in `src/app/globals.css`
- Libraries/Tools:
  - @monaco-editor/react (Monaco editor)
  - framer-motion (animations)
  - lucide-react (icons)
  - react-hot-toast (toasts)
  - next/image, next/link (Next.js image/link)
- Data Integration:
  - convex/react (useQuery/useMutation/usePaginatedQuery)
  - Monaco themes defined in `src/app/(home)/_constants/index.ts`

State Management
- React local state used for UI filters and toggles on the snippet list page.
- Zustand is present as a dependency (`zustand`) but not confirmed as actively used in the reviewed snippets pages.

Build Tools
- Next.js build pipeline (npm scripts: dev/build/start/lint)

## Backend
- Runtime: Convex serverless environment
- Framework: Convex (queries/mutations + Convex HTTP router)
- Authentication/Identity:
  - Clerk identity integration via `ConvexProviderWithClerk`
  - Server-side identity retrieval in Convex functions using `ctx.auth.getUserIdentity()`
- API Technologies:
  - Convex queries and mutations
  - Convex HTTP router for webhooks
- Webhook verification tools:
  - Svix (Clerk webhook verification)
  - crypto (HMAC verification for Lemon Squeezy webhook)

Middleware
- Route protection for Next.js routes via Clerk middleware in `src/proxy.ts`.
- Convex auth checks for protected mutations/queries.

## Database
- Database Type: Convex tables (managed by Convex)
- Schema/Modeling:
  - `convex/schema.ts` defines all tables and indexes
- Storage Strategy:
  - Snippets, comments, and stars are stored in dedicated Convex tables
  - Denormalized display fields (e.g., `userName`) are stored directly in snippet/comment records

## Authentication
- Implemented provider: Clerk
- Convex integration method: Clerk identity provided to Convex via `ConvexProviderWithClerk`
- Authorization enforcement location: Convex mutations/queries using `ctx.auth.getUserIdentity()`
- Explicitly NOT implemented: custom JWT auth, email/password login, or session-cookie auth handled by this repo

## DevOps & Deployment
- Hosting: Not explicitly defined in code; repository is configured for Next.js + Convex.
- CI/CD: Not present in reviewed files.
- Cloud Services:
  - Clerk is used for identity
  - Convex is used for backend
- Storage Services: Not explicitly implemented beyond Convex tables and Next.js static assets (`public/`)

============================================================
# 4. FEATURES LIST

Below are features detected from the existing source code.

## 4.1 Snippet Browsing
- Feature Name: Snippet listing with UI filters
- Purpose: Allow users to discover community snippets
- User Benefit: Quickly find snippets by title, language, or author
- Related Components:
  - `src/app/snippets/page.tsx` (UI filtering + view toggle)
  - Convex query: `api.snippets.getSnippets` (fetches all snippets ordered desc)

Feature Screenshot Placeholder:
[INSERT_FEATURE_SCREENSHOT_HERE]

## 4.2 Snippet Detail Viewing
- Feature Name: Snippet detail page with Monaco editor
- Purpose: Display snippet metadata and code in read-only editor
- User Benefit: View code with syntax highlighting
- Related Components:
  - `src/app/snippets/[snippet]/page.tsx`
  - Monaco language config: `src/app/(home)/_constants/index.ts`
  - Convex queries:
    - `api.snippets.getSnippetById`
    - `api.snippets.getComments`

## 4.3 Star/Unstar Snippets
- Feature Name: Snippet starring
- Purpose: Enable bookmarking of snippets
- User Benefit: Save snippets for later
- Related Components:
  - Convex mutation: `api.snippets.starSnippet`
  - Convex query: `api.snippets.getStarredSnippets`
  - Convex query: `api.snippets.isSnippetStarred`

## 4.4 Commenting on Snippets
- Feature Name: Add and delete snippet comments
- Purpose: Enable discussion on snippet pages
- User Benefit: Share feedback and context
- Related Components:
  - `src/app/snippets/[snippet]/_components/Comments.tsx`
  - `src/app/snippets/[snippet]/_components/CommentForm.tsx`
  - Convex mutations:
    - `api.snippets.addComment`
    - `api.snippets.deleteComment` (author-only)
  - Convex query:
    - `api.snippets.getComments`

## 4.5 User Profile and Stats
- Feature Name: Profile page (executions + starred)
- Purpose: Show execution history and aggregated stats
- User Benefit: Understand personal usage and engagement
- Related Components:
  - `src/app/profile/page.tsx`
  - Profile header and skeleton:
    - `src/app/profile/_components/ProfileHeader.tsx`
    - `src/app/profile/_components/ProfileHeaderSkeleton.tsx`
  - Convex queries:
    - `api.codeExecutions.getUserStats`
    - `api.snippets.getStarredSnippets`
    - `api.codeExecutions.getUserExecutions`
  - Convex mutation:
    - `api.codeExecutions.saveExecution` exists in backend for execution logging (UI caller not reviewed in the provided files)

## 4.6 Webhook-Driven User Sync (Clerk)
- Feature Name: Clerk webhook handler
- Purpose: Keep Convex `users` table synchronized with Clerk user creation events
- User Benefit: Automated onboarding without manual user provisioning
- Related Components:
  - Convex HTTP route: `POST /clerk-webhook` in `convex/http.ts`
  - Verification library: Svix `Webhook` using `CLERK_WEBHOOK_SECRET`
  - Convex mutation:
    - `api.users.syncUser`

## 4.7 Webhook-Driven Pro Upgrade (Lemon Squeezy)
- Feature Name: Lemon Squeezy webhook handler
- Purpose: Mark users as Pro based on subscription events
- User Benefit: Unlock additional language execution usage
- Related Components:
  - Convex HTTP route: `POST /lemon-squeezy-webhook` in `convex/http.ts`
  - Signature verification: HMAC via `LEMON_SQUEEZY_WEBHOOK_SECRET`
  - Convex mutation:
    - `api.users.upgradeToPro`

============================================================
# 5. FOLDER STRUCTURE

Actual structure in repository (based on available files):

dev-canvas/
├── convex/
│   ├── _generated/
│   ├── auth.config.ts
│   ├── codeExecutions.ts
│   ├── http.ts
│   ├── lemonSqueezy.ts
│   ├── README.md
│   ├── schema.ts
│   └── snippets.ts
│   └── users.ts
├── public/
│   ├── (logos/icons for languages + assets)
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── (home)/_constants/index.ts
│   │   ├── pricing/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── snippets/page.tsx
│   │   ├── snippets/[snippet]/page.tsx
│   │   ├── support/page.tsx
│   │   └── terms/page.tsx
│   ├── components/
│   │   ├── providers/ConvexClientProvider.tsx
│   │   ├── NavigationHeader.tsx
│   │   ├── LoginButton.tsx
│   │   ├── Footer.tsx
│   │   ├── ToastProvider.tsx
│   │   ├── StarButton.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useMounted.tsx
│   │   └── useScreenSize.ts
│   ├── store/
│   │   └── useCodeEditorStore.ts
│   └── proxy.ts
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json

Explanation of key folders
- `convex/`: Backend Convex schema, queries, mutations, and webhook routes
- `src/app/`: Next.js pages (App Router) for home-related constants, snippets, profile, and static pages
- `src/components/`: Shared UI components and providers (Clerk + Convex client wiring)
- `src/proxy.ts`: Clerk middleware configuration

============================================================
# 6. SYSTEM ARCHITECTURE

## Architecture Pattern
- Client-Server architecture:
  - Frontend: Next.js (React)
  - Backend/API: Convex queries/mutations and Convex HTTP webhook routes
  - Database: Convex tables

## Request Lifecycle
Typical snippet detail request:
1. Browser requests `/snippets/[snippet]`
2. Next.js loads `src/app/snippets/[snippet]/page.tsx`
3. Client calls Convex queries via `useQuery`:
   - `api.snippets.getSnippetById` (snippet metadata)
   - `api.snippets.getComments` (snippet discussion)
4. Convex executes queries against Convex tables and returns results
5. UI renders metadata + read-only Monaco editor + comments

## Data Flow
- UI → Convex query/mutation (auth-aware operations use Clerk identity)
- External providers → Convex HTTP webhooks:
  - Clerk (Svix-verified)
  - Lemon Squeezy (HMAC verified)

## Communication Model
- Convex React hooks are used for declarative data fetching
- Webhook ingestion is implemented as Convex HTTP routes

Text-based architecture diagram:

User (Browser)
  |
  v
Next.js App (React)
  |  (Convex React hooks: useQuery/useMutation)
  v
Convex Backend
  |\
  | \-- Queries/Mutations
  |        - Snippets, Comments, Stars, Users, Code Executions
  |
  \-- HTTP Router (webhooks)
           - /clerk-webhook
           - /lemon-squeezy-webhook

Convex Tables (schema.ts)

============================================================
# 7. DATABASE DESIGN

All Convex table definitions are in `convex/schema.ts`.

## 7.1 users
- Purpose: Store Clerk user details and Pro subscription state
- Fields:
  - userId: string
  - email: string
  - name: string
  - isPro: boolean
  - proSince: optional number
  - lemonSqueezyCustomerId: optional string
  - lemonSqueezyOrderId: optional string
- Indexes:
  - `by_user_id` on [userId]

## 7.2 codeExecutions
- Purpose: Persist code execution logs (language + code + optional output/error)
- Fields:
  - userId: string
  - language: string
  - code: string
  - output: optional string
  - error: optional string
- Indexes:
  - `by_user_id` on [userId]

## 7.3 snippets
- Purpose: Store code snippets created by users
- Fields:
  - userId: string
  - title: string
  - language: string
  - code: string
  - userName: string (denormalized)
- Indexes:
  - `by_user_id` on [userId]

## 7.4 snippetComments
- Purpose: Store comments/discussion for snippets
- Fields:
  - snippetId: v.id("snippets")
  - userId: string
  - userName: string (denormalized)
  - content: string (stored as HTML per schema comment)
- Indexes:
  - `by_snippet_id` on [snippetId]

## 7.5 stars
- Purpose: Join table representing star relationships between users and snippets
- Fields:
  - userId: string
  - snippetId: v.id("snippets")
- Indexes:
  - `by_user_id` on [userId]
  - `by_snippet_id` on [snippetId]
  - `by_user_id_and_snippet_id` on [userId, snippetId]

Constraints and Relationships
- Convex tables do not enforce DB foreign keys; relationships are enforced in application logic:
  - Snippet ownership checks occur in Convex mutations.
  - Comment deletion checks compare comment.userId to ctx.auth identity.subject.

============================================================
# 8. ENTITY RELATIONSHIP DIAGRAM (ERD)

Text-based ERD:

users (userId, email, name, isPro, ...)
  1 ──< snippets (userId)
  1 ──< snippetComments (userId)
  1 ──< codeExecutions (userId)

snippets
  1 ──< snippetComments (snippetId)

users ↔ snippets via stars (userId, snippetId)

Legend:
- “1 ──<” indicates one-to-many
- “via stars” indicates many-to-many join table pattern

============================================================
# 9. SECURITY ARCHITECTURE

## Authentication
- Implemented authentication provider: Clerk
- Convex auth integration:
  - Frontend wraps the app with `ConvexProviderWithClerk` and passes Clerk’s `useAuth`
  - Convex functions call `ctx.auth.getUserIdentity()`

## Authorization
Authorization is enforced inside Convex mutations/queries that require user identity.

Implemented checks (from code):
- createSnippet
  - Requires identity; uses identity.subject as userId
  - Throws error if not authenticated
- deleteSnippet
  - Requires identity
  - Verifies ownership: `snippet.userId !== identity.subject` → throws
  - Deletes related comments and stars before deleting snippet
- addComment
  - Requires identity
  - Uses identity.subject and user record name
- deleteComment
  - Requires identity
  - Compares `comment.userId` to identity.subject
- starSnippet
  - Requires identity
  - Toggles star by checking existence in stars index
- saveExecution
  - Requires identity
  - Enforces Pro gating: if user is not Pro and language !== "javascript" → throws

## Protected Routes
- Clerk middleware is configured in `src/proxy.ts`.
- For Next.js routing:
  - The matcher targets non-static paths and applies to `/api` and `/trpc` patterns.
- Convex protected operations use identity retrieval rather than Next.js route handlers.

## Token Strategy
- Project does not implement custom JWT issuance or verification.
- Tokens/cookies are managed by Clerk integration; Convex uses Clerk identity.

## Validation
- Input validation is implemented via Convex `v.*` validators on mutation/query args.

## Encryption
- Lemon Squeezy webhook signature verification uses HMAC-SHA256 via Node `crypto`.

## Webhook Security
- Clerk webhook verification:
  - Svix Webhook verification using `CLERK_WEBHOOK_SECRET`
  - Verifies headers `svix-id`, `svix-timestamp`, `svix-signature`
- Lemon Squeezy webhook verification:
  - HMAC verification against `LEMON_SQUEEZY_WEBHOOK_SECRET`
  - Compares `X-Signature` header to computed digest

============================================================
# 10. AUTHENTICATION FLOW

Important: No JWT auth is implemented.
This repo uses Clerk authentication integrated with Convex.

Text-based authentication flow (implemented identity flow):

1) User signs in
   - Handled by Clerk UI (e.g., SignInButton in `src/components/LoginButton.tsx`)

2) Client obtains authenticated context (Clerk)
   - `useAuth` is provided to Convex via `ConvexProviderWithClerk`

3) Protected Convex request occurs
   - Frontend calls Convex query/mutation via hooks

4) Convex identity retrieval
   - Convex functions call `ctx.auth.getUserIdentity()`
   - If identity is missing, protected operations throw or return defaults

5) Authorization decisions
   - Mutations enforce ownership and Pro gating using `identity.subject`

6) Response
   - Convex returns data or throws an error; UI displays results or toast errors

Auth required by Convex operation (examples):
- Auth required (uses identity):
  - createSnippet, deleteSnippet, starSnippet, addComment, deleteComment, isSnippetStarred, getStarredSnippets, saveExecution
- Auth not enforced in code (queries):
  - getSnippets (no identity checks)
  - getSnippetById (no identity checks)
  - getComments (no identity checks)
  - getSnippetStarCount (no identity checks)
  - getUserExecutions/getUserStats do not enforce ctx.auth in backend code (based on provided implementation)

============================================================
# 11. APPLICATION FLOW

Text-based flow diagram (startup → runtime):

App Startup
  |
  v
Next.js RootLayout (src/app/layout.tsx)
  - Wraps app with <ClerkProvider>
  - Wraps main content with <ConvexClientProvider>
    - ConvexProviderWithClerk configured using useAuth
  - Renders <Footer /> and <ToastProvider />

User Navigation
  |
  +--> /snippets (src/app/snippets/page.tsx)
  |       - calls api.snippets.getSnippets via useQuery
  |       - client-side filter/search and language chip selection
  |
  +--> /snippets/[snippet] (src/app/snippets/[snippet]/page.tsx)
  |       - reads snippetId from route params
  |       - calls api.snippets.getSnippetById and api.snippets.getComments
  |       - renders Monaco Editor and Comments section
  |
  +--> /profile (src/app/profile/page.tsx)
          - uses Clerk `useUser()` for profile access
          - redirects to `/` if user is not loaded and missing
          - loads user stats and execution history and starred snippets

Webhook-driven background updates (separate path)
  - POST /clerk-webhook → api.users.syncUser (user.created)
  - POST /lemon-squeezy-webhook → api.users.upgradeToPro (order_created)

============================================================
# 12. BACKEND INTERNAL FLOW

Convex query/mutation execution pattern:

Route/Handler (Convex)
  → Argument validation (v.*)
  → Auth check (ctx.auth.getUserIdentity where required)
  → Business logic
  → Convex table operations (insert/patch/delete/query)
  → Return response

Example backend flows from code:
- deleteSnippet
  → get identity
  → verify ownership
  → query related snippetComments and stars
  → delete dependents
  → delete snippet

- saveExecution
  → get identity
  → load user
  → enforce Pro gating for language usage
  → insert codeExecutions record

Webhook handler flow (Convex HTTP routes):
- POST /clerk-webhook
  → read env secret
  → read headers (svix-id, svix-signature, svix-timestamp)
  → verify signature with Svix using raw body text
  → if event type user.created → run api.users.syncUser
  → respond 200

- POST /lemon-squeezy-webhook
  → read raw payload text
  → read X-Signature header
  → call internal verifyWebhook to validate HMAC
  → if event_name order_created → run api.users.upgradeToPro
  → respond 200

Text-based backend flow diagram:

Convex Function
  -> (v.* arg validators)
  -> (ctx.auth.getUserIdentity for auth-required ops)
  -> (ctx.db query/insert/patch/delete)
  -> Response

Convex HTTP Webhook Route
  -> Parse headers + raw body
  -> Verify signature (Svix/HMAC)
  -> ctx.runMutation / ctx.runAction
  -> Response

============================================================
# 13. FRONTEND INTERNAL FLOW

Text-based frontend flow diagrams:

Entry Point
src/app/layout.tsx
  -> <ClerkProvider>
  -> <ConvexClientProvider>
    -> ConvexProviderWithClerk (useAuth)
  -> <ScreenTooSmallGuard />
  -> <Footer />
  -> <ToastProvider />

Routing (Next.js App Router)
- /snippets → SnippetsPage
- /snippets/[snippet] → SnippetDetailPage
- /profile → ProfilePage

Snippet Detail Data Fetching
SnippetDetailPage
  -> read params.snippet
  -> useQuery(getSnippetById)
  -> useQuery(getComments)
  -> render Monaco readOnly editor
  -> render Comments component

Comments UI Flow
Comments component
  -> uses useUser() from Clerk
  -> useQuery(getComments)
  -> if user exists: render CommentForm
  -> addComment mutation on submit
  -> deleteComment mutation on delete action

============================================================
# 14. API DOCUMENTATION

This section covers the backend interfaces implemented in this repository.

Note: In Convex, “endpoints” are Convex queries/mutations invoked by the frontend using generated `api.<namespace>.<operation>` bindings (not Next.js HTTP routes).

Additionally, this repo defines Convex HTTP webhook routes.

## 14.1 Convex Queries & Mutations

### Method Table Format (Convex)
| Method | Endpoint | Description | Auth Required | Request Body | Response |
| ------ | -------- | ----------- | ------------- | ------------ | -------- |

Auth required means the Convex operation uses `ctx.auth.getUserIdentity()`.

### Snippets API (Convex namespace: api.snippets)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| ------ | -------- | ----------- | ------------- | ------------ | -------- |
| mutation | api.snippets.createSnippet | Create a snippet for the authenticated user | Yes | { title, language, code } | snippetId (insert return) |
| mutation | api.snippets.deleteSnippet | Delete a snippet (and dependent comments/stars) | Yes | { snippetId } | void |
| mutation | api.snippets.starSnippet | Toggle star/unstar for a snippet | Yes | { snippetId } | void |
| mutation | api.snippets.addComment | Add a comment to a snippet | Yes | { snippetId, content } | insert return |
| mutation | api.snippets.deleteComment | Delete a comment (only author can delete) | Yes | { commentId } | void |
| query | api.snippets.getSnippets | Return all snippets ordered desc | No | — | snippets[] |
| query | api.snippets.getSnippetById | Return snippet by id | No | { snippetId } | snippet |
| query | api.snippets.getComments | Return snippet comments ordered desc | No | { snippetId } | snippetComments[] |
| query | api.snippets.isSnippetStarred | Check whether current user has starred snippet | Yes | { snippetId } | boolean |
| query | api.snippets.getSnippetStarCount | Count stars for a snippet | No | { snippetId } | number |
| query | api.snippets.getStarredSnippets | List starred snippets for current user | Yes | — | snippets[] |

Per-endpoint details (selected):

#### Endpoint Name: api.snippets.createSnippet
- Purpose: Inserts a snippet for authenticated user
- Auth Requirements: Required (`ctx.auth.getUserIdentity()`)
- Request Parameters:
  - title: string
  - language: string
  - code: string
- Success Response: returns snippetId
- Error Response:
  - Throws "Not authenticated" if identity missing
  - Throws "User not found" if Convex user record missing
- Internal Flow:
  Route → Auth check → users lookup → insert into snippets → return snippetId

#### Endpoint Name: api.snippets.deleteSnippet
- Purpose: Deletes snippet + dependent comments and stars
- Auth Requirements: Required
- Request Parameters:
  - snippetId: v.id("snippets")
- Authorization:
  - Only deletes if snippet.userId === identity.subject
- Success Response: void
- Error Response:
  - "Not authenticated", "Snippet not found", "Not authorized to delete this snippet"
- Internal Flow:
  Route → Auth check → ownership check → query dependents → delete dependents → delete snippet

#### Endpoint Name: api.snippets.addComment
- Purpose: Add a comment to a snippet
- Auth Requirements: Required
- Request Parameters:
  - snippetId: v.id("snippets")
  - content: string (as provided by frontend)
- Success Response: insert return value
- Error Response: "Not authenticated", "User not found"

#### Endpoint Name: api.snippets.deleteComment
- Purpose: Delete comment by id
- Auth Requirements: Required
- Authorization:
  - Only comment author can delete (comment.userId must equal identity.subject)
- Success Response: void
- Error Response: "Not authenticated", "Comment not found", "Not authorized to delete this comment"

### Users API (Convex namespace: api.users)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| ------ | -------- | ----------- | ------------- | ------------ | -------- |
| mutation | api.users.syncUser | Sync user on Clerk `user.created` | No | { userId, email, name } | void |
| query | api.users.getUser | Fetch user by userId | No | { userId } | user |
| mutation | api.users.upgradeToPro | Upgrade user to Pro (stores Lemon Squeezy IDs) | No | { email, lemonSqueezyCustomerId, lemonSqueezyOrderId, amount } | { success: true } |

Notes:
- These operations do not call `ctx.auth.getUserIdentity()` in the implementation shown.
- They are invoked by verified webhook handlers in `convex/http.ts`.

### Code Executions API (Convex namespace: api.codeExecutions)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| ------ | -------- | ----------- | ------------- | ------------ | -------- |
| mutation | api.codeExecutions.saveExecution | Save code execution record with Pro gating | Yes | { language, code, output?, error? } | void |
| query | api.codeExecutions.getUserExecutions | Fetch executions for user with pagination | No (not enforced) | { userId, paginationOpts } | paginated result |
| query | api.codeExecutions.getUserStats | Aggregate stats for user | No (not enforced) | { userId } | stats object |

Auth Note:
- `saveExecution` enforces auth and Pro gating.
- `getUserExecutions` and `getUserStats` do not use `ctx.auth.getUserIdentity()` in the reviewed backend code.

## 14.2 Convex HTTP Webhook Endpoints

Implemented in `convex/http.ts`.

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| ------ | -------- | ----------- | ------------- | ------------ | -------- |
| POST | /clerk-webhook | Clerk webhook event handler (Svix verification) | No session auth (secret verification) | Raw request text | 200 on success; 400/500 on failure |
| POST | /lemon-squeezy-webhook | Lemon Squeezy webhook event handler (HMAC verification) | No session auth (secret verification) | Raw request text | 200 on success; 500 on failure |

Endpoint: POST /clerk-webhook
- Authentication Requirements:
  - Webhook signature verification using `CLERK_WEBHOOK_SECRET`
- Expected Headers:
  - svix-id
  - svix-signature
  - svix-timestamp
- Request Body:
  - Raw webhook body (verified as text)
- Success Response:
  - "Webhook processed successfully" (HTTP 200)
- Error Response:
  - "Missing svix headers" (HTTP 400)
  - 500 JSON with { error: message }

Endpoint: POST /lemon-squeezy-webhook
- Authentication Requirements:
  - HMAC verification using `LEMON_SQUEEZY_WEBHOOK_SECRET`
- Expected Headers:
  - X-Signature
- Request Body:
  - Raw payload text
- Success Response:
  - "Webhook processed successfully" (HTTP 200)
- Error Response:
  - "Error processing webhook" (HTTP 500)

============================================================
# 15. THIRD-PARTY INTEGRATIONS

Detected integrations and how they are used:

## Clerk
- Where used:
  - Frontend: `@clerk/nextjs` SignInButton and ClerkProvider
  - Backend: ConvexProviderWithClerk and `ctx.auth.getUserIdentity()`
  - Webhooks: `POST /clerk-webhook` verifies events with Svix
- Integration Flow:
  - Clerk emits `user.created` event to webhook
  - Convex verifies signature (Svix)
  - Convex calls `api.users.syncUser`

## Svix
- Where used:
  - `convex/http.ts` uses `Webhook` from `svix` for Clerk webhook verification
- Purpose:
  - Verify webhook integrity and authenticity

## Lemon Squeezy
- Where used:
  - Webhook handler: `POST /lemon-squeezy-webhook`
  - Signature verification: `convex/lemonSqueezy.ts`
- Purpose:
  - Provide subscription events that are used to set user Pro status

## Monaco Editor
- Where used:
  - Snippet detail and code display via `@monaco-editor/react`
- Purpose:
  - Syntax-highlighted code presentation (readOnly)

## React Hot Toast
- Where used:
  - Comments component uses toast for error messages

============================================================
# 16. ENVIRONMENT VARIABLES

Detected environment variables directly referenced in source code.

| Variable | Purpose | Required |
| -------- | ------- | -------- |
| NEXT_PUBLIC_CONVEX_URL | Public Convex URL used by `ConvexReactClient` in frontend provider | Yes (code uses `!`) |
| CLERK_WEBHOOK_SECRET | Svix secret to verify Clerk webhook signatures | Yes (required; throws missing secret error) |
| LEMON_SQUEEZY_WEBHOOK_SECRET | Secret used to compute/verify HMAC signatures for Lemon Squeezy webhook | Yes (required; uses `!`) |

============================================================
# 17. DEPENDENCIES

## Frontend Dependencies (from package.json)
- next, react, react-dom
- convex
- convex/react (via usage in code)
- @clerk/nextjs
- @monaco-editor/react
- framer-motion
- lucide-react
- react-hot-toast
- react-syntax-highlighter
- zustand (present as dependency)
- @icons-pack/react-simple-icons

## Backend Dependencies (from package.json and code)
- convex
- svix
- crypto (Node built-in)

============================================================
# 18. INSTALLATION GUIDE

## Prerequisites
- Node.js installed
- Clerk configured for your application
- Convex configured and running

## Setup Steps
1. Navigate to the project:
   - cd dev-canvas
2. Install dependencies:
   - npm install
3. Create an environment configuration (.env) with:
   - NEXT_PUBLIC_CONVEX_URL=...
   - CLERK_WEBHOOK_SECRET=...
   - LEMON_SQUEEZY_WEBHOOK_SECRET=...
4. Run development server:
   - npm run dev

## Expected Output
- Next.js application starts.
- Snippet list and detail pages load.
- Webhook endpoints are handled by Convex HTTP router.

============================================================
# 19. DEPLOYMENT GUIDE

Deployment architecture (inferred from implementation):

- Frontend hosting: Next.js hosting (e.g., Vercel or similar)
- Backend hosting: Convex deployed project (Convex provides queries/mutations and HTTP routes)
- Authentication: Clerk
- Webhooks:
  - Clerk sends `user.created` → Convex HTTP route
  - Lemon Squeezy sends subscription events → Convex HTTP route

Environment configuration
- Production must set the required env vars:
  - NEXT_PUBLIC_CONVEX_URL
  - CLERK_WEBHOOK_SECRET
  - LEMON_SQUEEZY_WEBHOOK_SECRET

Production build process
- Build: `npm run build`
- Start: `npm run start`

============================================================
# 20. RUNTIME FLOW

Text-based runtime flow after startup:

Server/Providers Start
  -> Next.js RootLayout mounts
  -> ClerkProvider initializes auth context
  -> ConvexClientProvider initializes Convex client

Request Handling
  -> Browser requests a route
  -> If route uses Convex hooks:
       - useQuery executes request through Convex integration
  -> For auth-required mutations:
       - Convex checks ctx.auth.getUserIdentity
       - Applies ownership/pro gating checks
  -> UI renders response data

Webhook Events (async)
  -> Clerk webhook POST /clerk-webhook
       - signature verify
       - if user.created → sync user
  -> Lemon Squeezy webhook POST /lemon-squeezy-webhook
       - HMAC verify
       - if order_created → upgrade user to Pro

============================================================
# 21. CHALLENGES & LEARNINGS

## Technical Challenges (from code observations)
- Client-side filtering of snippets:
  - `src/app/snippets/page.tsx` fetches all snippets with `getSnippets` and filters in the browser.
  - This can become inefficient with large datasets.
- Denormalization:
  - Snippet and comment records store `userName` for display.
  - Name changes in Clerk would not automatically propagate unless explicitly updated.
- Authorization enforcement inconsistency across queries:
  - Some queries do not enforce auth (e.g., getSnippets/getComments).
  - `getUserExecutions`/`getUserStats` do not enforce `ctx.auth.getUserIdentity()` in backend code.
  - If privacy is intended, server-side auth checks should be added.

## Solutions Implemented
- Convex arg validation with `v.*` validators in mutations/queries.
- Strong auth enforcement in protected mutations (ownership + identity subject checks).
- Pro gating enforced in `saveExecution`.
- Verified webhook processing using Svix and HMAC.

## Key Learnings
- Using Convex `ctx.auth.getUserIdentity()` provides an effective server-side authorization gate.
- Webhook signature verification is critical; both Clerk and Lemon Squeezy flows implement verification before mutations.

============================================================
# 22. COMMON ERRORS & TROUBLESHOOTING

1) Missing NEXT_PUBLIC_CONVEX_URL
- Symptom: Convex client fails to connect
- Fix: Set NEXT_PUBLIC_CONVEX_URL in environment.

2) Missing CLERK_WEBHOOK_SECRET
- Symptom: /clerk-webhook returns 500 with "Missing CLERK_WEBHOOK_SECRET"
- Fix: Provide CLERK_WEBHOOK_SECRET.

3) Missing LEMON_SQUEEZY_WEBHOOK_SECRET
- Symptom: /lemon-squeezy-webhook throws verification error
- Fix: Provide LEMON_SQUEEZY_WEBHOOK_SECRET.

4) Not authenticated errors
- Symptom: Convex mutations throw "Not authenticated"
- Fix: Ensure user is signed in with Clerk.

5) Authorization errors
- Symptom:
  - "Not authorized to delete this snippet"
  - "Not authorized to delete this comment"
- Fix: Only owners can delete their content; verify user ownership.

6) Pro gating failures
- Symptom: "Pro subscription required to use this language"
- Fix: Upgrade the user to Pro via Lemon Squeezy webhook flow.

============================================================
# 23. PERFORMANCE ANALYSIS

## Current Optimizations
- Convex indexes used for certain lookups:
  - users.by_user_id
  - snippets.by_user_id
  - snippetComments.by_snippet_id
  - stars indexes for star existence checks
  - codeExecutions.by_user_id
- Query pagination is used for execution history UI via `usePaginatedQuery` and `paginationOptsValidator`.

## Potential Bottlenecks
- `getSnippets` collects all snippets with no pagination; listing filters are client-side.
- `getUserStats` collects all codeExecutions for the user and then aggregates in memory.
- `getUserStats` also loads snippet details for each starred snippet using Promise.all (could be heavy for many stars).

## Scalability Considerations
- Add pagination to snippet listing.
- Consider server-side filtering/search for snippets.
- Consider denormalized aggregated stats or incremental updates.

## Performance Recommendations
- Implement indexed/paginated snippet queries.
- Add auth enforcement to user-specific queries if privacy/security requirements exist.

============================================================
# 24. SECURITY REVIEW

## Existing Security Measures
- Authenticated operations use Clerk identity:
  - ctx.auth.getUserIdentity()
- Ownership checks:
  - deleteSnippet and deleteComment enforce subject matching.
- Pro gating enforced in saveExecution.
- Webhook signature verification:
  - Clerk: Svix verification
  - Lemon Squeezy: HMAC verification

## Security Risks Observed (based on implementation)
- Some queries and user-specific reads do not enforce auth in backend code:
  - getUserExecutions and getUserStats accept `userId` and do not call ctx.auth.getUserIdentity() in provided implementation.
  - getSnippets/getSnippetById/getComments also do not enforce auth.
  These may be intended (public browse), but user-specific data reads might be exposed depending on usage.

## Recommended Improvements (realistic)
- If user-specific stats/executions should be private, enforce auth by comparing identity.subject to requested userId.
- Consider rate limiting and additional webhook hardening if required by your threat model.
- Validate and sanitize comment content if stored as HTML (schema comment indicates HTML storage).

============================================================
# 25. FUTURE ENHANCEMENTS

Based on current architecture (and without inventing new unimplemented features):
- Add pagination and server-side filtering/search for snippets list.
- Add authorization checks to user-specific queries (`getUserExecutions`, `getUserStats`) if they are intended to be private.
- Improve comment content handling (sanitization) since schema indicates HTML content is stored.
- Add caching for computed stats if computation grows costly.

============================================================
# 26. DEVELOPER NOTES

## Architecture Decisions (from code)
- Convex as backend for queries/mutations and storage
- Clerk for authentication
- Webhook-based user provisioning and subscription updates
- Monaco editor for code viewing
- Convex indexes for common access patterns (stars, comments, user-owned records)

## Maintainability Notes
- Keep schema changes centralized in `convex/schema.ts`.
- Keep authorization checks in Convex mutations/queries (single source of truth).
- Prefer adding pagination for potentially growing collections.

## Refactoring Opportunities
- Standardize auth enforcement behavior across queries and decide which endpoints are public vs protected.
- Optimize `getUserStats` for large datasets (reduce full collects and per-star fetches).

## Technical Debt Observations
- UI snippet filtering is client-side; may become a performance bottleneck.
- Denormalized userName fields may lead to stale display values if user profile changes.
- Some queries appear to accept userId without auth checks (verify intended behavior).

============================================================

[END OF DOCUMENT]

