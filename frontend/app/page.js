"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, ShieldCheck, MessageSquareText, BarChart3, ArrowRight,
  Bot, FileText, Languages, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { saveUser, getUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";

const FEATURES = [
  { icon: FileText, title: "AI Pitch Scripts", desc: "Personalized, ready-to-speak scripts from customer data." },
  { icon: Bot, title: "Live Call Co-pilot", desc: "Dynamic script controls & instant chatbot answers." },
  { icon: ShieldCheck, title: "Compliance Guardrails", desc: "RBI-aware mis-selling checks on every pitch." },
  { icon: BarChart3, title: "Sales Analytics", desc: "Conversion, pipeline & agent performance insights." },
];

export default function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("rajesh.kumar");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getUser()) router.replace("/dashboard");
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await api.login(username, password);
      saveUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* floating blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Logo size="lg" />
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span className="chip bg-white/70 backdrop-blur ring-1 ring-slate-200 text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Powered by Gemini
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: hero */}
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 mb-5">
              <Sparkles className="h-3.5 w-3.5" /> AI Sales Enablement for Banking
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              Turn recommendations into
              <span className="text-gradient"> winning conversations.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl leading-relaxed">
              EXL Bank AI Sales Buddy analyses each customer&apos;s profile and product recommendations to craft
              highly personalized, ready-to-speak sales pitches — so every agent sounds like your best agent.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 grid sm:grid-cols-2 gap-3 max-w-xl"
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="flex items-start gap-3 rounded-2xl bg-white/70 backdrop-blur border border-white/80 p-3.5 shadow-soft"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 grid place-items-center text-white shrink-0">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800">{f.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: login card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="card p-8 backdrop-blur bg-white/90 border-white/60 shadow-glow">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to your sales workspace.</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="label">Username</label>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. rajesh.kumar" autoFocus />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                  {error}
                </motion.div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Demo logins</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[["rajesh.kumar", "demo123", "Agent"], ["admin", "admin123", "Admin"]].map(([u, p, r]) => (
                  <button key={u} type="button" onClick={() => { setUsername(u); setPassword(p); }}
                    className="text-left rounded-lg bg-white border border-slate-200 px-2.5 py-2 hover:border-brand-300 hover:bg-brand-50/50 transition">
                    <div className="font-medium text-slate-700">{u}</div>
                    <div className="text-slate-400">{r} · {p}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
            <Languages className="h-3.5 w-3.5" /> Multilingual pitches ·
            <MessageSquareText className="h-3.5 w-3.5" /> Live co-pilot ·
            <ShieldCheck className="h-3.5 w-3.5" /> Compliance-checked
          </p>
        </motion.div>
      </main>
    </div>
  );
}
