"use client";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, StickyNote, Send } from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "pitch", label: "Pitch", icon: FileText },
  { key: "eligibility", label: "Eligibility", icon: ShieldCheck },
  { key: "notes", label: "Notes & Follow-ups", icon: StickyNote },
];

export function TabSwitcher() {
  const { activeTab, setActiveTab } = useWorkspace();
  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto">
      {TABS.map((t) => {
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0",
              active ? "text-brand-700" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {active && (
              <motion.div layoutId="workspace-tab-active" className="absolute inset-0 rounded-lg bg-white shadow-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <t.icon className={cn("h-4 w-4 relative z-10", active && "text-brand-600")} />
            <span className="relative z-10">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
