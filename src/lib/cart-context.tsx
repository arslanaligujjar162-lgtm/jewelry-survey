"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "1720_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
  /** False until the cart has finished reading localStorage on mount. Check
   * this before treating an empty `lines` array as a genuinely empty cart —
   * a fresh page load (not client-side nav) starts with `lines: []` for one
   * render even when localStorage has items. */
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** One cart line per product + ring size + colour. */
export function lineKey(line: Pick<CartLine, "product_id" | "ring_size" | "colour">) {
  return `${line.product_id}::${line.ring_size ?? ""}::${line.colour ?? ""}`;
}

/**
 * Stock is held per product, not per size or colour, so a line may only grow
 * to what the product's other lines leave free.
 */
function clampToStock(lines: CartLine[], key: string, productId: string, maxStock: number, quantity: number) {
  const elsewhere = lines
    .filter((l) => l.product_id === productId && lineKey(l) !== key)
    .reduce((sum, l) => sum + l.quantity, 0);
  return Math.max(0, Math.min(quantity, maxStock - elsewhere));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const key = lineKey(line);
      const existing = prev.find((l) => lineKey(l) === key);
      const wanted = (existing?.quantity ?? 0) + line.quantity;
      const quantity = clampToStock(prev, key, line.product_id, line.max_stock, wanted);
      if (quantity === 0) return prev;
      if (existing) return prev.map((l) => (lineKey(l) === key ? { ...l, quantity } : l));
      return [...prev, { ...line, quantity }];
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) =>
        lineKey(l) === key
          ? { ...l, quantity: Math.max(1, clampToStock(prev, key, l.product_id, l.max_stock, quantity)) }
          : l
      )
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  const value: CartContextValue = {
    lines,
    addLine,
    removeLine,
    updateQuantity,
    clear,
    subtotal,
    itemCount,
    hydrated,
    drawerOpen,
    openDrawer,
    closeDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
