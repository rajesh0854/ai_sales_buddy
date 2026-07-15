import clsx from "clsx";

export const cn = (...args) => clsx(...args);

export function formatINR(value, { compact = false } = {}) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const n = Number(value);
  if (compact) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toFixed(0)}`;
  }
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function avatarColor(seed = "") {
  const colors = [
    "from-indigo-500 to-violet-500", "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500", "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500", "from-fuchsia-500 to-purple-500",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export function segmentStyle(segment) {
  return {
    HNI: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    Affluent: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    Mass: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  }[segment] || "bg-slate-100 text-slate-600";
}

export function bandStyle(band) {
  return {
    Hot: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
    Warm: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
    Cool: "bg-sky-50 text-sky-600 ring-1 ring-sky-200",
  }[band] || "bg-slate-100 text-slate-600";
}

export function relativeDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
