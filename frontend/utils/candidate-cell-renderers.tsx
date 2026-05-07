import type { ReactNode } from "react";
import dayjs from "dayjs";
import CopyTextButton from "@/components/ui/CopyTextButton";
import type { Candidate } from "@/lib/types";
import { getGoogleMapsSearchUrl, isHttpUrl } from "@/utils/candidate-links";
import { parseCandidateInstantMs } from "@/utils/candidate-datetime";

type OpenCandidateHandler = (candidate: Candidate) => void;

function formatCell(value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function shortenText(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function formatName(
  value: unknown,
  candidate: Candidate,
  onOpenCandidate: OpenCandidateHandler,
): ReactNode {
  const raw = formatCell(value);
  if (raw === "-") return raw;
  const name = String(value).trim();
  return (
    <button
      type="button"
      className="cell-name-button"
      onClick={() => onOpenCandidate(candidate)}
      title={name}
    >
      {name}
    </button>
  );
}

function formatId(value: unknown): ReactNode {
  const raw = formatCell(value);
  if (raw === "-") return raw;
  const s = String(value).trim();
  const display = s.length <= 8 ? s : `${s.slice(0, 3)}…${s.slice(-2)}`;
  return (
    <span className="cell-with-action">
      <CopyTextButton text={s} label="Copy id" />
      <span className="cell-id" title={s}>
        {display}
      </span>
    </span>
  );
}

function formatDate(value: unknown): ReactNode {
  if (value === undefined || value === null || value === "") return "-";
  const raw = String(value).trim();
  const ms = parseCandidateInstantMs(value);
  if (ms === null) {
    return (
      <span className="cell-date" title={raw}>
        {raw.split(/\s+/)[0] || raw}
      </span>
    );
  }
  const formatted = dayjs(ms).format("MMM D, YYYY, h:mm A");
  return (
    <span className="cell-date" title={raw}>
      {formatted}
    </span>
  );
}

function formatCareer(value: unknown): ReactNode {
  const raw = formatCell(value);
  if (raw === "-") return raw;
  const s = String(value).trim();
  const short = shortenText(s, 22);
  if (short === s) return <span className="cell-career">{s}</span>;
  return (
    <span className="cell-career" title={s}>
      {short}
    </span>
  );
}

function formatEmail(value: unknown): ReactNode {
  const raw = formatCell(value);
  if (raw === "-") return raw;
  const s = String(value).trim();
  const display = shortenText(s, 18);
  return (
    <span className="cell-with-action">
      <span className="cell-email" title={s}>
        {display}
      </span>
      <CopyTextButton text={s} label="Copy email" />
    </span>
  );
}

function formatReason(value: unknown): ReactNode {
  if (value === "" || value === undefined) return "-";
  const s = String(value).trim();
  if (!s) return "-";
  const display = shortenText(s, 22);
  return (
    <span className="cell-reason" title={s}>
      {display}
    </span>
  );
}

function formatLocation(value: unknown): ReactNode {
  const raw = formatCell(value);
  if (raw === "-") return raw;
  const location = String(value).trim();
  const display = shortenText(location, 20);
  const mapsUrl = getGoogleMapsSearchUrl(location);
  return (
    <a
      className="cell-link"
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={location}
    >
      {display}
    </a>
  );
}

function formatGraduated(value: unknown): ReactNode {
  const raw = formatCell(value);
  if (raw === "-") return raw;
  const s = String(value).trim();
  if (s.length <= 20) return <span className="cell-graduated">{s}</span>;
  const display = `${s.slice(0, 17)}...`;
  return (
    <span className="cell-graduated" title={s}>
      {display}
    </span>
  );
}

function renderCvLinkCell(value: unknown): ReactNode {
  if (typeof value === "string" && isHttpUrl(value)) {
    return (
      <a
        className="cell-link"
        href={value}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open CV
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </a>
    );
  }
  return formatCell(value);
}

type CellRenderer = (
  value: unknown,
  candidate: Candidate,
  onOpenCandidate: OpenCandidateHandler,
) => ReactNode;

const CELL_RENDERERS: Record<string, CellRenderer> = {
  name: (value, candidate, onOpenCandidate) =>
    formatName(value, candidate, onOpenCandidate),
  id: (value) => formatId(value),
  email: (value) => formatEmail(value),
  reason: (value) => formatReason(value),
  date: (value) => formatDate(value),
  career: (value) => formatCareer(value),
  graduated: (value) => formatGraduated(value),
  location: (value) => formatLocation(value),
  cv_zonajobs: (value) => renderCvLinkCell(value),
  cv_bumeran: (value) => renderCvLinkCell(value),
};

export function renderCandidateCell(
  key: string,
  value: unknown,
  candidate: Candidate,
  onOpenCandidate: OpenCandidateHandler,
): ReactNode {
  const render = CELL_RENDERERS[key];
  if (render) return render(value, candidate, onOpenCandidate);
  return formatCell(value);
}
