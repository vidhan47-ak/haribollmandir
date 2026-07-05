"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import FallbackImage from "@/components/ui/FallbackImage";
import type { Palette } from "@/lib/images";

interface ParallaxImageProps {
  src: string;
  alt: string;
  label?: string;
  palette?: Palette;
  className?: string;
  imgClassName?: string;
  amount?: number;
  loading?: "lazy" | "eager";
}

/**
 * Image with a gentle vertical parallax as it scrolls through the viewport.
 * The image is slightly oversized so the movement never reveals an edge.
 */
export default function ParallaxImage({
  src,
  alt,
  label,
  palette = "maroon",
  className = "",
  imgClassName = "h-full w-full object-cover",
  amount = 42,
  loading = "lazy",
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y: reduce ? 0 : y }}
        className="absolute inset-x-0 -top-[8%] h-[116%] will-change-transform"
      >
        <FallbackImage
          src={src}
          alt={alt}
          label={label}
          palette={palette}
          loading={loading}
          className={imgClassName}
        />
      </motion.div>
    </div>
  );
}
