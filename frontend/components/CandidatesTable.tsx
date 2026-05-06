"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  MoreHorizontal,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import StatusBadge from "@/components/ui/StatusBadge";
import { getColumnLabel, getVisibleColumnKeys } from "@/lib/columns";
import type { Candidate, ColumnsConfig } from "@/lib/types";
import { renderCandidateCell } from "@/utils/candidate-cell-renderers";

const candidateColumnHelper = createColumnHelper<Candidate>();

const SORTABLE_KEYS = new Set(["name", "email", "date", "age"]);

function parseDateMs(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const raw = String(value).trim();
  const d = dayjs(raw.replace(" ", "T"));
  if (!d.isValid()) return null;
  return d.valueOf();
}

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
  const ta = parseDateMs(rowA.getValue(columnId));
  const tb = parseDateMs(rowB.getValue(columnId));
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
  onApprove: (candidate: Candidate) => void;
  onReject: (candidate: Candidate) => void;
  onOpenCandidate: (candidate: Candidate) => void;
};

export default function CandidatesTable({
  candidates,
  columns,
  pendingId,
  onApprove,
  onReject,
  onOpenCandidate,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const visibleKeys = getVisibleColumnKeys(columns);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".actions-menu-container")) return;
      setOpenMenuId(null);
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

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

    const statusColumn = candidateColumnHelper.display({
      id: "status",
      enableSorting: false,
      header: () => "Status",
      cell: (info) => <StatusBadge reason={info.row.original.reason} />,
    });

    const actionsColumn = candidateColumnHelper.display({
      id: "actions",
      enableSorting: false,
      header: () => "Actions",
      cell: (info) => {
        const candidate = info.row.original;
        const isRejected = candidate.reason !== "";
        const isPending = pendingId === candidate.id;
        const isOpen = openMenuId === candidate.id;

        function handleApprove() {
          setOpenMenuId(null);
          onApprove(candidate);
        }

        function handleReject() {
          setOpenMenuId(null);
          onReject(candidate);
        }

        return (
          <div className="actions-menu-container">
            <button
              type="button"
              className="actions-trigger"
              aria-label="Open actions"
              title="Actions"
              onClick={() =>
                setOpenMenuId((prev) =>
                  prev === candidate.id ? null : candidate.id,
                )
              }
              disabled={isPending}
            >
              <MoreHorizontal size={16} aria-hidden="true" />
            </button>

            {isOpen && (
              <div className="actions-menu">
                {isRejected && (
                  <button
                    type="button"
                    className="actions-menu-item"
                    onClick={handleApprove}
                    disabled={isPending}
                  >
                    <Check size={14} aria-hidden="true" />
                    <span>Approve</span>
                  </button>
                )}
                <button
                  type="button"
                  className="actions-menu-item actions-menu-item-danger"
                  onClick={handleReject}
                  disabled={isPending}
                >
                  <X size={14} aria-hidden="true" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        );
      },
    });

    return [...dataColumns, statusColumn, actionsColumn];
  }, [
    onApprove,
    onReject,
    onOpenCandidate,
    openMenuId,
    pendingId,
    visibleKeys,
  ]);

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
      <table className="candidates-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
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
                <td key={cell.id}>
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
