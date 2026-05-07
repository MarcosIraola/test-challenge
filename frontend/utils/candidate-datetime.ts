export function parseCandidateInstantMs(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const trimmed = String(value).trim().replace(/\s+/g, " ");
  const m = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?/,
  );
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const hh = Number(m[4]);
    const mm = Number(m[5]);
    const ss = Number(m[6]);
    const frac = m[7] ?? "";
    const base = new Date(y, mo, d, hh, mm, ss).getTime();
    if (Number.isNaN(base)) return null;
    if (!frac) return base;
    const pad = `${frac}000000000`.slice(0, 9);
    return base + Number(pad) / 1e6;
  }
  const iso = trimmed.replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T");
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}
