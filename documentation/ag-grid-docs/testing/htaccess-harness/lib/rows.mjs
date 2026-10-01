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
//   page=<path>      extra placeholder file to create in the docroot
//   twin=no          do not auto-create the .md twin for an accept=md row
//   known-fail=<ref> approved desired behaviour, not implemented yet: the row is EXPECTED to fail;
//                    an unexpected pass fails the run so the row gets promoted.
//
// Directives (comment lines): `# @category <name>` sets the category of the rows that follow;
// `# @min-rows <n>` fails the run if the file yields fewer executed rows (guards a generator
// silently dropping rows).
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

const ASSERTION = /^(?<key>[a-z][a-z-]*|h:[A-Za-z0-9-]+)(?<op>=|~|\+|-)(?<value>.*)$/;

export function parseFile(file) {
    const rows = [];
    const directives = { minRows: 0 };
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
            checks: [],
            pages: [],
            twin: true,
            knownFail: null,
        };
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
            } else if (key === 'page') {
                row.pages.push(value);
            } else if (key === 'twin') {
                row.twin = value !== 'no';
            } else if (key === 'known-fail') {
                row.knownFail = value;
            } else {
                row.checks.push({ key, op, value });
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
