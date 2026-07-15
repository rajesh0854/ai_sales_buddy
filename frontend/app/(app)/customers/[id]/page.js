"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sparkles, TrendingUp, TrendingDown, CreditCard, Building2,
  FileText, ShieldCheck, Send, MapPin, Briefcase, Phone, Mail, Star, AlertTriangle,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from "recharts";
import { Topbar } from "@/components/Topbar";
import { Card, Avatar, Badge, Skeleton, SectionTitle, ProgressRing } from "@/components/ui";
import { api } from "@/lib/api";
import { formatINR, segmentStyle, relativeDate, cn } from "@/lib/utils";

export default function Customer360Page() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.customer360(id).then(setData).catch(() => {});
  }, [id]);

  if (!data) {
    return (
      <div>
        <Topbar title="Customer 360" />
        <div className="p-6 space-y-4"><Skeleton className="h-48" /><Skeleton className="h-64" /></div>
      </div>
    );
  }

  const c = data.customer;
  const txn = data.transaction_summary;
  const own = data.holdings.filter((h) => h.is_own_bank === 1);
  const other = data.holdings.filter((h) => h.is_own_bank === 0);

  return (
    <div>
      <Topbar title="Customer 360°" subtitle="Unified view across CRM, core banking & transactions." />
      <div className="p-6 space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-600 to-violet-600" />
            <div className="relative pt-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="ring-4 ring-white rounded-full">
                  <Avatar name={c.full_name} size="xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-900">{c.full_name}</h2>
                    <Badge className={segmentStyle(c.segment)}>{c.segment}</Badge>
                    {c.risk_category === "High" && <Badge className="bg-rose-50 text-rose-600"><AlertTriangle className="h-3 w-3" /> High risk</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{c.occupation} · {c.employer}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.city}, {c.state}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{c.mobile}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/workspace?customer=${c.customer_id}&tab=pitch`} className="btn-primary text-sm"><FileText className="h-4 w-4" /> Generate Pitch</Link>
                  <Link href={`/workspace?customer=${c.customer_id}&tab=eligibility`} className="btn-ghost text-sm"><ShieldCheck className="h-4 w-4" /></Link>
                  <Link href={`/workspace?customer=${c.customer_id}&tab=messaging`} className="btn-ghost text-sm"><Send className="h-4 w-4" /></Link>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                {[
                  ["Annual income", formatINR(c.annual_income, { compact: true }), c.income_band],
                  ["CIBIL score", c.cibil_score, c.cibil_score >= 750 ? "Excellent" : c.cibil_score >= 700 ? "Good" : "Fair"],
                  ["Relationship", `${new Date().getFullYear() - new Date(c.relationship_since).getFullYear()} yrs`, `Since ${new Date(c.relationship_since).getFullYear()}`],
                  ["Language", c.preferred_language, `${c.marital_status} · ${c.dependents} dep.`],
                  ["Avg spend/mo", formatINR(txn.avg_monthly_spend, { compact: true }), `${txn.txn_count} txns`],
                ].map(([label, val, sub]) => (
                  <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5">{val}</div>
                    <div className="text-xs text-slate-400">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <SectionTitle title="AI product recommendations" subtitle="Ranked by ML propensity model" right={<Badge className="bg-brand-50 text-brand-600"><Sparkles className="h-3 w-3" /> NBO v3.2</Badge>} />
              <div className="space-y-3">
                {data.recommendations.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No active recommendations.</p>
                ) : data.recommendations.map((r, i) => (
                  <motion.div key={r.recommendation_id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-slate-100 p-4 hover:border-brand-200 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="relative grid place-items-center">
                        <ProgressRing value={Math.round(r.propensity_score * 100)} size={52} />
                        <span className="absolute text-xs font-bold text-slate-700">{Math.round(r.propensity_score * 100)}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{r.product_name}</span>
                              {r.rank === 1 && <Badge className="bg-amber-50 text-amber-600"><Star className="h-3 w-3 fill-amber-400" /> Top pick</Badge>}
                            </div>
                            <div className="text-xs text-slate-400">{r.product_category} · Expected value {formatINR(r.expected_value, { compact: true })}</div>
                          </div>
                          <Link href={`/workspace?customer=${c.customer_id}&product=${r.product_id}&tab=pitch`} className="btn-soft text-xs shrink-0">Pitch <FileText className="h-3.5 w-3.5" /></Link>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(r.reason_codes || []).map((code, j) => (
                            <span key={j} className="chip bg-slate-50 text-slate-500 text-[11px] ring-1 ring-slate-100">{code}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Transactions */}
            <Card>
              <SectionTitle title="Transaction behaviour" subtitle="Money-in vs money-out (12 months)" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={txn.monthly_series} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="credGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="debGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} /><stop offset="100%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(m) => m?.slice(5)} />
                  <Tooltip formatter={(v) => formatINR(v, { compact: true })} contentStyle={{ borderRadius: 12, border: "1px solid #eef1f6" }} />
                  <Area type="monotone" dataKey="credit" name="In" stroke="#10b981" strokeWidth={2} fill="url(#credGrad)" />
                  <Area type="monotone" dataKey="debit" name="Out" stroke="#f43f5e" strokeWidth={2} fill="url(#debGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3"><TrendingUp className="h-5 w-5 text-emerald-500" /><div><div className="text-xs text-slate-500">Total credits</div><div className="font-semibold text-slate-800">{formatINR(txn.total_credit, { compact: true })}</div></div></div>
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3"><TrendingDown className="h-5 w-5 text-rose-500" /><div><div className="text-xs text-slate-500">Total debits</div><div className="font-semibold text-slate-800">{formatINR(txn.total_debit, { compact: true })}</div></div></div>
              </div>
            </Card>
          </div>

          {/* Holdings sidebar */}
          <div className="space-y-6">
            <Card>
              <SectionTitle title="Spend categories" />
              <div className="space-y-2.5">
                {txn.top_spend_categories.map((s, i) => {
                  const max = txn.top_spend_categories[0].amount || 1;
                  return (
                    <div key={s.category}>
                      <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{s.category}</span><span className="font-medium text-slate-700">{formatINR(s.amount, { compact: true })}</span></div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(s.amount / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.08 }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <SectionTitle title="Product holdings" />
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2"><Building2 className="h-3.5 w-3.5" /> With EXL Bank</div>
                  {own.length === 0 ? <p className="text-xs text-slate-400">None yet — opportunity!</p> : own.map((h) => (
                    <div key={h.holding_id} className="flex items-center justify-between rounded-lg bg-emerald-50/50 p-2.5 mb-1.5">
                      <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-500" /><span className="text-sm text-slate-700">{h.product_type}</span></div>
                      {h.outstanding_amount ? <span className="text-xs text-slate-500">{formatINR(h.outstanding_amount, { compact: true })}</span> : null}
                    </div>
                  ))}
                </div>
                {other.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2"><AlertTriangle className="h-3.5 w-3.5" /> With competitors</div>
                    {other.map((h) => (
                      <div key={h.holding_id} className="flex items-center justify-between rounded-lg bg-amber-50/50 p-2.5 mb-1.5">
                        <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-500" /><div><span className="text-sm text-slate-700">{h.product_type}</span><div className="text-[11px] text-slate-400">{h.provider}</div></div></div>
                        <span className="text-[10px] chip bg-amber-100 text-amber-700">Win-back</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
