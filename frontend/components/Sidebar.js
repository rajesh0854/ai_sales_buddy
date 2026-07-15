"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, ShieldCheck, StickyNote,
  Send, LayoutTemplate, Sparkles,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/pitch", label: "Pitch Studio", icon: FileText },
  { href: "/eligibility", label: "Eligibility", icon: ShieldCheck },
  { href: "/notes", label: "Notes & Follow-ups", icon: StickyNote },
  { href: "/messaging", label: "Messaging", icon: Send },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-100 bg-white/80 backdrop-blur h-screen sticky top-0">
      <div className="px-5 py-5">
        <Logo size="md" />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-brand-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}>
              {active && (
                <motion.div layoutId="nav-active" className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-100" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <item.icon className={cn("h-[18px] w-[18px] relative z-10", active && "text-brand-600")} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-4 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
          <Sparkles className="h-5 w-5 mb-2" />
          <div className="text-sm font-semibold">AI Co-pilot</div>
          <div className="text-xs text-white/70 mt-0.5">Tap the chat bubble anytime for instant answers during a call.</div>
        </div>
      </div>
    </aside>
  );
}
