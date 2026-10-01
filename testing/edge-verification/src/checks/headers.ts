import { promises as dns } from 'node:dns';

import { metaContents } from '../core/html';
import { type Response, header, headerAll, headerTokens } from '../core/http';
import { type CheckDef, Problems, budgeted, fail, pass, skip } from '../core/types';
import {
    ARCHIVE_VALIDATOR_PROBE,
    ARCHIVE_VALIDATOR_REQUESTS,
    DIVERGENT_VALIDATOR_PROBE,
    GZIP_REVALIDATION_PROBES,
    HEADER_ROWS,
    type HeaderRow,
    NOT_MODIFIED_CACHE_CONTROL,
    NOT_MODIFIED_PROBE,
    SECURITY_HEADERS,
} from '../expected/headers';
import { PENDING, finding } from '../expected/lifecycle';

export function expectHeader(p: Problems, res: Response, name: string, exp: string | RegExp | null): void {
    const values = headerAll(res, name);
    if (exp === null) {
        p.check(values.length === 0, `${name} should be absent, got ${JSON.stringify(values)}`);
    } else if (typeof exp === 'string') {
        p.check(values.length === 1, `${name}: expected exactly one, got ${values.length}`);
        if (values.length) {
            p.eq(name, values[0], exp);
        }
    } else {
        const joined = values.join(', ');
        p.check(exp.test(joined), `${name} ${JSON.stringify(joined)} does not match ${exp}`);
    }
}

export function expectSecurityHeaders(p: Problems, res: Response): void {
    for (const [name, exp] of Object.entries(SECURITY_HEADERS)) {
        const values = headerAll(res, name);
        p.check(values.length === 1, `${name}: expected exactly one copy, got ${values.length}`);
        if (values.length === 1) {
            if (typeof exp === 'string') {
                p.eq(name, values[0], exp);
            } else {
                p.check(exp.test(values[0]), `${name} does not match ${exp}`);
            }
        }
    }
}

export function isNoindexed(res: Response): boolean {
    if (headerAll(res, 'x-robots-tag').some((v) => /noindex/i.test(v))) {
        return true;
    }
    return metaContents(res.body, 'robots').some((v) => /noindex/i.test(v));
}

function headerCheck(row: HeaderRow): CheckDef {
    return {
        id: `headers.${row.id}`,
        area: 'headers',
        title: row.title,
        refs: row.refs,
        pending: row.pending,
        knownIssue: row.knownIssue,
        fixedBy: row.fixedBy,
        async run({ http }) {
            const res = await http.request({
                method: row.method ?? 'GET',
                url: row.url,
                headers: row.accept ? { accept: row.accept } : undefined,
            });
            const p = new Problems();
            if (row.status !== undefined) {
                p.eq('status', res.status, row.status);
            }
            for (const [name, exp] of Object.entries(row.expect ?? {})) {
                expectHeader(p, res, name, exp);
            }
            if (row.security) {
                expectSecurityHeaders(p, res);
            }
            for (const token of row.varyIncludes ?? []) {
                const vary = headerTokens(res, 'vary');
                p.check(vary.includes(token), `Vary ${JSON.stringify(vary)} lacks ${token}`);
            }
            if (row.noindex) {
                p.check(isNoindexed(res), 'not noindexed (no X-Robots-Tag or meta robots noindex)');
            }
            return p.outcome(`${res.status} ${row.url}`);
        },
    };
}

const GZIP = { 'accept-encoding': 'gzip' };

/** Fresh misses for `url` carry one ETag and one Last-Modified: both hosts agree (a mismatch fails). */
function validatorsAgree(id: string, url: string, lifecycle: { pending?: string; knownIssue?: string }): CheckDef {
    return {
        id,
        area: 'headers',
        title: `Both origin hosts send the same ETag and Last-Modified for ${new URL(url).pathname}`,
        refs: [finding(19)],
        ...lifecycle,
        async run({ http }) {
            const responses = [];
            for (let i = 0; i < ARCHIVE_VALIDATOR_REQUESTS; i++) {
                responses.push(await http.request({ method: 'HEAD', url, fresh: true }));
            }
            // A CloudFront hit replays one host's copy, so only misses say what each host serves.
            const fromOrigin = responses.filter((r) => /^Miss from cloudfront$/i.test(header(r, 'x-cache') ?? ''));
            if (fromOrigin.length < 2) {
                return skip(`${fromOrigin.length} of ${responses.length} responses reached the origin`);
            }
            const etags = new Set(fromOrigin.map((r) => header(r, 'etag')));
            const dates = new Set(fromOrigin.map((r) => header(r, 'last-modified')));
            const p = new Problems();
            // Agreement only means something between successful responses that carry both:
            // identical missing validators, or matching error pages, must not pass.
            const failed = fromOrigin.filter((r) => r.status !== 200);
            p.check(!failed.length, `origin responses not 200: ${failed.map((r) => r.status).join(', ')}`);
            for (const name of ['etag', 'last-modified']) {
                const missing = fromOrigin.filter((r) => !header(r, name)).length;
                p.check(
                    !missing,
                    `${name === 'etag' ? 'ETag' : 'Last-Modified'} missing on ${missing} of ${fromOrigin.length} origin responses`
                );
            }
            p.check(etags.size === 1, `ETags differ: ${[...etags].join(' vs ')}`);
            p.check(dates.size === 1, `Last-Modified differs: ${[...dates].join(' vs ')}`);
            if (p.count) {
                return p.outcome();
            }
            // Nothing in a response says which ALB target sent it, so agreement may be one host
            // answering every time: only a disagreement proves anything about both.
            return skip(
                `inconclusive: ${fromOrigin.length} origin responses agree (ETag ${[...etags][0]}), but nothing shows they came from both hosts`
            );
        },
    };
}

export function headerChecks(): CheckDef[] {
    return [
        ...HEADER_ROWS.map(headerCheck),
        ...GZIP_REVALIDATION_PROBES.map((probe): CheckDef => ({
            id: `headers.revalidate-gzip.${probe.id}`,
            area: 'headers',
            title: `A gzip ${probe.id} page revalidated with its -gzip ETag (If-None-Match) is a 304`,
            refs: [finding(19)],
            pending: probe.pending,
            async run({ http }) {
                const full = await http.request({ url: probe.url, headers: GZIP, fresh: true });
                const etag = header(full, 'etag');
                const encoding = header(full, 'content-encoding');
                if (full.status !== 200 || !etag || encoding !== 'gzip') {
                    return fail(`${full.status}, Content-Encoding ${encoding}, ETag ${etag}: nothing to revalidate`);
                }
                const res = await http.request({
                    url: probe.url,
                    headers: { ...GZIP, 'if-none-match': etag },
                    fresh: true,
                });
                const p = new Problems();
                p.eq(`status for If-None-Match ${etag}`, res.status, 304);
                return p.outcome(`If-None-Match ${etag}: ${res.status}`);
            },
        })),
        validatorsAgree('headers.archive-validators-agree', ARCHIVE_VALIDATOR_PROBE, {
            pending: PENDING.archiveMtimes,
        }),
        validatorsAgree('headers.archive-validators-agree.35.0.0', DIVERGENT_VALIDATOR_PROBE, {
            // Extracted per host with tar -m before the fix, and not scheduled for re-extraction.
            knownIssue: `${finding(19)} (grid 35.0.0: each host sends its own Last-Modified and ETag, so a revalidation that crosses hosts gets a 200)`,
        }),
        {
            id: 'headers.internal-host.prompts-docs-nxdomain',
            area: 'headers',
            title: 'prompts.docs.ag-grid.com no longer resolves (orphaned CNAME removed)',
            refs: ['SE-187'],
            async run() {
                try {
                    const r = await dns.resolve('prompts.docs.ag-grid.com');
                    return fail(`resolves to ${r.join(', ')}`);
                } catch (e: any) {
                    return e.code === 'ENOTFOUND' || e.code === 'ENODATA' ? pass(e.code) : fail(`DNS error ${e.code}`);
                }
            },
        },
        {
            id: 'headers.asset.hashed',
            area: 'headers',
            title: 'Content-hashed /_astro/ assets: public, max-age=604800, s-maxage=31536000, no Link',
            refs: ['SE-189'],
            async run({ http }) {
                const asset = /\/_astro\/[\w.-]+\.[A-Za-z0-9_-]{8}\.css/.exec(
                    (await http.get('https://www.ag-grid.com/')).body
                )?.[0];
                if (!asset) {
                    return fail('no hashed stylesheet referenced from the home page');
                }
                const res = await http.head(`https://www.ag-grid.com${asset}`);
                const p = new Problems();
                p.eq('status', res.status, 200);
                expectHeader(p, res, 'cache-control', 'public, max-age=604800, s-maxage=31536000');
                expectHeader(p, res, 'link', null);
                return p.outcome(asset);
            },
        },
        {
            id: 'headers.asset.charts-astro-live',
            area: 'headers',
            title: 'Every /charts/_astro/ stylesheet the charts home references exists',
            refs: ['SE-190'],
            run: budgeted(async ({ http }, p) => {
                const html = (await http.get('https://www.ag-grid.com/charts/')).body;
                const assets = [...new Set([...html.matchAll(/\/charts\/_astro\/[\w.-]+\.css/g)].map((m) => m[0]))];
                p.check(assets.length > 0, 'no stylesheets found');
                for (const a of assets) {
                    const res = await http.head(`https://www.ag-grid.com${a}`);
                    p.check(res.status === 200, `${a}: ${res.status}`);
                }
                return p.outcome(`${assets.length} stylesheets`);
            }),
        },
        {
            id: 'headers.not-modified-keeps-cache',
            area: 'headers',
            title: 'A 304 on a released archive page keeps its long cache (redirect no-cache excludes 304)',
            refs: [finding(4), finding(8)],
            async run({ http }) {
                const url = NOT_MODIFIED_PROBE;
                const full = await http.get(url);
                const etag = header(full, 'etag');
                const lastModified = header(full, 'last-modified');
                if (full.status !== 200 || (!etag && !lastModified)) {
                    return fail(
                        `${full.status}, no validator to revalidate with (ETag ${etag}, Last-Modified ${lastModified})`
                    );
                }
                // Last-Modified first: Apache's mod_deflate suffixes the ETag of a compressed response
                // (-gzip) and then does not match it, so If-None-Match can miss a 304 the date gets.
                const conditional: Record<string, string> = lastModified
                    ? { 'if-modified-since': lastModified }
                    : { 'if-none-match': etag! };
                const validator = Object.keys(conditional)[0];
                const res = await http.request({ url, headers: conditional, fresh: true });
                const stored = header(full, 'cache-control');
                const revalidated = headerAll(res, 'cache-control');
                const p = new Problems();
                // A 304 can only keep the long cache the 200 had: without it there is nothing to keep.
                expectHeader(p, full, 'cache-control', NOT_MODIFIED_CACHE_CONTROL);
                p.eq(`status for ${validator}`, res.status, 304);
                // Absent is fine: a cache keeps the stored Cache-Control when a 304 does not resend it.
                p.check(
                    revalidated.length === 0 || (revalidated.length === 1 && revalidated[0] === stored),
                    `304 Cache-Control ${JSON.stringify(revalidated)} replaces the stored ${JSON.stringify(stored)}`
                );
                return p.outcome(
                    `${validator}: 304 Cache-Control ${revalidated.length ? revalidated[0] : '(not resent)'}; 200 had ${stored}`
                );
            },
        },
        {
            id: 'headers.csp.main-vs-blog',
            area: 'headers',
            title: 'Main-site CSP lists sha256 hashes; the /blog/ CSP is a different policy with none',
            refs: ['SE-40', 'SE-93'],
            async run({ http }) {
                const main = headerAll(await http.get('https://www.ag-grid.com/'), 'content-security-policy');
                const blog = headerAll(await http.get('https://www.ag-grid.com/blog/'), 'content-security-policy');
                const p = new Problems();
                p.check(main.length === 1 && /'sha256-/.test(main[0]), 'main CSP has no sha256 entries');
                p.check(blog.length === 1 && !/'sha256-/.test(blog[0]), 'blog CSP is missing or lists sha256 entries');
                p.check(main[0] !== blog[0], 'blog and main CSP are identical (path scoping broken)');
                p.check(
                    /frame-src[^;]*https:\/\/ag-grid\.com/.test(blog[0] ?? ''),
                    'blog frame-src lacks https://ag-grid.com (apex embeds)'
                );
                p.check(
                    /frame-src[^;]*https:\/\/\*\.ag-grid\.com/.test(blog[0] ?? ''),
                    'blog frame-src lacks https://*.ag-grid.com'
                );
                return p.outcome();
            },
        },
    ];
}
