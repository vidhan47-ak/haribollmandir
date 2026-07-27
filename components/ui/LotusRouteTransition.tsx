"use client";

import {
  type AnchorHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import "./lotus-route-transition.css";

const DEFAULT_ROUTES = [
  "/",
  "/gaudiya-heritage",
  "/grantha-mandir",
] as const;

const DEFAULT_LABELS: Record<string, string> = {
  "/": "Home",
  "/gaudiya-heritage": "Gaudiya Heritage",
  "/grantha-mandir": "Grantha Mandir",
};

type RouteTheme = "home" | "heritage" | "grantha";

const ROUTE_META: Record<
  string,
  { theme: RouteTheme; code: string }
> = {
  "/": { theme: "home", code: "00" },
  "/gaudiya-heritage": { theme: "heritage", code: "01" },
  "/grantha-mandir": { theme: "grantha", code: "02" },
};

type PetalRing = "outer" | "middle" | "inner";

type IrisPetal = {
  id: string;
  ring: PetalRing;
  style: CSSProperties;
};

function createPetalRing(
  ring: PetalRing,
  count: number,
  angleOffset: number,
  enterStart: number,
  enterStep: number,
  exitStart: number,
  exitStep: number,
): IrisPetal[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${ring}-${index}`,
    ring,
    style: {
      "--iris-angle": `${angleOffset + (360 / count) * index}deg`,
      "--iris-enter-delay": `${enterStart + enterStep * index}ms`,
      "--iris-exit-delay": `${exitStart + exitStep * index}ms`,
      "--iris-petal-index": index,
    } as CSSProperties,
  }));
}

const IRIS_PETALS = [
  ...createPetalRing("outer", 8, 0, 120, 7, 120, 8),
  ...createPetalRing("middle", 6, 30, 90, 9, 70, 9),
  ...createPetalRing("inner", 5, 0, 55, 10, 15, 10),
];

const IRIS_PARTICLES = Array.from({ length: 12 }, (_, index) => ({
  id: `particle-${index}`,
  style: {
    "--iris-particle-angle": `${index * 30}deg`,
    "--iris-particle-distance": `-${22 + (index % 4) * 8}vmin`,
    "--iris-particle-delay": `${index * 14}ms`,
  } as CSSProperties,
}));

type Phase = "idle" | "covering" | "covered" | "revealing" | "history";

type TransitionOrigin = {
  x: number;
  y: number;
};

type NavigationOptions = {
  replace?: boolean;
  scroll?: boolean;
  origin?: TransitionOrigin;
};

type TransitionContextValue = {
  isTransitioning: boolean;
  navigate: (href: string, options?: NavigationOptions) => void;
};

export type LotusTransitionProviderProps = {
  children: ReactNode;
  routes?: readonly string[];
  routeLabels?: Record<string, string>;
  focusTargetSelector?: string;
  centerLogo?: ReactNode;
  centerLogoSrc?: string;
  centerLogoSize?: CSSProperties["width"];
};

type LotusLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string;
  replace?: boolean;
  scroll?: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

// Bridge compatibility: components/ui/ViewTransitions.tsx consumes this hook to
// build useLotusNavigate. It returns the transition context ({ isTransitioning,
// navigate }) when inside the provider, else null.
export function useLotusTransition() {
  return useContext(TransitionContext);
}

function normalizePath(value: string) {
  try {
    const url = new URL(value, "https://hariboll.local");
    const path = url.pathname.replace(/\/+$/, "");
    return path || "/";
  } catch {
    const path = value.split(/[?#]/)[0].replace(/\/+$/, "");
    return path || "/";
  }
}

function resolvePath(value: string, fromPath: string) {
  try {
    const basePath = normalizePath(fromPath);
    const url = new URL(value, `https://hariboll.local${basePath}`);
    return normalizePath(url.pathname);
  } catch {
    return normalizePath(value);
  }
}

function getRouteMeta(path: string) {
  return ROUTE_META[normalizePath(path)] ?? {
    theme: "home" as RouteTheme,
    code: "00",
  };
}

function isExternalHref(href: string) {
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch {
    return true;
  }
}

function focusNewPage(selector: string) {
  let attempts = 0;

  const tryFocus = () => {
    const target = document.querySelector<HTMLElement>(selector);

    if (!target && attempts < 40) {
      attempts += 1;
      window.setTimeout(tryFocus, 100);
      return;
    }

    if (!target) return;

    const alreadyFocusable = target.hasAttribute("tabindex");
    if (!alreadyFocusable) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });

    if (!alreadyFocusable) {
      target.addEventListener(
        "blur",
        () => target.removeAttribute("tabindex"),
        { once: true },
      );
    }
  };

  window.requestAnimationFrame(tryFocus);
}

export function LotusTransitionProvider({
  children,
  routes = DEFAULT_ROUTES,
  routeLabels = DEFAULT_LABELS,
  focusTargetSelector = "main h1",
  centerLogo,
  centerLogoSrc,
  centerLogoSize = "62%",
}: LotusTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = normalizePath(pathname);

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [navigationLocked, setNavigationLocked] = useState(false);
  const [destinationLabel, setDestinationLabel] = useState("");
  const [destinationMeta, setDestinationMeta] = useState(
    getRouteMeta(currentPath),
  );
  const [origin, setOrigin] = useState<TransitionOrigin | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const previousPathRef = useRef<string | null>(null);
  const pendingPathRef = useRef<string | null>(null);
  const transitionIdRef = useRef(0);
  const focusAfterTransitionRef = useRef(false);
  const routeLabelsRef = useRef(routeLabels);
  const coverTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const historyTimerRef = useRef<number | null>(null);

  routeLabelsRef.current = routeLabels;

  const routeSignature = routes.map(normalizePath).join("\u001f");
  const routeSet = useMemo(
    () => new Set(routeSignature.split("\u001f")),
    [routeSignature],
  );

  const coverDuration = 480;
  const revealDuration = 520;
  const settleDuration = 20;
  const historyDuration = 820;
  const isTransitioning = phase !== "idle" || navigationLocked;
  const hasCustomCenterLogo =
    centerLogo !== undefined || centerLogoSrc !== undefined;
  const resolvedCenterLogo =
    centerLogo !== undefined
      ? centerLogo
      : centerLogoSrc
        ? (
            <img
              className="lotus-iris-transition__brand-logo"
              src={centerLogoSrc}
              alt=""
              decoding="async"
              loading="eager"
              draggable={false}
            />
          )
        : null;
  const resolvedCenterLogoSize =
    typeof centerLogoSize === "number"
      ? `${centerLogoSize}px`
      : centerLogoSize;

  const clearTimer = useCallback(
    (ref: { current: number | null }) => {
      if (ref.current !== null) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    },
    [],
  );

  const clearAllTimers = useCallback(() => {
    clearTimer(coverTimerRef);
    clearTimer(settleTimerRef);
    clearTimer(revealTimerRef);
    clearTimer(safetyTimerRef);
    clearTimer(historyTimerRef);
  }, [clearTimer]);

  const finishImmediately = useCallback(
    (transitionId: number, shouldFocus: boolean) => {
      if (transitionId !== transitionIdRef.current) return;

      clearAllTimers();
      pendingPathRef.current = null;
      setPhase("idle");
      setNavigationLocked(false);
      setDestinationLabel("");
      setOrigin(null);
      if (shouldFocus) focusAfterTransitionRef.current = true;
    },
    [clearAllTimers],
  );

  const beginReveal = useCallback(
    (transitionId: number) => {
      if (transitionId !== transitionIdRef.current) return;

      clearTimer(safetyTimerRef);
      setPhase("revealing");

      clearTimer(revealTimerRef);
      revealTimerRef.current = window.setTimeout(() => {
        if (transitionId !== transitionIdRef.current) return;

        pendingPathRef.current = null;
        setPhase("idle");
        setNavigationLocked(false);
        setDestinationLabel("");
        setOrigin(null);
        focusAfterTransitionRef.current = true;
        revealTimerRef.current = null;
      }, revealDuration);
    },
    [clearTimer],
  );

  const navigate = useCallback(
    (href: string, options: NavigationOptions = {}) => {
      const targetPath = resolvePath(href, currentPath);
      const scroll = options.scroll ?? true;

      if (targetPath === currentPath) {
        if (options.replace) {
          router.replace(href, { scroll });
        } else {
          router.push(href, { scroll });
        }
        return;
      }

      const shouldAnimate =
        routeSet.has(currentPath) && routeSet.has(targetPath);

      if (!shouldAnimate) {
        if (options.replace) {
          router.replace(href, { scroll });
        } else {
          router.push(href, { scroll });
        }
        return;
      }

      if (pendingPathRef.current !== null || isTransitioning) return;

      clearAllTimers();
      const transitionId = transitionIdRef.current + 1;
      transitionIdRef.current = transitionId;
      pendingPathRef.current = targetPath;
      setNavigationLocked(true);
      setDestinationLabel(
        routeLabelsRef.current[targetPath] ?? "Sacred Passage",
      );
      setDestinationMeta(getRouteMeta(targetPath));
      setOrigin(options.origin ?? null);

      const commitNavigation = () => {
        if (transitionId !== transitionIdRef.current) return;

        if (options.replace) {
          router.replace(href, { scroll });
        } else {
          router.push(href, { scroll });
        }

        safetyTimerRef.current = window.setTimeout(() => {
          finishImmediately(transitionId, false);
        }, 8000);
      };

      if (reducedMotion) {
        commitNavigation();
        return;
      }

      setPhase("covering");
      coverTimerRef.current = window.setTimeout(() => {
        if (transitionId !== transitionIdRef.current) return;

        setPhase("covered");
        commitNavigation();
        coverTimerRef.current = null;
      }, coverDuration);
    },
    [
      clearAllTimers,
      currentPath,
      finishImmediately,
      isTransitioning,
      reducedMotion,
      routeSet,
      router,
    ],
  );

  useEffect(() => {
    setMounted(true);

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  // Prefetch the other scoped routes so the transition reveals a ready page
  // instead of one that is still fetching/painting (the navbar's Grantha /
  // Heritage items are buttons and would otherwise not prefetch).
  useEffect(() => {
    for (const r of routes) {
      if (normalizePath(r) !== currentPath) {
        try {
          router.prefetch(r);
        } catch {
          /* prefetch is best-effort */
        }
      }
    }
  }, [currentPath, routeSignature, routes, router]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const pendingPath = pendingPathRef.current;

    if (pendingPath === currentPath) {
      const transitionId = transitionIdRef.current;
      clearTimer(safetyTimerRef);

      if (reducedMotion) {
        finishImmediately(transitionId, true);
      } else {
        clearTimer(settleTimerRef);
        settleTimerRef.current = window.setTimeout(() => {
          settleTimerRef.current = null;
          // Reveal only after the new route has painted a frame, so the bloom opens
          // onto a ready page rather than one that is still laying out.
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(() => beginReveal(transitionId)),
          );
        }, settleDuration);
      }
    } else if (
      pendingPath === null &&
      previousPath !== null &&
      previousPath !== currentPath &&
      routeSet.has(previousPath) &&
      routeSet.has(currentPath) &&
      !reducedMotion
    ) {
      // Native Back/Forward cannot cover the old page before it changes.
      // Bloom briefly over the restored page without manipulating history.
      clearAllTimers();
      const transitionId = transitionIdRef.current + 1;
      transitionIdRef.current = transitionId;
      setOrigin(null);
      setDestinationLabel(
        routeLabelsRef.current[currentPath] ?? "Sacred Passage",
      );
      setDestinationMeta(getRouteMeta(currentPath));
      setNavigationLocked(true);
      setPhase("history");

      historyTimerRef.current = window.setTimeout(() => {
        if (transitionId !== transitionIdRef.current) return;

        setPhase("idle");
        setNavigationLocked(false);
        setDestinationLabel("");
        historyTimerRef.current = null;
      }, historyDuration);
    }

    previousPathRef.current = currentPath;
  }, [
    beginReveal,
    clearAllTimers,
    clearTimer,
    currentPath,
    finishImmediately,
    reducedMotion,
    routeSet,
  ]);

  useEffect(() => {
    const cancelPendingTransition = () => {
      transitionIdRef.current += 1;
      clearAllTimers();
      pendingPathRef.current = null;
      setPhase("idle");
      setNavigationLocked(false);
      setDestinationLabel("");
      setOrigin(null);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) cancelPendingTransition();
    };

    window.addEventListener("popstate", cancelPendingTransition);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("popstate", cancelPendingTransition);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [clearAllTimers]);

  useEffect(() => {
    if (!isTransitioning) return;

    const previousOverflow = document.body.style.overflow;
    const overlayElement = document.querySelector<HTMLElement>(
      ".lotus-iris-transition",
    );
    const statusElement = document.querySelector<HTMLElement>(
      ".lotus-iris-transition__status",
    );
    const inertState: Array<[HTMLElement, boolean]> = [];

    document.body.style.overflow = "hidden";

    for (const child of Array.from(document.body.children)) {
      if (!(child instanceof HTMLElement)) continue;
      if (child === overlayElement || child === statusElement) continue;
      if (overlayElement && child.contains(overlayElement)) continue;
      if (statusElement && child.contains(statusElement)) continue;

      inertState.push([child, child.inert]);
      child.inert = true;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      for (const [element, wasInert] of inertState) {
        element.inert = wasInert;
      }
    };
  }, [isTransitioning]);

  useEffect(() => {
    if (isTransitioning || !focusAfterTransitionRef.current) return;

    focusAfterTransitionRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      focusNewPage(focusTargetSelector);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusTargetSelector, isTransitioning]);

  useEffect(() => {
    if (!isTransitioning) return;

    const previousBusy = document.body.getAttribute("aria-busy");
    document.body.setAttribute("aria-busy", "true");

    return () => {
      if (previousBusy === null) {
        document.body.removeAttribute("aria-busy");
      } else {
        document.body.setAttribute("aria-busy", previousBusy);
      }
    };
  }, [isTransitioning]);

  useEffect(
    () => () => {
      transitionIdRef.current += 1;
      clearAllTimers();
    },
    [clearAllTimers],
  );

  const overlayStyle = {
    "--iris-cover-duration": `${coverDuration}ms`,
    "--iris-reveal-duration": `${revealDuration}ms`,
    "--iris-history-duration": `${historyDuration}ms`,
    "--iris-origin-x": origin ? `${origin.x}px` : "50%",
    "--iris-origin-y": origin ? `${origin.y}px` : "50%",
    "--iris-center-logo-size": resolvedCenterLogoSize,
  } as CSSProperties;

  const contextValue = useMemo(
    () => ({ isTransitioning, navigate }),
    [isTransitioning, navigate],
  );

  const overlay = (
    <>
      <div
        className="lotus-iris-transition"
        data-phase={phase}
        data-theme={destinationMeta.theme}
        style={overlayStyle}
        aria-hidden="true"
      >
        <div className="lotus-iris-transition__backdrop" />
        <div className="lotus-iris-transition__grid" />
        <div className="lotus-iris-transition__noise" />
        <span className="lotus-iris-transition__signal" />

        <div className="lotus-iris-transition__orbit-field">
          <span className="lotus-iris-transition__orbit lotus-iris-transition__orbit--one" />
          <span className="lotus-iris-transition__orbit lotus-iris-transition__orbit--two" />
          <span className="lotus-iris-transition__orbit lotus-iris-transition__orbit--three" />
        </div>

        <div className="lotus-iris-transition__petal-field">
          {IRIS_PETALS.map((petal) => (
            <span
              key={petal.id}
              className={`lotus-iris-transition__petal lotus-iris-transition__petal--${petal.ring}`}
              style={petal.style}
            >
              <i />
            </span>
          ))}
        </div>

        <div className="lotus-iris-transition__particle-field">
          {IRIS_PARTICLES.map((particle) => (
            <i key={particle.id} style={particle.style} />
          ))}
        </div>

        <div
          className={`lotus-iris-transition__core${
            hasCustomCenterLogo
              ? " lotus-iris-transition__core--has-logo"
              : ""
          }`}
        >
          <span className="lotus-iris-transition__core-ring lotus-iris-transition__core-ring--outer" />
          <span className="lotus-iris-transition__core-ring lotus-iris-transition__core-ring--inner" />

          {hasCustomCenterLogo ? (
            <div className="lotus-iris-transition__core-logo">
              {resolvedCenterLogo}
            </div>
          ) : (
            <>
              <svg
                className="lotus-iris-transition__core-lotus"
                viewBox="0 0 180 180"
                role="presentation"
              >
                <defs>
                  <linearGradient
                    id="iris-core-petal"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#fffdf5" />
                    <stop offset="0.45" stopColor="#efd38a" />
                    <stop offset="1" stopColor="#9a6424" />
                  </linearGradient>
                  <radialGradient id="iris-core-light">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.28" stopColor="#ffe9a8" />
                    <stop offset="1" stopColor="#b57525" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <circle
                  className="lotus-iris-transition__core-light"
                  cx="90"
                  cy="90"
                  r="72"
                />
                <g className="lotus-iris-transition__core-petals">
                  <path d="M90 101C67 80 70 43 90 20c20 23 23 60 0 81Z" />
                  <path d="M84 110C53 106 33 81 36 50c31 8 50 31 48 60Z" />
                  <path d="M96 110c31-4 51-29 48-60-31 8-50 31-48 60Z" />
                  <path d="M79 121C45 130 16 113 7 84c34-5 62 8 72 37Z" />
                  <path d="M101 121c34 9 63-8 72-37-34-5-62 8-72 37Z" />
                  <path d="M90 111c-24 0-44 13-56 36 19 14 39 17 56 9 17 8 37 5 56-9-12-23-32-36-56-36Z" />
                </g>
                <g className="lotus-iris-transition__core-circuit">
                  <path d="M90 31v47M51 65l27 27M129 65l-27 27" />
                  <circle cx="90" cy="90" r="5" />
                </g>
              </svg>

              <span className="lotus-iris-transition__core-dot" />
            </>
          )}
        </div>

        <div className="lotus-iris-transition__route-lockup">
          <span>LOTUS PASSAGE&nbsp;&nbsp;/&nbsp;&nbsp;{destinationMeta.code}</span>
          <strong>{destinationLabel || "Sacred Passage"}</strong>
        </div>

        <div className="lotus-iris-transition__corner lotus-iris-transition__corner--tl" />
        <div className="lotus-iris-transition__corner lotus-iris-transition__corner--tr" />
        <div className="lotus-iris-transition__corner lotus-iris-transition__corner--bl" />
        <div className="lotus-iris-transition__corner lotus-iris-transition__corner--br" />

        <div className="lotus-iris-transition__meter">
          <span />
          <i />
        </div>
      </div>

      <span
        className="lotus-iris-transition__status"
        role="status"
        aria-live="polite"
      >
        {isTransitioning && destinationLabel
          ? `Opening ${destinationLabel}`
          : ""}
      </span>
    </>
  );

  return (
    <TransitionContext.Provider value={contextValue}>
      {children}
      {mounted ? createPortal(overlay, document.body) : null}
    </TransitionContext.Provider>
  );
}

export function LotusLink({
  href,
  replace,
  scroll,
  children,
  onClick,
  onFocus,
  onPointerEnter,
  target,
  download,
  ...anchorProps
}: LotusLinkProps) {
  const context = useContext(TransitionContext);
  const router = useRouter();
  const pathname = usePathname();

  if (!context) {
    throw new Error(
      "LotusLink must be rendered inside LotusTransitionProvider.",
    );
  }

  const prefetch = () => {
    if (isExternalHref(href)) return;

    const targetPath = resolvePath(href, pathname);
    if (targetPath !== normalizePath(pathname)) router.prefetch(href);
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const modifiedClick =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;

    if (
      modifiedClick ||
      isExternalHref(href) ||
      download !== undefined ||
      (target !== undefined && target !== "_self")
    ) {
      return;
    }

    event.preventDefault();
    const clickedWithPointer = event.detail > 0;

    context.navigate(href, {
      replace,
      scroll,
      origin: clickedWithPointer
        ? { x: event.clientX, y: event.clientY }
        : undefined,
    });
  };

  return (
    <a
      {...anchorProps}
      href={href}
      target={target}
      download={download}
      onClick={handleClick}
      onFocus={(event) => {
        prefetch();
        onFocus?.(event);
      }}
      onPointerEnter={(event) => {
        prefetch();
        onPointerEnter?.(event);
      }}
      aria-current={
        normalizePath(pathname) === resolvePath(href, pathname)
          ? "page"
          : undefined
      }
      data-lotus-link=""
      data-transitioning={context.isTransitioning ? "true" : "false"}
    >
      {children}
    </a>
  );
}
