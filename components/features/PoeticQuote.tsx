"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function PoeticQuote({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const words = text.split(/\s+/);

  if (reduce) return <>{text}</>;

  return (
    <motion.span
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.055 } },
      }}
    >
      {words.map((word, index) => (
        <motion.span
          aria-hidden="true"
          className="mr-[0.27em] inline-block"
          key={`${word}-${index}`}
          variants={{
            hidden: { opacity: 0, y: 16, filter: "blur(5px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

