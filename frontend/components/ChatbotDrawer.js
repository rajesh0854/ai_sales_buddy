"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, Send, Sparkles, Copy, Check, GitCompare, MessageSquareText } from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Spinner, Select } from "./ui";

export function ChatbotDrawer() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("qa"); // qa | compare
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [products, setProducts] = useState([]);
  const [cmpA, setCmpA] = useState("");
  const [cmpB, setCmpB] = useState("");
  const [copied, setCopied] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && customers.length === 0) {
      api.listCustomers().then((d) => setCustomers(d.customers)).catch(() => {});
      api.listProducts().then((d) => setProducts(d.products)).catch(() => {});
    }
  }, [open, customers.length]);

  useEffect(() => {
    if (open) api.suggestedQuestions(customerId || undefined).then((d) => setSuggestions(d.questions)).catch(() => {});
  }, [open, customerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(q) {
    const question = (q ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const agent = getUser();
      const res = await api.ask({ question, customer_id: customerId || undefined, agent_id: agent?.user_id });
      setMessages((m) => [...m, { role: "bot", text: res.answer, facts: res.quick_facts, confidence: res.confidence }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, I couldn't fetch that right now.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  async function runCompare() {
    if (!cmpA || !cmpB || cmpA === cmpB || loading) return;
    const nameA = products.find((p) => p.product_id === cmpA)?.name;
    const nameB = products.find((p) => p.product_id === cmpB)?.name;
    setMessages((m) => [...m, { role: "user", text: `Compare ${nameA} vs ${nameB}` }]);
    setLoading(true);
    try {
      const agent = getUser();
      const res = await api.compare({ product_id_a: cmpA, product_id_b: cmpB, customer_id: customerId || undefined, agent_id: agent?.user_id });
      setMessages((m) => [...m, { role: "bot", compare: res, nameA, nameB }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Comparison failed.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function copy(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      {/* floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-amber-500 text-white shadow-glow grid place-items-center hover:scale-105 transition-transform"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-white grid place-items-center">
          <Sparkles className="h-2.5 w-2.5 text-white" />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* header */}
              <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-brand-600 to-amber-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center"><Bot className="h-5 w-5" /></div>
                    <div>
                      <div className="font-semibold">Quick Co-pilot</div>
                      <div className="text-xs text-white/70">Instant answers, ready to speak</div>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg hover:bg-white/20 grid place-items-center"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-3 flex gap-1 bg-white/15 rounded-xl p-1">
                  {[["qa", "Ask", MessageSquareText], ["compare", "Compare", GitCompare]].map(([m, l, Icon]) => (
                    <button key={m} onClick={() => setMode(m)}
                      className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition", mode === m ? "bg-white text-brand-700" : "text-white/80 hover:text-white")}>
                      <Icon className="h-3.5 w-3.5" /> {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* customer context */}
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <Select value={customerId} onChange={setCustomerId} placeholder="No customer context (general)"
                  options={customers.map((c) => ({ value: c.customer_id, label: `${c.full_name} · ${c.segment}` }))}
                  className="py-2 text-sm" />
              </div>

              {/* body */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && mode === "qa" && (
                  <div className="text-center py-6">
                    <div className="h-12 w-12 rounded-2xl bg-brand-50 grid place-items-center mx-auto mb-3"><Sparkles className="h-6 w-6 text-brand-500" /></div>
                    <p className="text-sm text-slate-500">Ask me anything — try keyword questions like <span className="font-medium text-slate-700">&quot;home loan roi&quot;</span></p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    {m.compare ? (
                      <CompareCard data={m.compare} nameA={m.nameA} nameB={m.nameB} onCopy={(t) => copy(t, `cmp${i}`)} copied={copied === `cmp${i}`} />
                    ) : (
                      <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                        m.role === "user" ? "bg-brand-600 text-white rounded-br-md" : "bg-slate-100 text-slate-700 rounded-bl-md")}>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                        {m.facts?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {m.facts.map((f, j) => <span key={j} className="chip bg-white/60 text-slate-600 text-[11px]">{f}</span>)}
                          </div>
                        )}
                        {m.role === "bot" && !m.error && (
                          <button onClick={() => copy(m.text, i)} className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600">
                            {copied === i ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-slate-400">
                      <Spinner className="h-4 w-4" /> <span className="text-sm">Thinking…</span>
                    </div>
                  </div>
                )}
              </div>

              {/* input */}
              {mode === "qa" ? (
                <div className="p-3 border-t border-slate-100">
                  {suggestions.length > 0 && messages.length === 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {suggestions.slice(0, 4).map((s, i) => (
                        <button key={i} onClick={() => ask(s)} className="chip bg-brand-50 text-brand-600 hover:bg-brand-100 transition text-[11px]">{s}</button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()}
                      placeholder="Type a keyword question…" className="input py-2.5 text-sm" />
                    <button onClick={() => ask()} disabled={loading || !input.trim()} className="btn-primary h-11 w-11 p-0 shrink-0"><Send className="h-4 w-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="p-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={cmpA} onChange={setCmpA} placeholder="Product A" options={products.map((p) => ({ value: p.product_id, label: p.name }))} className="py-2 text-sm" />
                    <Select value={cmpB} onChange={setCmpB} placeholder="Product B" options={products.map((p) => ({ value: p.product_id, label: p.name }))} className="py-2 text-sm" />
                  </div>
                  <button onClick={runCompare} disabled={loading || !cmpA || !cmpB || cmpA === cmpB} className="btn-primary w-full py-2.5 text-sm">
                    <GitCompare className="h-4 w-4" /> Compare & recommend
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CompareCard({ data, nameA, nameB, onCopy, copied }) {
  return (
    <div className="max-w-[95%] w-full bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        {[[nameA, data.product_a_pros, data.product_a_cons], [nameB, data.product_b_pros, data.product_b_cons]].map(([name, pros, cons], i) => (
          <div key={i} className="p-3">
            <div className="font-semibold text-xs text-slate-800 mb-1.5">{name}</div>
            <div className="space-y-0.5">
              {(pros || []).map((p, j) => <div key={j} className="text-[11px] text-emerald-600">✓ {p}</div>)}
              {(cons || []).map((c, j) => <div key={j} className="text-[11px] text-rose-500">✕ {c}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-brand-50/60 border-t border-slate-100">
        <div className="text-[11px] font-semibold text-brand-700 uppercase tracking-wide mb-1">Recommendation</div>
        <p className="text-xs text-slate-600 mb-2">{data.recommendation}</p>
        <div className="rounded-lg bg-white border border-slate-200 p-2.5">
          <p className="text-xs text-slate-700 italic">&ldquo;{data.sales_pitch}&rdquo;</p>
        </div>
        <button onClick={() => onCopy(data.sales_pitch)} className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600">
          {copied ? <><Check className="h-3 w-3" /> Copied pitch</> : <><Copy className="h-3 w-3" /> Copy pitch</>}
        </button>
      </div>
    </div>
  );
}
