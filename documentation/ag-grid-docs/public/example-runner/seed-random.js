(function () {
    const seed = document.currentScript.dataset.seed;

    window.agRandom = new Math.seedrandom(seed);

    window.agRandom();
    window.agRandom();
})();
