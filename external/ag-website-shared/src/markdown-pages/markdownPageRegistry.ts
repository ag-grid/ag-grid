/**
 * SE-80: the contract for declaring which pages ship a markdown (`.md`) twin.
 *
 * The set of twinned pages is consumed in three places that must agree exactly — the dev-server
 * negotiation plugin, the Apache rewrite rule, and the Apache `Vary: Accept` scope. Previously
 * each held its own hand-maintained copy of the list, so adding a twin was a multi-file edit with
 * nothing to catch an omission. Each product now declares its pages once as `MarkdownPageGroup`s
 * and derives all three from that single list.
 *
 * Only the type lives here. The derivation (see AG Grid's `markdownPages.ts`) is three lines, and
 * keeping it product-side avoids a runtime import across this package boundary: this subrepo has
 * no `"type": "module"`, so a consumer running under plain node — as the htaccess test harness does
 * via `tsx` — would load it as CJS and see no named exports.
 */
export interface MarkdownPageGroup {
    /**
     * URL path pattern with no leading or trailing slash, e.g. `license-pricing` or
     * `session/[^/.]+`. Consumers anchor it as `^/(<pattern>)/?$`.
     *
     * Must be valid in BOTH the JavaScript RegExp engine (dev-server plugin) and Apache's PCRE
     * (`RewriteCond`, and `<If>` expressions using `m#...#` delimiters). Keep to the common subset:
     * `(?:…)`, `|`, `?`, and negated character classes. No named groups, no lookbehind, no `#`.
     *
     * Match final path segments with `[^/.]+` rather than `[^/]+` so a request for the twin itself
     * (`/react-data-grid/cell-editing.md`) never matches and re-negotiates into `….md.md`. No page
     * slug on any of the sites contains a dot.
     *
     * Omit for a page negotiated by a dedicated rule rather than the shared alternation — currently
     * only the site root, whose twin is `index.md` because it has no path segment to suffix. Such a
     * group documents the page without contributing to the patterns.
     */
    pattern?: string;
    /** What this group covers, for readers of the registry. Not emitted anywhere. */
    describes: string;
}
