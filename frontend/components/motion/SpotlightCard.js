"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Card wrapper that tracks the cursor: renders a radial spotlight following
 * the pointer and applies a subtle 3D tilt. Falls back to a plain Card on
 * touch (no mousemove).
 */
export function SpotlightCard({ children, className, tilt = true, spotlightColor = "rgba(79,70,229,0.14)", ...cardProps }) {
  const ref = useRef(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const [hovering, setHovering] = useState(false);

  function onMouseMove(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    mx.set(px);
    my.set(py);
    if (tilt) {
      ry.set((px - 50) / 10);
      rx.set(-(py - 50) / 10);
    }
  }

  function onMouseLeave() {
    setHovering(false);
    if (tilt) {
      rx.set(0);
      ry.set(0);
    }
  }

  const background = useTransform([mx, my], ([x, y]) => `radial-gradient(320px circle at ${x}% ${y}%, ${spotlightColor}, transparent 70%)`);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={onMouseLeave}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined}
      className="relative"
    >
      <Card className={cn("relative overflow-hidden", className)} {...cardProps}>
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: hovering ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ background }}
        />
        <div className="relative">{children}</div>
      </Card>
    </motion.div>
  );
}
