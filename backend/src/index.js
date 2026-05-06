const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const DATA_DIR = path.join(__dirname, "data");

function loadJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

let candidates = loadJson("candidates.json");
const columns = loadJson("columns.json");
const rejectionReasons = loadJson("rejection-reasons.json");

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/candidates", (_req, res) => {
  res.json(candidates);
});

app.get("/api/columns", (_req, res) => {
  res.json(columns);
});

app.get("/api/rejection-reasons", (_req, res) => {
  res.json(rejectionReasons);
});

app.post("/api/rejection-reasons", (req, res) => {
  const { reason } = req.body || {};

  if (typeof reason !== "string" || reason.trim().length === 0) {
    return res.status(400).json({
      error: "Body must include a non-empty 'reason' string",
    });
  }

  const trimmed = reason.trim();
  const exists = rejectionReasons.some(
    (r) => r.toLowerCase() === trimmed.toLowerCase(),
  );

  if (exists) {
    return res.status(409).json({ error: "Reason already exists" });
  }

  rejectionReasons.push(trimmed);
  res.status(201).json(rejectionReasons);
});

app.put("/api/candidates/:id/approve", (req, res) => {
  const { id } = req.params;
  const candidate = candidates.find((c) => String(c.id) === String(id));

  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  candidate.reason = "";
  res.json(candidate);
});

app.put("/api/candidates/:id/reject", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  if (typeof reason !== "string" || reason.trim().length === 0) {
    return res.status(400).json({
      error: "Body must include a non-empty 'reason' string",
    });
  }

  const candidate = candidates.find((c) => String(c.id) === String(id));
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  candidate.reason = reason.trim();
  res.json(candidate);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`CORS allowed origin: ${FRONTEND_URL}`);
});
