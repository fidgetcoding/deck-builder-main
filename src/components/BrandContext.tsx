"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Brand } from "@/lib/brand";

const BrandContext = createContext<Brand | null>(null);

/**
 * Brand values reach client components as data from the server, so they never get
 * compiled into a JS chunk. That's what lets an edit to them land without a reload.
 */
export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  const brand = useContext(BrandContext);
  if (!brand) throw new Error("useBrand needs a BrandProvider above it");
  return brand;
}
