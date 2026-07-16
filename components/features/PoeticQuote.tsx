"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function PoeticQuote({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const words = text.split(/\s+/);

  if (reduce) return <>{text}</>;

  return (
    <motion.span
      className="poetic-quote inline-block"
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.045 } },
      }}
    >
      {words.map((word, index) => (
        <motion.span
          aria-hidden="true"
          className="mr-[0.27em] inline-block"
          key={`${word}-${index}`}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
      <motion.span
        aria-hidden="true"
        className="mx-auto mt-3 block h-px w-[78%] origin-center bg-gradient-to-r from-transparent via-gold-light to-transparent"
        variants={{
          hidden: { opacity: 0, scaleX: 0 },
          show: {
            opacity: 0.85,
            scaleX: 1,
            transition: { duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      />
    </motion.span>
  );
}
