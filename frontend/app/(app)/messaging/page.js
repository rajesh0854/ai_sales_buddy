"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Sparkles, Send, Copy, Check, Smartphone } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, Select, Skeleton, Spinner, EmptyState, Avatar } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

function Messaging() {
  const params = useSearchParams();
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [languages, setLanguages] = useState(["English"]);
  const [customerId, setCustomerId] = useState(params.get("customer") || "");
  const [productId, setProductId] = useState(params.get("product") || "");
  const [channel, setChannel] = useState("Email");
  const [language, setLanguage] = useState("English");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.listCustomers().then((d) => setCustomers(d.customers)).catch(() => {});
    api.listProducts().then((d) => setProducts(d.products)).catch(() => {});
    api.languages().then((d) => setLanguages(d.languages)).catch(() => {});
  }, []);

  async function generate() {
    if (!customerId || !productId) { toast.error("Select customer and product"); return; }
    setLoading(true); setMsg(null); setSent(false);
    try {
      setMsg(await api.generateMessage({ customer_id: customerId, product_id: productId, channel, language, extra_request: extra }));
    } catch (e) { toast.error("Generation failed"); } finally { setLoading(false); }
  }

  async function send() {
    try {
      await api.sendMessage({ customer_id: customerId, agent_id: getUser()?.user_id, product_id: productId, channel, subject: msg.subject, body: msg.body, language });
      setSent(true);
      toast.success(`${channel} sent successfully!`);
    } catch (e) { toast.error("Send failed"); }
  }

  const customer = customers.find((c) => c.customer_id === customerId);

  return (
    <div>
      <Topbar title="Messaging" subtitle="Send personalized Email & WhatsApp messages to customers." />
      <div className="p-6 grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 h-fit">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[["Email", Mail], ["WhatsApp", MessageCircle]].map(([ch, Icon]) => (
                <button key={ch} onClick={() => setChannel(ch)}
                  className={cn("flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition", channel === ch ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>
                  <Icon className="h-4 w-4" /> {ch}
                </button>
              ))}
            </div>
            <div><label className="label">Customer</label>
              <Select value={customerId} onChange={setCustomerId} placeholder="Select customer…" options={customers.map((c) => ({ value: c.customer_id, label: `${c.full_name} · ${c.segment}` }))} /></div>
            <div><label className="label">Product</label>
              <Select value={productId} onChange={setProductId} placeholder="Select product…" options={products.map((p) => ({ value: p.product_id, label: p.name }))} /></div>
            <div><label className="label">Language</label><Select value={language} onChange={setLanguage} options={languages} /></div>
            <div><label className="label">Customer wants to know (optional)</label>
              <input value={extra} onChange={(e) => setExtra(e.target.value)} className="input" placeholder="e.g. interest rate for 20 years" /></div>
            <button onClick={generate} disabled={loading} className="btn-primary w-full py-3">
              {loading ? <><Spinner className="h-4 w-4" /> Drafting…</> : <><Sparkles className="h-4 w-4" /> Generate message</>}
            </button>
          </div>
        </Card>

        <div className="lg:col-span-3">
          {loading ? <Card><Skeleton className="h-80" /></Card> : !msg ? (
            <Card className="h-full min-h-[360px] grid place-items-center">
              <EmptyState icon={Send} title="Compose a personalized message" subtitle="Pick a channel, customer and product — we'll draft a ready-to-send, personalized message." />
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {channel === "Email" ? (
                <Card className="p-0 overflow-hidden">
                  <div className="border-b border-slate-100 p-4 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2"><Mail className="h-4 w-4" /> Email preview</div>
                    <div className="text-xs text-slate-400">To: {customer?.full_name} &lt;{customer ? customer.full_name.toLowerCase().replace(" ", ".") + "@email.com" : ""}&gt;</div>
                    <div className="font-semibold text-slate-800 mt-1">{msg.subject}</div>
                  </div>
                  <div className="p-5"><pre className="whitespace-pre-wrap font-sans text-[15px] text-slate-700 leading-relaxed">{msg.body}</pre></div>
                </Card>
              ) : (
                <Card className="bg-[#e5ddd5]/40">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3"><Smartphone className="h-4 w-4" /> WhatsApp preview</div>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-[#dcf8c6] rounded-2xl rounded-br-md p-3.5 shadow-sm">
                      <pre className="whitespace-pre-wrap font-sans text-[15px] text-slate-800 leading-relaxed">{msg.body}</pre>
                      <div className="text-[10px] text-slate-400 text-right mt-1">now ✓✓</div>
                    </div>
                  </div>
                </Card>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={() => { navigator.clipboard.writeText((msg.subject ? msg.subject + "\n\n" : "") + msg.body); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn-ghost text-sm">
                  {copied ? <><Check className="h-4 w-4 text-emerald-500" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                </button>
                <button onClick={send} disabled={sent} className="btn-primary text-sm flex-1">
                  {sent ? <><Check className="h-4 w-4" /> Sent</> : <><Send className="h-4 w-4" /> Send {channel}</>}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}><Messaging /></Suspense>;
}
