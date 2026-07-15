"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, Check, X, ArrowRight, Lightbulb } from "lucide-react";
import { Card, Skeleton, Badge, Spinner, EmptyState } from "@/components/ui";
import { useWorkspace } from "@/components/WorkspaceContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/motion/MagneticButton";

export function EligibilityPanel() {
  const { customerId, productId } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function check() {
    if (!customerId || !productId) return;
    setLoading(true); setResult(null);
    try {
      setResult(await api.checkEligibility(customerId, productId));
    } catch (e) { /* ignore */ } finally { setLoading(false); }
  }

  const eligible = result?.verdict === "ELIGIBLE";

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1 h-fit">
        <MagneticButton onClick={check} disabled={loading || !customerId || !productId} className="btn-primary w-full py-2.5">
          {loading ? <><Spinner className="h-4 w-4" /> Checking…</> : <><ShieldCheck className="h-4 w-4" /> Check eligibility</>}
        </MagneticButton>
        <p className="text-xs text-slate-400 mt-2.5">Uses the customer & product selected above to validate against product policy rules.</p>
      </Card>

      <div className="lg:col-span-2">
        {loading ? <Card><Skeleton className="h-56" /></Card> : !result ? (
          <Card className="h-full min-h-[320px] grid place-items-center">
            <EmptyState icon={ShieldCheck} title="Run an eligibility check" subtitle="Select a customer and product above to validate against the product's policy rules — with a plain-language explanation." />
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Card className={cn("relative overflow-hidden", eligible ? "ring-1 ring-emerald-200" : "ring-1 ring-rose-200")}>
              <div className={cn("absolute right-0 top-0 h-32 w-32 rounded-full blur-2xl opacity-20", eligible ? "bg-emerald-400" : "bg-rose-400")} />
              <div className="flex items-start gap-4 relative">
                <div className={cn("h-14 w-14 rounded-2xl grid place-items-center text-white shrink-0", eligible ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-rose-500 to-pink-500")}>
                  {eligible ? <ShieldCheck className="h-7 w-7" /> : <ShieldX className="h-7 w-7" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={eligible ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}>{eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}</Badge>
                    <span className="text-sm text-slate-400">{result.product_name}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mt-1">{result.headline}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{result.explanation}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold text-slate-700 mb-2.5">Policy rule checks</div>
              <div className="space-y-2">
                {result.rule_checks.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className={cn("flex items-center gap-3 rounded-xl border p-2.5", c.passed ? "border-emerald-100 bg-emerald-50/40" : "border-rose-100 bg-rose-50/40")}>
                    <div className={cn("h-7 w-7 rounded-lg grid place-items-center text-white shrink-0", c.passed ? "bg-emerald-500" : "bg-rose-500")}>
                      {c.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div className="flex-1"><div className="text-sm font-medium text-slate-700">{c.criterion}</div><div className="text-xs text-slate-400">Required: {c.required}</div></div>
                    <div className={cn("text-sm font-semibold", c.passed ? "text-emerald-600" : "text-rose-600")}>{c.actual}</div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {result.failed_reasons?.length > 0 && (
              <Card className="bg-rose-50/40 border-rose-100">
                <div className="text-sm font-semibold text-rose-700 mb-2">Why not eligible</div>
                {result.failed_reasons.map((r, i) => <div key={i} className="text-sm text-slate-600 flex items-start gap-1.5 mb-1"><X className="h-3.5 w-3.5 text-rose-400 mt-0.5" />{r}</div>)}
              </Card>
            )}
            {result.suggestions?.length > 0 && (
              <Card className="bg-brand-50/40 border-brand-100">
                <div className="text-sm font-semibold text-brand-700 mb-2 flex items-center gap-1.5"><Lightbulb className="h-4 w-4" /> Suggestions</div>
                {result.suggestions.map((s, i) => <div key={i} className="text-sm text-slate-600 flex items-start gap-1.5 mb-1"><ArrowRight className="h-3.5 w-3.5 text-brand-400 mt-0.5" />{s}</div>)}
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
