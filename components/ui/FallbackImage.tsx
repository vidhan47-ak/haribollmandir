"use client";

import { useState } from "react";
import type { Palette } from "@/lib/images";

interface PaletteDef {
  from: string;
  to: string;
  ink: string;
  accent: string;
}

const palettes: Record<Palette, PaletteDef> = {
  maroon: { from: "#7B2D3A", to: "#4A1219", ink: "#F3E0C9", accent: "#E3C77E" },
  gold: { from: "#E3C77E", to: "#A8842F", ink: "#4A1219", accent: "#6E1E2A" },
  forest: { from: "#356150", to: "#152B22", ink: "#EAD9B8", accent: "#E3C77E" },
  sky: { from: "#C4D8E2", to: "#5E86A0", ink: "#22333C", accent: "#FBF4E6" },
  cream: { from: "#FEFBF5", to: "#E4D2AF", ink: "#6E1E2A", accent: "#C9A24B" },
};

/**
 * Builds an elegant, themed SVG placeholder (lotus mandala + label) as a
 * data URI. Used automatically when a real photo has not been added yet.
 */
export function makePlaceholder(label: string, palette: Palette = "maroon") {
  const p = palettes[palette];

  const petals = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    return `<path d='M600 650 C 638 596 638 552 600 508 C 562 552 562 596 600 650 Z' transform='rotate(${angle} 600 650)' fill='${p.accent}' fill-opacity='0.16' stroke='${p.accent}' stroke-opacity='0.30' stroke-width='2'/>`;
  }).join("");

  const innerPetals = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30 + 15;
    return `<path d='M600 650 C 626 614 626 586 600 556 C 574 586 574 614 600 650 Z' transform='rotate(${angle} 600 650)' fill='${p.accent}' fill-opacity='0.22' stroke='none'/>`;
  }).join("");

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1500' viewBox='0 0 1200 1500'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.from}'/>
        <stop offset='1' stop-color='${p.to}'/>
      </linearGradient>
      <radialGradient id='glow' cx='50%' cy='43%' r='55%'>
        <stop offset='0' stop-color='${p.accent}' stop-opacity='0.20'/>
        <stop offset='1' stop-color='${p.accent}' stop-opacity='0'/>
      </radialGradient>
    </defs>
    <rect width='1200' height='1500' fill='url(#bg)'/>
    <rect width='1200' height='1500' fill='url(#glow)'/>
    <rect x='40' y='40' width='1120' height='1420' rx='36' fill='none' stroke='${p.accent}' stroke-opacity='0.30' stroke-width='2'/>
    <circle cx='600' cy='650' r='300' fill='none' stroke='${p.accent}' stroke-opacity='0.14' stroke-width='2'/>
    <circle cx='600' cy='650' r='230' fill='none' stroke='${p.accent}' stroke-opacity='0.18' stroke-width='2'/>
    ${petals}
    ${innerPetals}
    <circle cx='600' cy='650' r='34' fill='${p.accent}' fill-opacity='0.30' stroke='${p.accent}' stroke-opacity='0.55' stroke-width='2'/>
    <text x='600' y='1140' text-anchor='middle' font-family='Georgia, "Times New Roman", serif' font-size='58' letter-spacing='2' fill='${p.ink}' fill-opacity='0.92'>${escapeXml(
      label,
    )}</text>
    <text x='600' y='1200' text-anchor='middle' font-family='Georgia, serif' font-size='24' letter-spacing='6' fill='${p.ink}' fill-opacity='0.55'>HARIBOLL MANDIR</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface FallbackImageProps {
  src: string;
  alt: string;
  label?: string;
  palette?: Palette;
  className?: string;
  loading?: "lazy" | "eager";
  draggable?: boolean;
}

/**
 * A plain <img> that gracefully falls back to a beautiful themed
 * placeholder if the real photo is missing. Keeps the site looking
 * premium out of the box and works on any host (no image server needed).
 */
export default function FallbackImage({
  src,
  alt,
  label,
  palette = "maroon",
  className = "h-full w-full object-cover",
  loading = "lazy",
  draggable = false,
}: FallbackImageProps) {
  const placeholder = makePlaceholder(label ?? alt, palette);
  const [currentSrc, setCurrentSrc] = useState(src || placeholder);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={draggable}
      onError={() => {
        if (currentSrc !== placeholder) setCurrentSrc(placeholder);
      }}
      className={className}
    />
  );
}
