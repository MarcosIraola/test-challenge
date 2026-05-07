"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getColumnLabel, getVisibleColumnKeys } from "@/lib/columns";
import type { ReviewColumnPlacement } from "@/lib/review-column-placement";
import type { Candidate, ColumnsConfig } from "@/lib/types";
import { renderCandidateCell } from "@/utils/candidate-cell-renderers";
import { parseCandidateInstantMs } from "@/utils/candidate-datetime";

const candidateColumnHelper = createColumnHelper<Candidate>();

const SORTABLE_KEYS = new Set(["name", "email", "date", "age"]);

function parseAge(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

const sortString: SortingFn<Candidate> = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);
  const sa =
    a === undefined || a === null || a === ""
      ? ""
      : String(a).toLocaleLowerCase();
  const sb =
    b === undefined || b === null || b === ""
      ? ""
      : String(b).toLocaleLowerCase();
  return sa.localeCompare(sb, undefined, { numeric: true });
};

const sortDate: SortingFn<Candidate> = (rowA, rowB, columnId) => {
  const ta = parseCandidateInstantMs(rowA.getValue(columnId));
  const tb = parseCandidateInstantMs(rowB.getValue(columnId));
  if (ta === null && tb === null) return 0;
  if (ta === null) return 1;
  if (tb === null) return -1;
  return ta - tb;
};

const sortAge: SortingFn<Candidate> = (rowA, rowB, columnId) => {
  const na = parseAge(rowA.getValue(columnId));
  const nb = parseAge(rowB.getValue(columnId));
  if (na === null && nb === null) return 0;
  if (na === null) return 1;
  if (nb === null) return -1;
  return na - nb;
};

type Props = {
  candidates: Candidate[];
  columns: ColumnsConfig;
  pendingId: string | null;
  reviewPlacement: ReviewColumnPlacement;
  onApprove: (candidate: Candidate) => void;
  onReject: (candidate: Candidate) => void;
  onOpenCandidate: (candidate: Candidate) => void;
};

export default function CandidatesTable({
  candidates,
  columns,
  pendingId,
  reviewPlacement,
  onApprove,
  onReject,
  onOpenCandidate,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const visibleKeys = getVisibleColumnKeys(columns);

  const tableColumns = useMemo(() => {
    const dataColumns = visibleKeys.map((key) => {
      const sortable = SORTABLE_KEYS.has(key);
      const sortingFn =
        key === "date" ? sortDate : key === "age" ? sortAge : sortString;
      return candidateColumnHelper.accessor((row) => row[key], {
        id: key,
        enableSorting: sortable,
        sortingFn,
        header: ({ column }) => {
          const label = getColumnLabel(key);
          if (!sortable) return label;
          return (
            <button
              type="button"
              className="th-sort"
              onClick={column.getToggleSortingHandler()}
            >
              <span>{label}</span>
              {column.getIsSorted() === "asc" ? (
                <ArrowUp size={14} aria-hidden="true" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown size={14} aria-hidden="true" />
              ) : (
                <ArrowUpDown
                  size={14}
                  className="th-sort-icon-muted"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        },
        cell: (info) =>
          renderCandidateCell(
            key,
            info.getValue(),
            info.row.original,
            onOpenCandidate,
          ),
      });
    });

    const actionsColumn = candidateColumnHelper.display({
      id: "actions",
      enableSorting: false,
      header: () => "Review",
      cell: (info) => {
        const candidate = info.row.original;
        const isApproved = candidate.reason === "";
        const isPending = pendingId === candidate.id;

        function handleSwitchClick() {
          if (isApproved) {
            onReject(candidate);
          } else {
            onApprove(candidate);
          }
        }

        return (
          <div className="actions-cell-sticky-inner">
            <StatusBadge reason={candidate.reason} variant="icon" />
            <button
              type="button"
              role="switch"
              aria-checked={isApproved}
              aria-label={
                isApproved
                  ? "Reject candidate"
                  : "Approve candidate"
              }
              className={`approval-switch${isApproved ? " is-on" : ""}`}
              onClick={handleSwitchClick}
              disabled={isPending}
              title={isApproved ? "Reject candidate" : "Approve candidate"}
            >
              <span className="approval-switch-track" aria-hidden="true">
                <span className="approval-switch-thumb" />
              </span>
            </button>
          </div>
        );
      },
    });

    return reviewPlacement === "left"
      ? [actionsColumn, ...dataColumns]
      : [...dataColumns, actionsColumn];
  }, [
    onApprove,
    onReject,
    onOpenCandidate,
    pendingId,
    reviewPlacement,
    visibleKeys,
  ]);

  const actionsHeaderClass =
    reviewPlacement === "left" ? "th-actions-start" : "th-actions-end";
  const actionsCellClass =
    reviewPlacement === "left" ? "td-actions-start" : "td-actions-end";

  const table = useReactTable({
    data: candidates,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="table-wrapper">
      <table
        className="candidates-table"
        data-review-placement={reviewPlacement}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={
                    header.column.id === "actions" ? actionsHeaderClass : undefined
                  }
                  aria-sort={
                    header.column.getCanSort()
                      ? header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={
                    cell.column.id === "actions" ? actionsCellClass : undefined
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
