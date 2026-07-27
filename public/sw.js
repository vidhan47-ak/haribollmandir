const CACHE_PREFIX = "hariboll-mandir-";
const CACHE = `${CACHE_PREFIX}v4`;
const IS_LOCALHOST = ["localhost", "127.0.0.1", "[::1]"].includes(self.location.hostname);

/*
  Assets the offline experience depends on.

  Previously this list also contained /images/hero-bg.webp and
  /images/hero-bg-mobile.webp, neither of which exists in public/images. Because
  cache.addAll() rejects ATOMICALLY on any single 404, the install handler's
  waitUntil rejected every time and /offline.html was never cached — so offline
  mode never worked at all, while the install prompt advertised "offline temple
  timings". Two changes prevent that class of bug returning:

    1. the two phantom files are gone;
    2. precaching is now per-entry and tolerant, so one missing asset can never
       take down the whole install.
*/
const CORE = [
  "/offline.html",
  "/manifest.webmanifest",
  "/images/logo.png",
  "/images/pwa-icon-192.png",
  "/images/pwa-icon-512.png",
];

/** The offline page must be cached or offline mode is pointless. */
const REQUIRED = "/offline.html";

/** Reading routes are prerendered, so they are safe to keep for offline reading. */
function isReadingRoute(pathname) {
  return (
    pathname.startsWith("/grantha-mandir/read/") ||
    pathname.startsWith("/grantha-mandir/issue/")
  );
}

async function precache() {
  const cache = await caches.open(CACHE);

  // Per-entry so a single missing file degrades instead of failing the install.
  const results = await Promise.allSettled(
    CORE.map(async (url) => {
      const response = await fetch(new Request(url, { cache: "reload" }));
      if (!response.ok) throw new Error(`${url} -> ${response.status}`);
      await cache.put(url, response);
      return url;
    }),
  );

  const failed = results
    .map((result, index) => (result.status === "rejected" ? CORE[index] : null))
    .filter(Boolean);

  if (failed.length > 0) {
    // Surfaces a stale precache list in DevTools instead of failing silently.
    console.warn("[sw] precache skipped:", failed.join(", "));
  }

  if (!(await cache.match(REQUIRED))) {
    throw new Error(`[sw] required asset missing: ${REQUIRED}`);
  }
}

self.addEventListener("install", (event) => {
  if (IS_LOCALHOST) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && (IS_LOCALHOST || key !== CACHE))
          .map((key) => caches.delete(key)),
      );

      if (IS_LOCALHOST) {
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: "window" });
        await Promise.all(clients.map((client) => client.navigate(client.url)));
        return;
      }

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (IS_LOCALHOST || event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // Next.js chunks are content-addressed and must never be served from this
  // app-shell cache. Mixing generations causes missing Turbopack factories.
  if (requestUrl.pathname.startsWith("/_next/") || requestUrl.pathname === "/sw.js") {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    /*
      Reading pages a devotee has already opened stay available offline
      (stale-while-revalidate): serve the cached copy immediately, refresh it in
      the background. Every reading route is statically prerendered, so the
      cached HTML is a complete page rather than a shell.
    */
    if (isReadingRoute(requestUrl.pathname)) {
      event.respondWith(
        (async () => {
          const cache = await caches.open(CACHE);
          const cached = await cache.match(event.request);

          const network = fetch(event.request)
            .then((response) => {
              if (response.ok) void cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => null);

          if (cached) {
            void network;
            return cached;
          }

          return (await network) || (await caches.match("/offline.html"));
        })(),
      );
      return;
    }

    event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
    return;
  }

  if (["image", "font"].includes(event.request.destination)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
