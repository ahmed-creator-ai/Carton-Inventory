const CACHE_NAME = "carton2-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json"
];


/* ================================
   INSTALL
================================ */

self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function(cache) {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

    self.skipWaiting();

});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys().then(function(cacheNames) {

            return Promise.all(

                cacheNames.map(function(cacheName) {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                })

            );

        })

    );

    self.clients.claim();

});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", function(event) {

    /*
       HTML files:
       Always try the newest version
       from the network first.
    */

    if (
        event.request.mode === "navigate" ||
        event.request.destination === "document"
    ) {

        event.respondWith(

            fetch(event.request)
                .then(function(response) {

                    const responseClone =
                        response.clone();

                    caches.open(CACHE_NAME).then(function(cache) {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                    return response;

                })
                .catch(function() {

                    return caches.match(event.request);

                })

        );

        return;

    }


    /*
       Other files:
       Use cache first, then network.
    */

    event.respondWith(

        caches.match(event.request).then(function(response) {

            return response || fetch(event.request);

        })

    );

});
