"use client";
// components/ui/LocationAutocomplete.tsx
// Reusable address autocomplete using Nominatim — no API key needed

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";

interface Suggestion {
  place_id: number;
  display_name: string;
  // We build a short label ourselves
  short: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

function buildShortLabel(display_name: string): string {
  // Nominatim returns very long strings like:
  // "Dhaka, Dhaka District, Dhaka Division, Bangladesh"
  // We trim to the first 2-3 meaningful parts
  const parts = display_name.split(", ");
  if (parts.length <= 3) return display_name;
  // Keep first part + last part (usually the country)
  return `${parts[0]}, ${parts[parts.length - 1]}`;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Start typing a city or address...",
  id,
  className = "",
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep internal query in sync if parent changes value externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(q)}` +
        `&format=json` +
        `&limit=6` +
        `&addressdetails=0`;

      const res = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "JBscape/1.0 (contact@jbscape.com)",
        },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      const results: Suggestion[] = data.map((item: any) => ({
        place_id: item.place_id,
        display_name: item.display_name,
        short: buildShortLabel(item.display_name),
      }));

      // Deduplicate by short label
      const seen = new Set<string>();
      const unique = results.filter((r) => {
        if (seen.has(r.short)) return false;
        seen.add(r.short);
        return true;
      });

      setSuggestions(unique);
      setOpen(unique.length > 0);
      setHighlighted(-1);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    onChange(q); // keep parent in sync as user types

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(q);
    }, 300); // 300ms debounce — well within Nominatim's 1 req/sec limit
  }

  function selectSuggestion(s: Suggestion) {
    setQuery(s.short);
    onChange(s.short);
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleClear() {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && suggestions[highlighted]) {
        selectSuggestion(suggestions[highlighted]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none shrink-0" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`
            w-full pl-9 pr-9 py-2 text-sm rounded-md border border-input bg-background
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            placeholder:text-muted-foreground transition-shadow
          `}
        />
        {/* Right side: spinner or clear button */}
        <div className="absolute right-3 flex items-center">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={(e) => {
                // mousedown fires before blur, so we prevent blur from closing first
                e.preventDefault();
                selectSuggestion(s);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`
                w-full text-left px-3 py-2.5 text-sm flex items-start gap-2.5 transition-colors
                ${highlighted === i
                  ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }
              `}
            >
              <MapPin className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${highlighted === i ? "text-violet-500" : "text-gray-400"}`} />
              <div className="min-w-0">
                <p className="font-medium truncate">{s.short}</p>
                {s.display_name !== s.short && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{s.display_name}</p>
                )}
              </div>
            </button>
          ))}
          <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400">Powered by OpenStreetMap</p>
          </div>
        </div>
      )}
    </div>
  );
}