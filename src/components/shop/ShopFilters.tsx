"use client";

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

  function setParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-brand-umber/10 pb-6">
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
          : "border-brand-umber/20 text-brand-charcoal hover:bg-brand-sky-light"
      }`}
    >
      {children}
    </button>
  );
}
