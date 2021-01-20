let cacheName = "songQuiz-v1";

let filesToCache = [
  // "/",
  "/N46MusicQuiz/"
  "service-worker.js",
  "js/app.js",
  "js/install-handler.js",
  "js/settings.js",
  "js/data.js",
  "css/app.css",
  "css/externalCssChanges.css",
  "css/fonts/Lato-Regular.ttf",
  "assets/icons/logo.png",
  "manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/plyr/3.6.3/plyr.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.5/awesomplete.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.5/awesomplete.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/plyr/3.6.3/plyr.min.js"
];


// in the service worker
addEventListener('message', event => {
  // event is an ExtendableMessageEvent object
  var data = JSON.parse(event.data);
  var cardSet = [];

  data.forEach(item => {
    item.img.forEach(img => {
      cardSet.push(`assets/images/${img}`)
    })
  })

  caches.open(cacheName).then(cache => {
    cardSet.forEach((item, i) => {
      cache.add(item);
    });

  })
});

self.addEventListener("install", function(event) {
  event.waitUntil(caches.open(cacheName).then((cache) => {
    console.log('installed successfully')
    return cache.addAll(filesToCache);
  }));
});

self.addEventListener('fetch', function(event) {

  if (event.request.url.includes('clean-cache')) {
    caches.delete(cacheName);
    console.log('Cache cleared')
  }

  //CACHE FIRST; NETWORK FALLBACK
  // event.respondWith(
  //   caches.match(event.request).then(function(response) {
  //     if (response) {
  //       console.log('served form cache')
  //     } else {
  //       console.log('Not serving from cache ', event.request.url)
  //     }
  //     return response || fetch(event.request);
  //   })
  // );

  // NETWORK FIRST; CACHE FALLBACK
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );



});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('service worker: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
