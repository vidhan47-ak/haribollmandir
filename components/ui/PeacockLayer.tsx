"use client";

import { useState } from "react";
import PeacockOrnament from "@/components/ui/PeacockOrnament";

interface PeacockLayerProps {
  /** Which side of the hero this peacock frames. */
  side: "left" | "right";
  /** Path to the real peacock photo (transparent PNG). */
  src: string;
  className?: string;
}

/**
 * Renders a real peacock photo when the file is present, and gracefully
 * falls back to the hand-authored SVG {@link PeacockOrnament} when the
 * file is missing (onError). Only ONE is ever shown at a time — never
 * both. Purely decorative (aria-hidden).
 *
 * The real PNGs are expected to already face inward, so the <img> is NOT
 * CSS-mirrored; only the SVG fallback mirrors itself via its `side` prop.
 */
export default function PeacockLayer({
  side,
  src,
  className = "",
}: PeacockLayerProps) {
  const [error, setError] = useState(false);

  // Missing photo -> show the ornamental SVG instead of a broken image.
  if (error) {
    return <PeacockOrnament side={side} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="eager"
      onError={() => setError(true)}
      className={`block ${className}`}
    />
  );
}
