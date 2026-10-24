/* ==========================================================
   SMARTLIFT
   SERVICE WORKER
========================================================== */


/* ================= CACHE VERSION ================= */

const CACHE_VERSION =
  "smartlift-v1.0.2";
  
const APP_CACHE =
  `${CACHE_VERSION}-app`;

const RUNTIME_CACHE =
  `${CACHE_VERSION}-runtime`;


/* ================= LOCAL APP FILES ================= */

const APP_SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./firebase-config.js",
  "./manifest.json"
];


/* ================= OPTIONAL ASSETS ================= */

/*
  ไฟล์ในรายการนี้จะถูกแคชเมื่อมีอยู่จริง
  หากไฟล์ใดยังไม่มี Service Worker จะไม่หยุดทำงาน
*/

const OPTIONAL_ASSETS = [
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-192.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",

  "./screenshots/dashboard-mobile.png",
  "./screenshots/dashboard-desktop.png"
];


/* ================= INSTALL ================= */

self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      installApplicationCache()
    );

    self.skipWaiting();
  }
);


async function installApplicationCache() {
  const cache =
    await caches.open(
      APP_CACHE
    );

  await cache.addAll(
    APP_SHELL_FILES
  );

  await Promise.allSettled(
    OPTIONAL_ASSETS.map(
      async (assetURL) => {
        try {
          const response =
            await fetch(
              assetURL,
              {
                cache: "no-cache"
              }
            );

          if (
            response &&
            response.ok
          ) {
            await cache.put(
              assetURL,
              response
            );
          }
        } catch {
          /*
            ไฟล์เสริมยังไม่มีได้
            ไม่ทำให้การติดตั้ง Service Worker ล้มเหลว
          */
        }
      }
    )
  );
}


/* ================= ACTIVATE ================= */

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      activateServiceWorker()
    );
  }
);


async function activateServiceWorker() {
  const cacheNames =
    await caches.keys();

  await Promise.all(
    cacheNames.map(
      (cacheName) => {
        const belongsToSmartLift =
          cacheName.startsWith(
            "smartlift-"
          );

        const isCurrentCache =
          cacheName === APP_CACHE ||
          cacheName === RUNTIME_CACHE;

        if (
          belongsToSmartLift &&
          !isCurrentCache
        ) {
          return caches.delete(
            cacheName
          );
        }

        return Promise.resolve(
          false
        );
      }
    )
  );

  await self.clients.claim();
}


/* ================= FETCH ================= */

self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    if (
      request.method !== "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url
      );

    /*
      ไม่ดักจับคำขอที่ไม่ใช่ HTTP หรือ HTTPS
    */

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return;
    }

    /*
      หน้าเว็บหลักใช้ Network First
      เพื่อให้ได้โค้ดเวอร์ชันล่าสุดก่อน
    */

    if (
      request.mode === "navigate"
    ) {
      event.respondWith(
        handleNavigationRequest(
          request
        )
      );

      return;
    }

    /*
      ไฟล์ในโดเมนเดียวกันใช้ Stale While Revalidate
    */

    if (
      url.origin ===
      self.location.origin
    ) {
      event.respondWith(
        handleLocalAssetRequest(
          request
        )
      );

      return;
    }

    /*
      Firebase CDN และทรัพยากรภายนอกใช้ Network First
      แล้วสำรองจาก Runtime Cache
    */

    event.respondWith(
      handleExternalRequest(
        request
      )
    );
  }
);


/* ================= NAVIGATION STRATEGY ================= */

async function handleNavigationRequest(
  request
) {
  try {
    const networkResponse =
      await fetch(
        request
      );

    if (
      networkResponse &&
      networkResponse.ok
    ) {
      const cache =
        await caches.open(
          RUNTIME_CACHE
        );

      await cache.put(
        request,
        networkResponse.clone()
      );
    }

    return networkResponse;
  } catch {
    const cachedPage =
      await caches.match(
        request
      );

    if (cachedPage) {
      return cachedPage;
    }

    const cachedIndex =
      await caches.match(
        "./index.html"
      );

    if (cachedIndex) {
      return cachedIndex;
    }

    return createOfflineResponse();
  }
}


/* ================= LOCAL ASSET STRATEGY ================= */

async function handleLocalAssetRequest(
  request
) {
  const cachedResponse =
    await caches.match(
      request
    );

  const networkPromise =
    fetch(request)
      .then(
        async (networkResponse) => {
          if (
            networkResponse &&
            networkResponse.ok
          ) {
            const cache =
              await caches.open(
                RUNTIME_CACHE
              );

            await cache.put(
              request,
              networkResponse.clone()
            );
          }

          return networkResponse;
        }
      )
      .catch(
        () => null
      );

  if (cachedResponse) {
    /*
      อัปเดตแคชในเบื้องหลัง
    */

    networkPromise.catch(
      () => {}
    );

    return cachedResponse;
  }

  const networkResponse =
    await networkPromise;

  if (networkResponse) {
    return networkResponse;
  }

  return new Response(
    "",
    {
      status: 504,
      statusText:
        "SmartLift Offline"
    }
  );
}


/* ================= EXTERNAL REQUEST STRATEGY ================= */

async function handleExternalRequest(
  request
) {
  try {
    const networkResponse =
      await fetch(
        request
      );

    if (
      networkResponse &&
      networkResponse.ok &&
      canCacheResponse(
        networkResponse
      )
    ) {
      const cache =
        await caches.open(
          RUNTIME_CACHE
        );

      await cache.put(
        request,
        networkResponse.clone()
      );
    }

    return networkResponse;
  } catch {
    const cachedResponse =
      await caches.match(
        request
      );

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      "",
      {
        status: 504,
        statusText:
          "External resource unavailable"
      }
    );
  }
}


/* ================= CACHE VALIDATION ================= */

function canCacheResponse(
  response
) {
  if (!response) {
    return false;
  }

  return (
    response.status === 200 ||
    response.type === "opaque"
  );
}


/* ================= OFFLINE RESPONSE ================= */

function createOfflineResponse() {
  const offlineHTML = `
    <!DOCTYPE html>

    <html lang="th">

    <head>

      <meta charset="UTF-8">

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover"
      >

      <meta
        name="theme-color"
        content="#2563eb"
      >

      <title>
        SmartLift Offline
      </title>

      <style>

        *{
          box-sizing:border-box;
        }

        body{
          min-height:100vh;
          min-height:100dvh;

          display:grid;
          place-items:center;

          margin:0;

          padding:24px;

          font-family:
            "Segoe UI",
            Arial,
            sans-serif;

          color:#111827;

          background:
            radial-gradient(
              circle at top,
              #dbeafe,
              #eef4ff 52%,
              #f8fafc
            );
        }

        main{
          width:min(
            100%,
            430px
          );

          padding:34px 26px;

          border:
            1px solid
            rgba(148,163,184,.24);

          border-radius:28px;

          background:
            rgba(255,255,255,.9);

          box-shadow:
            0 25px 70px
            rgba(37,99,235,.16);

          text-align:center;
        }

        .logo{
          width:76px;
          height:76px;

          display:grid;
          place-items:center;

          margin:
            0 auto 18px;

          border-radius:23px;

          color:#ffffff;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );

          box-shadow:
            0 16px 36px
            rgba(37,99,235,.28);

          font-size:34px;
          font-weight:900;
        }

        h1{
          margin:
            0 0 9px;

          font-size:29px;
        }

        p{
          margin:
            0;

          color:#64748b;

          font-size:14px;

          line-height:1.7;
        }

        button{
          width:100%;
          min-height:50px;

          margin-top:22px;

          padding:12px 17px;

          border:0;
          border-radius:15px;

          color:#ffffff;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );

          font:inherit;
          font-weight:800;

          cursor:pointer;
        }

      </style>

    </head>

    <body>

      <main>

        <div
          class="logo"
          aria-hidden="true"
        >
          S
        </div>

        <h1>
          ไม่สามารถเชื่อมต่ออินเทอร์เน็ต
        </h1>

        <p>
          SmartLift ไม่สามารถโหลดหน้าเว็บได้ในขณะนี้
          กรุณาตรวจสอบการเชื่อมต่อ แล้วลองอีกครั้ง
        </p>

        <button
          type="button"
          onclick="location.reload()"
        >
          ลองใหม่
        </button>

      </main>

    </body>

    </html>
  `;

  return new Response(
    offlineHTML,
    {
      status: 503,

      headers: {
        "Content-Type":
          "text/html; charset=utf-8",

        "Cache-Control":
          "no-store"
      }
    }
  );
}


/* ================= MESSAGE COMMANDS ================= */

self.addEventListener(
  "message",
  (event) => {
    const message =
      event.data;

    if (!message) {
      return;
    }

    if (
      message.type ===
      "SKIP_WAITING"
    ) {
      self.skipWaiting();

      return;
    }

    if (
      message.type ===
      "CLEAR_RUNTIME_CACHE"
    ) {
      event.waitUntil(
        caches.delete(
          RUNTIME_CACHE
        )
      );
    }
  }
);