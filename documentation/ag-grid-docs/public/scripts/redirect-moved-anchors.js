/*
 * Sends a visit to the old anchor of a section that has moved to another page on to its new location,
 * so that external links and bookmarks to the old anchor keep working.
 *
 * The page lists its moved anchors in the `data-moved-anchors` attribute of this script's element, as a
 * JSON object from the old heading id to the new URL (the `movedAnchors` frontmatter of a docs page).
 * A heading that still has the id on this page wins, so nothing is redirected away from content that
 * is still here.
 *
 * Besides arriving at the page, an old anchor can be visited from the page itself. Astro's router moves
 * to a fragment of the current page without a `hashchange` event, so links are caught as they are
 * clicked; `hashchange` covers a fragment typed into the address bar. Both listeners are removed when
 * the router swaps in another page.
 *
 * Externalised to a 'self' script (rather than bundled inline by Astro) so the site Content-Security-Policy
 * can keep script-src free of 'unsafe-inline' without needing a per-build hash.
 */
(function () {
    var script = document.currentScript;
    if (!script) {
        return;
    }

    var movedAnchors;
    try {
        movedAnchors = JSON.parse(script.getAttribute('data-moved-anchors') || '{}');
    } catch (e) {
        return;
    }

    function getTarget(hash) {
        // Moved heading ids are plain `[a-z0-9-]`, so the fragment is compared as it is, without decoding
        var id = hash.slice(1);
        if (!id || document.getElementById(id) || !Object.prototype.hasOwnProperty.call(movedAnchors, id)) {
            return null;
        }
        return movedAnchors[id];
    }

    function onHashChange() {
        var target = getTarget(location.hash);
        if (target) {
            location.replace(target);
        }
    }

    function onClick(event) {
        // A click opening another tab or window loads the page anew, which redirects on arrival
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }
        var link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!link || link.pathname !== location.pathname || link.search !== location.search) {
            return;
        }
        var target = getTarget(link.hash);
        if (target) {
            event.preventDefault();
            location.assign(target);
        }
    }

    function removeListeners() {
        window.removeEventListener('hashchange', onHashChange);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('astro:before-swap', removeListeners);
    }

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    // Capture phase, so the link is redirected before Astro's router handles the click
    document.addEventListener('click', onClick, true);
    document.addEventListener('astro:before-swap', removeListeners);
})();
