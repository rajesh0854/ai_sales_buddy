"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((message, type = "success") => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
  const colors = {
    success: "text-emerald-600 bg-emerald-50 border-emerald-100",
    error: "text-rose-600 bg-rose-50 border-rose-100",
    info: "text-brand-600 bg-brand-50 border-brand-100",
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-[340px]">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                className="bg-white rounded-xl shadow-card border border-slate-100 p-3.5 flex items-start gap-3"
              >
                <div className={`h-8 w-8 rounded-lg grid place-items-center border ${colors[t.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-700 flex-1 pt-1">{t.message}</p>
                <button onClick={() => remove(t.id)} className="text-slate-300 hover:text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
