"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Sparkles, Star, ChevronLeft, ChevronRight, AlertTriangle,
  Briefcase, MapPin, Phone, ShieldCheck, Check
} from "lucide-react";
import { Avatar, Badge, Spinner, ProgressRing, Card } from "../ui";
import { formatINR, segmentStyle, cn } from "@/lib/utils";
import { useWorkspace } from "../WorkspaceContext";

export function CustomerDetailsSidebar({ show, onToggle, details, loading }) {
  const { productId, setProductId } = useWorkspace();

  if (loading) {
    return (
      <div className="w-80 border-l border-slate-100 bg-white flex flex-col justify-center items-center h-full shrink-0">
        <Spinner className="h-6 w-6 text-brand-500" />
        <span className="text-xs text-slate-400 mt-2">Loading customer context…</span>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  const { customer: c, recommendations = [] } = details;

  return (
    <div className="relative h-full flex shrink-0">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 focus:outline-none flex items-center justify-center shadow-soft border-slate-200",
          show 
            ? "left-0 -translate-x-1/2 h-8 w-8 rounded-full border" 
            : "left-0 -translate-x-full h-12 w-6 rounded-l-xl border-y border-l hover:w-7"
        )}
        title={show ? "Collapse profile details" : "Expand profile details"}
      >
        {show ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
      </button>

      <motion.div
        animate={{ width: show ? 360 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-white border-l border-slate-100 overflow-hidden flex flex-col relative"
      >
        {show && (
          <div className="w-[360px] h-full flex flex-col min-h-0">
            {/* Header banner */}
            <div className="p-4 bg-gradient-to-r from-brand-600 to-amber-600 text-white shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={c.full_name} size="lg" gradient="from-white/20 to-white/10" />
                <div className="min-w-0">
                  <div className="font-bold text-base truncate">{c.full_name}</div>
                  <div className="text-xs text-white/80 capitalize">{c.occupation}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <Badge className={segmentStyle(c.segment) + " bg-white/25 border-0 text-white"}>{c.segment}</Badge>
                {c.risk_category === "High" && (
                  <Badge className="bg-rose-500/20 border-0 text-white flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> High Risk</Badge>
                )}
              </div>
            </div>

            {/* Scrollable details area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 pb-10">
              {/* Profile grid */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Customer Profile</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Employer</div>
                    <div className="text-sm font-semibold text-slate-800 truncate mt-0.5" title={c.employer}>{c.employer}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Annual Income</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5">{formatINR(c.annual_income, { compact: true })}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">CIBIL Score</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                      {c.cibil_score}
                      <span className={`text-[10px] font-medium ${c.cibil_score >= 750 ? "text-emerald-600" : c.cibil_score >= 700 ? "text-amber-600" : "text-rose-600"}`}>
                        ({c.cibil_score >= 750 ? "Excellent" : c.cibil_score >= 700 ? "Good" : "Fair"})
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Preferred Lang</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{c.preferred_language}</div>
                  </div>
                </div>
              </div>

              {/* Product recommendations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Product Offers</h3>
                  <Badge className="bg-brand-50 text-brand-700 text-[10px] font-bold"><Sparkles className="h-2.5 w-2.5" /> NBO Model</Badge>
                </div>
                <div className="space-y-2.5">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">No active offers.</div>
                  ) : (
                    recommendations.map((r) => {
                      const isPitched = productId === r.product_id;
                      return (
                        <div
                          key={r.recommendation_id}
                          className={`rounded-xl border p-3 transition-colors ${
                            isPitched ? "border-brand-300 bg-brand-50/20" : "border-slate-100 hover:border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0 grid place-items-center mt-0.5">
                              <ProgressRing value={Math.round(r.propensity_score * 100)} size={38} stroke={3.5} />
                              <span className="absolute text-[10px] font-bold text-slate-700">{Math.round(r.propensity_score * 100)}%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs text-slate-800 truncate" title={r.product_name}>{r.product_name}</span>
                                {r.rank === 1 && (
                                  <Badge className="bg-amber-50 text-amber-700 text-[9px] py-0 px-1 border-0 flex items-center gap-0.5"><Star className="h-2 w-2 fill-amber-400" /> Best</Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{r.product_category} · EV {formatINR(r.expected_value, { compact: true })}</div>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {(r.reason_codes || []).map((code, j) => (
                                  <span key={j} className="chip bg-slate-50 border border-slate-100 text-slate-500 text-[10px] py-0 px-1">
                                    {code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2.5 border-t border-slate-100/60 pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setProductId(r.product_id)}
                              disabled={isPitched}
                              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                                isPitched
                                  ? "bg-emerald-50 text-emerald-700 cursor-default"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {isPitched ? (
                                <><Check className="h-3 w-3" /> Active Pitch</>
                              ) : (
                                <><Sparkles className="h-3 w-3" /> Pitch This</>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
