"use client";

import type { Candidate } from "@/lib/types";
import { getColumnLabel } from "@/lib/columns";
import type { ReactNode } from "react";
import { getGoogleMapsSearchUrl, isHttpUrl } from "@/utils/candidate-links";

type Props = {
  candidate: Candidate;
  onClose: () => void;
};

function formatValue(key: string, value: unknown): ReactNode {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value, null, 2);

  const text = String(value).trim();

  if ((key === "cv_zonajobs" || key === "cv_bumeran") && isHttpUrl(text)) {
    return (
      <a
        href={text}
        target="_blank"
        rel="noopener noreferrer"
        className="cell-link"
      >
        Open CV
      </a>
    );
  }

  if (key === "location") {
    const mapsUrl = getGoogleMapsSearchUrl(text);
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="cell-link"
      >
        {text}
      </a>
    );
  }

  return text;
}

export default function CandidateDetailsModal({ candidate, onClose }: Props) {
  const entries = Object.entries(candidate);
  const title =
    typeof candidate.name === "string" && candidate.name.trim().length > 0
      ? candidate.name
      : candidate.id;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal candidate-details-modal">
        <div className="modal-header">
          <h2>Candidate details</h2>
          <p>{title}</p>
        </div>

        <div className="modal-body">
          <dl className="candidate-details-list">
            {entries.map(([key, value]) => (
              <div key={key} className="candidate-details-item">
                <dt>{getColumnLabel(key)}</dt>
                <dd>{formatValue(key, value)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
