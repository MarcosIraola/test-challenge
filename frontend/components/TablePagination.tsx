"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PAGE_SIZE_OPTIONS,
  type PageSize,
} from "@/lib/table-pagination";

type Props = {
  pageIndex: number;
  pageSize: PageSize;
  totalItems: number;
  onPageIndexChange: (index: number) => void;
  onPageSizeChange: (size: PageSize) => void;
};

export default function TablePagination({
  pageIndex,
  pageSize,
  totalItems,
  onPageIndexChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeIndex = Math.min(pageIndex, totalPages - 1);
  const from = totalItems === 0 ? 0 : safeIndex * pageSize + 1;
  const to = Math.min((safeIndex + 1) * pageSize, totalItems);

  return (
    <div className="table-pagination">
      <div className="table-pagination-size">
        <label htmlFor="page-size-select" className="table-pagination-label">
          Rows
        </label>
        <select
          id="page-size-select"
          className="table-pagination-select"
          value={pageSize}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (PAGE_SIZE_OPTIONS.includes(v as PageSize)) {
              onPageSizeChange(v as PageSize);
            }
          }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <p className="table-pagination-range" aria-live="polite">
        {totalItems === 0
          ? "0 rows"
          : `Showing ${from}–${to} of ${totalItems}`}
      </p>

      <div className="table-pagination-nav">
        <button
          type="button"
          className="table-pagination-btn"
          aria-label="Previous page"
          disabled={safeIndex <= 0}
          onClick={() => onPageIndexChange(safeIndex - 1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="table-pagination-page">
          Page {safeIndex + 1} / {totalPages}
        </span>
        <button
          type="button"
          className="table-pagination-btn"
          aria-label="Next page"
          disabled={safeIndex >= totalPages - 1}
          onClick={() => onPageIndexChange(safeIndex + 1)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
