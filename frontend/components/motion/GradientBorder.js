"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Rotating conic-gradient border ring around its children (masked so only
 * the border shows). Use to highlight a "top pick" badge or an active chip.
 */
export function GradientBorder({ children, className, borderWidth = 2, colors = "from-brand-500 via-fuchsia-500 to-amber-400", rounded = "rounded-2xl" }) {
  return (
    <div className={cn("relative isolate", rounded, className)} style={{ padding: borderWidth }}>
      <motion.div
        className={cn("absolute inset-0 bg-gradient-to-r opacity-90", colors, rounded)}
        style={{ backgroundSize: "300% 300%" }}
        animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
      />
      <div className={cn("relative bg-white", rounded)}>{children}</div>
    </div>
  );
}
