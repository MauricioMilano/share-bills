# Copilot Instructions for Share Bills (Splitwise Clone)

## Project Overview
- **Monorepo**: Backend (Node.js/Express/Prisma/SQLite) and Frontend (React/Vite/TypeScript/Tailwind/shadcn/ui)
- **Auth**: JWT (stateless), bcrypt for password hashing
- **Infra**: Docker-based, with `docker-compose.full.yml` for full stack

## Key Directories & Files
- `src/` (backend): Express modules (e.g., `expenses.ts`, `groups.ts`), middlewares, business logic
- `prisma/`: Prisma schema, migrations, and seed scripts
- `frontend/src/`: React pages, components, and styles
- `frontend/nginx.conf`: Nginx config for production frontend
- `docker-compose.full.yml`: Orchestrates backend, frontend, and DB

## Data & API Patterns
- **Prisma**: Models in `prisma/schema.prisma` (e.g., `User`, `Group`, `Expense`, `Payment`)
- **Expense Splitting**: Supports equal, percentage, and times-based splits (see `expenses.ts` logic)
- **Settlements**: Debts are settled via POST `/api/expenses/:groupId/settle`, which creates `Payment` records
- **Balances**: Calculated dynamically from expenses minus payments; not stored persistently
- **Notifications**: Created for group invites, stored in `Notification` model

## Developer Workflows
- **Dev**: `npm run dev` (backend), `npm run dev` (frontend)
- **DB Migrations**: `npx prisma migrate dev --name <desc>`; always run `npx prisma generate` after schema changes
- **Docker**: Use `docker-compose -f docker-compose.full.yml up --build -d` for full stack
- **Seed Data**: See `prisma/seed.ts` for initial user/group setup

## Project Conventions
- **API**: RESTful, JWT required for most endpoints (see `authMiddleware.ts`)
- **Error Handling**: Returns JSON `{ error: string }` on failure
- **Frontend**: Uses React hooks, stateful forms, and Tailwind for UI; all API calls use JWT from `localStorage`
- **Expense Splits**: Always send a value for each selected user; for percentage splits, sum must be 100
- **Payments**: `Payment` model tracks all settlements; do not modify expenses after settlement

## Integration Points
- **Frontend <-> Backend**: Communicate via `/api/*` endpoints; see `GroupDetails.tsx` for expense/settlement flows
- **Prisma**: All DB access via Prisma Client; models are tightly coupled to business logic
- **Docker**: SQLite DB is file-based and persists in backend container

## Examples
- To settle all group debts: `POST /api/expenses/:groupId/settle` (see `expenses.ts`)
- To add an expense: `POST /api/expenses` with `{ groupId, description, amount, splits, splitMethod, paidById }`
- To fetch group balances: `GET /api/expenses/:groupId/balances`

---

For more, see `README.md` and key files above. If conventions or flows are unclear, ask for clarification or check the backend module for the relevant feature.
