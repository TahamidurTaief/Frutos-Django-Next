"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

const statusColors = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  in_transit: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  shipped: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  unpaid: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  refunded: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  suspended: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  seller: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  vendor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400",
  wholesaler: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
  affiliate: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400",
  customer: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  admin: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

/**
 * Dual-mode DataTable: supports client-side (default) and server-side pagination.
 *
 * Server-side props: serverSide, totalItems, currentPage, onSearch, onPageChange, loading
 */
export default function DataTable({
  columns,
  data,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
  onRowClick,
  actions,
  // Server-side mode
  serverSide = false,
  totalItems,
  currentPage,
  onSearch,
  onPageChange,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Client-side filtering
  const filtered = useMemo(() => {
    if (serverSide || !search || searchKeys.length === 0) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
    );
  }, [data, search, searchKeys, serverSide]);

  // Client-side sorting
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const total = serverSide ? (totalItems ?? 0) : sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activePage = serverSide ? (currentPage ?? 1) : page;
  const paginated = serverSide ? (data || []) : sorted.slice((activePage - 1) * pageSize, activePage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    if (!serverSide) setPage(1);
  };

  const handleSearch = useCallback((value) => {
    setSearch(value);
    if (serverSide) {
      onSearch?.(value);
    } else {
      setPage(1);
    }
  }, [serverSide, onSearch]);

  const goToPage = useCallback((p) => {
    if (serverSide) {
      onPageChange?.(p);
    } else {
      setPage(p);
    }
  }, [serverSide, onPageChange]);

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
      {/* Search */}
      {searchable && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-950/60 z-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap ${
                    col.sortable !== false ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" : ""
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-2.5 text-right font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-400">
                  No results found
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-100 dark:border-gray-800/50 last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {col.render ? col.render(row[col.key], row) : (
                        col.type === "status" ? (
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[row[col.key]] || "bg-gray-100 text-gray-600"}`}>
                            {String(row[col.key]).replace(/_/g, " ")}
                          </span>
                        ) : col.type === "currency" ? (
                          `$${Number(row[col.key]).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        ) : (
                          String(row[col.key] ?? "")
                        )
                      )}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-2.5 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
        <span>
          {total === 0 ? "0 results" : `${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, total)} of ${total}`}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => goToPage(1)} disabled={activePage === 1} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button onClick={() => goToPage(Math.max(1, activePage - 1))} disabled={activePage === 1} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs">{activePage} / {totalPages}</span>
          <button onClick={() => goToPage(Math.min(totalPages, activePage + 1))} disabled={activePage === totalPages} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => goToPage(totalPages)} disabled={activePage === totalPages} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
