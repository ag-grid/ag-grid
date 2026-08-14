/**
 * Initialises the seeded random number generator examples use, so that an example that would
 * otherwise generate different data on every load is predictable for tests and screenshots.
 *
 * Served as a classic script rather than inlined, so that an example's `index.html` carries no
 * machinery. The seed is the page's to choose, and arrives as `data-seed` -- `seedrandom`
 * itself is loaded from a CDN by the tag before this one.
 */
(function () {
    var seed = document.currentScript.dataset.seed;

    window.agRandom = new Math.seedrandom(seed);

    // Maintain consistency with previous versions of the docs by "warming up" the generator
    // with a few calls
    window.agRandom();
    window.agRandom();
})();
