"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const TAGS = { button: motion.button, a: motion.a, div: motion.div };

/**
 * Wraps a button/element and nudges it toward the cursor within `strength`.
 * Renders as a plain <button> when `as="button"` (default), so it drops
 * straight in for existing .btn-primary etc. call sites.
 */
export function MagneticButton({ as = "button", children, className, strength = 14, ...props }) {
  const MotionTag = TAGS[as] || motion.button;
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  function onMouseMove(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set((relX / (rect.width / 2)) * strength);
    y.set((relY / (rect.height / 2)) * strength);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionTag
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
