"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/brand";

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
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  function setParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

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
        <button
          type="submit"
          className="shrink-0 rounded-full border border-brand-umber/30 px-4 py-2 font-body text-sm font-medium text-brand-umber-dark hover:bg-brand-sky"
        >
          Search
        </button>
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
          : "border-brand-umber/20 text-brand-charcoal hover:bg-brand-sky"
      }`}
    >
      {children}
    </button>
  );
}
