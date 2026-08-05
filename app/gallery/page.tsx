"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/sections/Footer";
import SadhanaDock from "@/components/features/SadhanaDock";
import FallbackImage from "@/components/ui/FallbackImage";
import { useLang } from "@/lib/i18n";
import { GALLERY_ITEMS, type GalleryItem } from "@/lib/gallery-data";

export default function GalleryPage() {
  const { lang } = useLang();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeItem: GalleryItem | null =
    lightboxIndex !== null ? GALLERY_ITEMS[lightboxIndex] ?? null : null;

  const handleNext = useCallback(() => {
    if (lightboxIndex === null || GALLERY_ITEMS.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % GALLERY_ITEMS.length);
  }, [lightboxIndex]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null || GALLERY_ITEMS.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  }, [lightboxIndex]);

  // Keyboard listener for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#2d0c14] via-[#1a060a] to-[#280a11] text-cream font-body selection:bg-gold selection:text-maroon-dark overflow-hidden">
      {/* Warm Ambient Radial Glow Highlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-radial from-[#e5b85c]/18 via-[#8a1c2e]/12 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[650px] bg-gradient-radial from-[#d4af37]/12 via-[#4a0d17]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-[#f3d78e]/10 via-[#2d0c14]/20 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10">
        {/* Header — GRAND & DEVOTIONAL "GALLERY" TITLE */}
        <div className="text-center max-w-3xl mx-auto mt-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#fff4d6] via-[#f3d78e] to-[#c9a24b] drop-shadow-[0_12px_35px_rgba(0,0,0,0.9)]">
              GALLERY
            </h1>
            <p className="mt-2 font-heading text-xl sm:text-2xl text-gold-light/90 tracking-widest uppercase">
              {lang === "hi" ? "चित्रदीर्घा" : "Citradīrghā"}
            </p>
            <div className="divider-lotus my-6" />
          </motion.div>
        </div>

        {/* PURE PHOTO GRID — WARM, VIBRANT & ELEGANT */}
        <div className="mt-10">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
          >
            <AnimatePresence>
              {GALLERY_ITEMS.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35, delay: idx * 0.015 }}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gold/35 bg-[#1c080d]/80 shadow-[0_12px_35px_rgba(0,0,0,0.65)] hover:border-gold-light hover:shadow-[0_18px_50px_rgba(212,175,55,0.35)] backdrop-blur-sm transition-all duration-500"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <FallbackImage
                      src={item.src}
                      alt={item.alt}
                      label=""
                      palette={item.palette}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-devotional group-hover:scale-108"
                    />

                    {/* Warm Subtle Ambient Vignette Frame */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f060b]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Pure Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeItem && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/92 p-4 sm:p-8 backdrop-blur-xl select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col items-center max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-gold/50 bg-gradient-to-b from-[#280c14] to-[#150408] p-3 sm:p-5 shadow-[0_30px_100px_rgba(0,0,0,0.98)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 border border-gold/40 text-cream hover:bg-gold hover:text-maroon-dark transition duration-300"
                aria-label="Close photo"
              >
                ✕
              </button>

              {/* Photo Display */}
              <div className="relative flex items-center justify-center max-h-[82vh] w-full overflow-hidden rounded-2xl bg-black/80">
                <FallbackImage
                  src={activeItem.src}
                  alt={activeItem.alt}
                  label=""
                  palette={activeItem.palette}
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                />

                {/* Left/Right Navigation */}
                {GALLERY_ITEMS.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/75 border border-gold/40 text-gold-light hover:bg-gold hover:text-maroon-dark transition-all duration-300"
                      aria-label="Previous photo"
                    >
                      ◀
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/75 border border-gold/40 text-gold-light hover:bg-gold hover:text-maroon-dark transition-all duration-300"
                      aria-label="Next photo"
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>

              {/* Counter Indicator */}
              <div className="mt-3 flex items-center justify-between w-full px-4 text-xs font-body text-gold-light/70">
                <span>Hariboll Mandir</span>
                <span>
                  {lightboxIndex + 1} / {GALLERY_ITEMS.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sadhana Dock & Site Footer */}
      <SadhanaDock />
      <Footer />
    </div>
  );
}
