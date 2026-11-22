"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartLine = { sku: string; slug: string; name: string; nameHi: string; label: string; priceInr: number; qty: number; species: string };
export type Lang = "en" | "hi";

type State = {
  lines: CartLine[];
  open: boolean;
  lang: Lang;
  pulse: number;
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  setOpen: (o: boolean) => void;
  setLang: (l: Lang) => void;
};

const safeStorage = createJSONStorage(() => {
  try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return localStorage; }
  catch { const m = new Map<string, string>(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) }; }
});

export const useShop = create<State>()(
  persist(
    (set) => ({
      lines: [], open: false, lang: "en", pulse: 0,
      add: (l, qty = 1) => set((s) => {
        const ex = s.lines.find((x) => x.sku === l.sku);
        const lines = ex ? s.lines.map((x) => (x.sku === l.sku ? { ...x, qty: Math.min(999, x.qty + qty) } : x)) : [...s.lines, { ...l, qty }];
        return { lines, pulse: s.pulse + 1 };
      }),
      setQty: (sku, qty) => set((s) => ({ lines: s.lines.map((x) => (x.sku === sku ? { ...x, qty: Math.max(1, Math.min(999, qty)) } : x)) })),
      remove: (sku) => set((s) => ({ lines: s.lines.filter((x) => x.sku !== sku) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
      setLang: (lang) => set({ lang }),
    }),
    { name: "fulwari", storage: safeStorage, partialize: (s) => ({ lines: s.lines, lang: s.lang }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((a, l) => a + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((a, l) => a + l.qty * l.priceInr, 0);
