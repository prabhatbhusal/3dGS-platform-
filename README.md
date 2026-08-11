# Arrival-like Platform (no Viber)

This workspace contains a minimal frontend (Vite + React) and backend (Express) implementation to mirror an "arrival space"-style platform without Viber integration.

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

## Notes
- This is a minimal, in-memory implementation intended for local development and testing.
- To add persistence, replace the in-memory stores with a database and update the API accordingly.
# 3dGS-platform-
