"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }) {
  return <Loader2 className={cn("animate-spin", className)} />;
}

const CARD_SIZES = { sm: "p-3.5", md: "p-4", lg: "p-5" };

export function Card({ className, children, hover = false, size = "md", ...props }) {
  return (
    <div className={cn("card", CARD_SIZES[size] || CARD_SIZES.md, hover && "transition-all hover:shadow-glow hover:-translate-y-0.5", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, className }) {
  return <span className={cn("chip", className)}>{children}</span>;
}

export function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, accent = "brand", delay = 0 }) {
  const accents = {
    brand: "from-brand-500 to-amber-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
    sky: "from-sky-500 to-blue-500",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card p-5 relative overflow-hidden group"
    >
      <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-xl transition-opacity group-hover:opacity-20", accents[accent])} />
      <div className="flex items-center justify-between">
        <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br grid place-items-center text-white shadow-soft", accents[accent])}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </motion.div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center mb-4">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <h3 className="font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ name, seed, size = "md", gradient }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-lg" };
  const ini = (name || seed || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={cn("rounded-full bg-gradient-to-br grid place-items-center text-white font-semibold shadow-soft shrink-0", sizes[size], gradient || "from-brand-500 to-amber-500")}>
      {ini}
    </div>
  );
}

export function Select({ value, onChange, options, placeholder, className }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn("input appearance-none bg-white cursor-pointer", className)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

export function ProgressRing({ value = 0, size = 44, stroke = 4, color = "#FB4E0B" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f6" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }} transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}
