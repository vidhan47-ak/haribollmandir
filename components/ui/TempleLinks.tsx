"use client";

/* ------------------------------------------------------------------ */
/*  Ways to reach the mandir.                                          */
/*                                                                     */
/*  Every link and the temple email come from lib/temple.ts, so the     */
/*  footer, the Visit Us panel and the mobile menu can never drift out  */
/*  of sync with each other.                                            */
/* ------------------------------------------------------------------ */

import type { TempleLink, TempleLinkId } from "@/lib/temple";
import { TEMPLE_LINKS } from "@/lib/temple";
import type { Lang } from "@/lib/i18n";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.2h2.4l.36-2.8H13.5V9.24c0-.81.22-1.36 1.38-1.36h1.47V5.37A19.7 19.7 0 0 0 14.2 5.25c-2.13 0-3.58 1.3-3.58 3.69V11H8.25v2.8h2.37V21h2.88Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5v5l4.2-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3.2 21l4.5-1.1A9 9 0 1 0 12 3Z" />
      <path d="M9 9.3c0 3 2.4 5.4 5.4 5.4l.9-1.5-1.9-.7-.8.8a4.4 4.4 0 0 1-2-2l.8-.8-.7-1.9-1.7.7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BroadcastIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 15.8a5.4 5.4 0 0 0 0-7.6" />
      <path d="M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 18.5a9.2 9.2 0 0 0 0-13" opacity="0.55" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 7.4 5.4a1.4 1.4 0 0 0 1.6 0L20.2 7" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.4-7-11a7 7 0 1 1 14 0c0 4.6-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

const ICONS: Record<TempleLinkId, () => React.JSX.Element> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
  broadcast: BroadcastIcon,
  email: MailIcon,
  maps: MapPinIcon,
};

export function TempleLinkIcon({
  id,
  className = "h-5 w-5",
}: {
  id: TempleLinkId;
  className?: string;
}) {
  const Icon = ICONS[id];
  return (
    <span className={`${className} inline-block shrink-0`}>
      <Icon />
    </span>
  );
}

/** Attributes an external link needs; internal (mailto) links must not get them. */
function targetProps(link: TempleLink) {
  return link.external
    ? { target: "_blank", rel: "noopener noreferrer" as const }
    : {};
}

/**
 * The full list, as rows with a label and a line of context. Used in the
 * Visit Us panel where there is room to explain each one.
 */
export function TempleLinkRows({
  lang,
  ids,
  className = "",
}: {
  lang: Lang;
  /** Restrict and order the list; defaults to every link. */
  ids?: readonly TempleLinkId[];
  className?: string;
}) {
  const links = ids
    ? ids.map((id) => TEMPLE_LINKS.find((l) => l.id === id)!).filter(Boolean)
    : TEMPLE_LINKS;

  return (
    <ul className={`grid gap-2 min-w-0 sm:grid-cols-2 ${className}`}>
      {links.map((link) => (
        <li key={link.id} className="min-w-0">
          <a
            href={link.href}
            {...targetProps(link)}
            className="temple-link-row group flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-gold/25 bg-white/55 px-3 py-2.5 sm:px-3.5 sm:py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 min-w-0 overflow-hidden"
          >
            <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl border border-gold/30 bg-cream-50 text-gold-deep">
              <TempleLinkIcon id={link.id} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </span>
            <span className="min-w-0 flex-1 overflow-hidden">
              <span className="block truncate font-heading text-xs sm:text-[15px] font-semibold leading-tight text-maroon">
                {lang === "hi" ? link.labelHi : link.label}
              </span>
              <span className="mt-0.5 block truncate font-body text-[11px] sm:text-xs text-ink-soft">
                {link.handle ?? (lang === "hi" ? link.noteHi : link.note)}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Compact icon row for the footer. Labels stay available to screen readers
 * and as titles, so the icons are never the only affordance.
 */
export function TempleSocialIcons({
  lang,
  ids,
  className = "",
}: {
  lang: Lang;
  ids?: readonly TempleLinkId[];
  className?: string;
}) {
  const links = ids
    ? ids.map((id) => TEMPLE_LINKS.find((l) => l.id === id)!).filter(Boolean)
    : TEMPLE_LINKS.filter((l) => l.id !== "email" && l.id !== "maps");

  return (
    <ul className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {links.map((link) => {
        const label = lang === "hi" ? link.labelHi : link.label;
        return (
          <li key={link.id}>
            <a
              href={link.href}
              {...targetProps(link)}
              title={label}
              className="temple-social-icon grid h-10 w-10 place-items-center rounded-full border border-gold-light/40 text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
            >
              <TempleLinkIcon id={link.id} className="h-[18px] w-[18px]" />
              <span className="sr-only">{label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
