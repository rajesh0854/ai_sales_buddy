"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight, Sparkles } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, Avatar, Badge, Skeleton, Select, EmptyState } from "@/components/ui";
import { api } from "@/lib/api";
import { formatINR, segmentStyle } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState(null);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setCustomers(null);
      api.listCustomers({ search, segment }).then((d) => setCustomers(d.customers)).catch(() => setCustomers([]));
    }, 250);
    return () => clearTimeout(t);
  }, [search, segment]);

  return (
    <div>
      <Topbar title="Customers" subtitle="Search, filter and open a 360° customer view." />
      <div className="p-6 space-y-4">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID or mobile…" className="input pl-10" />
            </div>
            <div className="w-full sm:w-52 relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Select value={segment} onChange={setSegment} placeholder="All segments" className="pl-10"
                options={[{ value: "Mass", label: "Mass" }, { value: "Affluent", label: "Affluent" }, { value: "HNI", label: "HNI" }]} />
            </div>
          </div>
        </Card>

        {!customers ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
        ) : customers.length === 0 ? (
          <Card><EmptyState icon={Search} title="No customers found" subtitle="Try a different search or filter." /></Card>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {customers.map((c, i) => (
              <motion.div key={c.customer_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                <Link href={`/customers/${c.customer_id}`}>
                  <Card hover className="h-full group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <Avatar name={c.full_name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800 truncate">{c.full_name}</h3>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-slate-400">{c.customer_id} · {c.city}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Badge className={segmentStyle(c.segment)}>{c.segment}</Badge>
                          <Badge className="bg-slate-100 text-slate-500">{c.occupation}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                      <div><div className="text-sm font-semibold text-slate-800">{formatINR(c.annual_income, { compact: true })}</div><div className="text-[10px] text-slate-400 uppercase">Income</div></div>
                      <div><div className="text-sm font-semibold text-slate-800">{c.cibil_score}</div><div className="text-[10px] text-slate-400 uppercase">CIBIL</div></div>
                      <div><div className="text-sm font-semibold text-brand-600 flex items-center justify-center gap-0.5"><Sparkles className="h-3 w-3" />{c.rec_count}</div><div className="text-[10px] text-slate-400 uppercase">Recos</div></div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
