"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot, X, Send, Sparkles, Copy, Check, MessageSquareText,
  Mail, MessageCircle, Trash2, Users
} from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Spinner, Card } from "./ui";
import { useWorkspace } from "./WorkspaceContext";
import { useToast } from "./Toast";

export function ChatbotDrawer() {
  const ws = useWorkspace();
  const toast = useToast();
  const { customerId, customer } = ws;

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("copilot"); // copilot | message
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied] = useState(null);

  // Messaging sub-states
  const [channel, setChannel] = useState("Email");
  const [extra, setExtra] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgDraft, setMsgDraft] = useState(null);
  const [msgCopied, setMsgCopied] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  const scrollRef = useRef(null);

  // Auto-fetch suggestions whenever customer changes
  useEffect(() => {
    if (open) {
      api.suggestedQuestions(customerId || undefined)
        .then((d) => setSuggestions(d.questions || []))
        .catch(() => setSuggestions([]));
    }
  }, [open, customerId]);

  // Reset messaging draft state if customer or product changes in the workspace
  useEffect(() => {
    setMsgDraft(null);
    setMsgSent(false);
  }, [customerId, ws.productId]);

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

  function clearChat() {
    setMessages([]);
    if (customerId) {
      api.suggestedQuestions(customerId)
        .then((d) => setSuggestions(d.questions || []))
        .catch(() => {});
    }
  }

  async function generateMessage() {
    if (!customerId || !ws.productId) {
      toast.error("Select customer and product in workspace");
      return;
    }
    setMsgLoading(true); setMsgDraft(null); setMsgSent(false);
    try {
      const res = await api.generateMessage({
        customer_id: customerId,
        product_id: ws.productId,
        channel,
        language: ws.language,
        extra_request: extra
      });
      setMsgDraft(res);
      toast.success("Draft generated!");
    } catch (e) {
      toast.error("Draft generation failed");
    } finally {
      setMsgLoading(false);
    }
  }

  async function sendMessage() {
    try {
      await api.sendMessage({
        customer_id: customerId,
        agent_id: getUser()?.user_id,
        product_id: ws.productId,
        channel,
        subject: msgDraft.subject,
        body: msgDraft.body,
        language: ws.language
      });
      setMsgSent(true);
      toast.success(`${channel} sent successfully!`);
    } catch (e) {
      toast.error("Send failed");
    }
  }

  function copy(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      {/* Floating Button */}
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
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-brand-600 to-amber-600 text-white shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center"><Bot className="h-5 w-5" /></div>
                    <div>
                      <div className="font-semibold text-sm">Quick Co-pilot</div>
                      <div className="text-xs text-white/70">Instant answers, ready to speak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tab === "copilot" && messages.length > 0 && (
                      <button
                        onClick={clearChat}
                        title="Clear conversation"
                        className="h-8 w-8 rounded-lg hover:bg-white/20 grid place-items-center text-white/80 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg hover:bg-white/20 grid place-items-center"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-3 flex gap-1 bg-white/15 rounded-xl p-1">
                  {[["copilot", "Chat Co-pilot", MessageSquareText], ["message", "Send Message", Mail]].map(([t, label, Icon]) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition", tab === t ? "bg-white text-brand-700" : "text-white/80 hover:text-white")}>
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer context context indicator */}
              <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center text-xs shrink-0">
                <div className="flex items-center gap-1.5 text-slate-500 truncate">
                  <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-400">Context:</span>
                  {customer ? (
                    <span className="font-semibold text-slate-700 truncate">{customer.full_name} · {customer.segment}</span>
                  ) : (
                    <span className="text-slate-400">General banking</span>
                  )}
                </div>
              </div>

              {/* Body */}
              {tab === "copilot" ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Messages list */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {messages.length === 0 && (
                      <div className="text-center py-10 px-4">
                        <div className="h-12 w-12 rounded-2xl bg-brand-50 grid place-items-center mx-auto mb-3"><Sparkles className="h-6 w-6 text-brand-500" /></div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Ask me anything — try comparative questions like <span className="font-semibold text-slate-600">&quot;home loan vs bike loan&quot;</span> or query specific rates.
                        </p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-soft",
                          m.role === "user" ? "bg-brand-600 text-white rounded-br-md" : "bg-slate-100 text-slate-700 rounded-bl-md")}>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          {m.facts?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {m.facts.map((f, j) => <span key={j} className="chip bg-white/60 text-slate-600 text-[10px] border-0 py-0.5 px-1.5">{f}</span>)}
                            </div>
                          )}
                          {m.role === "bot" && !m.error && (
                            <button onClick={() => copy(m.text, i)} className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-600">
                              {copied === i ? <><Check className="h-3 w-3 text-emerald-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy speech</>}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-slate-400">
                          <Spinner className="h-4 w-4" /> <span className="text-xs font-medium">Thinking…</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input bar */}
                  <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                    {suggestions.length > 0 && messages.length === 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {suggestions.slice(0, 3).map((s, i) => (
                          <button key={i} onClick={() => ask(s)} className="chip bg-brand-50 border border-brand-100 text-brand-700 hover:bg-brand-100 transition text-[10px] py-0.5 px-2 font-medium">{s}</button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()}
                        placeholder="Type comparative or catalog questions…" className="input py-2.5 text-sm" />
                      <button onClick={() => ask()} disabled={loading || !input.trim()} className="btn-primary h-11 w-11 p-0 shrink-0"><Send className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ) : (
                // Send Message Tab
                <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
                  {!customerId || !ws.productId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 grid place-items-center mb-4">
                        <Mail className="h-6 w-6 text-amber-500" />
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm">Workspace Context Required</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                        Please select both a customer and a product in the Call Workspace to draft a personalized message.
                      </p>
                    </div>
                  ) : msgLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
                      <Spinner className="h-8 w-8 text-brand-500 animate-spin" />
                      <span className="text-xs text-slate-400 mt-2">Drafting message with AI…</span>
                    </div>
                  ) : !msgDraft ? (
                    // Input Config Form
                    <div className="p-4 space-y-4 bg-white flex-1 overflow-y-auto">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Channel</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[["Email", Mail], ["WhatsApp", MessageCircle]].map(([ch, Icon]) => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => setChannel(ch)}
                              className={cn(
                                "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition",
                                channel === ch
                                  ? "border-brand-500 bg-brand-50/50 text-brand-700 font-semibold"
                                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              <Icon className="h-4 w-4" /> {ch}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">What does the customer want to know? (Optional)</label>
                        <textarea
                          value={extra}
                          onChange={(e) => setExtra(e.target.value)}
                          rows={4}
                          placeholder="e.g. details about interest rate for 20 years, waiver on processing fee..."
                          className="input resize-none py-2 text-sm leading-relaxed"
                        />
                      </div>

                      <button
                        onClick={generateMessage}
                        className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 font-semibold text-sm"
                      >
                        <Sparkles className="h-4 w-4" /> Generate Message
                      </button>
                    </div>
                  ) : (
                    // Preview & Edit
                    <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0 bg-slate-50">
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
                        {channel === "Email" ? (
                          <div className="rounded-xl border border-slate-200 bg-white shadow-soft overflow-hidden flex flex-col">
                            <div className="border-b border-slate-100 p-3 bg-slate-50 text-xs text-slate-500 space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold"><Mail className="h-3.5 w-3.5" /> Email Draft</div>
                              <div className="truncate">To: <span className="font-semibold text-slate-700">{customer?.full_name}</span></div>
                            </div>
                            <div className="p-3 space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase">Subject</label>
                                <input
                                  type="text"
                                  value={msgDraft.subject}
                                  onChange={(e) => setMsgDraft({ ...msgDraft, subject: e.target.value })}
                                  className="input py-1.5 text-sm font-medium"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase">Body</label>
                                <textarea
                                  value={msgDraft.body}
                                  onChange={(e) => setMsgDraft({ ...msgDraft, body: e.target.value })}
                                  rows={8}
                                  className="input py-2 text-sm leading-relaxed resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-slate-200 bg-[#e5ddd5]/30 p-3 flex flex-col">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Draft</div>
                            <textarea
                              value={msgDraft.body}
                              onChange={(e) => setMsgDraft({ ...msgDraft, body: e.target.value })}
                              rows={11}
                              className="input py-2.5 text-sm leading-relaxed resize-none bg-white/95"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 shrink-0">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText((msgDraft.subject ? msgDraft.subject + "\n\n" : "") + msgDraft.body);
                              setMsgCopied(true);
                              setTimeout(() => setMsgCopied(false), 1500);
                            }}
                            className="btn-ghost py-2.5 flex-1 text-xs font-semibold"
                          >
                            {msgCopied ? <><Check className="h-4 w-4 text-emerald-500" /> Copied</> : <><Copy className="h-4 w-4" /> Copy Text</>}
                          </button>
                          <button
                            type="button"
                            onClick={sendMessage}
                            disabled={msgSent}
                            className="btn-primary py-2.5 flex-1 text-xs font-semibold"
                          >
                            {msgSent ? <><Check className="h-4 w-4" /> Sent</> : <><Send className="h-4 w-4" /> Send {channel}</>}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMsgDraft(null)}
                          className="w-full text-center text-xs text-slate-500 hover:text-brand-600 font-medium py-1"
                        >
                          ← Back to edit options
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
