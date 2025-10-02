# Copilot Instructions for Share Bills (Splitwise Clone)

## Project Architecture
- **Monorepo**: Backend (Node.js/Express/Prisma/SQLite) and Frontend (React/Vite/TypeScript/Tailwind/shadcn/ui) in a single repo.
- **Backend**: Modular Express app (`src/modules/`), Prisma ORM, SQLite DB (file-based, persists in Docker container).
- **Frontend**: React (Vite), Tailwind, shadcn/ui, stateful forms, JWT stored in `localStorage`.
- **Infra**: Docker-based, with `docker-compose.full.yml` for full stack (backend, frontend, DB). See unified `Dockerfile` for multi-stage build.

## Key Directories & Files
- `src/`: Express modules (e.g., `expenses.ts`, `groups.ts`, `notifications.ts`), middlewares, business logic
- `prisma/`: Prisma schema, migrations, and seed scripts (`schema.prisma`, `seed.ts`)
- `frontend/src/`: React pages/components (see `GroupDetails.tsx` for expense/settlement flows)
- `frontend/nginx.conf`: Nginx config for production frontend
- `docker-compose.full.yml`: Orchestrates backend, frontend, and DB

## Data & API Patterns
- **Prisma Models**: `User`, `Group`, `Expense`, `Payment`, `Notification`, etc. (see `prisma/schema.prisma`)
- **Expense Splitting**: Supports equal, percentage, and times-based splits. Always send a value for each selected user; for percentage, sum must be 100.
- **Settlements**: Debts are settled via `POST /api/expenses/:groupId/settle` (see `expenses.ts`). This creates `Payment` records; do not modify expenses after settlement.
- **Balances**: Calculated dynamically from expenses minus payments; not stored persistently. See `/api/expenses/:groupId/balances` and `/api/groups/:id/balance`.
- **Notifications**: Created for group invites, stored in `Notification` model. Mark as read via `POST /api/notifications/:id/read`.

## Developer Workflows
- **Dev**: `npm run dev` (backend, in root), `npm run dev` (frontend, in `frontend/`)
- **DB Migrations**: `npx prisma migrate dev --name <desc>`; always run `npx prisma generate` after schema changes
- **Seed Data**: Run `npm run prisma:seed` or see `prisma/seed.ts` for initial user/group setup
- **Docker**: Use `docker-compose -f docker-compose.full.yml up --build` for full stack (backend:4000, frontend:3000)
- **Build**: Unified `Dockerfile` builds both frontend and backend; see comments for multi-stage details

## Project Conventions & Patterns
- **API**: RESTful, JWT required for most endpoints (see `authMiddleware.ts`). Error responses: `{ error: string }`
- **Frontend**: All API calls use JWT from `localStorage`. React hooks and stateful forms are standard. Use relative URLs for API calls (no hardcoded `VITE_API_URL` in dev).
- **Expense Splits**: Always provide a split value for each user. For percentage splits, sum must be 100. For times, all values must be >0.
- **Payments**: `Payment` model tracks all settlements. Do not modify expenses after settlement.
- **Group Invites**: Invites create notifications with group name and ID in message (see `groups.ts`). Accept/reject via `/api/groups/:groupId/accept|reject`.

## Integration Points
- **Frontend <-> Backend**: Communicate via `/api/*` endpoints. See `GroupDetails.tsx` for expense/settlement flows and invite management.
- **Prisma**: All DB access via Prisma Client. Models are tightly coupled to business logic; see `prisma/schema.prisma`.
- **Docker**: SQLite DB is file-based and persists in backend container. Unified Dockerfile builds both apps.

## Examples
- Settle all group debts: `POST /api/expenses/:groupId/settle` (see `expenses.ts`)
- Add an expense: `POST /api/expenses` with `{ groupId, description, amount, splits, splitMethod, paidById }`
- Fetch group balances: `GET /api/expenses/:groupId/balances` or `GET /api/groups/:id/balance`
- Mark notification as read: `POST /api/notifications/:id/read`

---

For more, see `README.md`, `CHECKLIST.md`, and key files above. If conventions or flows are unclear, check the relevant backend module or ask for clarification.
