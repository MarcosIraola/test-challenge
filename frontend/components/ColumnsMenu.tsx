"use client";

import { useEffect, useRef, useState } from "react";
import { getColumnLabel } from "@/lib/columns";
import type { ColumnsConfig } from "@/lib/types";

type Props = {
  columns: ColumnsConfig;
  onChange: (next: ColumnsConfig) => void;
  onReset: () => void;
  isDefault: boolean;
};

export default function ColumnsMenu({
  columns,
  onChange,
  onReset,
  isDefault,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const entries = Object.entries(columns);
  const visibleCount = entries.filter(([, v]) => v).length;
  const total = entries.length;

  function toggle(key: string) {
    onChange({ ...columns, [key]: !columns[key] });
  }

  function showAll() {
    const next: ColumnsConfig = {};
    for (const key of Object.keys(columns)) next[key] = true;
    onChange(next);
  }

  function hideAll() {
    const next: ColumnsConfig = {};
    for (const key of Object.keys(columns)) next[key] = false;
    onChange(next);
  }

  return (
    <div className="columns-menu" ref={wrapperRef}>
      <button
        type="button"
        className="btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
          <path d="M15 4v16" />
        </svg>
        Displayed columns
        <span className="columns-count">
          {visibleCount}/{total}
        </span>
      </button>

      {open && (
        <div
          className="columns-popover"
          role="dialog"
          aria-label="Visible columns"
        >
          <div className="columns-popover-header">
            <span>Visible columns</span>
            <button
              type="button"
              className="link-btn"
              onClick={onReset}
              disabled={isDefault}
              title="Reset to default"
            >
              Reset
            </button>
          </div>

          <div className="columns-popover-body">
            {entries.map(([key, visible]) => (
              <label
                key={key}
                className={`column-option${visible ? " is-on" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => toggle(key)}
                />
                <span>{getColumnLabel(key)}</span>
              </label>
            ))}
          </div>

          <div className="columns-popover-footer">
            <button type="button" className="link-btn" onClick={showAll}>
              Show all
            </button>
            <button type="button" className="link-btn" onClick={hideAll}>
              Hide all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
