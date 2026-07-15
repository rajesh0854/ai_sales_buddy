"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, FileText, Copy, Check, RefreshCw, Zap, ShieldCheck, ShieldAlert,
  Star, Send, Wand2, Clock, Lightbulb, MessageSquareWarning,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, Select, Skeleton, Badge, Spinner, EmptyState } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

function PitchStudio() {
  const params = useSearchParams();
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [languages, setLanguages] = useState(["English"]);
  const [customerId, setCustomerId] = useState(params.get("customer") || "");
  const [productId, setProductId] = useState(params.get("product") || "");
  const [templateId, setTemplateId] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [regenKey, setRegenKey] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    api.listCustomers().then((d) => setCustomers(d.customers)).catch(() => {});
    api.listProducts().then((d) => setProducts(d.products)).catch(() => {});
    api.listTemplates().then((d) => { setTemplates(d.templates); const def = d.templates.find((t) => t.is_default); if (def) setTemplateId(def.template_id); }).catch(() => {});
    api.languages().then((d) => setLanguages(d.languages)).catch(() => {});
  }, []);

  async function generate() {
    if (!customerId || !productId) { toast.error("Select a customer and product first."); return; }
    setLoading(true); setScript(null); setActiveScenario(null);
    try {
      const agent = getUser();
      const res = await api.generatePitch({ customer_id: customerId, product_id: productId, template_id: templateId || undefined, language, agent_id: agent?.user_id });
      setScript(res);
      toast.success("Pitch script generated!");
    } catch (e) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function regenerate(key) {
    setRegenKey(key);
    try {
      const updated = await api.regenScenario(script.script_id, key);
      setScript((s) => ({ ...s, scenarios: s.scenarios.map((sc) => sc.scenario_key === key ? updated : sc) }));
      toast.success("Scenario refreshed");
    } catch (e) {
      toast.error("Could not refresh scenario");
    } finally {
      setRegenKey(null);
    }
  }

  function copy(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 1500);
  }

  const fullScript = script ? script.script_content.map((s) => `${s.heading}:\n${s.content}`).join("\n\n") : "";

  return (
    <div>
      <Topbar title="Pitch Studio" subtitle="Generate a personalized, ready-to-speak sales script." />
      <div className="p-6 grid lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 grid place-items-center text-white"><Wand2 className="h-4.5 w-4.5" /></div>
              <div><div className="font-semibold text-slate-800">Configure</div><div className="text-xs text-slate-400">Tailor the script inputs</div></div>
            </div>
            <div className="space-y-3">
              <div><label className="label">Customer</label>
                <Select value={customerId} onChange={setCustomerId} placeholder="Select customer…"
                  options={customers.map((c) => ({ value: c.customer_id, label: `${c.full_name} · ${c.segment}` }))} /></div>
              <div><label className="label">Product</label>
                <Select value={productId} onChange={setProductId} placeholder="Select product…"
                  options={products.map((p) => ({ value: p.product_id, label: p.name }))} /></div>
              <div><label className="label">Template</label>
                <Select value={templateId} onChange={setTemplateId} placeholder="Default template"
                  options={templates.map((t) => ({ value: t.template_id, label: t.name }))} /></div>
              <div><label className="label">Language</label>
                <Select value={language} onChange={setLanguage} options={languages} /></div>
              <button onClick={generate} disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><Spinner className="h-4 w-4" /> Generating…</> : <><Sparkles className="h-4 w-4" /> Generate Pitch</>}
              </button>
            </div>
          </Card>

          {templateId && (
            <Card className="bg-slate-50/60">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Template guidelines</div>
              <div className="text-xs text-slate-500 space-y-1">
                {(templates.find((t) => t.template_id === templateId)?.techniques || []).slice(0, 3).map((t, i) => <div key={i}>• {t}</div>)}
              </div>
            </Card>
          )}
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card className="space-y-3"><Skeleton className="h-8 w-2/3" />{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</Card>
          ) : !script ? (
            <Card className="h-full min-h-[400px] grid place-items-center">
              <EmptyState icon={FileText} title="Your pitch will appear here" subtitle="Choose a customer and product, then hit Generate to craft a personalized, compliance-checked script with dynamic call controls." />
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* header + compliance */}
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{script.title}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      <Clock className="h-3.5 w-3.5" /> {script.script_content?.length} sections
                      <Badge className="bg-slate-100 text-slate-500">{script.language}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {script.compliance && <ComplianceBadge c={script.compliance} />}
                    <button onClick={() => copy(fullScript, "full")} className="btn-ghost text-sm">
                      {copied === "full" ? <><Check className="h-4 w-4 text-emerald-500" /> Copied</> : <><Copy className="h-4 w-4" /> Copy all</>}
                    </button>
                  </div>
                </div>
                {script.compliance?.flags?.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {script.compliance.flags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs rounded-lg bg-amber-50 border border-amber-100 p-2.5">
                        <MessageSquareWarning className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div><span className="font-medium text-amber-700">{f.issue}</span><span className="text-amber-600"> — {f.suggestion}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* script sections */}
              <Card>
                <div className="space-y-1">
                  {script.script_content.map((sec, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="group relative rounded-xl p-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="h-5 w-5 rounded-md bg-brand-100 text-brand-700 text-[11px] font-bold grid place-items-center">{i + 1}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{sec.heading}</span>
                        <button onClick={() => copy(sec.content, `sec${i}`)} className="ml-auto opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-brand-600">
                          {copied === `sec${i}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <p className="text-[15px] text-slate-700 leading-relaxed pl-7">{sec.content}</p>
                    </motion.div>
                  ))}
                </div>
                {script.talking_points?.length > 0 && (
                  <div className="mt-3 rounded-xl bg-brand-50/50 border border-brand-100 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Key talking points</div>
                    <div className="grid sm:grid-cols-2 gap-1.5">
                      {script.talking_points.map((t, i) => <div key={i} className="text-sm text-slate-600 flex items-start gap-1.5"><span className="text-brand-400">▸</span>{t}</div>)}
                    </div>
                  </div>
                )}
              </Card>

              {/* Dynamic script controls */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-white"><Zap className="h-4 w-4" /></div>
                  <div><div className="font-semibold text-slate-800">Dynamic call controls</div><div className="text-xs text-slate-400">Tap a situation to load a ready response — no regeneration needed.</div></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {script.scenarios.map((sc) => (
                    <button key={sc.scenario_key} onClick={() => setActiveScenario(activeScenario === sc.scenario_key ? null : sc.scenario_key)}
                      className={cn("chip text-sm px-3 py-2 transition-all", activeScenario === sc.scenario_key ? "bg-brand-600 text-white shadow-soft" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                      {sc.title}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {activeScenario && (() => {
                    const sc = script.scenarios.find((s) => s.scenario_key === activeScenario);
                    return (
                      <motion.div key={activeScenario} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden">
                        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{sc.title}</span>
                            <div className="flex gap-2">
                              <button onClick={() => regenerate(sc.scenario_key)} disabled={regenKey === sc.scenario_key} className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
                                {regenKey === sc.scenario_key ? <Spinner className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />} Regenerate
                              </button>
                              <button onClick={() => copy(sc.content, `scn`)} className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
                                {copied === "scn" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />} Copy
                              </button>
                            </div>
                          </div>
                          <p className="text-[15px] text-slate-700 leading-relaxed italic">&ldquo;{sc.content}&rdquo;</p>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </Card>

              <FeedbackBox scriptId={script.script_id} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComplianceBadge({ c }) {
  const map = {
    Pass: { cls: "bg-emerald-50 text-emerald-600 ring-emerald-200", Icon: ShieldCheck, label: "Compliant" },
    Warning: { cls: "bg-amber-50 text-amber-600 ring-amber-200", Icon: ShieldAlert, label: "Review" },
    Fail: { cls: "bg-rose-50 text-rose-600 ring-rose-200", Icon: ShieldAlert, label: "Non-compliant" },
  };
  const { cls, Icon, label } = map[c.status] || map.Warning;
  return <span className={cn("chip ring-1", cls)}><Icon className="h-3.5 w-3.5" /> {label} · {c.risk_score}</span>;
}

function FeedbackBox({ scriptId }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [outcome, setOutcome] = useState("");
  const [comments, setComments] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    if (!rating) { toast.error("Please give a rating"); return; }
    try {
      await api.addFeedback({ script_id: scriptId, agent_id: getUser()?.user_id, rating, outcome: outcome || undefined, comments });
      setDone(true);
      toast.success("Thanks for your feedback!");
    } catch (e) { toast.error("Could not submit feedback"); }
  }

  if (done) return (
    <Card className="bg-emerald-50/50 border-emerald-100"><div className="flex items-center gap-2 text-emerald-700"><Check className="h-5 w-5" /> <span className="font-medium">Feedback recorded — it helps improve future pitches.</span></div></Card>
  );

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3"><Star className="h-4 w-4 text-amber-400" /><span className="font-semibold text-slate-800">Rate this pitch</span></div>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
            <Star className={cn("h-7 w-7 transition-colors", (hover || rating) >= n ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Select value={outcome} onChange={setOutcome} placeholder="Call outcome (optional)"
          options={["Converted", "Interested", "Callback", "Rejected", "No Answer"]} />
        <input value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Comments…" className="input" />
      </div>
      <button onClick={submit} className="btn-primary mt-3 text-sm"><Send className="h-4 w-4" /> Submit feedback</button>
    </Card>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}><PitchStudio /></Suspense>;
}
