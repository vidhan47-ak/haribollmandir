"use client";

import { useEffect } from "react";

/**
 * Per-section colour moods: as the reader scrolls the homepage, an accent
 * colour (--mood / --mood-soft on <html>) crossfades to match the section in
 * view. Consumers: the scroll filament, ceremonial dividers and the fixed
 * mood veil rendered here.
 */
type Mood = { accent: string; soft: string };

const SECTION_MOODS: Record<string, Mood> = {
  home: { accent: "#146B7C", soft: "rgba(20, 107, 124, 0.12)" }, // peacock teal
  darshan: { accent: "#C9A24B", soft: "rgba(201, 162, 75, 0.14)" }, // temple gold
  about: { accent: "#356150", soft: "rgba(53, 97, 80, 0.13)" }, // forest
  seva: { accent: "#A45A3A", soft: "rgba(164, 90, 58, 0.14)" }, // terracotta
  festivals: { accent: "#C47A2C", soft: "rgba(196, 122, 44, 0.15)" }, // saffron
  gallery: { accent: "#2E92A6", soft: "rgba(46, 146, 166, 0.13)" }, // peacock light
  visit: { accent: "#8A2C3A", soft: "rgba(138, 44, 58, 0.13)" }, // maroon
  footer: { accent: "#D0AA57", soft: "rgba(208, 170, 87, 0.13)" }, // warm gold
};

const BAND_MOODS: Record<string, Mood> = {
  gold: SECTION_MOODS.darshan,
  forest: SECTION_MOODS.about,
  maroon: SECTION_MOODS.visit,
};

const DEFAULT_MOOD = SECTION_MOODS.home;

export default function SectionMoods() {
  useEffect(() => {
    const root = document.documentElement;
    const idSections = Object.keys(SECTION_MOODS)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const bandSections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-mood]"),
    );
    const sections = Array.from(new Set([...idSections, ...bandSections]));
    if (sections.length === 0) return;

    /**
     * Writes the DESTINATION colour, not the animated one.
     *
     * These used to be `--mood` / `--mood-soft` — registered `inherits: true`
     * and transitioned on `:root`, so each section change kicked off 1.4s of
     * animated whole-document style resolution, roughly eight times per pass
     * down the homepage. The consumers (`.mood-veil`, `.ceremonial-divider`)
     * now own the transition, so this is a single cheap recalculation.
     */
    const applyMood = (mood: Mood) => {
      root.style.setProperty("--mood-target", mood.accent);
      root.style.setProperty("--mood-soft-target", mood.soft);
    };

    applyMood(DEFAULT_MOOD);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = entry.target as HTMLElement;
          const bandMood = section.dataset.sectionMood;
          const mood = bandMood
            ? BAND_MOODS[bandMood]
            : SECTION_MOODS[section.id];
          applyMood(mood ?? DEFAULT_MOOD);
        });
      },
      // Fire when a section's band crosses the middle of the viewport.
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      root.style.removeProperty("--mood-target");
      root.style.removeProperty("--mood-soft-target");
    };
  }, []);

  return <div className="mood-veil" aria-hidden="true" />;
}
