/* Mi cartilla de presión: funciona sin internet.
   Cuando cambies index.html, sube el número de VERSION para que los celulares descarguen la nueva. */
const VERSION='cartilla-v1';
const FUENTES='fuentes-v1';
const APP=['./','./index.html','./manifest.webmanifest','./pdf-lib.min.js','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(APP)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!==FUENTES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function conTiempo(p,ms){return new Promise((ok,no)=>{const t=setTimeout(no,ms);p.then(r=>{clearTimeout(t);ok(r)},e=>{clearTimeout(t);no(e)})})}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===self.location.origin){
    if(r.mode==='navigate'){
      e.respondWith(conTiempo(fetch(r),3500).then(res=>{
        if(res.ok){const c=res.clone();caches.open(VERSION).then(x=>x.put('./index.html',c))}
        return res;
      }).catch(()=>caches.match('./index.html')));
      return;
    }
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r)));
    return;
  }
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FUENTES).then(c=>c.match(r).then(m=>{
      const red=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res});
      if(m){red.catch(()=>{});return m}
      return red;
    })));
  }
});
