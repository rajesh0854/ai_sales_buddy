"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Low-chrome strip for scenarios the keyword heuristic couldn't confidently
 * tie to a specific section — still surfaced (nothing is ever hidden), just
 * without the false confidence of an inline placement.
 */
export function ScenarioRail({ scenarios, onRegenerate, regenKey, onCopy, copiedId }) {
  const [active, setActive] = useState(null);
  if (!scenarios.length) return null;

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
        <Sparkles className="h-3.5 w-3.5" /> Other quick responses
      </div>
      <div className="flex flex-wrap gap-1.5">
        {scenarios.map((sc) => (
          <button
            key={sc.scenario_key}
            onClick={() => setActive(active === sc.scenario_key ? null : sc.scenario_key)}
            className={cn("chip text-xs px-2.5 py-1 transition-all", active === sc.scenario_key ? "bg-brand-600 text-white shadow-soft" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
          >
            {sc.title}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {active && (() => {
          const sc = scenarios.find((s) => s.scenario_key === active);
          if (!sc) return null;
          return (
            <motion.div key={active} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2">
              <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{sc.title}</span>
                  <div className="flex gap-2">
                    <button onClick={() => onRegenerate(sc.scenario_key)} disabled={regenKey === sc.scenario_key} className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
                      {regenKey === sc.scenario_key ? <Spinner className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />} Regenerate
                    </button>
                    <button onClick={() => onCopy(sc.content, sc.scenario_key)} className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
                      {copiedId === sc.scenario_key ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />} Copy
                    </button>
                  </div>
                </div>
                <p className="text-[14px] text-slate-700 leading-relaxed italic">&ldquo;{sc.content}&rdquo;</p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
