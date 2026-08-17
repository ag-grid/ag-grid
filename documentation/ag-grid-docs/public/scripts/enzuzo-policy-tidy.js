/*
 * The Enzuzo cookie-policy embed (AG-18194) includes a section promoting Enzuzo's own product —
 * "How was this cookie policy generated?" — whose body carries an outbound link to enzuzo.com. It
 * is vendor marketing sitting in the middle of our policy copy, so strip it out.
 *
 * This cannot be done in CSS. The section is a heading followed by sibling paragraphs inside an
 * unclassed <div> with no id, and CSS has no previous-sibling selector to reach the heading from
 * the paragraph that contains the link. Removing the section also removes the link, so no separate
 * rule is needed for it.
 *
 * The embed injects its policy asynchronously (a fetch inside the loader script), so wait for the
 * policy root with a MutationObserver rather than assuming it is present at execution time.
 *
 * Externalised to a 'self' script (rather than inlined) so the site Content-Security-Policy can
 * keep script-src free of 'unsafe-inline' without needing a per-build hash. Mirrors the pattern in
 * persist-cookie-consent.js.
 */
(function () {
    var POLICY_ROOT = '[ez-policy]';
    // Matched on text because the section carries no id or class of its own. Compared
    // case-insensitively with punctuation and whitespace collapsed, so light rewording in the
    // Enzuzo console does not silently reintroduce the section.
    var VENDOR_SECTION_HEADING = 'how was this cookie policy generated';
    var HEADINGS = { H1: true, H2: true, H3: true, H4: true, H5: true, H6: true };

    function normalise(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    /**
     * Remove `heading` and every following sibling up to the next heading — the paragraphs that
     * make up its section.
     */
    function removeSection(heading) {
        var next = heading.nextElementSibling;

        while (next && !HEADINGS[next.tagName]) {
            var toRemove = next;
            next = next.nextElementSibling;
            toRemove.remove();
        }

        heading.remove();
    }

    /**
     * Returns true once the policy has been injected, whether or not the vendor section was found —
     * a reworded or absent heading is a no-op, not an error, and must not leave the observer
     * running for the life of the page.
     */
    function tidy() {
        var policy = document.querySelector(POLICY_ROOT);

        if (!policy) {
            return false;
        }

        var headings = policy.querySelectorAll('h1, h2, h3, h4, h5, h6');

        for (var i = 0, len = headings.length; i < len; ++i) {
            if (normalise(headings[i].textContent) === VENDOR_SECTION_HEADING) {
                removeSection(headings[i]);
                break;
            }
        }

        return true;
    }

    if (tidy()) {
        return;
    }

    var observer = new MutationObserver(function () {
        if (tidy()) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Astro's client-side router replaces <body>, which strands this observer on the detached one.
    // The script re-runs on the next page (data-astro-rerun), so drop this one rather than leaving
    // one behind per navigation.
    document.addEventListener('astro:before-swap', function () {
        observer.disconnect();
    });
})();
