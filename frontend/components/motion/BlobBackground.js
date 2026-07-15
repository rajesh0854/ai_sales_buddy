"use client";
import { cn } from "@/lib/utils";

const PALETTES = {
  brand: ["bg-brand-400", "bg-amber-300", "bg-brand-200"],
  warm: ["bg-amber-300", "bg-brand-300", "bg-rose-200"],
};

/**
 * Decorative floating gradient blobs for an "editorial" hero treatment.
 * Absolutely positioned within a `relative` parent — render first, behind content.
 */
export function BlobBackground({ className, palette = "brand", count = 3 }) {
  const colors = PALETTES[palette] || PALETTES.brand;
  const positions = [
    "left-[-6%] top-[-10%] h-64 w-64",
    "right-[-4%] top-[10%] h-72 w-72",
    "left-[30%] bottom-[-15%] h-56 w-56",
  ];
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none -z-10", className)} aria-hidden>
      {positions.slice(0, count).map((pos, i) => (
        <div
          key={i}
          className={cn("blob animate-blob-float", colors[i % colors.length], pos)}
          style={{ animationDelay: `${i * 1.5}s` }}
        />
      ))}
    </div>
  );
}
