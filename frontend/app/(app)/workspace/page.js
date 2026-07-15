"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { Skeleton } from "@/components/ui";
import { useWorkspace } from "@/components/WorkspaceContext";
import { CustomerProductPicker } from "@/components/workspace/CustomerProductPicker";
import { PitchPanel } from "@/components/workspace/PitchPanel";
import { EligibilityPanel } from "@/components/workspace/EligibilityPanel";
import { NotesPanel } from "@/components/workspace/NotesPanel";
import { CustomerDetailsSidebar } from "@/components/workspace/CustomerDetailsSidebar";
import { BlobBackground } from "@/components/motion/BlobBackground";
import { cn } from "@/lib/utils";

const TABS = ["pitch", "eligibility", "notes"];
const SUBTITLES = {
  pitch: "Generate a personalized, ready-to-speak sales script — with dynamic call controls built right in.",
  eligibility: "Validate a recommendation against product policy before you pitch.",
  notes: "Capture notes — AI turns them into intelligence, events and reminders.",
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

  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f7f8fc]">
      <div className="shrink-0 relative z-30">
        <div className="relative">
          <BlobBackground count={2} />
          <Topbar title="Call Workspace" subtitle={SUBTITLES[ws.activeTab]} />
        </div>
        <CustomerProductPicker />
      </div>
      <div className="flex-1 min-h-0 flex relative">
        <div className="flex-1 p-4 overflow-hidden relative">
          <div className={cn("h-full", ws.activeTab === "pitch" ? "" : "hidden")}>
            <PitchPanel />
          </div>
          <div className={cn("h-full", ws.activeTab === "eligibility" ? "" : "hidden")}>
            <EligibilityPanel />
          </div>
          <div className={cn("h-full", ws.activeTab === "notes" ? "" : "hidden")}>
            <NotesPanel />
          </div>
        </div>

        {ws.customerId && (
          <CustomerDetailsSidebar
            show={showDetails}
            onToggle={() => setShowDetails(!showDetails)}
            details={ws.customerDetails}
            loading={ws.loadingDetails}
          />
        )}
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
