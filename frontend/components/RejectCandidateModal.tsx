"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { addRejectionReason, getRejectionReasons } from "@/lib/api";

type Props = {
  candidateName?: string;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
};

export default function RejectCandidateModal({
  candidateName,
  onCancel,
  onConfirm,
}: Props) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newReason, setNewReason] = useState("");
  const [addingReason, setAddingReason] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadingReasons(true);
        const data = await getRejectionReasons();
        if (cancelled) return;
        setReasons(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load rejection reasons",
        );
      } finally {
        if (!cancelled) setLoadingReasons(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleReason(reason: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
  }

  async function handleAddReason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newReason.trim();
    if (!trimmed) return;

    setAddError(null);
    setAddingReason(true);
    try {
      const updated = await addRejectionReason(trimmed);
      setReasons(updated);
      setSelected((prev) => new Set(prev).add(trimmed));
      setNewReason("");
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Failed to add rejection reason",
      );
    } finally {
      setAddingReason(false);
    }
  }

  async function handleConfirm() {
    if (selected.size === 0) {
      setError("Please select at least one rejection reason");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const ordered = reasons.filter((r) => selected.has(r));
      await onConfirm(ordered.join(", "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject candidate");
      setSubmitting(false);
    }
  }

  const isBusy = submitting || addingReason;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2>Reject candidate</h2>
          <p>
            {candidateName
              ? `Select one or more reasons for rejecting ${candidateName}.`
              : "Select one or more rejection reasons."}
          </p>
        </div>

        <div className="modal-body">
          {loadingReasons && (
            <div className="reasons-loading">Loading reasons…</div>
          )}

          {!loadingReasons && reasons.length === 0 && (
            <div className="reasons-empty">No rejection reasons available.</div>
          )}

          {!loadingReasons && reasons.length > 0 && (
            <ul className="reasons-list">
              {reasons.map((reason) => {
                const checked = selected.has(reason);
                return (
                  <li key={reason}>
                    <label
                      className={`reason-option${checked ? " is-on" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleReason(reason)}
                        disabled={isBusy}
                      />
                      <span>{reason}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <form className="add-reason-form" onSubmit={handleAddReason}>
            <input
              type="text"
              className="add-reason-input"
              placeholder="Don't see it? Add a new reason…"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              disabled={isBusy}
              maxLength={120}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={isBusy || newReason.trim().length === 0}
              title="Add reason"
            >
              <Plus size={14} aria-hidden="true" />
              <span>{addingReason ? "Adding…" : "Add"}</span>
            </button>
          </form>

          {addError && <div className="modal-error">{addError}</div>}
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-footer">
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isBusy || selected.size === 0}
          >
            {submitting ? "Rejecting…" : "Confirm reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
