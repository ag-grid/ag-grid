/**
 * robots.txt parsing and evaluation per RFC 9309 (as Google implements it):
 * - a crawler obeys the group(s) whose User-agent value equals its product token,
 *   case-insensitively, combining them if several match; otherwise the `*` group(s);
 * - within the chosen rules, the longest matching pattern wins, and Allow wins a tie;
 * - `*` matches any run of characters and a trailing `$` anchors the end of the URL;
 * - the URL matched is the path plus query string.
 */
export interface RobotsRule {
    type: 'allow' | 'disallow';
    pattern: string;
}

export interface RobotsGroup {
    agents: string[];
    rules: RobotsRule[];
    /** Other in-group lines, e.g. Content-Signal, keyed by lower-cased field name. */
    fields: Record<string, string[]>;
}

export interface Robots {
    groups: RobotsGroup[];
    sitemaps: string[];
}

export function parseRobots(text: string): Robots {
    const groups: RobotsGroup[] = [];
    const sitemaps: string[] = [];
    let current: RobotsGroup | undefined;
    let lastWasAgent = false;

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.replace(/#.*$/, '').trim();
        const sep = line.indexOf(':');
        if (!line || sep < 0) {
            continue;
        }
        const field = line.slice(0, sep).trim().toLowerCase();
        const value = line.slice(sep + 1).trim();

        if (field === 'user-agent') {
            if (!current || !lastWasAgent) {
                current = { agents: [], rules: [], fields: {} };
                groups.push(current);
            }
            current.agents.push(value);
            lastWasAgent = true;
            continue;
        }
        lastWasAgent = false;
        if (field === 'sitemap') {
            sitemaps.push(value);
        } else if (current && (field === 'allow' || field === 'disallow')) {
            // An empty Disallow means "nothing is disallowed": it is not a rule.
            if (value) {
                current.rules.push({ type: field, pattern: value });
            }
        } else if (current) {
            (current.fields[field] ??= []).push(value);
        }
    }
    return { groups, sitemaps };
}

/** The groups a crawler with this product token obeys. */
export function groupsFor(robots: Robots, token: string): RobotsGroup[] {
    const lower = token.toLowerCase();
    const named = robots.groups.filter((g) => g.agents.some((a) => a.toLowerCase() === lower));
    return named.length ? named : robots.groups.filter((g) => g.agents.includes('*'));
}

export function robotsPatternMatches(pattern: string, url: string): boolean {
    const anchored = pattern.endsWith('$');
    const body = anchored ? pattern.slice(0, -1) : pattern;
    const source = body
        .split('*')
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
    return new RegExp(`^${source}${anchored ? '$' : ''}`).test(url);
}

export interface RobotsVerdict {
    allowed: boolean;
    rule?: RobotsRule;
}

export function isAllowed(robots: Robots, token: string, url: string): RobotsVerdict {
    let best: RobotsRule | undefined;
    for (const group of groupsFor(robots, token)) {
        for (const rule of group.rules) {
            if (!robotsPatternMatches(rule.pattern, url)) {
                continue;
            }
            if (
                !best ||
                rule.pattern.length > best.pattern.length ||
                (rule.pattern.length === best.pattern.length && rule.type === 'allow')
            ) {
                best = rule;
            }
        }
    }
    return { allowed: !best || best.type === 'allow', rule: best };
}

export function describeVerdict(v: RobotsVerdict): string {
    return v.rule
        ? `${v.allowed ? 'allowed' : 'disallowed'} by "${v.rule.type === 'allow' ? 'Allow' : 'Disallow'}: ${v.rule.pattern}"`
        : 'allowed (no rule matches)';
}
