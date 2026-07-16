// ===== Firebase Cloud Messaging（背景推播）=====
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDGPR5tYZdfeHWpk76HWeuUkKDV5juTjt4",
  authDomain: "beyblade-x-app-4086b.firebaseapp.com",
  projectId: "beyblade-x-app-4086b",
  storageBucket: "beyblade-x-app-4086b.firebasestorage.app",
  messagingSenderId: "788931393957",
  appId: "1:788931393957:web:90d1409e022df7d6e0904c"
});

try{
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || 'BEYBLADE X 提醒';
    const body = (payload.notification && payload.notification.body) || '';
    self.registration.showNotification(title, { body, icon: './icons/icon-192.png' });
  });
}catch(e){ /* messaging not available in this context */ }

const CACHE_NAME = 'bx-encyclopedia-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase-config.js',
  './manifest.json',
  './data/blades.json',
  './data/ratchets.json',
  './data/bits.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 網路優先：先嘗試抓最新版本，只有離線時才退回快取，避免手機一直卡在舊版本
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
