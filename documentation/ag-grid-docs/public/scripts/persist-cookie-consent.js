/*
 * Enzuzo, the GTM-injected cookie-consent banner, appends its banner and preference-modal
 * markup to <body> and its stylesheets to <head>, then caches element references in closures
 * (createModalFunctions grabs #enzuzo-modal and friends once, at init). Astro's client-side
 * router replaces the whole <body> and removes any head element the incoming document does
 * not also contain, so all of that is destroyed on the first navigation.
 *
 * The banner's 'hashchange' listener is bound to window, which survives the swap, so it still
 * fires for #manage_cookies — but it toggles the now-detached nodes and nothing opens. Same
 * for the __enzuzoApi.prefCenter.show() entry point, which routes to the same closure.
 *
 * Astro keeps a live element when the incoming document carries a matching
 * data-astro-transition-persist id, so tag Enzuzo's roots and put placeholders carrying the
 * same ids into the incoming document for the router to pair them with. Mirrors the head-only
 * mechanism in persist-injected-styles.js.
 *
 * Externalised to a 'self' script (rather than inlined) so the site Content-Security-Policy
 * can keep script-src free of 'unsafe-inline' without needing a per-build hash.
 */
(function () {
    var BODY_ROOTS = ':scope > .ez-consent, :scope > [id^="ez-cookie"], :scope > [id^="enzuzo-"]';
    var HEAD_STYLES = 'style[id^="enzuzo_cb"], style[ez-style], [data-astro-transition-persist]';
    // Enzuzo's base and modal stylesheets carry no id or attribute, so they are matched on the
    // class names they style instead.
    var UNTAGGED_HEAD_STYLES = 'style:not([data-astro-transition-persist])';
    var STYLE_CONTENT_MARKERS = ['.ez-consent', 'enzuzo-modal-wrapper'];
    var nextPersistId = 0;

    function persist(el, newDocument, target) {
        if (!el.dataset.astroTransitionPersist) {
            el.dataset.astroTransitionPersist = 'enzuzo-' + nextPersistId++;
        }

        var placeholder = newDocument.createElement(el.localName);
        placeholder.dataset.astroTransitionPersist = el.dataset.astroTransitionPersist;
        target.appendChild(placeholder);
    }

    function persistAll(elements, newDocument, target) {
        for (var i = 0, len = elements.length; i < len; ++i) {
            persist(elements[i], newDocument, target);
        }
    }

    function matchesAnyMarker(style) {
        for (var i = 0, len = STYLE_CONTENT_MARKERS.length; i < len; ++i) {
            if (style.textContent.indexOf(STYLE_CONTENT_MARKERS[i]) !== -1) {
                return true;
            }
        }

        return false;
    }

    document.addEventListener('astro:before-swap', function (event) {
        var newDocument = event.newDocument;
        var matchedStyles = [];

        // Persist the identifiable stylesheets first: that tags them, so the content-matching
        // pass below cannot pick the same element up a second time.
        persistAll(document.head.querySelectorAll(HEAD_STYLES), newDocument, newDocument.head);

        var untagged = document.head.querySelectorAll(UNTAGGED_HEAD_STYLES);

        for (var i = 0, len = untagged.length; i < len; ++i) {
            if (matchesAnyMarker(untagged[i])) {
                matchedStyles.push(untagged[i]);
            }
        }

        persistAll(matchedStyles, newDocument, newDocument.head);
        persistAll(document.body.querySelectorAll(BODY_ROOTS), newDocument, newDocument.body);
    });
})();
