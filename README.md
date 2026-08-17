# Knit

Visual workflow automation. Drag nodes onto a canvas, wire them together, and let them run in the background — started by a form response, a Stripe event, or a manual click.

## What it does

A workflow is a graph of nodes on a canvas ([`@xyflow/react`](https://reactflow.dev)):

- **Triggers** start a run: a manual click, a Google Form submission, or a signed Stripe webhook event.
- **Actions** do the work: call any HTTP API, or send a prompt to OpenAI, Anthropic, or Gemini.
- **Messaging** nodes report the result: post to a Discord or Slack webhook.

Each node can reference the output of any node before it (`{{ name.field }}`) in a URL, request body, or prompt. When you hit execute, the workflow is queued and run step by step through [Inngest](https://www.inngest.com), with per-node status mirrored back onto the canvas as it progresses. Every run — including node-by-node output, and the error and stack trace if one fails — is kept in execution history.

Credentials (API keys, webhook secrets) are encrypted with AES-256-GCM at rest and only decrypted server-side at run time.

## Tech stack

- **Framework:** Next.js 15 (App Router, Turbopack), React 19
- **API:** tRPC + TanStack Query
- **Database:** PostgreSQL via Prisma
- **Auth:** better-auth (email/password + GitHub/Google OAuth)
- **Background jobs:** Inngest
- **Canvas:** @xyflow/react
- **AI SDKs:** Vercel AI SDK (OpenAI, Anthropic, Google)
- **UI:** Tailwind CSS v4, shadcn/radix-ui components
- **Lint/format:** Biome

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech), or `npx create-db` for a free hosted Prisma Postgres instance)

### Setup

```bash
npm install        # also runs `prisma generate` via postinstall
cp .env.example .env  # if present — otherwise create .env with the vars below
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Workflows with a Stripe or Google Form trigger need their webhook delivered to the app, and workflow execution needs Inngest running. For local dev, run both the Next.js server and the Inngest dev server together:

```bash
npm run dev:all
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Session/token signing secret for better-auth |
| `BETTER_AUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |
| `CREDENTIAL_ENCRYPTION_KEY` | Yes | AES-256-GCM key for encrypting stored credentials — generate with `openssl rand -base64 32` |
| `OPENAI_API_KEY` | For OpenAI nodes | Used server-side only for OpenAI nodes you configure |
| `ANTHROPIC_API_KEY` | For Anthropic nodes | Used server-side only for Anthropic nodes you configure |
| `GOOGLE_GENERATIVE_AI_API_KEY` | For Gemini nodes | Used server-side only for Gemini nodes you configure |
| `STRIPE_WEBHOOK_SECRET` | For Stripe triggers | Signing secret from the Stripe dashboard endpoint |
| `GOOGLE_FORM_WEBHOOK_SECRET` | For Google Form triggers | Shared secret validated on incoming form-submission webhooks |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional | Enables "Sign in with GitHub" — the button hides when unset |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Enables "Sign in with Google" — the button hides when unset |
| `INNGEST_DEV` | Local dev only | Set to `1` to point the Inngest client at the local dev server |

> The AI provider and messaging keys above are the app's own fallback/dev credentials. End users normally add their own API keys as encrypted `Credential` records and attach them to individual nodes, so each workflow authenticates with keys the user owns.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server (Turbopack) |
| `npm run dev:all` | Start the Next.js dev server and the Inngest dev server together |
| `npm run inngest:dev` | Start the Inngest dev server alone |
| `npm run build` | Run pending Prisma migrations, then build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Check formatting/lint with Biome |
| `npm run format` | Format the codebase with Biome |

## Project structure

```
prisma/schema.prisma        Data model: User, Workflow, Node, Connection, Credential, Execution
src/app/                    Next.js routes: (auth), (dashboard)/(editor|rest), (marketing), api/
src/features/
  editor/                   The workflow canvas
  executions/                Execution engine: topological sort, templating, per-node executors
  workflows/                Workflow CRUD and list views
  credentials/               Encrypted credential management
  auth/                      Auth UI
  marketing/                 Public landing page
src/inngest/                Inngest client and the execute-workflow function
src/components/ui/          shadcn/radix-ui component library
src/trpc/                   tRPC router setup and client
```

## Data model

A `Workflow` owns a graph of `Node`s and `Connection`s. Each `Execution` records one run of that graph: its status, the accumulated output keyed by variable name, per-node status for the live canvas indicators, and — on failure — the error and stack trace. `Credential`s are scoped to a user and referenced by nodes via a nullable foreign key, so deleting a credential fails the nodes that used it at run time rather than silently breaking the workflow graph.
