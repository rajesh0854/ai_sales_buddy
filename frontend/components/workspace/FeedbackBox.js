"use client";
import { useState } from "react";
import { Star, Send, Check } from "lucide-react";
import { Card, Select } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function FeedbackBox({ scriptId }) {
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
      <div className="flex items-center gap-2 mb-2.5"><Star className="h-4 w-4 text-amber-400" /><span className="font-semibold text-slate-800">Rate this pitch</span></div>
      <div className="flex items-center gap-1 mb-2.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
            <Star className={cn("h-6 w-6 transition-colors", (hover || rating) >= n ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        <Select value={outcome} onChange={setOutcome} placeholder="Call outcome (optional)"
          options={["Converted", "Interested", "Callback", "Rejected", "No Answer"]} />
        <input value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Comments…" className="input" />
      </div>
      <button onClick={submit} className="btn-primary mt-2.5 text-sm"><Send className="h-4 w-4" /> Submit feedback</button>
    </Card>
  );
}
