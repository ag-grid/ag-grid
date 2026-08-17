/**
 * Tells the page hosting the example's iframe that the example has rendered, which is what the runner
 * waits on before dropping its loading state. Served, so `index.html` carries no machinery; what
 * identifies the example and what to watch for arrive as attributes.
 */
(function () {
    var script = document.currentScript;
    var pageName = script.dataset.pageName;
    var exampleName = script.dataset.exampleName;
    var initSelector = script.dataset.initSelector;

    var checkInit = function () {
        if (document.querySelector(initSelector)) {
            window.parent?.postMessage({ type: 'init', pageName: pageName, exampleName: exampleName });
        } else {
            requestAnimationFrame(checkInit);
        }
    };

    checkInit();
})();
