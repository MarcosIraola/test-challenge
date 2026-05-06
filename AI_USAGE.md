# AI usage log

This document satisfies the React challenge requirement to disclose **honestly** how generative AI and related tools were used. It summarizes tools, Cursor configuration, iterative prompts (paraphrased where needed), outcomes, and what was verified manually versus left to tooling.

---

## 1. Tools and environments

| Tool | Role |
| ------ | ------ |
| **Cursor** (desktop IDE with integrated AI agents / chat / Composer-style flows) | Primary coding assistant: codebase edits, multi-file refactors, running builds, diagnosing errors. |
| **Models** | Models were chosen per task inside Cursor (e.g. chat vs agent). Exact model/version per message was not systematically exported; reviewers can corroborate from Cursor’s conversation history export if desired. |
| **Terminal inside Cursor / sandbox runner** | `npm install`, `npm run build`, occasional `curl` sanity checks during development sessions. |

No Copilot subscriptions, Claude Code standalone CLI, or third-party codegen SaaS besides Cursor were required for routine work once the project existed.

---

## 2. Persistent Cursor configuration affecting behavior

Two workspace rules lived under `.cursor/rules/` with `alwaysApply: true` throughout most of development:

| File | Effect on AI output |
| ----- | --------------------- |
| `.cursor/rules/nextjs-react-generalist-cursor-rules.mdc` | Steers responses toward concise React / Next.js / Node patterns, favors discrete steps + verification, emphasizes security awareness and naming consistency. |
| `.cursor/rules/optimized-nextjs-typescript-best-practices-modern-ui-ux.mdc` | Pushes TypeScript quality, RSC vs client tradeoffs, validation, structure (e.g. modular files, kebab-case folders). |

Additional **user rules** in Cursor (not committed to the repo) included: full tool use and real shell access, no “only tell the user to run commands,” avoid noise in diffs, **no code comments** in user code, and structured markdown preferences for assistant replies.

**Skills** (from `~/.cursor/skills-cursor/`) were available (e.g. babysit PR, canvas, create-rule) but were **not** central to this repo; work was done in standard Agent/Chat mode.

---

## 3. High-level workflow

1. **Bootstrap** — Express API + Next.js app, JSON-backed data, CORS, env samples.
2. **Table + columns** — Fetch `candidates` + `columns`, render dynamic columns, status badge, actions.
3. **UX iterations** — Search, filters, column picker + `localStorage`, kebab menu, truncation, copy buttons, maps link, detail modal.
4. **Challenge alignment** — Rejection reasons from backend (`GET` list, multi-select), inline `POST` to add a reason, approve/reject APIs.
5. **Polish** — Extract cell renderers to `utils/`, shared link helpers, `dayjs` for dates, README “How I tested it,” housekeeping.
6. **This log** — `AI_USAGE.md` + README pointer.

Human steps between sessions: running the app locally, visual checks, choosing when to simplify (e.g. plain CSS instead of Tailwind after an experiment).

---

## 4. Chronological log (representative prompts → outcomes)

Entries are **paraphrased** from the actual conversation threads; wording is not always verbatim. Order matches the approximate evolution of the repo.

| # | Representative user request / intent | Main AI actions | Verified how |
|---|--------------------------------------|-----------------|--------------|
| 1 | Build full-stack candidates challenge (Express backend, Next frontend, TanStack Table, SaaS-ish UI). | Scaffolded APIs, wired fetches, table, approve/reject, column config from JSON. | Manual UI + API smoke. |
| 2 | Reject uses free-text `reason`; remove predefined rejection-reason endpoints. | Simplified modal + backend body validation. | Reject flow in browser. |
| 3 | Roll back Tailwind; use global CSS. | Removed Tailwind usage, migrated styles back to single stylesheet. | Build + visual. |
| 4 | Actions in 3-dot menu; approve only when rejected. | Refactored actions column + dropdown markup/styles. | Click paths. |
| 5 | Format id, date, career; shorten strings. | Formatter helpers + CSS classes for cells. | Table render. |
| 6 | Copy next to id and email; shorten id and reason more. | `CopyTextButton` component, clipboard + fallback prompt. | Click copy. |
| 7 | Refactor renderers: object map instead of long `if` chain. | `CELL_RENDERERS` / `renderCell` pattern → later extracted to utils. | Lint + build. |
| 8 | Move `CopyTextButton` and `StatusBadge` under `components/ui`. | Created `components/ui/` and updated imports. | Build. |
| 9 | Location abbreviated + clickable → Google Maps. | Link builder + cell renderer using encoded query. | Link opens maps. |
| 10 | All clickable elements `cursor: pointer`. | Global `a`, `[role="button"]`, existing `button` rules. | Hover. |
| 11 | Name opens modal with full candidate object. | `CandidateDetailsModal`, state in `page.tsx`, `onOpenCandidate` prop. | Modal content. |
| 12 | Move format functions to utils folder. | `utils/candidate-cell-renderers.tsx`, `utils/candidate-links.ts`. | Build. |
| 13 | In details modal: CV columns + location as links (reuse helpers). | `isHttpUrl` / `getGoogleMapsSearchUrl` shared. | Clicks from modal. |
| 14 | Search filter also matches candidate `id`. | `filteredCandidates` in `page.tsx`. | Search box. |
| 15 | Challenge prep: analysis + how to test; align with spec. | Written guidance (chat only at that time). | N/A. |
| 16 | Housekeeping: remove dead `StatusBadge`, README test section, git note for `.DS_Store`. | Deleted duplicate file, expanded README. | Build. |
| 17 | Rejection reasons from backend list + multi-select (spec); curate JSON. | `rejection-reasons.json`, `GET /api/rejection-reasons`, checkbox modal. | Modal + curl. |
| 18 | In reject modal: add missing reason → backend. | `POST /api/rejection-reasons`, `addRejectionReason()` + form row. | Add + reject. |
| 19 | Use **dayjs** for table date formatting. | `npm install dayjs`; `formatDate` in renderers uses `dayjs(...).format(...)`. | Build. |
| 20 | Add AI usage **log file** now. | This `AI_USAGE.md` + README link. | Repo review. |

---

## 5. What AI did **not** do (or human owned)

| Area | Notes |
|------|-------|
| **Business domain wording** — Spanish rejection strings in seeds | Derived from `candidates.json` / curated list aligned with dataset; recruiter-facing copy mixes EN UI + ES reasons intentionally to match sample data. |
| **Hosting credentials** — Railway/Vercel, API keys | Not generated or stored in-repo; README documents env vars only. |
| **Security hardening beyond exercise scope** | No auth, no rate limiting, no SSRF protections on recruiter-entered URLs—appropriate for local demo only. |

---

## 6. Verification commands (minimal)

Typically run during development:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

```bash
cd frontend && npm run build
```

See root `README.md` → **How I tested it** for the full manual checklist.

---

## 7. How to deepen this log (Cursor-specific)

Cursor stores chat/agent history **locally**. To attach a fuller audit trail for reviewers:

1. Open Cursor → relevant chat/composer threads for this workspace.
2. Use Cursor’s UI to **copy or export** conversation text where available.
3. Paste into `AI_USAGE_APPENDIX.md` (optional) or append dated sections below this table **with verbatim prompts**.

Machine-specific paths are not committed; keep exports out of `.gitignore` only if comfortable sharing full prompt text.

---

## 8. Integrity statement

AI was used extensively for implementation speed, refactoring, and documentation scaffolding. Final behavior was spot-checked locally (runs, approve/reject, column picker, modals, searches). Anything not re-run recently should be validated with the checklist in `README.md` before submission.
