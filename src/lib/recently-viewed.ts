const STORAGE_KEY = "1720_recently_viewed_v1";
const MAX_ITEMS = 8;

export interface RecentlyViewedItem {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock_count: number;
  is_new: boolean;
  material_spec: string;
}

export function recordRecentlyViewed(item: RecentlyViewedItem) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
    const withoutCurrent = existing.filter((i) => i.id !== item.id);
    const updated = [item, ...withoutCurrent].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}

export function getRecentlyViewed(excludeProductId?: string): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
    return excludeProductId ? items.filter((i) => i.id !== excludeProductId) : items;
  } catch {
    return [];
  }
}
