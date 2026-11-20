// 오프라인 저장용 서비스 워커
// - 페이지(HTML): 인터넷이 되면 항상 새로 받고, 끊겼을 때만 저장본을 보여 준다.
// - 그림·글꼴·아이콘: 저장본을 먼저 쓴다. 이 파일들을 바꾸면 VERSION 숫자를 올린다.
const VERSION = "v1";
const CACHE = "honeymoon-" + VERSION;
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "fonts/pretendard-subset.woff2",
  "fonts/noto-serif-kr-subset.woff2",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "img/map-paris.jpg",
  "img/map-venezia.jpg",
  "img/map-firenze.jpg",
  "img/map-roma.jpg",
  "img/sights-paris.jpg",
  "img/sights-venezia.jpg",
  "img/sights-firenze.jpg",
  "img/sights-roma.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("honeymoon-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("index.html", copy));
          return res;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
