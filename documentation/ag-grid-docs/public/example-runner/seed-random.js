/**
 * Initialises the seeded random number generator, so an example that generates its own data is
 * predictable for tests and screenshots. Served, so `index.html` carries no machinery. The seed is the
 * page's to choose and arrives as `data-seed`; `seedrandom` comes from a CDN, loaded by the tag above.
 */
(function () {
    var seed = document.currentScript.dataset.seed;

    window.agRandom = new Math.seedrandom(seed);

    // "Warm up" the generator, as previous versions of the docs did, so the data matches
    window.agRandom();
    window.agRandom();
})();
