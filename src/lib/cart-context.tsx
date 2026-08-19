"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "1720_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (productId: string, ringSize?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, ringSize?: string | null) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: string, ringSize?: string | null) {
  return `${productId}::${ringSize ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

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
      const key = lineKey(line.product_id, line.ring_size);
      const existing = prev.find((l) => lineKey(l.product_id, l.ring_size) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.product_id, l.ring_size) === key
            ? { ...l, quantity: Math.min(l.quantity + line.quantity, l.max_stock) }
            : l
        );
      }
      return [...prev, line];
    });
  }, []);

  const removeLine = useCallback((productId: string, ringSize?: string | null) => {
    setLines((prev) => prev.filter((l) => lineKey(l.product_id, l.ring_size) !== lineKey(productId, ringSize)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, ringSize?: string | null) => {
    setLines((prev) =>
      prev.map((l) =>
        lineKey(l.product_id, l.ring_size) === lineKey(productId, ringSize)
          ? { ...l, quantity: Math.max(1, Math.min(quantity, l.max_stock)) }
          : l
      )
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
