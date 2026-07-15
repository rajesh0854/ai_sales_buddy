"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Target, FileText, Star, TrendingUp, Flame, Phone,
  ArrowUpRight, Wallet, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { Topbar } from "@/components/Topbar";
import { StatCard, Card, SectionTitle, Avatar, Skeleton, Badge } from "@/components/ui";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { formatINR, segmentStyle, bandStyle, cn } from "@/lib/utils";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
    api.dashboard().then(setData).catch(() => {});
    api.priorityQueue(6).then((d) => setLeads(d.leads)).catch(() => {});
    api.followUps({ status: "Pending" }).then((d) => setFollowUps(d.follow_ups.slice(0, 5))).catch(() => {});
  }, []);

  const k = data?.kpis;

  return (
    <div>
      <Topbar title={`Good day, ${user?.full_name?.split(" ")[0] || ""} 👋`} subtitle="Here's your sales command centre for today." />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {!k ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
            <>
              <StatCard icon={Target} label="Conversion rate" value={`${k.conversion_rate}%`} sub={`${k.conversions} conversions`} accent="emerald" delay={0} />
              <StatCard icon={Users} label="Active customers" value={k.total_customers} sub={`${k.total_recommendations} recommendations`} accent="brand" delay={0.05} />
              <StatCard icon={FileText} label="Pitches generated" value={k.pitches_generated} sub={`${k.messages_sent} messages sent`} accent="sky" delay={0.1} />
              <StatCard icon={Star} label="Avg pitch rating" value={k.avg_pitch_rating || "—"} sub={`${k.pending_follow_ups} follow-ups pending`} accent="amber" delay={0.15} />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Priority queue */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card>
              <SectionTitle title="Smart lead priority queue" subtitle="AI-ranked by propensity, value & recency"
                right={<Link href="/customers" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowUpRight className="h-4 w-4" /></Link>} />
              <div className="space-y-2">
                {leads.length === 0 ? (
                  [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)
                ) : leads.map((l, i) => (
                  <motion.div key={l.recommendation_id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/customers/${l.customer_id}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                      <Avatar name={l.full_name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 truncate">{l.full_name}</span>
                          <Badge className={segmentStyle(l.segment)}>{l.segment}</Badge>
                        </div>
                        <div className="text-sm text-slate-500 truncate">{l.product_name} · {formatINR(l.expected_value, { compact: true })} value</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Badge className={bandStyle(l.priority_band)}>
                            {l.priority_band === "Hot" && <Flame className="h-3 w-3" />}{l.priority_band}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Score {l.priority_score}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Segment donut + follow-ups */}
          <div className="space-y-6">
            <Card>
              <SectionTitle title="Customer mix" />
              {data ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie data={data.segment_distribution} dataKey="value" nameKey="name" innerRadius={38} outerRadius={60} paddingAngle={3}>
                        {data.segment_distribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {data.segment_distribution.map((s, i) => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{s.name}
                        </span>
                        <span className="font-semibold text-slate-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <Skeleton className="h-32" />}
            </Card>

            <Card>
              <SectionTitle title="Today's follow-ups" right={<Link href="/notes" className="text-sm text-brand-600 font-medium">All</Link>} />
              <div className="space-y-2">
                {followUps.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3 text-center">No pending follow-ups 🎉</p>
                ) : followUps.map((f) => (
                  <div key={f.followup_id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 grid place-items-center text-brand-600"><Phone className="h-3.5 w-3.5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{f.full_name}</div>
                      <div className="text-xs text-slate-400">{f.due_date} · {f.due_time}</div>
                    </div>
                    <Badge className={cn(f.priority === "High" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500")}>{f.priority}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <SectionTitle title="Product performance" subtitle="Recommendations vs conversions" />
            {data ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.product_performance.slice(0, 7)} margin={{ left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={0} angle={-18} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eef1f6", boxShadow: "0 8px 30px -8px rgba(16,24,40,0.15)" }} />
                  <Bar dataKey="total" name="Recommended" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="converted" name="Converted" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-64" />}
          </Card>

          <Card>
            <SectionTitle title="Feedback rating trend" subtitle="Average pitch rating over time" />
            {data ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.feedback_trend} margin={{ left: -18 }}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eef1f6" }} />
                  <Area type="monotone" dataKey="avg_rating" stroke="#6366f1" strokeWidth={2.5} fill="url(#ratingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-64" />}
          </Card>
        </div>

        {/* Pipeline + leaderboard */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <SectionTitle title="Pipeline value" subtitle="Open opportunity by segment" />
            <div className="space-y-3 mt-2">
              {data?.pipeline_value?.map((p, i) => {
                const total = data.pipeline_value.reduce((a, b) => a + b.value, 0) || 1;
                return (
                  <div key={p.segment}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{p.segment}</span>
                      <span className="font-semibold text-slate-800">{formatINR(p.value, { compact: true })}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(p.value / total) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                );
              }) || <Skeleton className="h-24" />}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                <Wallet className="h-4 w-4 text-emerald-500" />
                Total open: <span className="font-semibold text-slate-800">{data ? formatINR(data.pipeline_value.reduce((a, b) => a + b.value, 0), { compact: true }) : "—"}</span>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <SectionTitle title="Agent leaderboard" subtitle="Top performers by conversions" right={<TrendingUp className="h-5 w-5 text-emerald-500" />} />
            <div className="space-y-2">
              {data?.leaderboard?.map((a, i) => (
                <div key={a.user_id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className={cn("h-7 w-7 rounded-lg grid place-items-center text-xs font-bold",
                    i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-50 text-orange-600")}>#{i + 1}</div>
                  <Avatar name={a.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{a.full_name}</div>
                    <div className="text-xs text-slate-400 truncate">{a.branch}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center"><div className="font-semibold text-slate-800">{a.conversions || 0}</div><div className="text-[10px] text-slate-400 uppercase">Conv</div></div>
                    <div className="text-center"><div className="font-semibold text-slate-800 flex items-center gap-0.5">{a.avg_rating || "—"}<Star className="h-3 w-3 text-amber-400 fill-amber-400" /></div><div className="text-[10px] text-slate-400 uppercase">Rating</div></div>
                  </div>
                </div>
              )) || <Skeleton className="h-24" />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
