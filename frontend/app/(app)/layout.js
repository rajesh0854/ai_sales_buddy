"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatbotDrawer } from "@/components/ChatbotDrawer";
import { ToastProvider } from "@/components/Toast";
import { getUser } from "@/lib/auth";

export default function AppLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getUser()) router.replace("/");
    else setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-mesh">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 animate-pulse" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#f7f8fc]">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
        <ChatbotDrawer />
      </div>
    </ToastProvider>
  );
}
