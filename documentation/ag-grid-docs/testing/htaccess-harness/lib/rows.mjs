// Expectation-row parsing.
//
// A row is tab-separated:   host  path  status  location  [assertion]...
//
//   host      www | apex | blog | charts | any literal hostname (sent as the Host header)
//   path      request path (+ query)
//   status    expected status of the FIRST response
//   location  expected Location of the first response, EXACT. A Location on the harness server
//             itself (http://localhost:<port>/x) is normalised to the host-relative "/x"; an
//             absolute one is compared verbatim. Empty = no Location expected.
//
// Optional assertions, one per extra column:
//   accept=html|md|none|<literal>   Accept header to send (default */*, as curl)
//   req:<Name>=<value>   a further request header to send, e.g. req:If-None-Match=* for a 304
//   cc=<exact>|absent   cc~<regex>   Cache-Control
//   ct=<exact>|absent   ct~<regex>   Content-Type
//   xrt=<exact>|absent  xrt~<regex>  X-Robots-Tag
//   h:<Name>=<exact>|absent  h:<Name>~<regex>   any header
//   vary+<token>  vary-<token>       Vary does / does not list the token (case-insensitive)
//   link+describedby  link-describedby   Link header does / does not carry rel=describedby
//   csp=<n>          number of Content-Security-Policy headers
//   sec+             Referrer-Policy and Permissions-Policy both present
//   body~<regex>     body of the first response (proves which file/ErrorDocument served)
//   hops=<n>         redirects followed (within the harness hosts) until a non-3xx/external URL
//   final=<status>   status at the end of that chain
//   final-url=<url>  normalised URL at the end of that chain
//   revalidate=<status>     repeat the request with If-None-Match set to the first response's ETag
//   revalidate-lm=<status>  repeat the request with If-Modified-Since set to its Last-Modified
//   needs=<feature>  only run when the harness Apache has the optional feature (deflate); the row
//                    is skipped, and reported as such, otherwise
//   page=<path>      extra placeholder file to create in the docroot
//   twin=no          do not auto-create the .md twin for an accept=md row
//   known-fail=<assertion>[,<assertion>...]:<ref>
//                    approved desired behaviour, not implemented yet: the named assertions (status,
//                    location, or one of the row's own keys such as cc or h:ETag) are EXPECTED to
//                    fail. Any other failure, or a transport error, still fails the run, and so does
//                    a named assertion that passes, so the row gets promoted.
//
// Directives (comment lines): `# @category <name>` sets the category of the rows that follow, and a
// declared category that executes no rows fails the run (unless its site was skipped); `# @min-rows
// <n>` fails the run if the file yields fewer executed rows (guards a generator silently dropping
// rows).
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

export const HOST_ALIASES = {
    www: 'www.ag-grid.com',
    apex: 'ag-grid.com',
    blog: 'blog.ag-grid.com',
    charts: 'charts.ag-grid.com',
};

export const ACCEPT_ALIASES = {
    html: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    md: 'text/markdown',
    none: null,
};

const ASSERTION = /^(?<key>[a-z][a-z-]*|(?:h|req):[A-Za-z0-9-]+)(?<op>=|~|\+|-)(?<value>.*)$/;

// known-fail=cc:<ref>, known-fail=status,location:<ref>, known-fail=h:ETag:<ref>
const KNOWN_FAIL = /^(?<assertions>(?:h:[A-Za-z0-9-]+|[a-z][a-z-]*)(?:,(?:h:[A-Za-z0-9-]+|[a-z][a-z-]*))*):(?<ref>.+)$/;

/** Parses a known-fail marker; every assertion it names must be one the row makes. */
export function parseKnownFail(value, row) {
    const m = value.match(KNOWN_FAIL);
    if (!m) {
        throw new Error(`known-fail must name the assertions expected to fail: known-fail=<assertion>[,...]:<ref>`);
    }
    const assertions = m.groups.assertions.split(',');
    const made = new Set(['status', 'location', ...row.checks.map((check) => check.key)]);
    const unknown = assertions.filter((assertion) => !made.has(assertion));
    if (unknown.length) {
        throw new Error(`known-fail names ${unknown.join(', ')}, which the row does not assert`);
    }
    return { assertions, ref: m.groups.ref };
}

export function parseFile(file) {
    const rows = [];
    // Every declared category, with or without rows, so one left empty can be reported.
    const directives = { minRows: 0, categories: [] };
    let category = basename(file, '.tsv');
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
        if (!line.trim()) {
            return;
        }
        if (line.startsWith('#')) {
            const d = line.match(/^#\s*@(category|min-rows)\s+(.+?)\s*$/);
            if (d?.[1] === 'category') {
                category = d[2];
                directives.categories.push({ file: basename(file), category, line: i + 1 });
            } else if (d?.[1] === 'min-rows') {
                directives.minRows = Number(d[2]);
            }
            return;
        }
        const [host, path, status, location = '', ...rest] = line.split('\t');
        if (!path?.startsWith('/') || !/^\d{3}$/.test(status)) {
            throw new Error(`${file}:${i + 1}: malformed row: ${line}`);
        }
        const row = {
            file: basename(file),
            line: i + 1,
            category,
            host: HOST_ALIASES[host] ?? host,
            hostAlias: host,
            path,
            status: Number(status),
            location,
            accept: '*/*',
            requestHeaders: {},
            checks: [],
            pages: [],
            twin: true,
            needs: [],
            knownFail: null,
        };
        let knownFail;
        for (const raw of rest) {
            const tok = raw.trim();
            if (!tok) {
                continue;
            }
            const m = tok.match(ASSERTION);
            if (!m) {
                throw new Error(`${file}:${i + 1}: bad assertion '${tok}'`);
            }
            const { key, op, value } = m.groups;
            if (key === 'accept') {
                row.accept = value in ACCEPT_ALIASES ? ACCEPT_ALIASES[value] : value;
            } else if (key.startsWith('req:') && op === '=') {
                row.requestHeaders[key.slice(4)] = value;
            } else if (key === 'page') {
                row.pages.push(value);
            } else if (key === 'twin') {
                row.twin = value !== 'no';
            } else if (key === 'needs') {
                row.needs.push(value);
            } else if (key === 'known-fail') {
                knownFail = value;
            } else {
                row.checks.push({ key, op, value });
            }
        }
        if (knownFail !== undefined) {
            try {
                row.knownFail = parseKnownFail(knownFail, row);
            } catch (e) {
                throw new Error(`${file}:${i + 1}: ${e.message}`, { cause: e });
            }
        }
        rows.push(row);
    });
    return { rows, directives };
}

/** Which site's source a row depends on: the child .htaccess that governs its path. */
export function siteOf(row) {
    if (/^\/charts(\/|$|\?)/.test(row.path)) {
        return 'charts';
    }
    if (/^\/studio(\/|$|\?)/.test(row.path)) {
        return 'studio';
    }
    return 'grid';
}

export const wantsFollow = (row) =>
    row.checks.some((c) => c.key === 'hops' || c.key === 'final' || c.key === 'final-url');
