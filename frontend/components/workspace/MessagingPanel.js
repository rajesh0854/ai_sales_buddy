"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Sparkles, Send, Copy, Check, Smartphone } from "lucide-react";
import { Card, Skeleton, Spinner, EmptyState } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useWorkspace } from "@/components/WorkspaceContext";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/motion/MagneticButton";

export function MessagingPanel() {
  const toast = useToast();
  const { customerId, productId, language, customer } = useWorkspace();
  const [channel, setChannel] = useState("Email");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  async function generate() {
    if (!customerId || !productId) { toast.error("Select customer and product above"); return; }
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

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <Card className="lg:col-span-2 h-fit">
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {[["Email", Mail], ["WhatsApp", MessageCircle]].map(([ch, Icon]) => (
              <button key={ch} onClick={() => setChannel(ch)}
                className={cn("flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-medium transition", channel === ch ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>
                <Icon className="h-4 w-4" /> {ch}
              </button>
            ))}
          </div>
          <div><label className="label">Customer wants to know (optional)</label>
            <input value={extra} onChange={(e) => setExtra(e.target.value)} className="input" placeholder="e.g. interest rate for 20 years" /></div>
          <MagneticButton onClick={generate} disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? <><Spinner className="h-4 w-4" /> Drafting…</> : <><Sparkles className="h-4 w-4" /> Generate message</>}
          </MagneticButton>
        </div>
      </Card>

      <div className="lg:col-span-3">
        {loading ? <Card><Skeleton className="h-72" /></Card> : !msg ? (
          <Card className="h-full min-h-[320px] grid place-items-center">
            <EmptyState icon={Send} title="Compose a personalized message" subtitle="Pick a channel above — customer and product come from the workspace selection — we'll draft a ready-to-send, personalized message." />
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {channel === "Email" ? (
              <Card className="p-0 overflow-hidden">
                <div className="border-b border-slate-100 p-3.5 bg-slate-50/60">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1.5"><Mail className="h-4 w-4" /> Email preview</div>
                  <div className="text-xs text-slate-400">To: {customer?.full_name} &lt;{customer ? customer.full_name.toLowerCase().replace(" ", ".") + "@email.com" : ""}&gt;</div>
                  <div className="font-semibold text-slate-800 mt-1">{msg.subject}</div>
                </div>
                <div className="p-4"><pre className="whitespace-pre-wrap font-sans text-[15px] text-slate-700 leading-relaxed">{msg.body}</pre></div>
              </Card>
            ) : (
              <Card className="bg-[#e5ddd5]/40">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2.5"><Smartphone className="h-4 w-4" /> WhatsApp preview</div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#dcf8c6] rounded-2xl rounded-br-md p-3 shadow-sm">
                    <pre className="whitespace-pre-wrap font-sans text-[15px] text-slate-800 leading-relaxed">{msg.body}</pre>
                    <div className="text-[10px] text-slate-400 text-right mt-1">now ✓✓</div>
                  </div>
                </div>
              </Card>
            )}
            <div className="flex gap-2 mt-2.5">
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
  );
}
