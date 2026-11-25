/*
 * Sends a visit to the old anchor of a section that has moved to another page on to its new location,
 * so that external links and bookmarks to the old anchor keep working.
 *
 * The page lists its moved anchors in the `data-moved-anchors` attribute of this script's element, as a
 * JSON object from the old heading id to the new URL (the `movedAnchors` frontmatter of a docs page).
 * A heading that still has the id on this page wins, so nothing is redirected away from content that
 * is still here.
 *
 * Externalised to a 'self' script (rather than bundled inline by Astro) so the site Content-Security-Policy
 * can keep script-src free of 'unsafe-inline' without needing a per-build hash.
 */
(function () {
    var script = document.currentScript;
    var id = decodeURIComponent(location.hash.slice(1));

    if (!script || !id || document.getElementById(id)) {
        return;
    }

    var movedAnchors;
    try {
        movedAnchors = JSON.parse(script.getAttribute('data-moved-anchors') || '{}');
    } catch (e) {
        return;
    }

    if (Object.prototype.hasOwnProperty.call(movedAnchors, id)) {
        location.replace(movedAnchors[id]);
    }
})();
