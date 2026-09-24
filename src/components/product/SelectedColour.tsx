"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Shared by the product gallery and the add-to-cart form, which sit in
// different columns of the product page: choosing a colour shows its photo,
// and opening a colour's photo selects that colour.
const SelectedColourContext = createContext<{ colour: string | null; setColour: (c: string) => void } | null>(null);

export function SelectedColourProvider({ initial, children }: { initial: string | null; children: ReactNode }) {
  const [colour, setColour] = useState(initial);
  return <SelectedColourContext.Provider value={{ colour, setColour }}>{children}</SelectedColourContext.Provider>;
}

export function useSelectedColour() {
  return useContext(SelectedColourContext);
}
