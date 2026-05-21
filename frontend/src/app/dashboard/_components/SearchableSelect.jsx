"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

/**
 * SearchableSelect — custom dropdown with built-in search, replacing native <select>.
 *
 * Props:
 *   options         [{ value, label }]   — option list
 *   value           string | number      — currently selected value
 *   onChange        (value) => void      — called on selection
 *   placeholder     string              — shown when nothing is selected
 *   searchPlaceholder string            — search input hint
 *   disabled        boolean
 *   required        boolean             — uses hidden native input for HTML5 validation
 *   name            string              — name for the hidden input
 *   className       string              — extra classes on the trigger button
 */
export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  required = false,
  name,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));
  const filtered = search
    ? options.filter(o => o.label?.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") { setOpen(false); setSearch(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Auto-focus search when opened
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleSelect = (optValue) => {
    onChange?.(optValue);
    setOpen(false);
    setSearch("");
  };

  const toggleOpen = () => {
    if (!disabled) setOpen(o => !o);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-left focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selected ? "text-gray-900 dark:text-white" : "text-gray-400"} ${className}`}
      >
        <span className="truncate flex-1">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Hidden native input for HTML5 required validation */}
      {required && (
        <input
          tabIndex={-1}
          required={required}
          name={name}
          value={value ?? ""}
          onChange={() => {}}
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full opacity-0 pointer-events-none h-0"
        />
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 w-full mt-1 min-w-[180px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400">No options found</div>
            ) : (
              filtered.map(o => {
                const isSelected = String(o.value) === String(value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => handleSelect(o.value)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? "bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    <span className="truncate flex-1">{o.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
