// Tests for scripts/migrate-archive-htaccess.mjs, which patches the .htaccess of archives that are
// already deployed (they are never rebuilt, so generator fixes never reach them).
//
// The fixtures in __fixtures__/deployed-archives are what each archive was deployed with,
// regenerated from the release tag that built it, with the base URL its archive build used:
//
//   grid-<v>      ag-grid release-<v>,        PUBLIC_BASE_URL=/archive/<v>,        env production
//   charts-<v>    ag-charts release-<v>,      PUBLIC_BASE_URL=/charts/archive/<v>, env production
//   studio-<v>    ag-studio release-<v>,      PUBLIC_BASE_URL=/studio/archive/<v>, env production
//   *-top-level   ag-charts / ag-studio latest at 2026-10-01, base /charts and /studio (the live
//                 parents, which the archives without a rewrite block of their own inherit from)
//
// via `getHtaccessContent({ env: 'production' })`, as each repo's agHtaccessGen plugin calls it.
// Archive builds only ship a .htaccess since grid 36.0.0, charts 14.0.0 and studio 2.0.0 (each
// repo's `HTACCESS=production` in .env.build.archive, 2026-06-22/23); earlier archives have none
// and keep the parent's rules, so there is nothing to migrate. Grid files are trimmed to 25 of each
// kind of `Redirect 301` (in-archive and absolute target); every other line is verbatim.
import { readFileSync } from 'node:fs';

import {
    ALIAS_HOSTS,
    MIGRATION_BEGIN,
    MIGRATION_END,
    migrateArchiveHtaccess,
} from '../../../../../scripts/migrate-archive-htaccess.mjs';
import type * as Constants from '../../constants';
import type { CompiledHtaccess } from './htaccessSimulator';
import { compileHtaccess, followRedirects, responseHeaders, route } from './htaccessSimulator';

type Site = 'grid' | 'charts' | 'studio';

const fixture = (name: string): string =>
    readFileSync(new URL(`./__fixtures__/deployed-archives/${name}.htaccess`, import.meta.url), 'utf8');

const baseOf = (site: Site, version: string): string =>
    site === 'grid' ? `/archive/${version}` : `/${site}/archive/${version}`;

interface Case {
    site: Site;
    version: string;
    /** A doc page below the archive base, with its trailing slash. */
    page: string;
    /** Whether the archive ships markdown twins (AddType text/markdown). */
    markdown: boolean;
}

const CASES: Case[] = [
    { site: 'grid', version: '36.0.0', page: 'react-data-grid/getting-started/', markdown: false },
    { site: 'grid', version: '36.0.1', page: 'react-data-grid/getting-started/', markdown: false },
    { site: 'grid', version: '36.1.0', page: 'react-data-grid/getting-started/', markdown: true },
    { site: 'grid', version: '36.2.0', page: 'react-data-grid/getting-started/', markdown: true },
    { site: 'charts', version: '14.0.0', page: 'react/bar-series/', markdown: false },
    { site: 'charts', version: '14.1.0', page: 'react/bar-series/', markdown: true },
    { site: 'charts', version: '14.2.0', page: 'react/bar-series/', markdown: true },
    { site: 'studio', version: '2.0.0', page: 'react/getting-started/', markdown: false },
    { site: 'studio', version: '2.1.0', page: 'react/getting-started/', markdown: true },
    { site: 'studio', version: '3.0.0', page: 'react/getting-started/', markdown: true },
];

// The live root, and the live /charts/ and /studio/ parents, around one archive.
let rootHtaccess: CompiledHtaccess;
const parents: Record<Site, CompiledHtaccess[]> = { grid: [], charts: [], studio: [] };

beforeAll(async () => {
    const { getHtaccessContent } = await import('./htaccessRules');
    rootHtaccess = compileHtaccess(getHtaccessContent({ env: 'production' }), '/');
    parents.charts = [compileHtaccess(fixture('charts-top-level'), '/charts/')];
    parents.studio = [compileHtaccess(fixture('studio-top-level'), '/studio/')];
});

// Grid archives before 36.2.0 still carry a mod_expires block and a mod_deflate block with
// BrowserMatch lines, which the simulator does not model. Neither routes a request or sets a header
// these tests look at, so both are dropped before compiling.
const withoutUnmodelledModules = (content: string): string =>
    content.replace(/^<IfModule mod_(?:expires|deflate)\.c>\n[\s\S]*?^<\/IfModule>\n/gm, '');

const docroot = (site: Site, base: string, archive: string): CompiledHtaccess[] => [
    rootHtaccess,
    ...parents[site],
    compileHtaccess(withoutUnmodelledModules(archive), `${base}/`),
];

const migrate = (c: Case, source = fixture(`${c.site}-${c.version}`)) =>
    migrateArchiveHtaccess(source, { site: c.site, base: baseOf(c.site, c.version) });

// Every absolute or root-relative target a rule or redirect in the file can send a request to.
const targetsIn = (content: string): string[] =>
    content
        .split('\n')
        .map((line) => line.trim())
        .flatMap((line) => {
            const rule = line.match(/^RewriteRule\s+("[^"]*"|\S+)\s+("[^"]*"|\S+)/);
            const redirect = line.match(/^Redirect(?:Match)?\s+\d+\s+("[^"]*"|\S+)\s+("[^"]*"|\S+)/);
            const target = (rule ?? redirect)?.[2]?.replace(/^"|"$/g, '');
            return target && target !== '-' ? [target] : [];
        });

describe('migrate-archive-htaccess', () => {
    describe.each(CASES)('$site $version', (c) => {
        const base = baseOf(c.site, c.version);
        const original = fixture(`${c.site}-${c.version}`);
        const result = migrate(c);
        const output: string = result.output!;
        const pageUrl = `${base}/${c.page}`;
        const exists = (path: string) => [`${base}/${c.page.replace(/\/$/, '')}.md`, `${base}/index.md`].includes(path);

        it('is patched', () => {
            expect(result.status).toBe('patched');
        });

        it('inserts the block straight after the first RewriteEngine On, or in a rewrite block of its own', () => {
            const lines = output.split('\n');
            const begin = lines.findIndex((l) => l.trim() === MIGRATION_BEGIN);
            const engine = lines.findIndex((l) => l.trim() === 'RewriteEngine On');
            if (/RewriteEngine On/.test(original)) {
                expect(begin).toBe(engine + 1);
            } else {
                expect(lines.slice(begin, begin + 3).map((l) => l.trim())).toEqual([
                    MIGRATION_BEGIN,
                    '<IfModule mod_rewrite.c>',
                    'RewriteEngine On',
                ]);
            }
            expect(lines.filter((l) => l.trim() === MIGRATION_END)).toHaveLength(1);
        });

        it('is idempotent: a second run changes nothing', () => {
            const again = migrate(c, output);
            expect(again.status).toBe('unchanged');
            expect(again.output).toBe(output);
            expect(again.removed).toEqual([]);
        });

        it('re-running over a stale block regenerates it', () => {
            const stale = output.replace(/^(\s*RewriteCond %\{HTTP_HOST\} \^ag-grid\\.com\$) \[NC,OR\]$/m, '$1 [OR]');
            expect(stale).not.toBe(output);
            expect(migrate(c, stale).output).toBe(output);
        });

        it.each(ALIAS_HOSTS)('sends %s to the same archive URL on www in one hop, query string kept', (host) => {
            const chain = followRedirects(docroot(c.site, base, output), {
                url: `https://${host}${pageUrl}?a=1&b=x%20y`,
            });
            expect(chain.hops).toEqual([
                expect.objectContaining({ status: 301, location: `https://www.ag-grid.com${pageUrl}?a=1&b=x%20y` }),
            ]);
            expect(chain.final.outcome).toEqual(expect.objectContaining({ type: 'serve', path: pageUrl }));
        });

        it('leaves www serving the page', () => {
            expect(route(docroot(c.site, base, output), { url: `https://www.ag-grid.com${pageUrl}` })).toEqual(
                expect.objectContaining({ type: 'serve', path: pageUrl })
            );
        });

        if (c.markdown) {
            it('negotiates markdown under the archive base', () => {
                const files = docroot(c.site, base, output);
                const twin = { accept: 'text/markdown', fileExists: exists };
                expect(route(files, { url: `https://www.ag-grid.com${pageUrl}`, ...twin })).toEqual(
                    expect.objectContaining({ type: 'serve', path: `${base}/${c.page.replace(/\/$/, '')}.md` })
                );
                expect(route(files, { url: `https://www.ag-grid.com${base}/`, ...twin })).toEqual(
                    expect.objectContaining({ type: 'serve', path: `${base}/index.md` })
                );
                // A path with no twin on disk is left alone.
                expect(route(files, { url: `https://www.ag-grid.com${base}/no-twin/`, ...twin })).toEqual(
                    expect.objectContaining({ type: 'serve', path: `${base}/no-twin/` })
                );
            });
        }

        // Grid is the one site the block adds negotiation to, so it carries the Vary that goes with it.
        if (c.markdown && c.site === 'grid') {
            it('keys shared caches on Accept for the HTML variant of a negotiated page', () => {
                const headers = responseHeaders(docroot(c.site, base, output), {
                    uri: `${pageUrl}index.html`,
                    status: 200,
                    contentType: 'text/html',
                });
                expect(headers.get('vary')?.join(', ')).toContain('Accept');
            });
        }

        it('leaves no rule or redirect that sends a request out of the archive', () => {
            const outside = targetsIn(output).filter(
                (target) =>
                    // Internal markdown rewrites resolve against the docroot via %1, which carries the base.
                    !['/%1.md', '%{REQUEST_URI}/'].includes(target) &&
                    !target.startsWith('https://www.ag-grid.com%{REQUEST_URI}') &&
                    !target.startsWith(`${base}/`) &&
                    !target.startsWith(`https://www.ag-grid.com${base}/`) &&
                    // Root-anchored negotiation is kept: its conditions can never match under the archive.
                    target !== '/index.md'
            );
            expect(outside).toEqual([]);
        });

        it('keeps every redirect that stays inside the archive', () => {
            const inArchive = original
                .split('\n')
                .filter((line) => /^\s*Redirect(Match)? /.test(line))
                .filter((line) => targetsIn(line).every((t) => t.startsWith(`${base}/`)));
            expect(inArchive.length).toBeGreaterThan(0);
            for (const line of inArchive) {
                expect(output).toContain(line);
            }
        });

        it('only removes lines it recognised, each with its reason', () => {
            for (const removed of result.removed) {
                expect(original.split('\n')[removed.line - 1].trim()).toBe(removed.text);
                expect(removed.reason).toBeTruthy();
            }
            // Charts and studio archives never carried a rule that leaves the archive.
            if (c.site !== 'grid') {
                expect(result.removed).toEqual([]);
            }
        });
    });

    describe('grid 36.x out-of-archive rules', () => {
        // Served, refused, or redirected - but only ever to somewhere inside the same archive.
        const expectInArchive = (outcome: ReturnType<typeof route>, version: string) => {
            if (outcome.type === 'redirect') {
                expect(outcome.location).toMatch(
                    new RegExp(`^https?://[^/]+/archive/${version.replace(/\./g, '\\.')}/`)
                );
            }
        };

        const grid = (version: string) => ({
            before: docroot('grid', `/archive/${version}`, fixture(`grid-${version}`)),
            after: docroot(
                'grid',
                `/archive/${version}`,
                migrate({ site: 'grid', version, page: '', markdown: false }).output!
            ),
        });

        it.each(['36.0.0', '36.0.1', '36.1.0', '36.2.0'])(
            '%s: the apex kept the archive path only after',
            (version) => {
                const { before, after } = grid(version);
                const url = `https://ag-grid.com/archive/${version}/react-data-grid/getting-started/`;
                expect(route(before, { url })).toEqual(
                    expect.objectContaining({ location: 'https://www.ag-grid.com/react-data-grid/getting-started/' })
                );
                expect(route(after, { url })).toEqual(
                    expect.objectContaining({
                        location: `https://www.ag-grid.com/archive/${version}/react-data-grid/getting-started/`,
                    })
                );
            }
        );

        it.each(['36.0.0', '36.0.1', '36.1.0', '36.2.0'])(
            '%s: index.php no longer redirects to the site root',
            (version) => {
                const { before, after } = grid(version);
                const url = `https://www.ag-grid.com/archive/${version}/index.php`;
                expect(route(before, { url })).toEqual(
                    expect.objectContaining({ type: 'redirect', location: 'https://www.ag-grid.com/' })
                );
                expect(route(after, { url })).toEqual(
                    expect.objectContaining({ type: 'serve', path: `/archive/${version}/index.php` })
                );
            }
        );

        it.each(['36.0.1', '36.1.0', '36.2.0'])(
            '%s: a single-hop rewrite no longer lands on the live site',
            (version) => {
                const { before, after } = grid(version);
                const url = `https://www.ag-grid.com/archive/${version}/javascript-grid/licensing/`;
                expect(route(before, { url })).toEqual(
                    expect.objectContaining({
                        location: 'https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/',
                    })
                );
                expectInArchive(route(after, { url }), version);
            }
        );

        it.each(['36.0.0', '36.0.1', '36.1.0', '36.2.0'])(
            '%s: a redirect to a live URL is gone, an in-archive one stays',
            (version) => {
                const { before, after } = grid(version);
                const original = fixture(`grid-${version}`);
                const [, liveFrom] = original.match(/^\s*Redirect 301 (\S+) https:\/\/\S+$/m)!;
                const [, inFrom, inTo] = original.match(/^\s*Redirect 301 (\S+) (\/archive\/\S+)$/m)!;
                expect(route(before, { url: `https://www.ag-grid.com${liveFrom}` }).type).toBe('redirect');
                expectInArchive(route(after, { url: `https://www.ag-grid.com${liveFrom}` }), version);
                expect(route(after, { url: `https://www.ag-grid.com${inFrom}` })).toEqual(
                    expect.objectContaining({ type: 'redirect', location: `https://www.ag-grid.com${inTo}` })
                );
            }
        );

        it('36.2.0: the blog host block no longer sends archive URLs to the live blog', () => {
            const { before, after } = grid('36.2.0');
            const url = 'https://blog.ag-grid.com/archive/36.2.0/feed/';
            expect(route(before, { url })).toEqual(
                expect.objectContaining({ location: 'https://www.ag-grid.com/blog/rss/' })
            );
            expect(route(after, { url })).toEqual(
                expect.objectContaining({ location: 'https://www.ag-grid.com/archive/36.2.0/feed/' })
            );
        });

        it('http on www upgrades to https keeping the archive path', () => {
            const { before, after } = grid('36.2.0');
            const url = 'http://www.ag-grid.com/archive/36.2.0/react-data-grid/getting-started/';
            expect(route(before, { url })).toEqual(
                expect.objectContaining({ location: 'https://www.ag-grid.com/react-data-grid/getting-started/' })
            );
            expect(route(after, { url })).toEqual(
                expect.objectContaining({
                    location: 'https://www.ag-grid.com/archive/36.2.0/react-data-grid/getting-started/',
                })
            );
        });

        it('removes the [S=n] host skip together with every rule it skipped', () => {
            const result = migrate({ site: 'grid', version: '36.2.0', page: '', markdown: false });
            expect(result.output).not.toMatch(/\[S=\d+\]/);
            expect(result.removed.filter((r) => r.reason === 'host skip over the single-hop rewrites')).toHaveLength(2);
        });
    });

    describe('an archive built by the archive-aware generator', () => {
        let archiveContent: string;

        beforeAll(async () => {
            vi.resetModules();
            vi.doMock('../../constants', async (importActual) => {
                const actual = await importActual<typeof Constants>();
                return { ...actual, SITE_BASE_URL: '/archive/36.3.0/' };
            });
            const archiveRules = await import('./htaccessRules');
            archiveContent = archiveRules.getHtaccessContent({ env: 'production' });
        });

        afterAll(() => {
            vi.doUnmock('../../constants');
            vi.resetModules();
        });

        it('is left exactly as it is', () => {
            const result = migrateArchiveHtaccess(archiveContent, { site: 'grid', base: '/archive/36.3.0' });
            expect(result.status).toBe('unchanged');
            expect(result.output).toBe(archiveContent);
        });

        it('canonicalises exactly the alias hosts the migration does', () => {
            const generated = new Set(
                [...archiveContent.matchAll(/^\s*RewriteCond %\{HTTP_HOST\} \^((?:[a-z0-9-]+\\\.)+[a-z]+)\$/gm)].map(
                    (m) => m[1].replace(/\\\./g, '.')
                )
            );
            expect([...generated].sort()).toEqual([...ALIAS_HOSTS].sort());
        });
    });

    describe('refuses, leaving the file alone', () => {
        const grid362 = fixture('grid-36.2.0');
        const refused = (source: string, base = '/archive/36.2.0') =>
            migrateArchiveHtaccess(source, { site: 'grid', base });

        it('a rewrite rule of no known shape', () => {
            const source = grid362.replace(
                '    RewriteEngine On\n',
                '    RewriteEngine On\n    RewriteRule ^old$ /new [R=302,L]\n'
            );
            const result = refused(source);
            expect(result.status).toBe('refused');
            expect(result.output).toBeNull();
            expect(result.reasons.join('\n')).toContain('RewriteRule ^old$ /new [R=302,L]');
        });

        it('a redirect of no known shape', () => {
            expect(refused(`${grid362}\nRedirectPermanent /archive/36.2.0/a /archive/36.2.0/b\n`).status).toBe(
                'refused'
            );
            expect(refused(`${grid362}\nRedirect 301 /elsewhere/a /archive/36.2.0/b\n`).status).toBe('refused');
        });

        // A redirect is only removed when it is exactly what a generator emitted: the status, the
        // quoting and an absolute target on a host the redirect lists have used. Anything else that
        // leaves the archive could be a hand-added rule, so the file is refused rather than losing it.
        it.each([
            [
                'a 302 RedirectMatch to an external host',
                String.raw`RedirectMatch 302 "^/archive/36\.2\.0/private/(.*)$" "https://example.com/login?return=$1"`,
            ],
            ['a 301 Redirect to a host no generator targets', 'Redirect 301 /archive/36.2.0/a https://example.com/b'],
            ['a 301 RedirectMatch to a host no generator targets', 'RedirectMatch 301 "^/a$" "https://example.com/b"'],
            ['a status no generator emits', 'Redirect 307 /archive/36.2.0/a https://www.ag-grid.com/b'],
            ['a 302 other than the partnership tracker', 'RedirectMatch 302 ^/other/$ https://www.ag-grid.com/'],
            ['the partnership tracker pointing elsewhere', 'RedirectMatch 302 ^/theo/$ https://example.com/'],
            ['a quoted Redirect', 'Redirect 301 "/archive/36.2.0/a" "https://www.ag-grid.com/b"'],
            ['an unquoted RedirectMatch 301', 'RedirectMatch 301 ^/a$ https://www.ag-grid.com/b'],
            ['a root-relative target outside the archive', 'RedirectMatch 301 "^/a$" "/elsewhere/"'],
            ['an http target', 'Redirect 301 /archive/36.2.0/a http://www.ag-grid.com/b'],
        ])('a redirect out of the archive of no generated shape: %s', (_, line) => {
            const result = refused(`${grid362}\n${line}\n`);
            expect(result.status).toBe('refused');
            expect(result.output).toBeNull();
            expect(result.reasons).toEqual([expect.stringContaining(line)]);
        });

        // The same for rewrite rules: a removable shape with a target on a host its generator never
        // used is not that shape.
        it.each([
            ['a single-hop rewrite', 'RewriteRule "^/?private/$" "https://example.com/login" [R=301,L]', ''],
            [
                'a blog host redirect',
                'RewriteRule ^/?private/?$ https://example.com/login [R=301,NC,L]',
                String.raw`RewriteCond %{HTTP_HOST} ^blog\.ag-grid\.com$ [NC]`,
            ],
            [
                'a blog host redirect over http',
                'RewriteRule ^/?private/?$ http://www.ag-grid.com/blog/ [R=301,NC,L]',
                String.raw`RewriteCond %{HTTP_HOST} ^blog\.ag-grid\.com$ [NC]`,
            ],
            [
                'a blog host catch-all',
                'RewriteRule ^/?(.*)$ https://example.com/$1 [R=301,NC,L]',
                String.raw`RewriteCond %{HTTP_HOST} ^blog\.ag-grid\.com$ [NC]`,
            ],
        ])('a rewrite rule out of the archive to a host no generator targets: %s', (_, rule, cond) => {
            const source = grid362.replace(
                '    RewriteEngine On\n',
                `    RewriteEngine On\n${cond ? `    ${cond}\n` : ''}    ${rule}\n`
            );
            const result = refused(source);
            expect(result.status).toBe('refused');
            expect(result.reasons).toEqual([expect.stringContaining(rule)]);
        });

        it('a redirect inside the archive with a status no generator emits', () => {
            const line = 'Redirect 302 /archive/36.2.0/a /archive/36.2.0/b';
            expect(refused(`${grid362}\n${line}\n`).reasons).toEqual([expect.stringContaining(line)]);
        });

        it('a rewrite directive no generator emits', () => {
            const source = grid362.replace(
                '    RewriteEngine On\n',
                '    RewriteEngine On\n    RewriteOptions Inherit\n'
            );
            expect(refused(source).status).toBe('refused');
        });

        it.each([1, -1])('a skip whose count is off by %i from the rules it was written for', (delta) => {
            expect(refused(grid362.replace(/\[S=(\d+)\]/, (_, n) => `[S=${Number(n) + delta}]`)).status).toBe(
                'refused'
            );
        });

        it('a file that names another archive version', () => {
            expect(refused(grid362, '/archive/36.1.0').reasons).toEqual([expect.stringContaining('36.2.0')]);
        });

        it('a file that is not a generated archive .htaccess', () => {
            expect(refused('RewriteEngine On\n').status).toBe('refused');
        });

        it('malformed markers', () => {
            expect(refused(`${grid362}\n${MIGRATION_BEGIN}\n`).status).toBe('refused');
        });

        it('an unknown site or a base that does not fit it', () => {
            expect(() => migrateArchiveHtaccess(grid362, { site: 'blog', base: '/archive/36.2.0' } as any)).toThrow();
            expect(() => migrateArchiveHtaccess(grid362, { site: 'charts', base: '/archive/36.2.0' })).toThrow();
        });
    });
});
