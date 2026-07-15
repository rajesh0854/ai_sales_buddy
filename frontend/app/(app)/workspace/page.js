"use client";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { Skeleton } from "@/components/ui";
import { useWorkspace } from "@/components/WorkspaceContext";
import { CustomerProductPicker } from "@/components/workspace/CustomerProductPicker";
import { PitchPanel } from "@/components/workspace/PitchPanel";
import { EligibilityPanel } from "@/components/workspace/EligibilityPanel";
import { NotesPanel } from "@/components/workspace/NotesPanel";
import { MessagingPanel } from "@/components/workspace/MessagingPanel";
import { BlobBackground } from "@/components/motion/BlobBackground";

const TABS = ["pitch", "eligibility", "notes", "messaging"];
const SUBTITLES = {
  pitch: "Generate a personalized, ready-to-speak sales script — with dynamic call controls built right in.",
  eligibility: "Validate a recommendation against product policy before you pitch.",
  notes: "Capture notes — AI turns them into intelligence, events and reminders.",
  messaging: "Send personalized Email & WhatsApp messages to customers.",
};

function WorkspaceScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const ws = useWorkspace();
  const hydratedRef = useRef(false);

  useEffect(() => {
    ws.loadReferenceData();
  }, []);

  // One-time: hydrate context from ?customer=&product=&tab= (deep links from
  // Customer 360, Dashboard, or the redirected legacy routes).
  useEffect(() => {
    const c = params.get("customer");
    const p = params.get("product");
    const tab = params.get("tab");
    if (c) ws.setCustomerId(c);
    if (p) ws.setProductId(p);
    if (tab && TABS.includes(tab)) ws.setActiveTab(tab);
    hydratedRef.current = true;
  }, []);

  // Ongoing: keep the URL in sync with the workspace selection so it stays
  // shareable/reloadable. `replace` (not `push`) keeps one history entry for
  // the whole visit regardless of how many picks/tab-switches happen.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const qs = new URLSearchParams();
    qs.set("tab", ws.activeTab);
    if (ws.customerId) qs.set("customer", ws.customerId);
    if (ws.productId) qs.set("product", ws.productId);
    router.replace(`/workspace?${qs.toString()}`, { scroll: false });
  }, [ws.customerId, ws.productId, ws.activeTab]);

  return (
    <div>
      <div className="sticky top-0 z-30">
        <div className="relative">
          <BlobBackground count={2} />
          <Topbar title="Call Workspace" subtitle={SUBTITLES[ws.activeTab]} />
        </div>
        <CustomerProductPicker />
      </div>
      <div className="p-4">
        {ws.activeTab === "pitch" && <PitchPanel />}
        {ws.activeTab === "eligibility" && <EligibilityPanel />}
        {ws.activeTab === "notes" && <NotesPanel />}
        {ws.activeTab === "messaging" && <MessagingPanel />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
      <WorkspaceScreen />
    </Suspense>
  );
}
