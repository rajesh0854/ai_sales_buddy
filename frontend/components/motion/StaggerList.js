"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: (stagger) => ({ transition: { staggerChildren: stagger } }),
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/**
 * Generic staggered-reveal wrapper. Replaces the hand-rolled
 * `transition={{ delay: i * 0.06 }}` pattern duplicated across pages.
 * Pass an array of `items` and a `renderItem(item, index)` function.
 */
export function StaggerList({ items, renderItem, stagger = 0.06, className, itemClassName, as: As = "div" }) {
  const Container = motion[As] || motion.div;
  return (
    <Container initial="hidden" animate="show" custom={stagger} variants={container} className={className}>
      {items.map((it, i) => (
        <motion.div key={it.key ?? it.id ?? i} variants={item} className={itemClassName}>
          {renderItem(it, i)}
        </motion.div>
      ))}
    </Container>
  );
}
