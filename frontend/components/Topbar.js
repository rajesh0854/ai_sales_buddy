"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, Bell, ChevronDown } from "lucide-react";
import { getUser, clearUser } from "@/lib/auth";
import { Avatar } from "./ui";
import { api } from "@/lib/api";

export function Topbar({ title, subtitle }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [gemini, setGemini] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setUser(getUser());
    api.status().then((s) => setGemini(s.gemini_enabled)).catch(() => {});
  }, []);

  function logout() {
    clearUser();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-100">
      <div className="flex items-center justify-between px-6 py-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {gemini === false && (
            <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-200 hidden md:inline-flex">
              Demo mode · add Gemini key
            </span>
          )}
          <button className="relative h-9 w-9 rounded-xl border border-slate-200 bg-white grid place-items-center text-slate-500 hover:bg-slate-50">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white pl-1.5 pr-2.5 py-1.5 hover:bg-slate-50">
              <Avatar name={user?.full_name} seed={user?.avatar_seed} size="sm" />
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-slate-700 leading-tight">{user?.full_name || "—"}</div>
                <div className="text-[11px] text-slate-400 capitalize leading-tight">{user?.role}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {menu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-card border border-slate-100 p-1.5 z-40">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-700">{user?.full_name}</div>
                  <div className="text-xs text-slate-400">{user?.branch}</div>
                </div>
                <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 mt-1">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
