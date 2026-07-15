"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate, Plus, Pencil, Trash2, Sparkles, Star, X, Check,
  Lightbulb, TrendingUp, MessageSquare,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, Badge, Skeleton, Spinner, EmptyState, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const EMPTY = { name: "", description: "", channel: "Both", tone: "Warm & Consultative", structure: [], rules: [], techniques: [], is_default: 0 };

export default function TemplatesPage() {
  const toast = useToast();
  const [templates, setTemplates] = useState(null);
  const [guides, setGuides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [genGuide, setGenGuide] = useState(false);

  function refresh() {
    api.listTemplates().then((d) => setTemplates(d.templates)).catch(() => setTemplates([]));
    api.listGuides().then((d) => setGuides(d.guides)).catch(() => {});
  }
  useEffect(() => { refresh(); }, []);

  async function save(form) {
    try {
      const body = { ...form, created_by: getUser()?.user_id };
      if (form.template_id) await api.updateTemplate(form.template_id, body);
      else await api.createTemplate(body);
      toast.success("Template saved");
      setEditing(null); refresh();
    } catch (e) { toast.error("Save failed"); }
  }

  async function remove(id) {
    try { await api.deleteTemplate(id); toast.success("Template deleted"); refresh(); }
    catch (e) { toast.error("Delete failed"); }
  }

  async function generateGuide() {
    setGenGuide(true);
    try { await api.generateGuide(); toast.success("Improvement guide generated"); refresh(); }
    catch (e) { toast.error(e.message || "Need feedback data first"); }
    finally { setGenGuide(false); }
  }

  return (
    <div>
      <Topbar title="Templates & Improvement" subtitle="Customize pitch templates and let AI suggest improvements from feedback." />
      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle title="Pitch templates" subtitle="Rules & techniques that steer script generation" />
            <button onClick={() => setEditing(EMPTY)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> New template</button>
          </div>
          {!templates ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />) :
            templates.map((t, i) => (
              <motion.div key={t.template_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 grid place-items-center text-white"><LayoutTemplate className="h-5 w-5" /></div>
                      <div>
                        <div className="flex items-center gap-2"><h3 className="font-semibold text-slate-800">{t.name}</h3>{t.is_default === 1 && <Badge className="bg-brand-50 text-brand-600"><Star className="h-3 w-3 fill-brand-400" /> Default</Badge>}</div>
                        <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>
                        <div className="flex gap-1.5 mt-2"><Badge className="bg-slate-100 text-slate-500">{t.channel}</Badge><Badge className="bg-slate-100 text-slate-500">{t.tone}</Badge></div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(t)} className="h-8 w-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-400 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                      {t.is_default !== 1 && <button onClick={() => remove(t.template_id)} className="h-8 w-8 rounded-lg hover:bg-rose-50 grid place-items-center text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                    <div><div className="text-xs font-semibold text-slate-400 uppercase mb-1">Rules</div>{(t.rules || []).slice(0, 3).map((r, j) => <div key={j} className="text-xs text-slate-500">• {r}</div>)}</div>
                    <div><div className="text-xs font-semibold text-slate-400 uppercase mb-1">Techniques</div>{(t.techniques || []).slice(0, 3).map((r, j) => <div key={j} className="text-xs text-slate-500">• {r}</div>)}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>

        {/* Improvement guides */}
        <div>
          <Card className="bg-gradient-to-br from-brand-600 to-violet-600 text-white mb-4">
            <div className="flex items-center gap-2 mb-2"><Lightbulb className="h-5 w-5" /><span className="font-semibold">AI Improvement Engine</span></div>
            <p className="text-sm text-white/80 mb-3">Analyse agent feedback and generate concrete suggestions to fold back into templates.</p>
            <button onClick={generateGuide} disabled={genGuide} className="btn bg-white text-brand-700 px-4 py-2.5 text-sm w-full hover:bg-brand-50">
              {genGuide ? <><Spinner className="h-4 w-4" /> Analysing feedback…</> : <><Sparkles className="h-4 w-4" /> Generate guide</>}
            </button>
          </Card>

          <SectionTitle title="Improvement guides" />
          <div className="space-y-3">
            {guides.length === 0 ? <Card><EmptyState icon={TrendingUp} title="No guides yet" subtitle="Generate one from feedback." /></Card> :
              guides.map((g) => (
                <Card key={g.guide_id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{g.title}</span>
                    <Badge className="bg-amber-50 text-amber-600"><Star className="h-3 w-3 fill-amber-400" />{g.avg_rating}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{g.summary}</p>
                  <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Based on {g.based_on_count} feedbacks</div>
                  <div className="space-y-1.5">
                    {(g.suggestions || []).map((s, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-2.5">
                        <div className="flex items-center gap-1.5"><Badge className="bg-brand-50 text-brand-600 text-[10px]">{s.area}</Badge></div>
                        <div className="text-xs text-slate-600 mt-1">{s.suggestion}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>

      <AnimatePresence>{editing && <TemplateEditor initial={editing} onClose={() => setEditing(null)} onSave={save} />}</AnimatePresence>
    </div>
  );
}

function TemplateEditor({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    ...initial,
    structure: (initial.structure || []).join("\n"),
    rules: (initial.rules || []).join("\n"),
    techniques: (initial.techniques || []).join("\n"),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toList = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">{form.template_id ? "Edit template" : "New template"}</h3>
            <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 grid place-items-center"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Channel</label>
                <select className="input" value={form.channel} onChange={(e) => set("channel", e.target.value)}>{["Both", "Telecalling", "Face-to-Face"].map((o) => <option key={o}>{o}</option>)}</select></div>
              <div><label className="label">Tone</label>
                <select className="input" value={form.tone} onChange={(e) => set("tone", e.target.value)}>{["Warm & Consultative", "Confident & Direct", "Confident & Advisory"].map((o) => <option key={o}>{o}</option>)}</select></div>
            </div>
            <div><label className="label">Structure (one section per line)</label><textarea rows={3} className="input resize-none" value={form.structure} onChange={(e) => set("structure", e.target.value)} /></div>
            <div><label className="label">Rules (one per line)</label><textarea rows={3} className="input resize-none" value={form.rules} onChange={(e) => set("rules", e.target.value)} /></div>
            <div><label className="label">Techniques (one per line)</label><textarea rows={3} className="input resize-none" value={form.techniques} onChange={(e) => set("techniques", e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.is_default === 1} onChange={(e) => set("is_default", e.target.checked ? 1 : 0)} className="h-4 w-4 rounded" /> Set as default template</label>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="btn-ghost text-sm flex-1">Cancel</button>
            <button onClick={() => onSave({ ...form, structure: toList(form.structure), rules: toList(form.rules), techniques: toList(form.techniques) })} className="btn-primary text-sm flex-1"><Check className="h-4 w-4" /> Save</button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
