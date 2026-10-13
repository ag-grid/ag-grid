/**
 * A minimal RFC 9309 robots.txt evaluator, so tests can assert which rule *wins* for a URL rather
 * than which lines the file happens to contain.
 *
 * Implements the parts of the RFC the generated file relies on:
 * - group selection: every group naming the crawler's product token (case-insensitive) is merged;
 *   only when none does is the `*` group used. Groups never inherit from each other.
 * - longest match: the matching rule with the most octets wins, and Allow wins a tie.
 * - `*` matches any run of characters, a trailing `$` anchors the end, and everything else is a
 *   prefix match against the path plus query.
 * - percent-encoding is normalised on both sides before comparing; paths stay case-sensitive.
 * - `/robots.txt` itself is always allowed.
 */

interface RobotsRule {
    allow: boolean;
    pattern: string;
}

interface RobotsGroup {
    userAgents: string[];
    rules: RobotsRule[];
}

export interface ParsedRobotsTxt {
    groups: RobotsGroup[];
    sitemaps: string[];
}

const UNRESERVED = /[A-Za-z0-9\-._~]/;

/** Decode escaped unreserved characters, upper-case the remaining escapes and encode non-ASCII. */
function normalisePercentEncoding(value: string): string {
    const decodedUnreserved = value.replace(/%([0-9A-Fa-f]{2})/g, (escape, hex: string) => {
        const char = String.fromCharCode(parseInt(hex, 16));
        return UNRESERVED.test(char) ? char : escape.toUpperCase();
    });
    return [...decodedUnreserved].map((char) => (char.charCodeAt(0) > 0x7f ? encodeURIComponent(char) : char)).join('');
}

export function parseRobotsTxt(txt: string): ParsedRobotsTxt {
    const groups: RobotsGroup[] = [];
    const sitemaps: string[] = [];
    let current: RobotsGroup | undefined;
    let lastWasUserAgent = false;

    for (const rawLine of txt.split(/\r?\n/)) {
        const line = rawLine.replace(/#.*$/, '').trim();
        const separator = line.indexOf(':');
        if (separator < 0) {
            continue;
        }
        const key = line.slice(0, separator).trim().toLowerCase();
        const value = line.slice(separator + 1).trim();

        if (key === 'user-agent') {
            if (!current || !lastWasUserAgent) {
                current = { userAgents: [], rules: [] };
                groups.push(current);
            }
            current.userAgents.push(value);
            lastWasUserAgent = true;
            continue;
        }
        lastWasUserAgent = false;

        if (key === 'sitemap') {
            sitemaps.push(value);
        } else if ((key === 'allow' || key === 'disallow') && current && value) {
            current.rules.push({ allow: key === 'allow', pattern: normalisePercentEncoding(value) });
        }
    }

    return { groups, sitemaps };
}

function rulesFor({ groups }: ParsedRobotsTxt, userAgent: string): RobotsRule[] {
    const token = userAgent.toLowerCase();
    const named = groups.filter((group) => group.userAgents.some((agent) => agent.toLowerCase() === token));
    const selected = named.length ? named : groups.filter((group) => group.userAgents.includes('*'));
    return selected.flatMap((group) => group.rules);
}

function patternMatches(pattern: string, path: string): boolean {
    const anchored = pattern.endsWith('$');
    const body = anchored ? pattern.slice(0, -1) : pattern;
    const source = body
        .split('*')
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
    return new RegExp(`^${source}${anchored ? '$' : ''}`).test(path);
}

/** Whether `userAgent` may fetch `pathAndQuery` (e.g. `/changelog/?searchQuery=x`). */
export function isAllowedByRobots(robots: ParsedRobotsTxt, userAgent: string, pathAndQuery: string): boolean {
    const path = normalisePercentEncoding(pathAndQuery);
    if (path === '/robots.txt') {
        return true;
    }

    let winner: RobotsRule | undefined;
    for (const rule of rulesFor(robots, userAgent)) {
        if (!patternMatches(rule.pattern, path)) {
            continue;
        }
        const longer = !winner || rule.pattern.length > winner.pattern.length;
        const allowWinsTie = winner && rule.pattern.length === winner.pattern.length && rule.allow;
        if (longer || allowWinsTie) {
            winner = rule;
        }
    }

    return winner?.allow ?? true;
}
