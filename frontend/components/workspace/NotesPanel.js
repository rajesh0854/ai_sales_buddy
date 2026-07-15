"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StickyNote, Sparkles, Calendar, Clock, Check, Smile, Meh, Frown, Bell, Phone } from "lucide-react";
import { Card, Skeleton, Badge, Spinner, Avatar, EmptyState, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useWorkspace } from "@/components/WorkspaceContext";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/motion/MagneticButton";

const sentimentStyle = {
  Positive: { cls: "bg-emerald-50 text-emerald-600", Icon: Smile },
  Neutral: { cls: "bg-slate-100 text-slate-500", Icon: Meh },
  Negative: { cls: "bg-rose-50 text-rose-600", Icon: Frown },
};

export function NotesPanel() {
  const toast = useToast();
  const { customerId } = useWorkspace();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(null);
  const [followUps, setFollowUps] = useState([]);

  function refresh() {
    api.listNotes().then((d) => setNotes(d.notes)).catch(() => setNotes([]));
    api.followUps({}).then((d) => setFollowUps(d.follow_ups)).catch(() => {});
  }

  useEffect(() => { refresh(); }, []);

  async function save() {
    if (!customerId) { toast.error("Select a customer above first"); return; }
    if (!content.trim()) { toast.error("Write a note first"); return; }
    setSaving(true);
    try {
      const note = await api.createNote({ customer_id: customerId, agent_id: getUser()?.user_id, content });
      setContent("");
      if (note.follow_up_created) toast.success(`Note saved & follow-up scheduled for ${note.follow_up_created.due_date}`);
      else toast.success("Note saved with AI intelligence");
      refresh();
    } catch (e) { toast.error("Could not save note"); } finally { setSaving(false); }
  }

  async function toggleFollowUp(f) {
    const next = f.status === "Done" ? "Pending" : "Done";
    await api.updateFollowUp(f.followup_id, next);
    refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        <Card>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 grid place-items-center text-white"><StickyNote className="h-4.5 w-4.5" /></div>
            <div><div className="font-semibold text-slate-800">New note</div><div className="text-xs text-slate-400">Logged against the customer selected above. AI extracts sentiment & schedules follow-ups automatically</div></div>
          </div>
          <div className="space-y-2.5">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="input resize-none"
              placeholder="e.g. Customer keen on home loan, wants a callback next Tuesday at 4pm to discuss rates…" />
            <MagneticButton onClick={save} disabled={saving} className="btn-primary text-sm">
              {saving ? <><Spinner className="h-4 w-4" /> Analysing…</> : <><Sparkles className="h-4 w-4" /> Save & analyse</>}
            </MagneticButton>
          </div>
        </Card>

        <div>
          <SectionTitle title="Recent notes" />
          <div className="space-y-2.5">
            {!notes ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />) :
              notes.length === 0 ? <Card><EmptyState icon={StickyNote} title="No notes yet" subtitle="Your captured notes will appear here." /></Card> :
              notes.map((n, i) => {
                const s = sentimentStyle[n.sentiment] || sentimentStyle.Neutral;
                return (
                  <motion.div key={n.note_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                    <Card>
                      <div className="flex items-start gap-3">
                        <Avatar name={n.full_name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">{n.full_name}</span>
                            <div className="flex items-center gap-2">
                              <span className={cn("chip", s.cls)}><s.Icon className="h-3 w-3" />{n.sentiment}</span>
                              <span className="text-xs text-slate-400">{n.created_at}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-1.5">{n.content}</p>
                          {n.ai_summary && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-brand-600 bg-brand-50/50 rounded-lg px-2.5 py-1.5">
                              <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{n.ai_summary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle title="Follow-ups & events" right={<Bell className="h-4 w-4 text-brand-500" />} />
        <div className="space-y-2">
          {followUps.length === 0 ? <Card><EmptyState icon={Calendar} title="No follow-ups" subtitle="AI-detected reminders show up here." /></Card> :
            followUps.map((f, i) => (
              <motion.div key={f.followup_id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                <Card size="sm" className={cn(f.status === "Done" && "opacity-60")}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleFollowUp(f)} className={cn("h-6 w-6 rounded-lg border-2 grid place-items-center shrink-0 mt-0.5 transition", f.status === "Done" ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-brand-400")}>
                      {f.status === "Done" && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm font-medium text-slate-800", f.status === "Done" && "line-through")}>{f.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{f.full_name}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="chip bg-slate-100 text-slate-500 text-[11px]"><Calendar className="h-3 w-3" />{f.due_date}</span>
                        {f.due_time && <span className="chip bg-slate-100 text-slate-500 text-[11px]"><Clock className="h-3 w-3" />{f.due_time}</span>}
                        <span className={cn("chip text-[11px]", f.type === "Callback" ? "bg-brand-50 text-brand-600" : "bg-amber-50 text-amber-700")}>
                          {f.type === "Callback" && <Phone className="h-3 w-3" />}{f.type}
                        </span>
                      </div>
                    </div>
                    <Badge className={cn(f.priority === "High" ? "bg-rose-50 text-rose-600" : f.priority === "Medium" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500")}>{f.priority}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
