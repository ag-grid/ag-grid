/*
 * The AG runtime libraries inject their CSS into <head> on first use and record internally
 * that they have done so. Astro's client-side router removes any head element the incoming
 * document does not also contain, so those <style> elements are dropped on the first
 * navigation away from a page that mounted a grid or chart — and because the library
 * believes they are still present, it never re-inserts them, leaving every subsequent page
 * unstyled.
 *
 * Astro keeps a live head element when the incoming document carries a matching
 * data-astro-transition-persist id, so tag each injected <style> and put a placeholder
 * carrying the same id into the incoming document for the router to pair it with.
 *
 * Externalised to a 'self' script (rather than inlined) so the site Content-Security-Policy
 * can keep script-src free of 'unsafe-inline' without needing a per-build hash.
 */
(function () {
    var INJECTED_STYLE_SELECTOR = 'style[data-ag-css], style[data-ag-charts]';
    var nextPersistId = 0;

    document.addEventListener('astro:before-swap', function (event) {
        var newDocument = event.newDocument;
        var styles = document.head.querySelectorAll(INJECTED_STYLE_SELECTOR);

        for (var i = 0, len = styles.length; i < len; ++i) {
            var style = styles[i];

            if (!style.dataset.astroTransitionPersist) {
                style.dataset.astroTransitionPersist = 'ag-injected-style-' + nextPersistId++;
            }

            var placeholder = newDocument.createElement('style');
            placeholder.dataset.astroTransitionPersist = style.dataset.astroTransitionPersist;
            newDocument.head.appendChild(placeholder);
        }
    });
})();
