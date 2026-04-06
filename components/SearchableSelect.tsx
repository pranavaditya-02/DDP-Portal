// components/SearchableSelect.tsx
"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

type Option = { value: string; label: string };

type SearchableSelectProps = {
  label: string;
  name: string;
  value: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  onChange: (name: string, value: string) => void;
};

export function SearchableSelect({
  label, name, value, options, placeholder = "Choose an option",
  required, onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (opt: Option) => {
    onChange(name, opt.value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div ref={wrapRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : handleOpen())}
          className={`w-full flex items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-sm text-left outline-none transition
            ${open
              ? "border-indigo-400 ring-3 ring-indigo-100"
              : "border-gray-200 hover:border-indigo-300"
            }`}
        >
          <span className={selected ? "text-gray-800" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
              />
            </div>

            {/* Options */}
            <ul className="max-h-52 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <li className="py-3 text-center text-sm text-gray-400">No results found</li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition
                      ${opt.value === value
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                  >
                    {opt.label}
                    {opt.value === value && <Check size={13} className="text-indigo-500" />}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}