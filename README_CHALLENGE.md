# React Challenge

## Context

Emi is used by large companies to massively screen job candidates. Applicants apply through job boards (Zona Jobs, Bumeran, Indeed, etc.), receive an SMS and email to start chatting with Emi, and once the screening interview is finished, a backend application classifies them as **approved** or **rejected**.

The file `candidates.json` contains a list of screened candidates. The file `columns.json` defines which columns a recruiter wants to see (not all recruiters want to see the same data).

> **Note:** A candidate is **approved** if their `reason` field is empty (`""`). If `reason` is non-empty, the candidate is **rejected** — there may be more than one rejection reason, comma-separated.

## Part 1 — Display candidates

- Create a backend that exposes the necessary endpoints to serve the data from `candidates.json` and `columns.json`. You can use any language or framework you're comfortable with (Node is suggested).
- Build a React frontend that fetches candidates and columns from your backend and displays the candidate list respecting the columns configuration.
- Think about (and implement, or at least name) other features that would be useful for this list view.

## Part 2 — Reclassify candidates

The backend learns to classify candidates based on recruiter feedback — it's the core of the AI feedback loop. Recruiters occasionally need to manually override a classification.

**Manually approving a candidate:**

1. Call the API endpoint to remove all rejection reasons from a candidate.
2. Make sure the table reflects the updated data.

**Manually rejecting a candidate:**

1. Call the API to retrieve the list of available rejection reasons.
2. Let the recruiter select one or more reasons.
3. Call the API to update the candidate's data.

For this part you are allowed to manage state locally — dummy API endpoints are fine.

## Data files

- `candidates.json` — list of candidates
- `columns.json` — map of field names to booleans indicating visibility

## AI Usage

You are expected and encouraged to use AI tools throughout this challenge. However, you **must** deliver a detailed log of everything you used (prompts, tools, rules, configurations, etc.). If you use an AI assistant, consider whether it offers any built-in feature that could help you generate this log.

The quality and honesty of this log is part of the evaluation.
