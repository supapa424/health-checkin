const CACHE = "health-checkin-v24"; // ← 每次发布只改这里的版本号

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// 安装：立刻进入 waiting → active
self.addEventListener("install", (e) => {
  self.skipWaiting(); // 🔑 关键：不要等旧 SW 退出
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

// 激活：清理旧缓存 + 立刻接管页面
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            return caches.delete(key); // 🔑 删除旧版本缓存
          }
        })
      )
    )
  );
  self.clients.claim(); // 🔑 立刻控制所有页面
});

// 请求策略：cache first + 网络兜底
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(r => {
      return r || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      });
    })
  );
});
