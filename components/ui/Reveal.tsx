"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  blur?: boolean;
  once?: boolean;
  as?: "div" | "section" | "span" | "li" | "figure";
}

/** Soft fade + slide-up reveal when the element scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  duration = 0.92,
  blur = false,
  once = true,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{
        opacity: 0,
        y,
        filter: blur ? "blur(8px)" : "blur(0px)",
      }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-48px 0px -48px 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

/** Container that staggers the reveal of its <StaggerItem> children. */
export function Stagger({
  children,
  className,
  delayChildren = 0.1,
  staggerChildren = 0.1,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: reduce ? 0 : delayChildren,
        staggerChildren: reduce ? 0 : staggerChildren,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-48px 0px -48px 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 30,
  x = 0,
  scale = 1,
  duration = 0.88,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  x?: number;
  scale?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : y,
      x: reduce ? 0 : x,
      scale: reduce ? 1 : scale,
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration: reduce ? 0 : duration, ease: EASE },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
