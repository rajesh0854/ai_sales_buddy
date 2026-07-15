"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, Copy, Check, Wand2, Clock, Lightbulb, MessageSquareWarning, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, Select, Skeleton, Badge, Spinner, EmptyState } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useWorkspace } from "@/components/WorkspaceContext";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { mapScenariosToSections } from "@/lib/scenarioMapping";
import { ScriptSection } from "./ScriptSection";
import { ScenarioRail } from "./ScenarioRail";
import { FeedbackBox } from "./FeedbackBox";
import { MagneticButton } from "@/components/motion/MagneticButton";

function ComplianceBadge({ c }) {
  const map = {
    Pass: { cls: "bg-emerald-50 text-emerald-600 ring-emerald-200", Icon: ShieldCheck, label: "Compliant" },
    Warning: { cls: "bg-amber-50 text-amber-600 ring-amber-200", Icon: ShieldAlert, label: "Review" },
    Fail: { cls: "bg-rose-50 text-rose-600 ring-rose-200", Icon: ShieldAlert, label: "Non-compliant" },
  };
  const { cls, Icon, label } = map[c.status] || map.Warning;
  return <span className={cn("chip ring-1", cls)}><Icon className="h-3.5 w-3.5" /> {label} · {c.risk_score}</span>;
}

export function PitchPanel() {
  const toast = useToast();
  const { customerId, productId, templateId, setTemplateId, language, templates } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [regenKey, setRegenKey] = useState(null);
  const [copied, setCopied] = useState(null);
  const [copiedScenario, setCopiedScenario] = useState(null);

  async function generate() {
    if (!customerId || !productId) { toast.error("Select a customer and product first."); return; }
    setLoading(true); setScript(null);
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

  function copyScenario(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedScenario(id); setTimeout(() => setCopiedScenario(null), 1500);
  }

  const fullScript = script ? script.script_content.map((s) => `${s.heading}:\n${s.content}`).join("\n\n") : "";
  const { bySection, unmatched } = script ? mapScenariosToSections(script.script_content, script.scenarios || []) : { bySection: new Map(), unmatched: [] };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-3">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 grid place-items-center text-white"><Wand2 className="h-4.5 w-4.5" /></div>
            <div><div className="font-semibold text-slate-800">Configure</div><div className="text-xs text-slate-400">Template & generate</div></div>
          </div>
          <div className="space-y-2.5">
            <div><label className="label">Template</label>
              <Select value={templateId} onChange={setTemplateId} placeholder="Default template"
                options={templates.map((t) => ({ value: t.template_id, label: t.name }))} /></div>
            <MagneticButton onClick={generate} disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <><Spinner className="h-4 w-4" /> Generating…</> : <><Sparkles className="h-4 w-4" /> Generate Pitch</>}
            </MagneticButton>
          </div>
        </Card>

        {templateId && (
          <Card size="sm" className="bg-slate-50/60">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5"><Lightbulb className="h-4 w-4 text-amber-500" /> Template guidelines</div>
            <div className="text-xs text-slate-500 space-y-1">
              {(templates.find((t) => t.template_id === templateId)?.techniques || []).slice(0, 3).map((t, i) => <div key={i}>• {t}</div>)}
            </div>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <Card className="space-y-2.5"><Skeleton className="h-8 w-2/3" />{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</Card>
        ) : !script ? (
          <Card className="h-full min-h-[340px] grid place-items-center">
            <EmptyState icon={FileText} title="Your pitch will appear here" subtitle="Choose a customer and product above, then hit Generate to craft a personalized, compliance-checked script with dynamic call controls built right in." />
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
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
                <div className="mt-2.5 space-y-1.5">
                  {script.compliance.flags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs rounded-lg bg-amber-50 border border-amber-100 p-2.5">
                      <MessageSquareWarning className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div><span className="font-medium text-amber-700">{f.issue}</span><span className="text-amber-600"> — {f.suggestion}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="space-y-1">
                {script.script_content.map((sec, i) => (
                  <ScriptSection
                    key={i}
                    index={i}
                    section={sec}
                    scenarios={bySection.get(i) || []}
                    onCopySection={copy}
                    copiedId={copied}
                    onRegenerate={regenerate}
                    regenKey={regenKey}
                    onCopyScenario={copyScenario}
                    copiedScenarioId={copiedScenario}
                  />
                ))}
              </div>
              {script.talking_points?.length > 0 && (
                <div className="mt-2.5 rounded-xl bg-brand-50/50 border border-brand-100 p-3.5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Key talking points</div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {script.talking_points.map((t, i) => <div key={i} className="text-sm text-slate-600 flex items-start gap-1.5"><span className="text-brand-400">▸</span>{t}</div>)}
                  </div>
                </div>
              )}
              <ScenarioRail scenarios={unmatched} onRegenerate={regenerate} regenKey={regenKey} onCopy={copyScenario} copiedId={copiedScenario} />
            </Card>

            <FeedbackBox scriptId={script.script_id} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
