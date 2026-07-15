"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RefreshCw, Zap } from "lucide-react";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * One numbered script section, plus any scenario chip(s) the keyword
 * heuristic (lib/scenarioMapping) matched to it — rendered directly beneath
 * the section's content so dynamic call controls read as part of the script
 * itself, not a separate bolted-on feature.
 */
export function ScriptSection({ index, section, scenarios = [], onCopySection, copiedId, onRegenerate, regenKey, onCopyScenario, copiedScenarioId }) {
  const [activeScenario, setActiveScenario] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative rounded-xl p-3 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="h-5 w-5 rounded-md bg-brand-100 text-brand-700 text-[11px] font-bold grid place-items-center">{index + 1}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{section.heading}</span>
        <button onClick={() => onCopySection(section.content, `sec${index}`)} className="ml-auto opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-brand-600">
          {copiedId === `sec${index}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="text-[15px] text-slate-700 leading-relaxed pl-7">{section.content}</p>

      {scenarios.length > 0 && (
        <div className="pl-7 mt-2.5 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {scenarios.map((sc) => (
              <button
                key={sc.scenario_key}
                onClick={() => setActiveScenario(activeScenario === sc.scenario_key ? null : sc.scenario_key)}
                className={cn(
                  "chip text-xs px-2.5 py-1 transition-all",
                  activeScenario === sc.scenario_key ? "bg-amber-500 text-white shadow-soft" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                )}
              >
                <Zap className="h-3 w-3" /> {sc.title}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {activeScenario && (() => {
              const sc = scenarios.find((s) => s.scenario_key === activeScenario);
              if (!sc) return null;
              return (
                <motion.div key={activeScenario} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">{sc.title}</span>
                      <div className="flex gap-2">
                        <button onClick={() => onRegenerate(sc.scenario_key)} disabled={regenKey === sc.scenario_key} className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-1">
                          {regenKey === sc.scenario_key ? <Spinner className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />} Regenerate
                        </button>
                        <button onClick={() => onCopyScenario(sc.content, sc.scenario_key)} className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-1">
                          {copiedScenarioId === sc.scenario_key ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />} Copy
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
      )}
    </motion.div>
  );
}
