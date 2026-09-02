/*
 * Renders the Enzuzo cookie-policy embed on /cookies/ (AG-18194), doing three things the markup
 * and CSS cannot do on their own:
 *
 *  1. Stop the vendor's inline <script>s from executing, before they are inserted. See
 *     `stripVendorScripts` — this is what keeps the page free of CSP violations and an uncaught
 *     EvalError.
 *  2. Inject the vendor loader, once (1) is in place. See `injectLoader`.
 *  3. Remove the section promoting Enzuzo's own product — "How was this cookie policy generated?" —
 *     whose body carries an outbound link to enzuzo.com. It is vendor marketing sitting in the
 *     middle of our policy copy. CSS cannot reach it: the section is a heading followed by sibling
 *     paragraphs inside an unclassed <div> with no id, and CSS has no previous-sibling selector to
 *     reach the heading from the paragraph that contains the link. Removing the section also removes
 *     the link, so no separate rule is needed for it.
 *
 * (2) is what makes (1) reliable, and is the whole reason the loader is not simply a second <script>
 * tag in cookies.astro. The strip only works if the patch is installed before the loader runs, and
 * as two sibling <script src> tags that ordering is a race this script loses often enough to matter:
 * on a full page load it has to win a network round trip against the loader's policy fetch (a ~5ms
 * handicap is enough to lose), and on an Astro client-side navigation ClientRouter re-inserts both
 * scripts with createElement, which makes them async and drops document order entirely. Injecting
 * the loader from here makes the ordering structural instead of a matter of timing.
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
    // Set by cookies.astro. Named without the substring 'ez-': the vendor loader scans every
    // <script> on the page and reads any attribute matching /ez-\w+/ as a policy-mode marker,
    // which would make it mistake this script's own tag for a second policy embed.
    var LOADER_SRC_ATTR = 'data-policy-loader-src';
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

    /**
     * Append the vendor loader next to this script, which is both what the loader needs (it inserts
     * the policy as a sibling after its own <script>, so it has to sit inside the wrapper the
     * content lays out in) and what keeps the fragment patch above ahead of it.
     *
     * The tag is located by attribute rather than `document.currentScript` so the lookup holds
     * however the script came to run, including Astro's client-side re-execution.
     */
    function injectLoader() {
        var host = document.querySelector('script[' + LOADER_SRC_ATTR + ']');

        if (!host) {
            return;
        }

        var loader = document.createElement('script');
        // Kept for the page-verification suite, which asserts the loader lands in the content
        // wrapper, and matching the id the vendor loader looks for on its own scan.
        loader.id = '__enzuzo-root-script';
        loader.src = host.getAttribute(LOADER_SRC_ATTR);
        host.parentNode.insertBefore(loader, host.nextSibling);
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

    // Last, so that neither the strip nor the observer can be outrun by the policy it injects.
    injectLoader();
})();
