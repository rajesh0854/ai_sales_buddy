"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Staggered per-word reveal for bold headlines.
 * Splits `text` on whitespace; each word fades+rises in with an incremental delay.
 */
export function TextReveal({ text, className, wordClassName, delay = 0, stagger = 0.045, as = "span" }) {
  const words = text.split(" ");
  const Tag = motion[as] || motion.span;
  return (
    <Tag className={cn("inline-block", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: "0.6em", filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
          className={cn("inline-block will-change-transform", wordClassName)}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
