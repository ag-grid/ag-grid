(function () {
    const script = document.currentScript;
    const pageName = script.dataset.pageName;
    const exampleName = script.dataset.exampleName;
    const initSelector = script.dataset.initSelector;

    const checkInit = function () {
        if (document.querySelector(initSelector)) {
            window.parent?.postMessage({ type: 'init', pageName: pageName, exampleName: exampleName });
        } else {
            requestAnimationFrame(checkInit);
        }
    };

    checkInit();
})();
