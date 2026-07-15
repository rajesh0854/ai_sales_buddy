"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Count-up number. `format` receives the rounded numeric value and returns
 * the display string (e.g. wire up lib/utils formatINR).
 */
export function AnimatedCounter({ value = 0, format = (n) => n.toLocaleString(), duration = 1, className }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => format(Math.round(v)));
  const ref = useRef(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return display.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
  }, [display]);

  return <motion.span ref={ref} className={className}>{format(0)}</motion.span>;
}
