// The site-wide browser-cache cap: no response may let a browser keep it for more than 7 days.
// CloudFront's s-maxage is exempt (it can be invalidated); max-age, `immutable` and Expires are not.
// Nor is silence: a response a browser may cache heuristically (RFC 9111 §4.2.2, typically 10% of
// the time since Last-Modified) needs an explicit Cache-Control or Expires.

export const BROWSER_CACHE_CAP_SECONDS = 604800;

/** Statuses cacheable by default (RFC 9110 §15.1), so a browser may give them a heuristic lifetime. */
export const HEURISTICALLY_CACHEABLE = new Set([200, 203, 204, 206, 300, 301, 308, 404, 405, 410, 414, 501]);

/**
 * Why a response breaks the cap, or null. `headers` maps lower-case names to their values; the
 * status matters only to the heuristic case, which needs a Last-Modified to work from.
 */
export function browserCacheViolation(headers, status) {
    const problems = [];
    if (
        HEURISTICALLY_CACHEABLE.has(status) &&
        (headers['last-modified'] ?? []).length > 0 &&
        !(headers['cache-control'] ?? []).length &&
        !(headers.expires ?? []).length
    ) {
        problems.push('Last-Modified with no Cache-Control or Expires (heuristically cacheable)');
    }
    for (const value of headers['cache-control'] ?? []) {
        // max-age, not s-maxage: the lookbehind keeps "s-maxage=" out.
        for (const [, seconds] of value.matchAll(/(?<![-\w])max-age\s*=\s*"?(\d+)/gi)) {
            if (Number(seconds) > BROWSER_CACHE_CAP_SECONDS) {
                problems.push(`Cache-Control max-age=${seconds} (cap ${BROWSER_CACHE_CAP_SECONDS})`);
            }
        }
    }
    for (const expires of headers.expires ?? []) {
        const date = Date.parse((headers.date ?? [])[0] ?? '');
        const until = Date.parse(expires);
        if (Number.isNaN(until)) {
            continue; // an invalid Expires means already expired
        }
        const seconds = ((until - (Number.isNaN(date) ? Date.now() : date)) / 1000) | 0;
        if (seconds > BROWSER_CACHE_CAP_SECONDS) {
            problems.push(`Expires is ${seconds}s after Date (cap ${BROWSER_CACHE_CAP_SECONDS})`);
        }
    }
    return problems.length ? problems.join('; ') : null;
}
