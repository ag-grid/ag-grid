// Shared pieces of the expectation generators: sample-path synthesis from a rule's regex, and
// TSV output. The generators PREDICT behaviour from the rules' own semantics; the harness then
// checks every prediction against real Apache, so a disagreement surfaces as a failure to review
// (either the model is wrong, or Apache does something the rule author did not intend).

/** A concrete path that matches a (simple, anchored) Apache regex. First alternative wins. */
export function synthFromPattern(pat, { slug = 'sample' } = {}) {
    let p = pat;
    const anchored = p.startsWith('^');
    if (anchored) {
        p = p.slice(1);
    }
    if (p.endsWith('$')) {
        p = p.slice(0, -1);
    }
    let out = expand(p, slug);
    if (!anchored) {
        out = '/documentation' + out;
    }
    return out;
}

function expand(p, slug) {
    let out = '';
    let i = 0;
    while (i < p.length) {
        const c = p[i];
        if (c === '\\') {
            out += p[i + 1];
            i += 2;
            continue;
        }
        if (c === '(') {
            let depth = 1;
            let j = i + 1;
            while (j < p.length && depth > 0) {
                if (p[j] === '\\') {
                    j += 2;
                    continue;
                }
                if (p[j] === '(') {
                    depth++;
                } else if (p[j] === ')') {
                    depth--;
                }
                j++;
            }
            let inner = p.slice(i + 1, j - 1);
            if (inner.startsWith('?!') || inner.startsWith('?=')) {
                // lookaround: contributes nothing
                i = j;
                continue;
            }
            if (inner.startsWith('?:')) {
                inner = inner.slice(2);
            }
            const bar = topLevelBar(inner);
            const alt = bar >= 0 ? inner.slice(0, bar) : inner;
            out += expand(alt, slug);
            i = j;
            // a quantifier after a group: include the group once
            if (p[i] === '?' || p[i] === '*' || p[i] === '+') {
                i++;
            }
            continue;
        }
        if (c === '.') {
            const next = p[i + 1];
            if (next === '*' || next === '+') {
                out += slug;
                i += 2;
            } else {
                out += 'x';
                i++;
            }
            continue;
        }
        if (c === '[') {
            let j = i + 1;
            while (j < p.length && p[j] !== ']') {
                j++;
            }
            const cls = p.slice(i + 1, j);
            i = j + 1;
            const multi = p[i] === '+' || p[i] === '*';
            if (multi || p[i] === '{') {
                i = p[i] === '{' ? p.indexOf('}', i) + 1 : i + 1;
            }
            if (cls.startsWith('^')) {
                out += multi ? slug : 'a';
            } else if (/0-9/.test(cls) && !/a-z/.test(cls)) {
                out += '1';
            } else {
                // a letters class such as [a-z]+ (a framework slot in the legacy patterns)
                out += multi ? 'javascript' : 'a';
            }
            continue;
        }
        if (c === '?' || c === '*' || c === '+') {
            // quantifier on a literal: keep the literal once
            i++;
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

export function topLevelBar(inner) {
    let depth = 0;
    for (let i = 0; i < inner.length; i++) {
        if (inner[i] === '\\') {
            i++;
        } else if (inner[i] === '(') {
            depth++;
        } else if (inner[i] === ')') {
            depth--;
        } else if (inner[i] === '|' && depth === 0) {
            return i;
        }
    }
    return -1;
}

/** Every top-level alternative of a group pattern, each optional group both omitted and included. */
export function samplesForGroupPattern(pattern, slug) {
    const alts = [];
    let rest = pattern;
    for (;;) {
        const bar = topLevelBar(rest);
        alts.push(bar >= 0 ? rest.slice(0, bar) : rest);
        if (bar < 0) {
            break;
        }
        rest = rest.slice(bar + 1);
    }
    const out = new Set();
    for (const alt of alts) {
        out.add(expand(alt, slug));
        // the same alternative with a trailing optional group left out
        const withoutOptional = alt.replace(/\((?:\?:)?(?:[^()]|\([^()]*\))*\)\?$/, '');
        if (withoutOptional !== alt) {
            out.add(expand(withoutOptional, slug));
        }
    }
    return [...out];
}

/** $1..$9 substitution, as mod_alias / mod_rewrite do it. */
export const substitute = (target, match) => target.replace(/\$(\d)/g, (_, n) => match[Number(n)] ?? '');

/** Collapse a doubled slash in the path part of a URL (the intended form of a prefix append). */
export const collapseSlashes = (url) =>
    url.replace(/^(https?:\/\/[^/]+)?(.*)$/, (_, origin = '', path) => origin + path.replace(/\/{2,}/g, '/'));

const isRedirect = (status) => status >= 300 && status < 400 && status !== 304;

/**
 * The known-fail marker for a row that asserts the INTENDED answer where Apache gives another one,
 * naming only the assertions that differ: status, location, and the redirect no-cache check (which
 * `Rows.add` adds to an intended redirect) when Apache does not redirect at all. Null when the
 * answers do not differ, so there is nothing to mark.
 */
export function knownFailMarker(ref, intended, actual) {
    const assertions = [
        intended.status !== actual.status && 'status',
        intended.loc !== actual.loc && 'location',
        isRedirect(intended.status) && !isRedirect(actual.status) && 'cc',
    ].filter(Boolean);
    return assertions.length ? `known-fail=${assertions.join(',')}:${ref}` : null;
}

/**
 * Every generated redirect row also asserts it is never cached (the root's `Header always set
 * Cache-Control "no-cache"` for 3xx except 304), so a cached Location cannot replay one visitor's
 * query string to another. A row asserting its own Cache-Control keeps it.
 */
const withRedirectChecks = (status, extra) =>
    isRedirect(status) && !extra.some((e) => /^cc[=~]/.test(e)) ? [...extra, 'cc=no-cache'] : extra;

export class Rows {
    constructor() {
        this.rows = [];
        this.seen = new Set();
    }
    /**
     * First row for a host+path+accept wins: Apache answers one way per request. A `variant` names
     * a further row for the same request that asserts something else about the same response.
     */
    add(host, path, status, loc = '', extra = [], variant = '') {
        const key = `${host}\t${path}\t${extra.find((e) => e.startsWith('accept=')) ?? ''}\t${variant}`;
        if (this.seen.has(key)) {
            return;
        }
        this.seen.add(key);
        this.rows.push([host, path, String(status), loc, ...withRedirectChecks(Number(status), extra)].join('\t'));
    }
    section(title) {
        this.rows.push('', `# @category ${title}`);
    }
    toString(header) {
        return [...header.map((h) => `# ${h}`), ...this.rows].join('\n') + '\n';
    }
    get count() {
        return this.seen.size;
    }
}
