/*
 * Two clean-ups on the Enzuzo cookie-policy embed (AG-18194), both of which have to happen here
 * rather than in CSS or in the markup:
 *
 *  1. Drop the vendor's inline <script>s from the injected policy, before they run. See
 *     `stripVendorScripts` — this is what keeps the page free of an uncaught EvalError.
 *  2. Remove the section promoting Enzuzo's own product — "How was this cookie policy generated?" —
 *     whose body carries an outbound link to enzuzo.com. It is vendor marketing sitting in the
 *     middle of our policy copy. CSS cannot reach it: the section is a heading followed by sibling
 *     paragraphs inside an unclassed <div> with no id, and CSS has no previous-sibling selector to
 *     reach the heading from the paragraph that contains the link. Removing the section also removes
 *     the link, so no separate rule is needed for it.
 *
 * The embed injects its policy asynchronously (a fetch inside the loader script), so wait for the
 * policy root with a MutationObserver rather than assuming it is present at execution time. This
 * script is loaded immediately after the loader and is neither `async` nor `defer`, so it runs
 * while that fetch is still in flight — which is what lets (1) get in ahead of the injection.
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

    /**
     * Stop the three inline <script>s the vendor ships inside the policy HTML from executing, and
     * return a function that undoes the interception.
     *
     * The loader injects the policy with `Range.createContextualFragment`, which — unlike
     * `innerHTML` — produces *executable* scripts, so they run the moment the fragment is inserted.
     * All three are redundant on this page, and one of them is actively broken under our CSP:
     *
     *  - `window.ezphost = 'app.enzuzo.com'` — set and never read, by either the policy or the
     *    loader.
     *  - `window.__enzuzo.policy ||= {}` — the loader has already done this.
     *  - `eval("window.__enzuzo.policy.reboot||(window.__enzuzo.policy.reboot=…)")` — a fallback
     *    definition of the loader's own `reboot`/`changeLanguage`/`changeCountry`, guarded so that
     *    it no-ops when the loader defined them, which it always has by this point. It calls
     *    `eval()` regardless of that guard, so with script-src correctly free of 'unsafe-eval' it
     *    throws an uncaught EvalError into the console having achieved nothing.
     *
     * Removing them afterwards is not an option — insertion is what runs them — so intercept
     * fragment creation instead. The interception is deliberately short-lived: it is undone as soon
     * as the policy lands (or on navigation away), so no other fragment on the page is affected.
     */
    function stripVendorScripts() {
        var original = Range.prototype.createContextualFragment;

        Range.prototype.createContextualFragment = function (html) {
            var fragment = original.call(this, html);
            var scripts = fragment.querySelectorAll('script');

            for (var i = 0, len = scripts.length; i < len; ++i) {
                scripts[i].remove();
            }

            return fragment;
        };

        return function restore() {
            Range.prototype.createContextualFragment = original;
        };
    }

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

    var restoreFragments = stripVendorScripts();

    if (tidy()) {
        restoreFragments();
        return;
    }

    var observer = new MutationObserver(function () {
        if (tidy()) {
            observer.disconnect();
            restoreFragments();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Astro's client-side router replaces <body>, which strands this observer on the detached one.
    // The script re-runs on the next page (data-astro-rerun), so drop this one rather than leaving
    // one behind per navigation.
    document.addEventListener('astro:before-swap', function () {
        observer.disconnect();
        restoreFragments();
    });
})();
