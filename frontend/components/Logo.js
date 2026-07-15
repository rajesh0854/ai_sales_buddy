import { cn } from "@/lib/utils";

export function Logo({ className, showText = true, size = "md" }) {
  const heights = { sm: "h-6", md: "h-7", lg: "h-9" };
  return (
    <div className={cn("flex items-center gap-2.5 overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/exl-logo.png" alt="EXL" className={cn("w-auto object-contain shrink-0", heights[size])} />
      {showText && (
        <div className="leading-tight pl-2.5 border-l border-slate-200 whitespace-nowrap">
          <div className="text-[11px] font-bold text-slate-700 tracking-wide">SALES BUDDY</div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-brand-600 font-semibold -mt-0.5">AI Co-pilot</div>
        </div>
      )}
    </div>
  );
}
