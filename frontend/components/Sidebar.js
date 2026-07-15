"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Zap, LayoutTemplate, Sparkles, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/workspace", label: "Call Workspace", icon: Zap },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
];

const STORAGE_KEY = "sb_sidebar_collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      return !c;
    });
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="hidden lg:flex flex-col shrink-0 border-r border-slate-100 bg-white/80 backdrop-blur h-screen sticky top-0 overflow-hidden"
    >
      <div className="px-4 py-5 overflow-hidden">
        <Logo size="sm" showText={!collapsed} />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active ? "text-brand-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              {active && (
                <motion.div layoutId="nav-active" className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-100" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <item.icon className={cn("h-[18px] w-[18px] relative z-10 shrink-0", active && "text-brand-600")} />
              {!collapsed && <span className="relative z-10 whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        {!collapsed && (
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-amber-600 p-4 text-white relative overflow-hidden mb-2">
            <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <Sparkles className="h-5 w-5 mb-2" />
            <div className="text-sm font-semibold">AI Co-pilot</div>
            <div className="text-xs text-white/70 mt-0.5">Tap the chat bubble anytime for instant answers during a call.</div>
          </div>
        )}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </div>
    </motion.aside>
  );
}
