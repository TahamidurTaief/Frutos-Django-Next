"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

const statusColors = {
  active:      "bg-emerald-50 text-emerald-700",
  completed:   "bg-emerald-50 text-emerald-700",
  delivered:   "bg-emerald-50 text-emerald-700",
  published:   "bg-emerald-50 text-emerald-700",
  paid:        "bg-emerald-50 text-emerald-700",
  approved:    "bg-emerald-50 text-emerald-700",
  processing:  "bg-blue-50 text-blue-700",
  in_transit:  "bg-blue-50 text-blue-700",
  shipped:     "bg-indigo-50 text-indigo-700",
  pending:     "bg-amber-50 text-amber-700",
  unpaid:      "bg-amber-50 text-amber-700",
  draft:       "bg-slate-100 text-slate-600",
  inactive:    "bg-slate-100 text-slate-600",
  archived:    "bg-slate-100 text-slate-600",
  cancelled:   "bg-red-50 text-red-700",
  refunded:    "bg-red-50 text-red-700",
  rejected:    "bg-red-50 text-red-700",
  suspended:   "bg-orange-50 text-orange-700",
  seller:      "bg-purple-50 text-purple-700",
  vendor:      "bg-indigo-50 text-indigo-700",
  wholesaler:  "bg-cyan-50 text-cyan-700",
  affiliate:   "bg-pink-50 text-pink-700",
  customer:    "bg-slate-50 text-slate-700",
  admin:       "bg-red-50 text-red-700",
};

/**
 * Dual-mode DataTable: supports client-side (default) and server-side pagination.
 */
export default function DataTable({
  columns,
  data,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
  onRowClick,
  actions,
  extraFilters,
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
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
      {/* Search & Filters */}
      {(searchable || extraFilters) && (
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center">
          {searchable && (
            <div className="relative max-w-xs flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
            </div>
          )}
          {extraFilters && (
            <div className="flex items-center gap-2">
              {extraFilters}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'} ${
                    col.sortable !== false ? "cursor-pointer select-none hover:text-slate-700" : ""
                  }`}
                >
                  <span className={`flex items-center gap-1 ${col.align === 'left' ? 'justify-start' : col.align === 'right' ? 'justify-end' : 'justify-center'}`}>
                    {col.label}
                    {col.sortable !== false && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-10 text-center text-sm font-medium text-slate-400">
                  No results found
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-3.5 whitespace-nowrap text-slate-700 ${col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'}`}>
                      {col.render ? col.render(row[col.key], row) : (
                        col.type === "status" ? (
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[row[col.key]] || "bg-slate-100 text-slate-600"}`}>
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
                    <td className="px-5 py-3.5 text-right">
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
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 text-sm text-slate-500">
        <span className="text-xs font-medium">
          {total === 0 ? "0 results" : `${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, total)} of ${total}`}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => goToPage(1)} disabled={activePage === 1} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors">
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => goToPage(Math.max(1, activePage - 1))} disabled={activePage === 1} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-semibold text-slate-600">{activePage} / {totalPages}</span>
          <button onClick={() => goToPage(Math.min(totalPages, activePage + 1))} disabled={activePage === totalPages} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => goToPage(totalPages)} disabled={activePage === totalPages} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors">
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
