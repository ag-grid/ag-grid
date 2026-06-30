/*
 * Strips heading semantics from the OneTrust cookie-consent banner / preference
 * centre (GTM-injected, production-only) so its <h*> elements don't pollute the
 * document heading outline — bad for assistive-tech heading navigation and for
 * SEO heading-structure audits (SE-44).
 *
 * Externalised to public/scripts and served from 'self' (like gtm-init.js) so it
 * stays off the CSP script-src hash list. Non-destructive: each heading inside
 * the OneTrust container is given role="presentation" while its element, id,
 * classes and text are left intact, so OneTrust's own scripts and styling keep
 * working. No-ops when OneTrust is absent (dev, or before consent loads).
 */
(function () {
    if (window.__agOneTrustHeadingsInit) {
        return;
    }
    window.__agOneTrustHeadingsInit = true;

    var ROOT_SELECTOR = '#onetrust-consent-sdk';
    var HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';
    var PROCESSED_ATTR = 'data-ag-heading-neutralised';

    function demoteHeadings(root) {
        if (!root) {
            return;
        }
        var headings = root.querySelectorAll(HEADING_SELECTOR);
        for (var i = 0, len = headings.length; i < len; i++) {
            var heading = headings[i];
            if (heading.getAttribute(PROCESSED_ATTR) === 'true') {
                continue;
            }
            heading.setAttribute('role', 'presentation');
            heading.setAttribute(PROCESSED_ATTR, 'true');
        }
    }

    function watch(root) {
        demoteHeadings(root);
        // OneTrust injects the preference-centre modal lazily, so keep watching
        // the consent container for further headings.
        var observer = new MutationObserver(function () {
            demoteHeadings(root);
        });
        observer.observe(root, { childList: true, subtree: true });
    }

    function init() {
        var existing = document.querySelector(ROOT_SELECTOR);
        if (existing) {
            watch(existing);
            return;
        }

        if (!document.body) {
            return;
        }

        // The consent SDK is appended to <body> after GTM loads it; watch for it.
        var bodyObserver = new MutationObserver(function () {
            var root = document.querySelector(ROOT_SELECTOR);
            if (root) {
                bodyObserver.disconnect();
                watch(root);
            }
        });
        bodyObserver.observe(document.body, { childList: true });
    }

    init();
})();
