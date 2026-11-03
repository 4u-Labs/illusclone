const VERSION = '2.1.2';
const SCOPE = new URL(self.registration.scope);
const PREFIX = 'illusclone-' + encodeURIComponent(SCOPE.pathname) + '-';
const CACHE_NAME = PREFIX + VERSION;
const ASSETS = ['./','./index.html','./manifest.json','./favicon.png','./images/manifest/192x192.png','./images/manifest/512x512.png','./images/manifest/maskable-512x512.png','./transfer.js?v=2.1.2','./boot.js?v=2.1.2','./usability.js?v=2.1.2','./vectorcraft-web-b86a97bd7d399e62.js?v=2.1.2','./vectorcraft-web-b86a97bd7d399e62_bg.wasm?v=2.1.2'];
const urls = ASSETS.map(path => new URL(path, SCOPE).href);
self.addEventListener('install', event => {
  // An incomplete download must fail installation; keep the previous worker usable.
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try {await cache.addAll(urls);} catch(error) {await caches.delete(CACHE_NAME);throw error;}
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE_NAME && key.startsWith(PREFIX)).map(key=>caches.delete(key)));
    // Leave legacy caches intact: they are not scope-qualified and may be shared.
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if(event.data?.type!=='CHECK_OFFLINE')return;
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const ready=(await Promise.all(urls.map(url=>cache.match(url)))).every(Boolean);
    event.ports[0]?.postMessage({type:'OFFLINE_STATUS',ready,version:VERSION});
  })());
});
self.addEventListener('fetch', event => {
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET' || url.origin!==SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname))return;
  const isEntry=request.mode==='navigate' && [SCOPE.pathname,SCOPE.pathname+'index.html'].includes(url.pathname);
  if(request.mode==='navigate' && !isEntry)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    if(isEntry) {
      try {const response=await fetch(request);if(!response.ok)throw new Error('HTTP '+response.status);await cache.put(request,response.clone());return response;}
      catch(error) {const fallback=await cache.match(new URL('index.html',SCOPE).href);if(fallback)return fallback;throw error;}
    }
    const hit=await cache.match(request);if(hit)return hit;
    const response=await fetch(request);
    if(response.ok && urls.includes(url.href))await cache.put(request,response.clone());
    return response;
  })());
});
