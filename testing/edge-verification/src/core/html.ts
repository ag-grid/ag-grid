/**
 * Minimal, dependency-free HTML inspection for server-rendered markup. These checks read the
 * raw HTML exactly as a crawler does (no JavaScript), which is what the SEO tickets specify.
 */

export interface JsonLdNode {
    '@type'?: string | string[];
    '@id'?: string;
    [key: string]: unknown;
}

export function jsonLdNodes(html: string): JsonLdNode[] {
    const nodes: JsonLdNode[] = [];
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    for (const m of html.matchAll(re)) {
        try {
            const data = JSON.parse(m[1]);
            for (const item of Array.isArray(data) ? data : [data]) {
                nodes.push(...(Array.isArray(item['@graph']) ? item['@graph'] : [item]));
            }
        } catch {
            nodes.push({ '@type': INVALID_JSON_LD });
        }
    }
    return nodes;
}

/** A JSON-LD block that does not parse: jsonLdNodes reports it as a node of this type. */
export const INVALID_JSON_LD = 'INVALID_JSON';

/**
 * The JSON-LD nodes of a page, reporting through `problem` any block that does not parse: a
 * malformed block is broken structured data, never a node to count.
 */
export function validJsonLdNodes(html: string, problem: (message: string) => void): JsonLdNode[] {
    const nodes = jsonLdNodes(html);
    const invalid = nodes.filter((n) => n['@type'] === INVALID_JSON_LD).length;
    if (invalid) {
        problem(`${invalid} JSON-LD block${invalid === 1 ? ' does' : 's do'} not parse`);
    }
    return nodes.filter((n) => n['@type'] !== INVALID_JSON_LD);
}

export function nodesOfType(nodes: JsonLdNode[], type: string): JsonLdNode[] {
    return nodes.filter((n) => (Array.isArray(n['@type']) ? n['@type'].includes(type) : n['@type'] === type));
}

/** Content of every <meta> whose name or property equals `key`. */
export function metaContents(html: string, key: string): string[] {
    const out: string[] = [];
    for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
        const tag = m[0];
        const name = /\b(?:name|property)=["']([^"']+)["']/i.exec(tag)?.[1];
        if (name?.toLowerCase() === key.toLowerCase()) {
            out.push(/\bcontent=["']([^"']*)["']/i.exec(tag)?.[1] ?? '');
        }
    }
    return out;
}

export function linkHrefs(html: string, rel: string): string[] {
    const out: string[] = [];
    for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
        const tag = m[0];
        if (new RegExp(`\\brel=["']${rel}["']`, 'i').test(tag)) {
            out.push(/\bhref=["']([^"']*)["']/i.exec(tag)?.[1] ?? '');
        }
    }
    return out;
}

/** Opening tags of an element, e.g. countTags(html, 'main'). Ignores <mainfoo>. */
export function countTags(html: string, tag: string): number {
    return [...html.matchAll(new RegExp(`<${tag}(?=[\\s>/])`, 'gi'))].length;
}

export function stripTags(html: string): string {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export interface Heading {
    level: number;
    text: string;
}

/** Headings h1-h6 with their visible text. Nested headings are not expected in this markup. */
export function headings(html: string): Heading[] {
    const out: Heading[] = [];
    for (const m of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
        out.push({ level: Number(m[1]), text: stripTags(m[2]) });
    }
    return out;
}

/** The inner HTML of each <tag>...</tag> region (non-nested). */
export function sections(html: string, tag: string): string[] {
    return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))].map((m) => m[1]);
}

/** Absolute href attribute values of <a> elements. */
export function anchorHrefs(html: string): string[] {
    return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((m) => m[1]);
}

/** Links in markdown text: [label](url) targets plus bare https:// URLs, de-duplicated, in order. */
export function markdownLinks(text: string): string[] {
    const found: string[] = [];
    for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
        found.push(m[1]);
    }
    for (const m of text.matchAll(/(?<![(\w])(https?:\/\/[^\s)<>"'`,]+[^\s)<>"'`,.])/g)) {
        found.push(m[1]);
    }
    return [...new Set(found)];
}

/** Splits a markdown document into `## heading` sections. The text before the first is ''. */
export function markdownSections(text: string): Map<string, string> {
    const out = new Map<string, string>();
    let name = '';
    let buf: string[] = [];
    for (const line of text.split('\n')) {
        const m = /^##\s+(.+)$/.exec(line);
        if (m) {
            out.set(name, buf.join('\n'));
            name = m[1].trim();
            buf = [];
        } else {
            buf.push(line);
        }
    }
    out.set(name, buf.join('\n'));
    return out;
}

/** The documented markdown twin of a page URL: /x/y/ -> /x/y.md, a site root -> <root>/index.md. */
export function twinOf(url: string): string | undefined {
    const u = new URL(url);
    if (u.host !== 'www.ag-grid.com' || /\.(md|txt|xml|json)$/.test(u.pathname)) {
        return undefined;
    }
    const roots = ['/', '/charts/', '/studio/'];
    const path = roots.includes(u.pathname) ? `${u.pathname}index.md` : `${u.pathname.replace(/\/$/, '')}.md`;
    return `${u.origin}${path}`;
}
