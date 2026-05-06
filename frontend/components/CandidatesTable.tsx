"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Check, MoreHorizontal, X } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getColumnLabel, getVisibleColumnKeys } from "@/lib/columns";
import type { Candidate, ColumnsConfig } from "@/lib/types";
import { renderCandidateCell } from "@/utils/candidate-cell-renderers";

const candidateColumnHelper = createColumnHelper<Candidate>();

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
    const dataColumns = visibleKeys.map((key) =>
      candidateColumnHelper.accessor((row) => row[key], {
        id: key,
        header: () => getColumnLabel(key),
        cell: (info) =>
          renderCandidateCell(
            key,
            info.getValue(),
            info.row.original,
            onOpenCandidate,
          ),
      }),
    );

    const statusColumn = candidateColumnHelper.display({
      id: "status",
      header: () => "Status",
      cell: (info) => <StatusBadge reason={info.row.original.reason} />,
    });

    const actionsColumn = candidateColumnHelper.display({
      id: "actions",
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
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-wrapper">
      <table className="candidates-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
