# Arrival-like Platform (no Viber)

This workspace contains a minimal frontend (Vite + React) and backend (Express) implementation to mirror an "arrival space"-style platform without Vibe-coding  integration.

## Running the backend

1. Open a terminal in `backend`.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Start the server:

```bash
npm start
```

The backend listens on port 3000 and exposes `/api/users`, `/api/messages`, and `/api/status`.

### Database and Prisma

This project uses Prisma for the database schema. By default the Prisma schema targets PostgreSQL. Copy `.env.example` to `backend/.env` and set `DATABASE_URL` and `JWT_SECRET`.

Install backend dependencies and generate Prisma client:

```bash
cd backend
npm install
npm run prisma:generate
```

Create the database (Postgres) and run migrations:

```bash
# ensure Postgres is running and DATABASE_URL in backend/.env is correct
npm run prisma:migrate
```

You can inspect data with Prisma Studio:

```bash
npm run prisma:studio
```

## Running the frontend

1. Open a terminal in `frontend`.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the dev server:

```bash
npm run dev
```

The frontend is configured to proxy `/api` requests to `http://localhost:3000` for development.

## Running with Docker (Postgres + backend + frontend)

If you want a single command to run Postgres, the backend and the frontend (production frontend build), use Docker Compose.

1. Build and start everything:

```bash
docker compose up --build
```

2. The services will be available on:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Postgres: 5432 (credentials in `docker-compose.yml`)

Notes:
- The compose file uses default Postgres credentials (`postgres`/`password`) and database `arrival_platform`. Change these values in `docker-compose.yml` or set environment variables before deploying.
- After the DB is up, run migrations from the backend container (or locally) to initialize the schema:

```bash
# from repo root
docker compose exec backend npx prisma migrate deploy --schema=/app/prisma/schema.prisma
```


## Notes
- This is a minimal, in-memory implementation intended for local development and testing.
- To add persistence, replace the in-memory stores with a database and update the API accordingly.
# 3dGS-platform-
