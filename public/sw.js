// The Journey — Service Worker v1
// Maneja: caché offline + notificaciones push locales

const CACHE_NAME = "thejourney-v1";

// Archivos esenciales para modo offline
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// ── Install: cachear assets estáticos ────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Si falla algún asset, continúa de todas formas
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: limpiar cachés viejos ──────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network first, fallback a caché ────────────────────────
self.addEventListener("fetch", (event) => {
  // Solo manejar GET requests
  if (event.request.method !== "GET") return;

  // Para Google Fonts y CDN: network only
  const url = event.request.url;
  if (url.includes("fonts.googleapis") || url.includes("fonts.gstatic") || url.includes("cdnjs")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar copia en caché si es exitosa
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Sin red: intentar desde caché
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback a index.html para rutas SPA
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});

// ── Push notifications ────────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "🤖 The Journey";
  const body = data.body || "Tu robot te espera. ¡Completa una misión hoy!";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "thejourney-reminder",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: "/" },
      actions: [
        { action: "open", title: "Ver misiones" },
        { action: "dismiss", title: "Luego" },
      ],
    })
  );
});

// ── Notification click ────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});

// ── Background sync: recordatorio diario ─────────────────────────
// Programar notificación local si el usuario no abre la app en el día
self.addEventListener("message", (event) => {
  if (event.data?.type === "SCHEDULE_REMINDER") {
    const { name, hour = 19 } = event.data; // 7pm por defecto

    const now = new Date();
    const target = new Date();
    target.setHours(hour, 0, 0, 0);

    // Si ya pasó la hora de hoy, programar para mañana
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    setTimeout(() => {
      self.registration.showNotification("🤖 The Journey", {
        body: `${name}, tu robot te espera. ¿Completaste tus misiones hoy?`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "daily-reminder",
        vibrate: [300, 100, 300],
        data: { url: "/" },
        actions: [
          { action: "open", title: "¡Ir ahora!" },
          { action: "dismiss", title: "Mañana" },
        ],
      });
    }, delay);
  }
});
