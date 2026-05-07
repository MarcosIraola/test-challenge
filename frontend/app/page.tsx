"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CandidatesTable from "@/components/CandidatesTable";
import CandidateDetailsModal from "@/components/CandidateDetailsModal";
import ColumnsMenu from "@/components/ColumnsMenu";
import RejectCandidateModal from "@/components/RejectCandidateModal";
import emiLogoColor from "@/assets/emi-logo-color.png";
import {
  readStoredReviewPlacement,
  writeReviewPlacement,
  type ReviewColumnPlacement,
} from "@/lib/review-column-placement";
import {
  approveCandidate,
  getCandidates,
  getColumns,
  rejectCandidate,
} from "@/lib/api";
import type { Candidate, ColumnsConfig, StatusFilter } from "@/lib/types";

const COLUMNS_STORAGE_KEY = "candidates:columns";

function readStoredColumns(): Partial<ColumnsConfig> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function mergeColumns(
  base: ColumnsConfig,
  override: Partial<ColumnsConfig> | null,
): ColumnsConfig {
  if (!override) return base;
  const next: ColumnsConfig = {};
  for (const key of Object.keys(base)) {
    next[key] = key in override ? Boolean(override[key]) : base[key];
  }
  return next;
}

function columnsEqual(a: ColumnsConfig, b: ColumnsConfig): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => a[k] === b[k]);
}

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [defaultColumns, setDefaultColumns] = useState<ColumnsConfig>({});
  const [columns, setColumns] = useState<ColumnsConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Candidate | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Candidate | null>(null);
  const [reviewPlacement, setReviewPlacement] =
    useState<ReviewColumnPlacement>("right");

  useEffect(() => {
    const stored = readStoredReviewPlacement();
    if (stored) setReviewPlacement(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [candidatesData, columnsData] = await Promise.all([
          getCandidates(),
          getColumns(),
        ]);
        if (cancelled) return;
        setCandidates(candidatesData);
        setDefaultColumns(columnsData);
        setColumns(mergeColumns(columnsData, readStoredColumns()));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleColumnsChange(next: ColumnsConfig) {
    setColumns(next);
    try {
      window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function handleColumnsReset() {
    setColumns(defaultColumns);
    try {
      window.localStorage.removeItem(COLUMNS_STORAGE_KEY);
    } catch {}
  }

  function handleReviewPlacementChange(next: ReviewColumnPlacement) {
    setReviewPlacement(next);
    writeReviewPlacement(next);
  }

  const isDefaultColumns = useMemo(
    () => columnsEqual(columns, defaultColumns),
    [columns, defaultColumns],
  );

  const filteredCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (statusFilter === "approved" && c.reason !== "") return false;
      if (statusFilter === "rejected" && c.reason === "") return false;

      if (term) {
        const name = typeof c.name === "string" ? c.name.toLowerCase() : "";
        const email = typeof c.email === "string" ? c.email.toLowerCase() : "";
        const id = typeof c.id === "string" ? c.id.toLowerCase() : "";
        if (!name.includes(term) && !email.includes(term) && !id.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, statusFilter, search]);

  function replaceCandidate(updated: Candidate) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    );
  }

  async function handleApprove(candidate: Candidate) {
    setPendingId(candidate.id);
    try {
      const updated = await approveCandidate(candidate.id);
      replaceCandidate(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setPendingId(null);
    }
  }

  async function handleConfirmReject(reason: string) {
    if (!rejectTarget) return;
    setPendingId(rejectTarget.id);
    try {
      const updated = await rejectCandidate(rejectTarget.id, reason);
      replaceCandidate(updated);
      setRejectTarget(null);
    } finally {
      setPendingId(null);
    }
  }

  const total = candidates.length;
  const approved = candidates.filter((c) => c.reason === "").length;
  const rejected = total - approved;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <Image
              src={emiLogoColor}
              alt="Emi Labs"
              className="brand-logo"
              priority
            />
          </div>
          <span className="brand-name">by Marcos Iraola</span>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <span className="hero-eyebrow">Recruiter workspace</span>
          <h1>
            Review and decide on <span className="accent">your candidates</span>
          </h1>
          <p>
            Browse applications, approve in one click, or reject with one or
            multiple structured reasons. Stay aligned with your team without
            leaving the table.
          </p>

          <div className="stats">
            <div className="stat is-brand">
              <span className="stat-label">Total</span>
              <span className="stat-value">{total}</span>
            </div>
            <div className="stat is-success">
              <span className="stat-label">Approved</span>
              <span className="stat-value">{approved}</span>
            </div>
            <div className="stat is-coral">
              <span className="stat-label">Rejected</span>
              <span className="stat-value">{rejected}</span>
            </div>
          </div>
        </section>

        <div className="toolbar">
          <div
            className="filter-group"
            role="tablist"
            aria-label="Status filter"
          >
            {(["all", "approved", "rejected"] as StatusFilter[]).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  className={statusFilter === value ? "active" : ""}
                  onClick={() => setStatusFilter(value)}
                >
                  {value === "all"
                    ? "All"
                    : value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ),
            )}
          </div>

          <div className="search">
            <span className="search-icon" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, email or id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div
            className="filter-group"
            role="radiogroup"
            aria-label="Review column position"
          >
            <button
              type="button"
              className={reviewPlacement === "left" ? "active" : ""}
              aria-pressed={reviewPlacement === "left"}
              onClick={() => handleReviewPlacementChange("left")}
            >
              Review left
            </button>
            <button
              type="button"
              className={reviewPlacement === "right" ? "active" : ""}
              aria-pressed={reviewPlacement === "right"}
              onClick={() => handleReviewPlacementChange("right")}
            >
              Review right
            </button>
          </div>

          <div className="spacer" />

          <span className="summary">
            {filteredCandidates.length} of {total} shown
          </span>

          <ColumnsMenu
            columns={columns}
            onChange={handleColumnsChange}
            onReset={handleColumnsReset}
            isDefault={isDefaultColumns}
          />
        </div>

        <div className="card">
          {loading && <div className="loading">Loading candidates</div>}
          {!loading && error && <div className="error">{error}</div>}
          {!loading && !error && filteredCandidates.length === 0 && (
            <div className="empty">
              No candidates match the current filters.
            </div>
          )}
          {!loading && !error && filteredCandidates.length > 0 && (
            <CandidatesTable
              candidates={filteredCandidates}
              columns={columns}
              pendingId={pendingId}
              reviewPlacement={reviewPlacement}
              onApprove={handleApprove}
              onReject={(c) => setRejectTarget(c)}
              onOpenCandidate={(c) => setDetailsTarget(c)}
            />
          )}
        </div>
      </main>

      {rejectTarget && (
        <RejectCandidateModal
          candidateName={
            typeof rejectTarget.name === "string"
              ? rejectTarget.name
              : undefined
          }
          onCancel={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
        />
      )}

      {detailsTarget && (
        <CandidateDetailsModal
          candidate={detailsTarget}
          onClose={() => setDetailsTarget(null)}
        />
      )}
    </>
  );
}
