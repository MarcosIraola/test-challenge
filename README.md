# Candidates Challenge

Full-stack solution for the candidates React challenge.

**AI-assisted development:** see [`AI_USAGE.md`](AI_USAGE.md) for tools, Cursor rules,
and how AI was used to build this project (challenge requirement).

- `backend/` — Express API. Reads candidates and column config from local
  JSON files and offers `approve` / `reject` endpoints. Ready to be
  deployed on Railway.
- `frontend/` — Next.js (App Router, TypeScript). Renders the candidates
  table dynamically from the column config, supports search and status
  filters, and lets recruiters approve or reject candidates with one or
  more reasons.

## Run locally

You need **Node.js 18+**. Use two terminals: start the backend first, then the
frontend.

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

`backend/.env` defaults to `PORT=4000` and `FRONTEND_URL=http://localhost:3000`
so the Next.js app on port 3000 is allowed by CORS. Then:

```bash
npm run dev
```

The API listens at `http://localhost:4000`. Health check: open or `curl`
`http://localhost:4000/api/candidates`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

`frontend/.env.local` should set `NEXT_PUBLIC_API_URL=http://localhost:4000`
(the same host and port as the API). The app serves at
`http://localhost:3000` and all client requests go to `${NEXT_PUBLIC_API_URL}`
plus paths like `/api/candidates`.

## Production

The project is deployed: the **frontend** is on Vercel and the **backend** on
Railway.

| Service  | URL                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------- |
| Frontend | [https://emi-challenge.vercel.app](https://emi-challenge.vercel.app)                               |
| Backend  | [https://emi-challenge-production.up.railway.app](https://emi-challenge-production.up.railway.app) |

On Vercel, `NEXT_PUBLIC_API_URL` is set to the Railway **origin only** (no
`/api` path). On Railway, the service **root directory** is `backend`, and
`FRONTEND_URL` must match the Vercel origin exactly (scheme + host, no trailing
slash) so CORS preflight succeeds.

## Endpoints

All under the backend base URL.

| Method | Path                          | Description                                                          |
| ------ | ----------------------------- | -------------------------------------------------------------------- |
| `GET`  | `/api/candidates`             | Returns the in-memory candidates list.                               |
| `GET`  | `/api/columns`                | Returns the column configuration.                                    |
| `GET`  | `/api/rejection-reasons`      | Returns the list of available rejection reasons.                     |
| `POST` | `/api/rejection-reasons`      | Body: `{ "reason": string }`. Adds a new reason. `409` if duplicate. |
| `PUT`  | `/api/candidates/:id/approve` | Sets `reason = ""`. Returns the updated candidate.                   |
| `PUT`  | `/api/candidates/:id/reject`  | Body: `{ "reason": string }`. Stores comma-joined selected reasons.  |

Errors:

- `404 { "error": "Candidate not found" }` for unknown ids.
- `400 { "error": "..." }` if the reject payload is missing or invalid.

## Frontend features

- Dynamic columns from `/api/columns`. Hidden columns are not rendered;
  missing values render as `-`.
- Fixed `Status` column (Approved / Rejected badge) and `Actions` column.
- `Approve` button only on rejected candidates; `Reject` button always
  visible.
- Reject opens a modal with the list of rejection reasons fetched from
  `/api/rejection-reasons`. The recruiter selects one or more; the
  selected reasons are joined and sent as `reason`. If a needed reason
  is not in the list, the recruiter can add a new one inline; it is
  posted to `/api/rejection-reasons`, appended to the list and
  auto-selected.
- Candidate details modal: clicking a candidate name shows every field,
  with clickable links for `cv_zonajobs`, `cv_bumeran` and `location`
  (location opens Google Maps).
- Column picker (persisted per-recruiter in `localStorage`) with
  show all / hide all / reset to default.
- Filters: All / Approved / Rejected.
- Search by name, email or id.
- Copy-to-clipboard buttons next to id and email.
- Loading, error, and empty states.

## Tech decisions

- **Local JSON instead of a database.** The exercise is about the React
  flow, so data lives in `backend/src/data/*.json` and is loaded into
  memory at startup. `approve` / `reject` mutate the in-memory copy
  (state survives within a single server process, not across restarts).
  Swapping the storage layer for a DB later only requires touching the
  handlers in `backend/src/index.js`.
- **Backend prepared for Railway.** No hardcoded ports, CORS origin via
  `FRONTEND_URL`, plain `npm start` script, no build step. Deploying is
  pointing Railway at the `backend/` folder and setting `FRONTEND_URL`
  in the dashboard. See `backend/README.md` for details.
- **Next.js App Router + TypeScript** with plain CSS (no Tailwind). The
  candidate grid uses **`@tanstack/react-table`** for column definitions,
  accessors, `flexRender` and `getCoreRowModel`; the markup is still a
  normal `<table>` so styling stays predictable.
- **Single client page (`app/page.tsx`)** that owns the candidates state
  and applies the API responses optimistically after each mutation, so
  the UI stays in sync without a refetch.

## How I tested it

Manual smoke test (the project has no test runner configured yet, kept
on purpose to stay simple):

1. Run backend (`cd backend && npm run dev`) and frontend
   (`cd frontend && npm run dev`).
2. Open `http://localhost:3000`. The list loads and only the columns
   marked `true` in `columns.json` are rendered.
3. Toggle visibility from the "Displayed columns" picker, refresh the
   page — the choice persists. Click "Reset" to go back to defaults.
4. Switch between All / Approved / Rejected. The counts (Total,
   Approved, Rejected) and the table react to the filter.
5. Search by name (e.g. `aiden`), email (e.g. `bulinad`) or id
   (e.g. `5a271a13`) — all three should match the same candidate.
6. Click a candidate name — the details modal opens with every field;
   `cv_zonajobs` / `cv_bumeran` open the CV in a new tab and `location`
   opens Google Maps.
7. On a rejected row, open the kebab menu and click "Approve". The row
   should switch to `Approved` and the reason clear.
8. On any row, open the kebab menu and click "Reject". The reject
   modal loads the reasons from `/api/rejection-reasons`, lets you
   tick one or more, and on confirm the row switches to `Rejected`
   with the selected reasons. You can also add a missing reason from
   the same modal — it is posted to the backend and selected
   automatically.
9. Stop the backend and reload — the UI shows a friendly error state.

If you want to spot-check the API directly:

```bash
curl http://localhost:4000/api/candidates | jq '. | length'
curl http://localhost:4000/api/columns
curl http://localhost:4000/api/rejection-reasons
curl -X PUT http://localhost:4000/api/candidates/<id>/approve
curl -X PUT http://localhost:4000/api/candidates/<id>/reject \
  -H "Content-Type: application/json" \
  -d '{"reason":"Edad fuera de rango"}'
```

## Possible future improvements

- Real persistence (Postgres / Supabase / Mongo) instead of in-memory
  mutations.
- Pagination and server-side filtering once the candidate list grows.
- Column sorting (with persisted sort per recruiter).
- Authentication and per-recruiter sessions.
- Audit log of approve/reject actions (who, when, which reasons).
- Recruiter-specific column configurations (each recruiter saves their
  own visible columns / order).
- Optimistic UI with proper rollback on failure.
- E2E tests (Playwright) covering the approve/reject flows.
