"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/brand";
import { PRODUCT_SORTS } from "@/lib/product-sort";

const SEARCH_DEBOUNCE_MS = 350;

const PRICE_BANDS = [
  { label: "Any price", min: undefined, max: undefined },
  { label: "Under Rs. 3,500", min: undefined, max: 3500 },
  { label: "Rs. 3,500 - 5,000", min: 3500, max: 5000 },
  { label: "Over Rs. 5,000", min: 5000, max: undefined },
];

export function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeMin = searchParams.get("min");
  const activeMax = searchParams.get("max");
  const activeNew = searchParams.get("new") === "true";
  const activeSort = searchParams.get("sort") ?? "newest";
  const activeQuery = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(activeQuery);

  const setParams = useCallback(
    (updates: Record<string, string | undefined>, { replace = false } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      });
      const url = `${pathname}?${params.toString()}`;
      // Typing replaces rather than pushes, so every keystroke doesn't become
      // its own back-button entry.
      if (replace) router.replace(url);
      else router.push(url);
    },
    [router, pathname, searchParams]
  );

  // Instant search: the typed term syncs to the URL after a short pause. The
  // trimmed comparison against the URL's own `q` is what stops this from
  // looping — once the URL catches up, there is nothing left to sync.
  useEffect(() => {
    if (searchInput.trim() === activeQuery) return;
    const timer = setTimeout(() => {
      setParams({ q: searchInput.trim() || undefined }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, activeQuery, setParams]);

  return (
    <div className="space-y-4 border-b border-brand-umber/10 pb-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ q: searchInput.trim() || undefined });
        }}
        className="flex max-w-sm gap-2"
      >
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <input
          id="shop-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search earrings, rings…"
          className="w-full rounded-full border border-brand-umber/20 bg-brand-ivory px-4 py-2 font-body text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-umber focus:outline-none"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="shrink-0 rounded-full border border-brand-umber/30 px-4 py-2 font-body text-sm font-medium text-brand-umber-dark hover:bg-brand-sky/10"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <FilterChip active={activeCategory === ""} onClick={() => setParams({ category: undefined })}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.slug} active={activeCategory === c.slug} onClick={() => setParams({ category: c.slug })}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        <select
          aria-label="Filter by price"
          className="rounded-full border border-brand-umber/20 bg-brand-ivory px-4 py-2 font-body text-sm text-brand-charcoal"
          value={`${activeMin ?? ""}-${activeMax ?? ""}`}
          onChange={(e) => {
            const band = PRICE_BANDS.find((b) => `${b.min ?? ""}-${b.max ?? ""}` === e.target.value);
            setParams({ min: band?.min?.toString(), max: band?.max?.toString() });
          }}
        >
          {PRICE_BANDS.map((band) => (
            <option key={band.label} value={`${band.min ?? ""}-${band.max ?? ""}`}>
              {band.label}
            </option>
          ))}
        </select>

        <FilterChip active={activeNew} onClick={() => setParams({ new: activeNew ? undefined : "true" })}>
          New
        </FilterChip>

        <select
          aria-label="Sort products"
          className="rounded-full border border-brand-umber/20 bg-brand-ivory px-4 py-2 font-body text-sm text-brand-charcoal sm:ml-auto"
          value={activeSort}
          onChange={(e) => setParams({ sort: e.target.value === "newest" ? undefined : e.target.value })}
        >
          {PRODUCT_SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 font-body text-sm transition ${
        active
          ? "border-brand-umber bg-brand-umber text-brand-ivory"
          : "border-brand-umber/20 text-brand-charcoal hover:bg-brand-sky/10"
      }`}
    >
      {children}
    </button>
  );
}
