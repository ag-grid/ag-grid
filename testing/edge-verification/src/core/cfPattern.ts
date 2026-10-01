/**
 * CloudFront cache-behaviour path patterns: `*` matches zero or more characters, `?` exactly
 * one, matching is case-sensitive, against the URI path only (no query string), and a pattern
 * without a leading `/` is treated as if it had one. Behaviours are evaluated in list order and
 * the first match wins; anything unmatched goes to the default behaviour.
 */
export function cfPatternToRegExp(pattern: string): RegExp {
    const normalised = pattern.startsWith('/') || pattern.startsWith('*') ? pattern : '/' + pattern;
    let source = '';
    for (const ch of normalised) {
        if (ch === '*') {
            source += '.*';
        } else if (ch === '?') {
            source += '.';
        } else {
            source += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        }
    }
    return new RegExp(`^${source}$`);
}

export function cfPatternMatches(pattern: string, path: string): boolean {
    return cfPatternToRegExp(pattern).test(path);
}

/** Index of the first matching behaviour, or -1 for the default behaviour. */
export function selectBehaviour(patterns: readonly string[], path: string): number {
    return patterns.findIndex((p) => cfPatternMatches(p, path));
}
