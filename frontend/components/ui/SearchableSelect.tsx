// components/ui/SearchableSelect.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "@/lib/utils";

interface SearchableSelectProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchableSelect({
  options,
  selected,
  onChange,
  placeholder = "Select an option",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useRef(`ss-listbox-${Math.random().toString(36).slice(2)}`).current;

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Filtered options
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [options, searchTerm]
  );

  // Open → focus the search input and set initial highlight
  useEffect(() => {
    if (isOpen) {
      // Focus the search box
      setTimeout(() => inputRef.current?.focus(), 0);

      // If current selection exists in the filtered list, highlight it; else first item
      const initial =
        selected && filteredOptions.length
          ? Math.max(0, filteredOptions.findIndex((o) => o === selected))
          : filteredOptions.length > 0
          ? 0
          : -1;
      setHighlightedIndex(initial);
    } else {
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  }, [isOpen, filteredOptions, selected]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const onToggleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((idx) =>
        idx < filteredOptions.length - 1 ? idx + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((idx) =>
        idx > 0 ? idx - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length
      ) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      {/* Toggle button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        className={clsx(
          "relative flex w-full items-center rounded-md border border-gray-300 bg-white h-12",
          "pl-4 pr-10 text-left text-base text-gray-900",
          "focus:outline-none focus:ring-1 focus:ring-offset-0",
          "focus:ring-[var(--color-login-btn,#10B981)]"
        )}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={onToggleKeyDown}
      >
        <span className={clsx("truncate", !selected && "text-gray-500")}>
          {selected || placeholder}
        </span>

        {/* Chevron (always visible, rotates on open) */}
        <span
          className={clsx(
            "pointer-events-none absolute right-3 inset-y-0 flex items-center"
          )}
        >
          <svg
            className={clsx(
              "h-5 w-5 text-gray-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            {/* Heroicons mini chevron-down */}
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-35 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {/* Search box */}
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className={clsx(
                "w-full rounded-md border border-gray-300 px-3 py-2",
                "focus:outline-none focus:ring-1 "
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={onInputKeyDown}
            />
          </div>

          {/* Options */}
          <ul
            id={listboxId}
            role="listbox"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `${listboxId}-option-${highlightedIndex}`
                : undefined
            }
            className="max-h-60 overflow-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-sm text-gray-500 select-none">
                No results
              </li>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = option === selected;
                const isActive = idx === highlightedIndex;
                return (
                  <li
                    id={`${listboxId}-option-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    key={option}
                    className={clsx(
                      "cursor-pointer px-4 py-2 text-base",
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-800",
                      isSelected && "font-semibold"
                    )}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
