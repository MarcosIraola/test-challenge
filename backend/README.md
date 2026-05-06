# Candidates Backend

Express API for the candidates React challenge. Data is loaded from local
JSON files into memory at startup. Updates from the `approve` / `reject`
endpoints mutate the in-memory copy only (no disk persistence yet).

## Requirements

- Node.js 18+

## Run locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The server starts on `http://localhost:4000` by default.

## Scripts

- `npm run dev` — starts the server with `nodemon` (auto-restart on changes).
- `npm start` — starts the server with plain `node`. Used in production.

## Environment variables

| Variable       | Default                 | Description                      |
| -------------- | ----------------------- | -------------------------------- |
| `PORT`         | `4000`                  | Port the HTTP server listens on. |
| `FRONTEND_URL` | `http://localhost:3000` | Origin allowed by CORS.          |

## Endpoints

- `GET /api/candidates` → list of candidates from `candidates.json`.
- `GET /api/columns` → column configuration from `columns.json`.
- `GET /api/rejection-reasons` → list of available rejection reasons
  from `rejection-reasons.json`. Used by the frontend to populate the
  reject modal.
- `POST /api/rejection-reasons` → body `{ "reason": string }`. Adds a
  new reason to the in-memory list (case-insensitive dedupe; returns
  `409` if it already exists) and returns the updated list.
- `PUT /api/candidates/:id/approve` → sets `reason` to `""` and returns
  the updated candidate.
- `PUT /api/candidates/:id/reject` → body `{ "reason": string }`,
  stores the (comma-joined) selected reasons and returns the updated
  candidate.

Errors:

- `404` if the candidate id is not found.
- `400` if the reject payload is missing/invalid.
