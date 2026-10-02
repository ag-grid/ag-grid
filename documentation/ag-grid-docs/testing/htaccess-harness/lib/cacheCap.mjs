// The site-wide browser-cache cap: no response may let a browser keep it for more than 7 days.
// CloudFront's s-maxage is exempt (it can be invalidated); max-age, `immutable` and Expires are not.

export const BROWSER_CACHE_CAP_SECONDS = 604800;

/** Why a response breaks the cap, or null. `headers` maps lower-case names to their values. */
export function browserCacheViolation(headers) {
    const problems = [];
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
