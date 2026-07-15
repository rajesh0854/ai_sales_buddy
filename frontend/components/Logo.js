import { cn } from "@/lib/utils";

export function Logo({ className, showText = true, size = "md" }) {
  const dims = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-11 w-11" };
  const text = { sm: "text-base", md: "text-lg", lg: "text-xl" };
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative grid place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glow", dims[size])}>
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none">
          <path d="M4 13l3.5 3.5L12 12l4.5 4.5L20 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="7" r="1.6" fill="white" />
        </svg>
      </div>
      {showText && (
        <div className="leading-tight">
          <div className={cn("font-bold text-slate-800 tracking-tight", text[size])}>
            EXL<span className="text-brand-600"> Bank</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold -mt-0.5">Sales Buddy</div>
        </div>
      )}
    </div>
  );
}
