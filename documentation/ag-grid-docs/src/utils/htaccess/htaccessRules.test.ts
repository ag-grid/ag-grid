import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type * as Constants from '../../constants';
import { FRAMEWORKS } from '../../constants';
import {
    BRANCH_BUILDS_PATH_CONDITION,
    CAMPAIGNS_PATH_CONDITION,
    ECOMMERCE_PATH_CONDITION,
    EXAMPLES_PATH_CONDITION,
} from './cspRules';
import {
    IN_FLIGHT_BEGIN,
    IN_FLIGHT_END,
    PRODUCTION_CSP_PHASE,
    getBlogVhostHeaderFragment,
    getHtaccessContent,
    getInFlightArchiveRules,
} from './htaccessRules';
import type { CompiledHtaccess } from './htaccessSimulator';
import {
    compileHtaccess,
    followRedirects,
    requestHeaders,
    responseHeaders,
    route,
    samplePath,
} from './htaccessSimulator';
import { SITE_301_REDIRECTS, SITE_SINGLE_HOP_REWRITES } from './redirects';

describe('htaccessRules', () => {
    let productionContent: string;
    let stagingContent: string;

    beforeAll(() => {
        productionContent = getHtaccessContent({ env: 'production' });
        stagingContent = getHtaccessContent({ env: 'staging' });
    });

    // Full-output snapshots. These are the regression guard: any change to the generated rules
    // (additions, removals, reordering, or edits to existing redirects) shows up as a snapshot
    // diff in review. Update intentionally with `vitest -u` and eyeball the diff.
    describe('generated .htaccess snapshot', () => {
        it('production output is unchanged', () => {
            expect(productionContent).toMatchSnapshot();
        });

        it('staging output is unchanged', () => {
            expect(stagingContent).toMatchSnapshot();
        });
    });

    describe('Caching phase 1: content-addressed asset headers', () => {
        // Pulls the expr= regexes out of the GENERATED output rather than re-declaring them:
        // a copy would let the rule and its test drift apart.
        const getCacheRuleMatcher = (content: string) => {
            const line = content.split('\n').find((l) => l.includes('max-age=604800'));
            expect(line).toBeDefined();
            const patterns = [...line!.matchAll(/m#([^#]+)#/g)].map(([, re]) => new RegExp(re));
            expect(patterns).toHaveLength(2);
            return (uri: string) => patterns.some((re) => re.test(uri));
        };

        it('should set Cache-Control on production', () => {
            expect(productionContent).toContain('Header set Cache-Control');
            expect(productionContent).toContain('max-age=604800');
            expect(productionContent).toContain('s-maxage=31536000');
        });

        it('should NOT long-cache on staging, so testers never see a stale asset', () => {
            // Staging carries the no-cache document rule and no year-long asset cache. The
            // SE-189 root-static rule (max-age=86400 for /robots.txt and /favicon.ico only) is
            // a deliberate, bounded exception - see that describe block - so this checks for
            // the hashed-asset value specifically rather than any max-age.
            expect(stagingContent).not.toContain('max-age=604800');
        });

        it('should NOT use immutable, which would make a mistake unfixable for a year', () => {
            // Scoped to the Cache-Control line on purpose: the site has legitimate
            // /immutable-data/ redirect URLs, so a site-wide assertion is a false positive.
            const line = productionContent.split('\n').find((l) => l.includes('max-age=604800'));
            expect(line).toBeDefined();
            expect(line).not.toContain('immutable');
        });

        it('should have removed the inert mod_expires block', () => {
            // Never took effect (module not loaded, <IfModule> skips silently), and its
            // ExpiresDefault "access plus 1 year" would have fired if anyone enabled it.
            expect(productionContent).not.toContain('mod_expires');
            expect(productionContent).not.toContain('ExpiresActive');
            expect(productionContent).not.toContain('ExpiresDefault');
            expect(productionContent).not.toContain('ExpiresByType');
        });

        it('should not guard the rule with <IfModule>, so a missing module fails loudly', () => {
            const lines = productionContent.split('\n');
            const idx = lines.findIndex((l) => l.includes('max-age=604800'));
            const preceding = lines.slice(0, idx).join('\n');
            const openGuards = (preceding.match(/<IfModule/g) ?? []).length;
            const closeGuards = (preceding.match(/<\/IfModule>/g) ?? []).length;
            expect(openGuards).toBe(closeGuards);
        });

        describe('matches every content-hashed shape the build emits', () => {
            const hashed = [
                // name.HASH8.ext -- Vite's default, 126 of 128 live references
                '/_astro/design-system.BcXAtF3c.css',
                '/_astro/_pageName_.C5AIcGk_.css',
                '/_astro/_pageName_.astro_astro_type_script_index_0_lang.D12oPI3R.js',
                '/_astro/ag-grid-alpine-quartz-themes.tErC2lp7.png',
                // fonts/HASH16.ext -- whole basename is a 16-char hex hash
                '/_astro/fonts/2eb6e0e4fc33dd24.woff2',
                // archive assets live at /archive/<v>/_astro/, so the pattern must be unanchored
                '/archive/32.3.9/_astro/DocsExampleRunner.CiSTQ4_g.css',
                '/charts/archive/11.0.0/_astro/example-finance.bBLOPnBQ.css',
            ];

            hashed.forEach((uri) => {
                it(`caches ${uri}`, () => {
                    expect(getCacheRuleMatcher(productionContent)(uri)).toBe(true);
                });
            });
        });

        describe('does not match anything mutable', () => {
            // Everything here is a stable URL with mutable content. Caching any of it could
            // hide a fix from users and testers, which phase 1 must not be able to do.
            const mutable = [
                '/react-data-grid/column-moving/',
                '/archive/32.3.9/react-data-grid/getting-started/',
                '/documentation-archive',
                '/charts/documentation-archive/',
                '/sitemap-index.xml',
                '/llms.txt',
                '/robots.txt',
                '/images/logo.png',
                '/theme-icons/alpine.svg',
                '/example-assets/olympic-winners.json',
                '/example/foo.js',
                '/scripts/main.js',
                '/favicon.ico',
                // In _astro but NOT hash-shaped: matching on shape rather than directory is
                // what makes an unhashed file added to the build later fall through safely.
                '/_astro/unhashed-file.css',
                '/_astro/name.SHORT.css',
                '/_astro/name.TOOLONGHASH9.css',
                '/_astro/fonts/notahexhash1234.woff2',
            ];

            mutable.forEach((uri) => {
                it(`does not cache ${uri}`, () => {
                    expect(getCacheRuleMatcher(productionContent)(uri)).toBe(false);
                });
            });
        });
    });

    describe('Caching phase 2: Vary: User-Agent removed', () => {
        it('should not send Vary: User-Agent, which forks a shared cache per UA string', () => {
            // It was appended inside the mod_deflate block alongside BrowserMatch workarounds for
            // Netscape 4 and IE6. Harmless to browsers (a given browser's UA is constant) but it
            // would hold the CloudFront hit rate near zero, so it has to go before edge caching.
            expect(productionContent).not.toMatch(/Vary\s+User-Agent/);
            expect(stagingContent).not.toMatch(/Vary\s+User-Agent/);
        });

        it('should not carry the obsolete BrowserMatch gzip workarounds', () => {
            expect(productionContent).not.toContain('BrowserMatch');
        });

        it('should keep Vary: Accept, which is a different mechanism (SE-80 markdown negotiation)', () => {
            expect(productionContent).toContain('Header append Vary Accept');
        });

        it('should keep compressing the same content types', () => {
            // Removing BrowserMatch must not disturb the DEFLATE filter list.
            ['text/html', 'text/css', 'text/javascript', 'application/json', 'image/svg+xml'].forEach((type) => {
                expect(productionContent).toContain(`AddOutputFilterByType DEFLATE ${type}`);
            });
        });
    });

    describe('Caching phase 2: no heuristic caching of current pages', () => {
        // With Last-Modified but no Cache-Control, browsers invent a freshness lifetime of
        // ~10% of the document's age, growing without bound since the last deploy. That is the
        // stale-page-until-hard-refresh behaviour. no-cache removes it.
        const getNoCacheRule = (content: string) => {
            const line = content.split('\n').find((l) => l.includes('"no-cache"'));
            expect(line).toBeDefined();
            return line!;
        };

        it('should set no-cache on current pages, in both envs', () => {
            [productionContent, stagingContent].forEach((content) => {
                expect(getNoCacheRule(content)).toContain('Cache-Control "no-cache"');
            });
        });

        it('should scope it to HTML documents and their markdown variants, not assets', () => {
            [productionContent, stagingContent].forEach((content) => {
                const [, source] = getNoCacheRule(content).match(/%\{CONTENT_TYPE\} =~ m#([^#]+)#/)!;
                const contentType = new RegExp(source);
                expect(contentType.test('text/html; charset=utf-8')).toBe(true);
                // A live page's markdown variant changes with the page, so it must revalidate too -
                // whether fetched as /<page>.md or negotiated at the page URL.
                expect(contentType.test('text/markdown; charset=utf-8')).toBe(true);
                expect(contentType.test('text/css')).toBe(false);
                expect(contentType.test('application/javascript')).toBe(false);
                expect(contentType.test('text/plain')).toBe(false);
            });
        });

        it('should exclude archived versions, which are immutable', () => {
            const rule = getNoCacheRule(productionContent);
            expect(rule).toContain('!(');
            expect(rule).toContain('archive/[0-9]');
        });

        it('should leave archived markdown to the archive long cache', () => {
            // The exclusion is on the path, so an archive's .md keeps archiveCacheRules' long cache.
            const [, source] = getNoCacheRule(productionContent).match(/REQUEST_URI\} =~ m#([^#]+)#/)!;
            expect(new RegExp(source).test('/archive/36.2.0/react-data-grid/getting-started.md')).toBe(true);
            expect(new RegExp(source).test('/react-data-grid/getting-started.md')).toBe(false);
        });

        it('revalidates a live page and its markdown twin, whether fetched as .md or negotiated', () => {
            for (const content of [productionContent, stagingContent]) {
                const files = [compileHtaccess(content)];
                for (const [uri, contentType] of [
                    ['/react-data-grid/getting-started/index.html', 'text/html; charset=utf-8'],
                    ['/react-data-grid/getting-started.md', 'text/markdown; charset=utf-8'],
                    ['/index.md', 'text/markdown; charset=utf-8'],
                ]) {
                    const headers = responseHeaders(files, { uri, status: 200, contentType });
                    expect(headers.get('cache-control'), uri).toEqual(['no-cache']);
                    expect(headers.has('x-robots-tag'), uri).toBe(false);
                }
            }
        });

        it('should use no-cache rather than no-store, to keep back/forward navigation', () => {
            expect(productionContent).not.toContain('no-store');
        });

        it('should not override the hashed-asset long cache', () => {
            // The two rules have disjoint conditions (text/html vs a hashed filename), but the
            // asset rule is emitted after the document rule so it wins on any future overlap.
            const lines = productionContent.split('\n');
            const noCacheAt = lines.findIndex((l) => l.includes('"no-cache"'));
            const assetAt = lines.findIndex((l) => l.includes('max-age=604800'));
            expect(noCacheAt).toBeGreaterThan(-1);
            expect(assetAt).toBeGreaterThan(noCacheAt);
        });
    });

    describe('In-flight release archives', () => {
        // Grid and Charts ship together at independent version numbers (Grid 36.x, Charts 14.x)
        // and are tested in the same window, so both must be named. Studio is never cached.
        const inFlight = (grid: string | null, charts: string | null) =>
            getHtaccessContent({ env: 'production', uncachedGridArchive: grid, uncachedChartsArchive: charts });

        it('emits the marker block but no rules when nothing is in flight', () => {
            // The markers are always present so the deployed root .htaccess can be patched in
            // place between them; only the rules inside come and go.
            const empty = getInFlightArchiveRules(null, null);
            expect(empty).toContain(IN_FLIGHT_BEGIN);
            expect(empty).toContain(IN_FLIGHT_END);
            expect(empty).not.toContain('Cache-Control');
        });

        it('agrees with the patch script, which edits a built file rather than importing this', () => {
            // The script carries its own copies of the markers and the rule text, because it
            // runs against a .htaccess already on the web box. Patching a generated file must
            // therefore land exactly what generating it with those versions would have.
            const file = join(mkdtempSync(join(tmpdir(), 'htaccess-')), '.htaccess');
            writeFileSync(file, inFlight(null, null));
            execFileSync(
                'node',
                [
                    fileURLToPath(new URL('../../../../../scripts/uncached-archives.mjs', import.meta.url)),
                    file,
                    'set',
                    '36.2.0',
                    '14.3.0',
                ],
                { encoding: 'utf8' }
            );
            expect(readFileSync(file, 'utf8')).toBe(inFlight('36.2.0', '14.3.0'));
        });

        it('keeps the markers when rules are present, so the block stays patchable', () => {
            const rule = getInFlightArchiveRules('36.2.0', '14.3.0');
            expect(rule.indexOf(IN_FLIGHT_BEGIN)).toBeLessThan(rule.indexOf('archive/36'));
            expect(rule.indexOf(IN_FLIGHT_END)).toBeGreaterThan(rule.indexOf('charts/archive/14'));
        });

        it('a build never puts an archive in flight - the live file owns that state', () => {
            // Nothing in source can populate the block: the versions only reach the generator
            // through the test-only overrides, so a production deploy always resets it.
            [productionContent, stagingContent].forEach((content) => {
                expect(content).toContain(IN_FLIGHT_BEGIN);
                expect(content).not.toContain('Release archives under test');
                expect(content).not.toContain('m#^/archive/3');
                expect(content).not.toContain('m#^/charts/archive/1');
            });
        });

        it('matches grid and charts at their own version numbers', () => {
            const rule = getInFlightArchiveRules('36.2.0', '14.3.0');
            expect(rule).toContain('m#^/archive/36\\.2\\.0/#');
            expect(rule).toContain('m#^/charts/archive/14\\.3\\.0/#');
        });

        it('does not apply the grid version to the charts archive', () => {
            // The bug this replaced: one version behind an optional (charts/)? prefix, so a grid
            // version silently claimed to cover a charts archive that is numbered differently.
            const rule = getInFlightArchiveRules('36.2.0', '14.3.0');
            expect(rule).not.toContain('charts/archive/36\\.2\\.0');
            expect(rule).not.toContain('(charts/|studio/)?');
        });

        it('emits only the product that is in flight', () => {
            expect(getInFlightArchiveRules('36.2.0', null)).not.toContain('charts/archive');
            expect(getInFlightArchiveRules(null, '14.3.0')).not.toContain('m#^/archive/');
        });

        it('escapes dots so versions match literally', () => {
            expect(getInFlightArchiveRules('36.2.0', null)).not.toContain('archive/36.2.0/#');
        });

        it('uses no-cache, not no-store, so revalidation is a cheap 304', () => {
            expect(getInFlightArchiveRules('36.2.0', '14.3.0')).not.toContain('no-store');
        });

        it('is emitted after the hashed-asset rule, so it wins for in-flight assets', () => {
            const lines = inFlight('36.2.0', '14.3.0').split('\n');
            const assetAt = lines.findIndex((l) => l.includes('max-age=604800'));
            const gridAt = lines.findIndex((l) => l.includes('^/archive/36\\.2\\.0/#'));
            const chartsAt = lines.findIndex((l) => l.includes('^/charts/archive/14\\.3\\.0/#'));
            expect(assetAt).toBeGreaterThan(-1);
            expect(gridAt).toBeGreaterThan(assetAt);
            expect(chartsAt).toBeGreaterThan(assetAt);
        });

        it('applies to staging too, where release testing happens', () => {
            const staging = getHtaccessContent({
                env: 'staging',
                uncachedGridArchive: '36.2.0',
                uncachedChartsArchive: '14.3.0',
            });
            expect(staging).toContain('^/archive/36\\.2\\.0/#');
            expect(staging).toContain('^/charts/archive/14\\.3\\.0/#');
        });
    });

    describe('Redirects are never cached', () => {
        // A shared cache keying a redirect on the path alone would replay the first visitor's query
        // string (carried into Location) to everyone after, so every redirect must be no-cache.
        const getRedirectRules = (content: string) =>
            content.split('\n').filter((l) => l.startsWith('Header always set Cache-Control'));

        // Evaluates the rule's REQUEST_STATUS comparisons the way ap_expr does.
        const appliesToStatus = (rule: string, status: number) =>
            [...rule.matchAll(/%\{REQUEST_STATUS\} -(ge|lt|ne) (\d+)/g)].every(([, op, value]) => {
                const n = Number(value);
                return op === 'ge' ? status >= n : op === 'lt' ? status < n : status !== n;
            });

        it('sets no-cache on every redirect status, in both envs', () => {
            [productionContent, stagingContent].forEach((content) => {
                const rules = getRedirectRules(content);
                // The only 'always' Cache-Control rule, so nothing else can override it on a redirect.
                expect(rules).toHaveLength(1);
                expect(rules[0]).toContain('Cache-Control "no-cache"');
                for (const status of [301, 302, 303, 307, 308]) {
                    expect(appliesToStatus(rules[0], status)).toBe(true);
                }
            });
        });

        it('never touches a 200, an error, or a 304', () => {
            // A 304 refreshes the headers of the copy a cache already holds, so no-cache there would
            // wipe out the long cache of every revalidated asset and released archive page.
            const [rule] = getRedirectRules(productionContent);
            for (const status of [200, 204, 304, 404, 410, 500]) {
                expect(appliesToStatus(rule, status)).toBe(false);
            }
        });

        it("uses 'always', the only header table Apache sends on a redirect", () => {
            // The ordinary (onsuccess) table is dropped on non-2xx responses, which is also why no
            // later onsuccess Cache-Control rule - an archive's own included - can override this one.
            expect(getRedirectRules(productionContent)[0]).toMatch(/^Header always set /);
        });
    });

    describe('Compressed responses revalidate', () => {
        // The ETag Apache computes for the file, and the one mod_deflate sends with the gzip body.
        const ETAG = '"8aea4-65cb43860ca80"';
        const GZIP_ETAG = '"8aea4-65cb43860ca80-gzip"';
        const PAGE = '/react-data-grid/getting-started/index.html';

        const ifNoneMatchSeen = (content: string, ifNoneMatch: string, uri = PAGE) =>
            requestHeaders([compileHtaccess(content)], { uri, headers: { 'If-None-Match': ifNoneMatch } }).get(
                'if-none-match'
            );

        it('hands the handler the unsuffixed ETag a compressed page was revalidated with, in both envs', () => {
            for (const content of [productionContent, stagingContent]) {
                expect(ifNoneMatchSeen(content, GZIP_ETAG)).toEqual([ETAG]);
                expect(ifNoneMatchSeen(content, GZIP_ETAG, '/_astro/DocsExampleRunner.CiSTQ4_g.css')).toEqual([ETAG]);
            }
        });

        it('is the only request-header rule, in both envs', () => {
            for (const content of [productionContent, stagingContent]) {
                expect(compileHtaccess(content).requestHeaders).toHaveLength(1);
            }
        });

        it('strips every suffix in a list of ETags, weak ones included', () => {
            expect(ifNoneMatchSeen(productionContent, `W/${GZIP_ETAG}`)).toEqual([`W/${ETAG}`]);
            expect(ifNoneMatchSeen(productionContent, `"a-1-gzip", W/${GZIP_ETAG},"c-3"`)).toEqual([
                `"a-1", W/${ETAG},"c-3"`,
            ]);
        });

        it('leaves uncompressed, brotli and wildcard validators alone', () => {
            for (const value of [ETAG, '"8aea4-65cb43860ca80-br"', '*']) {
                expect(ifNoneMatchSeen(productionContent, value)).toEqual([value]);
            }
        });

        it('is not guarded by <IfModule>, so it cannot silently stop applying', () => {
            const lines = productionContent.split('\n');
            const index = lines.findIndex((l) => l.startsWith('RequestHeader edit* If-None-Match '));
            const opened = lines.slice(0, index).filter((l) => l.startsWith('<IfModule')).length;
            const closed = lines.slice(0, index).filter((l) => l.startsWith('</IfModule>')).length;
            expect(opened).toBe(closed);
        });
    });

    describe('Redirects are never cached, end to end', () => {
        const WWW = 'https://www.ag-grid.com';
        // Every kind of redirect the root file issues: scheme upgrade, host swap, add-slash, a
        // single-hop rewrite, a mod_alias redirect, the sitemap alias and the blog host move.
        const REDIRECTS = [
            'http://www.ag-grid.com/react-data-grid/getting-started/?x=1',
            'https://ag-grid.com/react-data-grid/getting-started/',
            'http://ag-grid.com/',
            'https://angulargrid.com/license-pricing/',
            `${WWW}/react-data-grid/getting-started?x=1`,
            `${WWW}/react-data-grid/whats-new`,
            `${WWW}/javascript-grid-virtual-paging/`,
            `${WWW}/sitemap.xml`,
            'https://blog.ag-grid.com/some-post/',
        ];
        const redirectHeaders = (content: string, url: string) => {
            const files = [compileHtaccess(content)];
            const outcome = route(files, { url });
            expect(outcome.type, url).toBe('redirect');
            const status = (outcome as { status: number }).status;
            return responseHeaders(files, { uri: new URL(url).pathname, status, contentType: 'text/html' });
        };

        it.each(REDIRECTS)('%s is sent with Cache-Control: no-cache', (url) => {
            expect(redirectHeaders(productionContent, url).get('cache-control')).toEqual(['no-cache']);
        });

        it('covers the redirects staging gets from Apache itself, such as the mod_dir add-slash', () => {
            // Staging carries no redirect rules of its own, but the always-table rule still reaches
            // any redirect Apache issues there.
            const files = [compileHtaccess(stagingContent)];
            for (const status of [301, 302, 307, 308]) {
                const headers = responseHeaders(files, { uri: '/react-data-grid/getting-started', status });
                expect(headers.get('cache-control'), String(status)).toEqual(['no-cache']);
            }
        });

        it('leaves a 304 to the long cache of the copy it revalidates', () => {
            // A 304 refreshes the stored headers, so a no-cache there would undo the long cache. Apache
            // sends the normal header table with a static-file 304 (verified on 2.4.52), and the
            // redirect rule adds nothing to it.
            const files = [compileHtaccess(productionContent)];
            const uri = '/_astro/DocsExampleRunner.CiSTQ4_g.css';
            expect(responseHeaders(files, { uri, status: 304, contentType: 'text/css' }).get('cache-control')).toEqual(
                responseHeaders(files, { uri, status: 200, contentType: 'text/css' }).get('cache-control')
            );
        });
    });

    describe('Archived markdown variants are noindexed', () => {
        const getNoindexRules = (content: string) => content.split('\n').filter((l) => l.includes('X-Robots-Tag'));

        it('sets X-Robots-Tag: noindex on archived markdown only', () => {
            const rules = getNoindexRules(productionContent);
            expect(rules).toHaveLength(1);
            expect(rules[0]).toMatch(/^Header set X-Robots-Tag "noindex" /);
            const [, contentType] = rules[0].match(/%\{CONTENT_TYPE\} =~ m#([^#]+)#/)!;
            const [, path] = rules[0].match(/%\{REQUEST_URI\} =~ m#([^#]+)#/)!;
            // Matched on content type, so the variant negotiated at the page's own URL is covered.
            expect(new RegExp(contentType).test('text/markdown; charset=utf-8')).toBe(true);
            // Archived HTML is already noindexed by its robots meta tag.
            expect(new RegExp(contentType).test('text/html; charset=utf-8')).toBe(false);
            for (const archived of [
                '/archive/36.2.0/react-data-grid/getting-started.md',
                '/archive/36.2.0/react-data-grid/getting-started/',
                '/charts/archive/11.0.4/react/line-series.md',
                '/studio/archive/1.0.0/index.md',
            ]) {
                expect(new RegExp(path).test(archived)).toBe(true);
            }
            for (const live of ['/react-data-grid/getting-started.md', '/documentation-archive.md', '/index.md']) {
                expect(new RegExp(path).test(live)).toBe(false);
            }
        });
    });

    // Both are root-owned: an archive's own .htaccess is applied after the root's, so a copy there
    // would only duplicate the root's rule (and must not carry anything that undoes it).
    describe('archive builds leave the redirect no-cache and markdown noindex to the root', () => {
        let archiveContent: string;

        beforeAll(async () => {
            vi.resetModules();
            vi.doMock('../../constants', async (importActual) => {
                const actual = await importActual<typeof Constants>();
                return { ...actual, SITE_BASE_URL: '/archive/36.2.0/' };
            });
            const archiveRules = await import('./htaccessRules');
            archiveContent = archiveRules.getHtaccessContent({ env: 'production' });
        });

        afterAll(() => {
            vi.doUnmock('../../constants');
            vi.resetModules();
        });

        it('emits neither rule, nor anything touching X-Robots-Tag or the always-sent Cache-Control', () => {
            expect(archiveContent).not.toContain('X-Robots-Tag');
            expect(archiveContent).not.toContain('Header always set Cache-Control');
            expect(archiveContent).not.toContain('REQUEST_STATUS} -ge 300');
        });

        it('leaves the If-None-Match suffix strip to the root, which mod_headers merges into archives', () => {
            const uri = '/archive/36.2.0/react-data-grid/getting-started/index.html';
            const headers = { 'If-None-Match': '"8aea4-65cb43860ca80-gzip"' };
            const archiveFile = compileHtaccess(archiveContent, '/archive/36.2.0/');
            expect(archiveFile.requestHeaders).toEqual([]);
            expect(
                requestHeaders([compileHtaccess(productionContent), archiveFile], { uri, headers }).get('if-none-match')
            ).toEqual(['"8aea4-65cb43860ca80"']);
        });
    });

    describe('Archived Studio versions are never cached', () => {
        it('does not apply to the live Studio site, which caches normally', () => {
            // The rule is anchored to /studio/archive/ - /studio/ itself must keep the normal
            // document rule and the long hashed-asset cache.
            const line = productionContent.split('\n').find((l) => l.includes('m#^/studio/archive/#'));
            expect(line).toContain('m#^/studio/archive/#');
        });

        it('blanket no-cache for /studio/archive/, in both envs', () => {
            [productionContent, stagingContent].forEach((content) => {
                expect(content).toContain('m#^/studio/archive/#');
            });
        });

        it('is emitted after the hashed-asset rule, so it covers studio assets too', () => {
            const lines = productionContent.split('\n');
            const assetAt = lines.findIndex((l) => l.includes('max-age=604800'));
            const studioAt = lines.findIndex((l) => l.includes('m#^/studio/archive/#'));
            expect(assetAt).toBeGreaterThan(-1);
            expect(studioAt).toBeGreaterThan(assetAt);
        });

        it('is not carved out of the document no-cache rule', () => {
            // Released grid/charts archives keep their heuristic window; studio must not.
            const doc = productionContent.split('\n').find((l) => l.includes('CONTENT_TYPE'));
            expect(doc).toContain('^/(charts/)?archive/[0-9]');
            expect(doc).not.toContain('studio');
        });
    });

    describe('Released archive versions get cached, not just excluded from no-cache', () => {
        // documentNoCacheRules excludes archive/[0-9] from forced no-cache, but that alone
        // produces no Cache-Control header at all - confirmed live 2026-09-23, every request to
        // a released archive page hit origin, including a 30k-request Sitebulb crawl of
        // /charts/archive/11.0.4/. This rule is what actually fills that gap.
        const line = () => productionContent.split('\n').find((l) => l.includes('^/(charts/)?archive/[0-9]#"'));

        it('caches with the long, hashed-asset-class TTL, not the moderate unhashed one', () => {
            const l = line();
            expect(l).toContain('max-age=604800, s-maxage=31536000');
        });

        it('is production-only, like every other asset-caching rule', () => {
            expect(stagingContent).not.toContain('archive/[0-9]#"');
        });

        // An archive's own .htaccess is applied after the root one, so if it carried this rule
        // it would override the root's in-flight no-cache for a release candidate under test.
        describe('is left out of archive builds, so the root in-flight no-cache still wins', () => {
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

            it('emits no archive cache rule', () => {
                expect(archiveContent).not.toContain('^/(charts/)?archive/[0-9]#"');
            });

            it('emits none of the unhashed asset cache rules either', () => {
                // Images, example-assets, theme icons, videos and /scripts/*.js are unhashed, so
                // each of these would also override the root's in-flight no-cache.
                expect(archiveContent).not.toContain('/(images|example-assets|example|theme-icons|videos)/');
                expect(archiveContent).not.toContain('m#/scripts/[^/]+');
            });

            it('keeps only cache rules that cannot match an archived release candidate', () => {
                const cachingLines = archiveContent
                    .split('\n')
                    .filter((l) => l.startsWith('Header set Cache-Control') && l.includes('public'));
                // The content-hashed asset rule (a changed hash is a new URL, so it can never be
                // stale) and the root-anchored robots.txt/favicon.ico rule (never under /archive/).
                expect(cachingLines).toHaveLength(2);
                expect(cachingLines.find((l) => l.includes('/_astro/'))).toBeDefined();
                expect(cachingLines.find((l) => l.includes('m#^/(robots'))).toBeDefined();
            });
        });

        it('matches a real released grid and charts archive page, any content type', () => {
            const [, source] = line()!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/archive/32.3.9/react-data-grid/getting-started/')).toBe(true);
            expect(pattern.test('/charts/archive/11.0.4/angular/radial-gauge/examples/labels/')).toBe(true);
            // No extension allowlist, unlike every other unhashed-asset rule - a released
            // archive's raw example source and dist bundles are just as frozen as its HTML.
            expect(pattern.test('/charts/archive/11.0.4/angular/radial-gauge/examples/labels/main.ts')).toBe(true);
            expect(pattern.test('/charts/archive/11.0.4/dev/ag-charts-enterprise/dist/package/main.cjs.js')).toBe(true);
        });

        it('does not match the archive listing pages, only a real numbered version', () => {
            const [, source] = line()!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/documentation-archive')).toBe(false);
            expect(pattern.test('/charts/documentation-archive/')).toBe(false);
        });

        it('never matches /studio/archive/, which stays no-cache always', () => {
            const [, source] = line()!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/studio/archive/3.0.0/react/getting-started/')).toBe(false);
        });

        it('is emitted before studioArchiveNoCacheRules, though the paths never overlap anyway', () => {
            const lines = productionContent.split('\n');
            const archiveAt = lines.findIndex((l) => l.includes('archive/[0-9]#"'));
            const studioAt = lines.findIndex((l) => l.includes('m#^/studio/archive/#'));
            expect(archiveAt).toBeGreaterThan(-1);
            expect(studioAt).toBeGreaterThan(archiveAt);
        });

        it('is overridden back to no-cache for a version still listed as in-flight', () => {
            // getInFlightArchiveRules is emitted last, so its no-cache for a specific version
            // wins over this rule's general cache header - the mechanism that lets a version
            // stay uncached during release-candidate testing and only get cached once removed
            // from that list.
            const content = getHtaccessContent({
                env: 'production',
                uncachedGridArchive: '36.2.0',
                uncachedChartsArchive: '14.3.0',
            });
            const lines = content.split('\n');
            const archiveAt = lines.findIndex((l) => l.includes('archive/[0-9]#"'));
            const inFlightGridAt = lines.findIndex((l) => l.includes('m#^/archive/36\\.2\\.0/#'));
            const inFlightChartsAt = lines.findIndex((l) => l.includes('m#^/charts/archive/14\\.3\\.0/#'));
            expect(archiveAt).toBeGreaterThan(-1);
            expect(inFlightGridAt).toBeGreaterThan(archiveAt);
            expect(inFlightChartsAt).toBeGreaterThan(archiveAt);
        });

        it('a version removed from the in-flight list falls through to this rule - the promised flip', () => {
            const rule = getInFlightArchiveRules(null, null);
            expect(rule).not.toContain('Cache-Control');
            // With nothing in flight, every released archive is governed solely by this rule.
            const [, source] = line()!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/archive/36.2.0/react-data-grid/getting-started/')).toBe(true);
        });
    });

    describe('SE-189: /robots.txt and /favicon.ico get a sensible cache lifetime', () => {
        // Pulls the expr= regex out of the GENERATED output rather than re-declaring it: a
        // copy would let the rule and its test drift apart.
        const getRootStaticCacheRule = (content: string) => {
            const line = content.split('\n').find((l) => l.includes('robots\\.txt|favicon\\.ico'));
            expect(line).toBeDefined();
            return line!;
        };

        it('should set a moderate Cache-Control on /robots.txt and /favicon.ico, in both envs', () => {
            [productionContent, stagingContent].forEach((content) => {
                const rule = getRootStaticCacheRule(content);
                expect(rule).toContain('Cache-Control "public, max-age=86400"');
            });
        });

        it('should NOT use the year-long immutable lifetime given to hashed assets', () => {
            // Neither /robots.txt nor /favicon.ico is content-addressed, so a real change
            // must be able to land same-day rather than waiting out a year-long cache.
            const rule = getRootStaticCacheRule(productionContent);
            expect(rule).not.toContain('604800');
            expect(rule).not.toContain('31536000');
            expect(rule).not.toContain('immutable');
        });

        it('should NOT use no-cache, which would defeat the point of caching them at all', () => {
            expect(getRootStaticCacheRule(productionContent)).not.toContain('no-cache');
        });

        it('should match /robots.txt and /favicon.ico only, not any other root file', () => {
            const rule = getRootStaticCacheRule(productionContent);
            const pattern = new RegExp(rule.match(/m#([^#]+)#/)![1]);
            expect(pattern.test('/robots.txt')).toBe(true);
            expect(pattern.test('/favicon.ico')).toBe(true);
            expect(pattern.test('/sitemap-index.xml')).toBe(false);
            expect(pattern.test('/llms.txt')).toBe(false);
            expect(pattern.test('/some/robots.txt')).toBe(false);
        });
    });

    describe('Images and example-assets get a moderate max-age', () => {
        it('applies a 24h max-age, not the year-long hashed-asset TTL', () => {
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            expect(line).toContain('max-age=86400');
            expect(line).not.toContain('max-age=604800');
        });

        it('matches nested product paths too, e.g. /charts/images/ or /studio/example-assets/', () => {
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            expect(line).not.toContain('^/(images|example-assets)/');
        });

        it('is production-only, unlike the document no-cache rule', () => {
            expect(stagingContent).not.toContain('images|example-assets');
        });

        it('also matches /example/, not just /example-assets/', () => {
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            const [, source] = line!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/example/finance.png')).toBe(true);
            expect(pattern.test('/example-assets/olympic-winners.json')).toBe(true);
        });

        it('does NOT match the /example/ demo page itself, only asset files beneath it', () => {
            // staticAssetCacheRules is emitted after documentNoCacheRules, so an unanchored
            // match on the directory name alone would win and override the live demo page's
            // no-cache with a day-long public cache - see src/pages/example.astro.
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            const [, source] = line!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/example/')).toBe(false);
            expect(pattern.test('/example/index.html')).toBe(false);
            expect(pattern.test('/example-assets/')).toBe(false);
            expect(pattern.test('/images/')).toBe(false);
        });

        it('matches assets nested in subdirectories, e.g. example-assets/space-company-logos/ or images/ag-logos/png-logos/', () => {
            // Real paths in public/ - an earlier version of this rule anchored the filename
            // segment with "[^/]+" (no subdirectory allowed), which silently broke exactly
            // these: 334 of the 364 files under public/images/ live nested, not at the top level.
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            const [, source] = line!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/example-assets/space-company-logos/nasa.png')).toBe(true);
            expect(pattern.test('/images/ag-logos/png-logos/react.png')).toBe(true);
        });

        it('covers the non-image extensions actually used under these paths (xlsx, mp4, webm)', () => {
            // Real files: public/example-assets/*.xlsx, public/images/**/*.mp4 and *.webm. The
            // original png/jpg/gif/svg/webp/ico/json list didn't include these.
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            const [, source] = line!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/example-assets/olympic-data.xlsx')).toBe(true);
            expect(pattern.test('/images/about/carousel/intro.mp4')).toBe(true);
            expect(pattern.test('/images/about/carousel/intro.webm')).toBe(true);
        });

        it('also matches /theme-icons/, including the per-theme zip bundle', () => {
            // public/theme-icons/<theme>/<icon>.svg plus a public/theme-icons/<theme>/<theme>-icons.zip
            // bundle per theme - same asset class (unhashed, build-time static) as images/example-assets,
            // so it shares this rule. The "does not match anything mutable" hashed-asset test elsewhere
            // in this file already confirms /theme-icons/alpine.svg isn't hash-shaped; this confirms it's
            // covered by *this* rule instead, not left uncached altogether.
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            const [, source] = line!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/theme-icons/material/filter.svg')).toBe(true);
            expect(pattern.test('/theme-icons/quartz/quartz-icons.zip')).toBe(true);
        });

        it('does NOT match a bare /theme-icons/ directory request, only files beneath it', () => {
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            const [, source] = line!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/theme-icons/')).toBe(false);
            expect(pattern.test('/theme-icons/material/')).toBe(false);
        });

        it('also matches /videos/, on both the grid root (json/png) and product subtrees (mp4/webm)', () => {
            // public/videos/*.json and *.png live directly under grid root; /studio/videos/*.mp4
            // and *.webm are the nested-.htaccess-cascade case this rule intentionally reaches -
            // see the "cascades into /charts/ or /studio/" test below for why that's expected.
            const line = productionContent.split('\n').find((l) => l.includes('images|example-assets'));
            const [, source] = line!.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/videos/getting-started.json')).toBe(true);
            expect(pattern.test('/studio/videos/drag-drop.webm')).toBe(true);
            expect(pattern.test('/studio/videos/drag-drop.mp4')).toBe(true);
        });
    });

    describe('Static script bundles under /scripts/ get a moderate max-age', () => {
        const getScriptCacheRule = () => {
            const line = productionContent.split('\n').find((l) => l.includes('/scripts/[^/]'));
            expect(line).toBeDefined();
            return line!;
        };

        it('applies a 24h max-age, not the year-long hashed-asset TTL', () => {
            const line = getScriptCacheRule();
            expect(line).toContain('max-age=86400');
            expect(line).not.toContain('max-age=604800');
        });

        it('is anchored to .js, so it can never match a directory or a non-script file', () => {
            const line = getScriptCacheRule();
            const [, source] = line.match(/m#([^#]+)#/)!;
            const pattern = new RegExp(source);
            expect(pattern.test('/scripts/gtm-init.js')).toBe(true);
            expect(pattern.test('/scripts/persist-cookie-consent.js')).toBe(true);
            expect(pattern.test('/scripts/')).toBe(false);
            expect(pattern.test('/scripts/gtm-init.js.map')).toBe(false);
        });

        it('is production-only, unlike the document no-cache rule', () => {
            expect(stagingContent).not.toContain('/scripts/[^/]');
        });
    });

    // The old per-framework charts URLs moved to the charts site. mod_alias is first-match, so the
    // /documentation/<framework>/charts* rules once sat behind the broad /documentation/<framework>/
    // prefix and never ran; requesting the URLs, not finding the rules, is what proves they work.
    describe('AG-17152: legacy charts overview URLs reach the charts quick start in one hop', () => {
        const cases = FRAMEWORKS.flatMap((framework) => [
            [`/${framework}-charts/`, framework],
            [`/${framework}-charts/overview/`, framework],
            [`/documentation/${framework}/charts/`, framework],
            [`/documentation/${framework}/charts-overview/`, framework],
        ]);

        it.each(cases)('%s', (path, framework) => {
            const files = [compileHtaccess(productionContent)];
            expect(route(files, { url: `https://www.ag-grid.com${path}` })).toMatchObject({
                type: 'redirect',
                status: 301,
                location: `https://www.ag-grid.com/charts/${framework}/quick-start/`,
            });
        });
    });

    describe('htaccess quality: redundant directives', () => {
        it('should have only one RewriteEngine On directive', () => {
            const matches = productionContent.match(/RewriteEngine On/g);
            expect(matches).not.toBeNull();
            expect(matches!.length).toBe(1);
        });
    });

    describe('production vs staging', () => {
        it('should include the redirect/canonicalization rewrites in production only', () => {
            // Both envs carry a small mod_rewrite block for SE-80 markdown negotiation,
            // but the host/https redirect rules are production-only.
            expect(productionContent).toContain('RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]');
            expect(stagingContent).not.toContain('https://www.ag-grid.com/$1 [R=301,L]');
        });

        it('should include the asset cache header in production only', () => {
            // Replaces an assertion that the (inert, now removed) mod_expires block was
            // present. Staging gets no long-lived asset cache so testers never hit a stale
            // asset (the SE-189 root-static exception aside - see that describe block).
            expect(productionContent).toContain('max-age=604800');
            expect(stagingContent).not.toContain('max-age=604800');
        });

        it('should include CORS headers in production only', () => {
            expect(productionContent).toContain('Access-Control-Allow-Origin');
            expect(stagingContent).not.toContain('Access-Control-Allow-Origin');
        });

        it("should use 'Header set' for CORS so the vhost value is replaced, not appended (RTI-3400)", () => {
            // 'Header add' appends, producing a duplicate Access-Control-Allow-Origin
            // header ('*, *') that browsers reject. 'set' replaces any inherited value.
            expect(productionContent).toContain('Header set Access-Control-Allow-Origin "*"');
            expect(productionContent).not.toContain('Header add Access-Control-Allow-Origin');
        });

        it('should include CSP in both environments', () => {
            expect(productionContent).toContain('Content-Security-Policy');
            expect(stagingContent).toContain('Content-Security-Policy');
        });
    });

    describe("AG-17134: 'unsafe-eval' removed from the main-site policy", () => {
        const ifOpen = `<If "${EXAMPLES_PATH_CONDITION}">`;

        // The <If> contents are indented, so unconditional directives are the
        // lines starting at column 0.
        const unconditionalLines = (content: string) => content.split('\n').filter((l) => !l.startsWith(' '));

        const extractIfBlock = (content: string) => {
            const start = content.indexOf(ifOpen);
            const end = content.indexOf('</If>', start);
            expect(start).toBeGreaterThan(-1);
            expect(end).toBeGreaterThan(start);
            return content.slice(start, end);
        };

        it('staging: unconditional enforced policy has no unsafe-eval but keeps unsafe-inline', () => {
            const setLine = unconditionalLines(stagingContent).find((l) =>
                l.startsWith('Header always set Content-Security-Policy "')
            );
            expect(setLine).toBeDefined();
            expect(setLine).not.toContain("'unsafe-eval'");
            expect(setLine).toContain("'unsafe-inline'");
        });

        it('staging: <If> override re-sets the enforced policy with unsafe-eval for example/archive paths', () => {
            const ifBlock = extractIfBlock(stagingContent);
            expect(ifBlock).toContain('Header always unset Content-Security-Policy\n');
            expect(ifBlock).toContain("'unsafe-eval'");
        });

        it('staging: site-wide set precedes the <If> override', () => {
            const setIndex = stagingContent.indexOf('Header always set Content-Security-Policy "');
            const ifIndex = stagingContent.indexOf(ifOpen);
            expect(setIndex).toBeGreaterThan(-1);
            expect(setIndex).toBeLessThan(ifIndex);
        });

        if (PRODUCTION_CSP_PHASE === 'report-only') {
            it('production (report-only window): keeps enforcing the previous policy with unsafe-eval', () => {
                const enforcedLine = unconditionalLines(productionContent).find((l) =>
                    l.startsWith('Header always set Content-Security-Policy "')
                );
                expect(enforcedLine).toBeDefined();
                expect(enforcedLine).toContain("'unsafe-eval'");
            });

            it('production (report-only window): reports on the tightened site policy', () => {
                const reportOnlyLine = unconditionalLines(productionContent).find((l) =>
                    l.startsWith('Header always set Content-Security-Policy-Report-Only "')
                );
                expect(reportOnlyLine).toBeDefined();
                expect(reportOnlyLine).not.toContain("'unsafe-eval'");
            });

            it('production (report-only window): <If> override only swaps the report-only header', () => {
                const ifBlock = extractIfBlock(productionContent);
                expect(ifBlock).toContain('Header always unset Content-Security-Policy-Report-Only\n');
                expect(ifBlock).toContain('Header always set Content-Security-Policy-Report-Only "');
                expect(ifBlock).not.toContain('Header always set Content-Security-Policy "');
            });

            it('production (report-only window): the report-only block does not unset the enforced header', () => {
                const lines = unconditionalLines(productionContent);
                const enforcedSetIndex = lines.findIndex((l) =>
                    l.startsWith('Header always set Content-Security-Policy "')
                );
                const laterUnset = lines
                    .slice(enforcedSetIndex + 1)
                    .find((l) => l.trim() === 'Header always unset Content-Security-Policy');
                expect(laterUnset).toBeUndefined();
            });
        } else {
            it('production (enforced): unconditional enforced policy has no unsafe-eval', () => {
                const enforcedLine = unconditionalLines(productionContent).find((l) =>
                    l.startsWith('Header always set Content-Security-Policy "')
                );
                expect(enforcedLine).toBeDefined();
                expect(enforcedLine).not.toContain("'unsafe-eval'");
            });

            it('production (enforced): <If> override re-sets the enforced policy with unsafe-eval', () => {
                const ifBlock = extractIfBlock(productionContent);
                expect(ifBlock).toContain('Header always unset Content-Security-Policy\n');
                expect(ifBlock).toContain("'unsafe-eval'");
            });
        }
    });

    describe('AG-17134: Bryntum campaign pages CSP override', () => {
        const campaignsIfOpen = `<If "${CAMPAIGNS_PATH_CONDITION}">`;

        // In every phase the first /campaigns/ <If> is the enforced override, so it
        // governs what the campaign pages actually load.
        const firstCampaignsIfBlock = (content: string) => {
            const start = content.indexOf(campaignsIfOpen);
            expect(start).toBeGreaterThan(-1);
            return content.slice(start, content.indexOf('</If>', start));
        };

        it('staging: <If> override allows bryntum.com for /campaigns/ without unsafe-eval', () => {
            const ifBlock = firstCampaignsIfBlock(stagingContent);
            expect(ifBlock).toContain('https://bryntum.com');
            expect(ifBlock).not.toContain("'unsafe-eval'");
        });

        it('RTI-3353: the campaigns <If> condition also covers archived campaign pages', () => {
            // Archived campaign pages (/archive/<version>/campaigns/) otherwise fall under
            // the examples scope and lose the bryntum.com allowances. The condition carries
            // the optional /archive/<version> prefix so the override applies to them too.
            expect(campaignsIfOpen).toContain('/archive/');
            expect(stagingContent).toContain(campaignsIfOpen);
            expect(productionContent).toContain(campaignsIfOpen);
        });

        it('production: allows bryntum.com for /campaigns/ without unsafe-eval (either phase)', () => {
            const ifBlock = firstCampaignsIfBlock(productionContent);
            expect(ifBlock).toContain('https://bryntum.com');
            expect(ifBlock).not.toContain("'unsafe-eval'");
        });

        if (PRODUCTION_CSP_PHASE === 'report-only') {
            it('production (report-only window): re-sets the ENFORCED header for /campaigns/ so bryntum.com loads during the window', () => {
                const ifBlock = firstCampaignsIfBlock(productionContent);
                expect(ifBlock).toContain('Header always unset Content-Security-Policy\n');
                expect(ifBlock).toContain('Header always set Content-Security-Policy "');
            });
        }
    });

    describe('AG-17134: /branch-builds/ CSP exemption', () => {
        const branchBuildsIfOpen = `<If "${BRANCH_BUILDS_PATH_CONDITION}">`;

        const branchBuildsIfBlock = (content: string) => {
            const start = content.indexOf(branchBuildsIfOpen);
            expect(start).toBeGreaterThan(-1);
            return content.slice(start, content.indexOf('</If>', start));
        };

        it('staging: drops the CSP entirely for /branch-builds/ (unset, no re-set)', () => {
            const ifBlock = branchBuildsIfBlock(stagingContent);
            expect(ifBlock).toContain('Header always unset Content-Security-Policy');
            expect(ifBlock).not.toContain('Header always set Content-Security-Policy');
        });

        it('staging: the branch-builds override trails the site-wide set so it wins for those paths', () => {
            const setIndex = stagingContent.indexOf('Header always set Content-Security-Policy "');
            const ifIndex = stagingContent.indexOf(branchBuildsIfOpen);
            expect(setIndex).toBeGreaterThan(-1);
            expect(ifIndex).toBeGreaterThan(setIndex);
        });

        it('production: no /branch-builds/ override (the tree is staging-only)', () => {
            expect(productionContent).not.toContain(branchBuildsIfOpen);
        });
    });

    describe('AG-17134: /ecommerce/ CSP override (separately-managed checkout SPA)', () => {
        const ecommerceIfOpen = `<If "${ECOMMERCE_PATH_CONDITION}">`;

        const ecommerceIfBlock = (content: string) => {
            const start = content.indexOf(ecommerceIfOpen);
            expect(start).toBeGreaterThan(-1);
            return content.slice(start, content.indexOf('</If>', start));
        };

        it("staging: <If> override re-allows 'unsafe-inline' and 'unsafe-eval' for /ecommerce/", () => {
            const ifBlock = ecommerceIfBlock(stagingContent);
            expect(ifBlock).toContain('Header always unset Content-Security-Policy\n');
            expect(ifBlock).toContain("'unsafe-inline'");
            expect(ifBlock).toContain("'unsafe-eval'");
        });

        it('production: emits the /ecommerce/ override in either phase', () => {
            expect(productionContent).toContain(ecommerceIfOpen);
            const ifBlock = ecommerceIfBlock(productionContent);
            expect(ifBlock).toContain("'unsafe-inline'");
            expect(ifBlock).toContain("'unsafe-eval'");
        });

        if (PRODUCTION_CSP_PHASE === 'report-only') {
            it('production (report-only window): the /ecommerce/ override only swaps the report-only header', () => {
                // During the window the enforced baseline is the permissive examples policy
                // (which already allows inline), so /ecommerce/ keeps working; this override
                // just stops it reporting under the tightened report-only site policy.
                const ifBlock = ecommerceIfBlock(productionContent);
                expect(ifBlock).toContain('Header always unset Content-Security-Policy-Report-Only\n');
                expect(ifBlock).toContain('Header always set Content-Security-Policy-Report-Only "');
                expect(ifBlock).not.toContain('Header always set Content-Security-Policy "');
            });
        }
    });

    describe('SE-66: single-hop rewrites must not redirect a path to itself', () => {
        const SITE_HOST = 'www.ag-grid.com';

        // A single-hop rewrite runs before the host-swap, so it fires for a request on either the
        // apex (ag-grid.com) or the www host. The RewriteRule regex is anchored (`^/?<from>$`), so it
        // only re-fires on its own output when the target is the EXACT same path on www — then the
        // browser is sent straight back to the URL it just requested and the request loops forever,
        // never reaching a 200. (A target that merely adds the www host or a trailing slash does not
        // re-match, so it is a legitimate single hop, not a loop.) This is the bug reported for
        // /charts/react/bullet-series/ (SE-66): it targeted its own www URL verbatim and looped.
        it('no rule targets its own path on the site host', () => {
            const loops = SITE_SINGLE_HOP_REWRITES.filter((rule) => {
                const target = new URL(rule.to);
                return target.host === SITE_HOST && target.pathname === rule.from;
            }).map((rule) => `${rule.from} -> ${rule.to}`);

            expect(loops).toEqual([]);
        });

        // The chain-shortening rewrites all target www, so a host guard skips them on every other
        // host the docroot answers for. Its [S=n] count must equal the rules it guards: too small
        // and the shortening leaks onto those hosts, too large and it swallows the host
        // canonicalisation that follows.
        it('skips the chain-shortening rules on other hosts, and only those rules', () => {
            const files = [compileHtaccess(productionContent)];
            const targets = new Set(SITE_SINGLE_HOP_REWRITES.map((rule) => rule.to));
            const shortening = new Set(
                files[0].rewriteRules.filter((rule) => targets.has(rule.substitution)).map((rule) => rule.source)
            );
            expect(shortening.size).toBeGreaterThan(0);
            for (const rule of SITE_SINGLE_HOP_REWRITES) {
                // On www the rule fires; on another host the guard must skip it (mod_alias may still match).
                const onWww = route(files, { url: `https://www.ag-grid.com${rule.from}` });
                expect(onWww, `${rule.from} on www`).toMatchObject({ location: rule.to });
                expect(shortening.has((onWww as { by: string }).by), `${rule.from} on www`).toBe(true);
                const outcome = route(files, { url: `https://studio.ag-grid.com${rule.from}` });
                expect(shortening.has((outcome as { by?: string }).by ?? ''), `${rule.from} on studio`).toBe(false);
            }
            // The first rule after the guarded block still runs for a non-www host.
            expect(route(files, { url: 'https://angulargrid.ag-grid.com/x/' })).toMatchObject({
                type: 'redirect',
                location: 'https://www.ag-grid.com/x/',
            });
        });
    });

    // /charts/ and /studio/ are separate sites (the ag-charts and Studio repos) deployed with their
    // own .htaccess. A child .htaccess with any mod_rewrite directive REPLACES the root's rewrite
    // rules for every request below it (no RewriteOptions Inherit), so a root rule written for a
    // /charts/ or /studio/ path never runs - verified in real Apache. The root mirrored the charts
    // semantic redirects for a while (SE-66), which only ever produced dead rules, and the
    // quick-start one would also have bounced the /charts/{react,angular,vue}/ landing hubs had it
    // ever run. The child .htaccess owns those paths, so the root must treat them like any other
    // path: whatever it does to /charts/<x> it must do identically to an unowned /<prefix>/<x>.
    describe('SE-66 / waf-finding §2: the root leaves /charts/ and /studio/ to their own .htaccess', () => {
        const NEUTRAL = 'zz-not-a-product';
        const productPaths = [
            '/charts/',
            '/charts',
            '/charts/react/',
            '/charts/react',
            '/charts/angular/',
            '/charts/vue/',
            '/charts/javascript/',
            '/charts/react/bullet-series/',
            '/charts/javascript/fonts',
            '/charts/react/toolbar/',
            '/charts/react/line',
            '/charts/archive/',
            '/charts/archive/12.0.0/',
            '/charts/javascript-charts/javascript/bar-series/',
            '/charts/enterprise-charts/react/bar-series/',
            '/charts/enterprise-charts/foo/',
            '/charts/react-charts/gallery/',
            '/charts/core/line-series',
            '/charts/side/',
            '/charts/server-side-rendering/x/',
            '/charts/vue/series/bar/',
            '/charts/angular/axes/',
            '/charts/documentation',
            '/charts/react/zoom',
            '/charts/react/cone-funnel-series',
            '/charts/react/candlestick-series',
            '/charts/react/zoom/?x=1',
            '/studio/',
            '/studio',
            '/studio/react/getting-started',
            '/studio/archive/',
            '/studio/archive/1.0.0/',
        ];
        const hosts = [
            'https://www.ag-grid.com',
            'http://www.ag-grid.com',
            'https://ag-grid.com',
            'https://blog.ag-grid.com',
        ];

        it('routes every /charts/ and /studio/ path exactly as it routes the same path under an unowned prefix', () => {
            const files = [compileHtaccess(productionContent)];
            const neutralise = (value: string) => value.replace(/\/(charts|studio)(?=\/|$|\?)/, `/${NEUTRAL}`);
            const differences = hosts.flatMap((host) =>
                productPaths.flatMap((path) => {
                    const product = route(files, { url: `${host}${path}` });
                    const neutral = route(files, { url: `${host}${neutralise(path)}` });
                    const productComparable = JSON.stringify({ ...product, by: undefined, path: undefined }).replace(
                        /\/(charts|studio)(?=\/|"|\?)/,
                        `/${NEUTRAL}`
                    );
                    const neutralComparable = JSON.stringify({ ...neutral, by: undefined, path: undefined });
                    return productComparable === neutralComparable
                        ? []
                        : [`${host}${path}: ${JSON.stringify(product)} vs ${JSON.stringify(neutral)}`];
                })
            );
            expect(differences).toEqual([]);
        });
    });

    describe('SE-80: Accept: text/markdown content negotiation', () => {
        // The negotiated path list is derived from GRID_MARKDOWN_PAGE_GROUPS, so asserting the
        // literal regex here would just restate the registry. Instead, pull the generated
        // pattern back out and check which URLs it actually matches — that catches a broken
        // pattern, which a string comparison against a hand-copied regex never would.
        const extractNegotiationPattern = (content: string) => {
            const match = content.match(/RewriteCond %\{REQUEST_URI\} \^\/\((.+)\)\/\?\$/);
            expect(match).not.toBeNull();
            return new RegExp(`^/(${match![1]})/?$`);
        };

        const extractVaryPattern = (content: string) => {
            const match = content.match(/<If "%\{REQUEST_URI\} =~ m#\^\/\(\?:(.+)\)\(\?:\/\|\/index\\\.html\)\?\$#/);
            expect(match).not.toBeNull();
            return new RegExp(`^/(?:${match![1]})(?:/|/index\\.html)?$`);
        };

        // One representative URL per group in the registry. Every URL in the sitemap must
        // negotiate, so a group added without a matching pattern shows up here.
        const negotiablePaths = [
            '/react-data-grid/cell-editing/',
            '/javascript-data-grid/getting-started/',
            '/react-data-grid/',
            '/about/',
            '/changelog/',
            '/documentation-archive/',
            '/example/',
            '/license-pricing/',
            '/pipeline/',
            '/roadmap/',
            '/whats-new/',
            '/community/',
            '/community/events/',
            '/community/beyond-the-prompt/',
            '/session/opening-keynote/',
            '/campaigns/bryntum-gantt/',
            '/landing-pages/react-data-grid/',
            '/react-table/',
            '/cookies/',
            '/modern-slavery/',
            '/privacy/',
            '/terms-of-use/',
            '/eula/community/',
            '/eula/commercial/',
            '/example-finance/',
            '/example-hr/',
            '/example-inventory/',
            '/contact/',
            '/niall/',
            '/licensing/',
            '/reference/',
            '/sitemap/',
            '/theme-builder/',
        ];

        // Paths that must NOT negotiate: they have no `.md` twin, and rewriting them would
        // either 404 or (for the `.md` itself) loop into `.md.md`.
        const nonNegotiablePaths = [
            '/react-data-grid/cell-editing.md', // the twin itself — final segments exclude dots
            '/javascript-data-grid/', // the one framework root without a hub, so no twin
            '/react-data-grid/errors/123/', // sitemap-excluded
            '/data-grid/cell-editing/', // framework-agnostic redirect stub
            '/contact/success/', // form result, sitemap-excluded
            '/privacy/your-choice/', // opt-out confirmation, robots-disallowed and sitemap-excluded
            '/eula/', // no page: the licences live at /eula/community/ and /eula/commercial/
            '/eula/license-en.html', // bare document for the ecommerce iframe, no twin
            '/examples/cell-editing/component-editor/reactFunctionalTs/',
            '/debug/files/',
            '/sitemap-0.xml',
            '/sitemap-index.xml',
        ];

        // Archive builds ship their own production .htaccess (HTACCESS=production in
        // .env.build.archive), served from /archive/<v>/, so negotiation must be anchored there
        // rather than at the root - otherwise no archived page ever negotiates.
        describe('archive builds negotiate under their own base path', () => {
            let archiveContent: string;

            beforeAll(async () => {
                vi.resetModules();
                vi.doMock('../../constants', async (importActual) => {
                    const actual = await importActual<typeof Constants>();
                    return { ...actual, SITE_BASE_URL: '/archive/36.2.0/' };
                });
                const archiveRules = await import('./htaccessRules');
                archiveContent = archiveRules.getHtaccessContent({ env: 'production' });
            });

            afterAll(() => {
                vi.doUnmock('../../constants');
                vi.resetModules();
            });

            it('negotiates every page group below the archive base, and nothing at the root', () => {
                const pattern = extractNegotiationPattern(archiveContent);
                for (const path of negotiablePaths) {
                    expect(pattern.test(`/archive/36.2.0${path}`), `/archive/36.2.0${path} should negotiate`).toBe(
                        true
                    );
                    expect(pattern.test(path), `${path} is outside the archive`).toBe(false);
                }
                for (const path of nonNegotiablePaths) {
                    expect(pattern.test(`/archive/36.2.0${path}`), `/archive/36.2.0${path}`).toBe(false);
                }
            });

            it('treats the version dots literally', () => {
                const pattern = extractNegotiationPattern(archiveContent);
                expect(pattern.test('/archive/36x2x0/react-data-grid/cell-editing/')).toBe(false);
            });

            it('captures the docroot-relative path in %1 so the -f guard and target resolve inside the archive', () => {
                const pattern = extractNegotiationPattern(archiveContent);
                expect('/archive/36.2.0/react-data-grid/cell-editing/'.match(pattern)?.[1]).toBe(
                    'archive/36.2.0/react-data-grid/cell-editing'
                );
                expect(archiveContent).toContain('RewriteCond %{DOCUMENT_ROOT}/%1.md -f');
                expect(archiveContent).toContain('RewriteRule ^ /%1.md [L]');
            });

            it('negotiates the archive homepage to its own index.md', () => {
                expect(archiveContent).toContain('RewriteCond %{REQUEST_URI} ^/archive/36\\.2\\.0/$');
                expect(archiveContent).toContain('RewriteCond %{DOCUMENT_ROOT}/archive/36.2.0/index.md -f');
                expect(archiveContent).toContain('RewriteRule ^ /archive/36.2.0/index.md [L]');
            });

            it('scopes Vary: Accept to the same archived paths', () => {
                const varyPattern = extractVaryPattern(archiveContent);
                for (const path of negotiablePaths) {
                    expect(varyPattern.test(`/archive/36.2.0${path}`), `/archive/36.2.0${path}`).toBe(true);
                    expect(
                        varyPattern.test(`/archive/36.2.0${path.replace(/\/$/, '')}/index.html`),
                        `/archive/36.2.0${path} via DirectoryIndex`
                    ).toBe(true);
                    expect(varyPattern.test(path), `${path} is outside the archive`).toBe(false);
                }
                expect(archiveContent).toContain('%{REQUEST_URI} =~ m#^/archive/36\\.2\\.0/(?:index\\.html)?$#');
            });
        });
    });

    // Archive builds ship this production .htaccess into /archive/<v>/, where Apache applies it after
    // the root's (waf-finding.md §3, AG-17157). A per-directory RewriteRule only sees the path below
    // that directory, so any root-relative rule there drops the archive prefix: ag-grid.com/archive/
    // 36.2.0/react-data-grid/getting-started/ was host-swapped onto the CURRENT docs, and the
    // current-site single-hop, blog and redirect rules fired inside archives. These tests deploy the
    // generated archive file below the generated root file and request URLs through both.
    describe('archive builds, deployed below the root .htaccess', () => {
        const BASE = '/archive/36.3.0';
        const WWW = 'https://www.ag-grid.com';
        let archiveContent: string;
        let deployed: CompiledHtaccess[];
        let inFlight: CompiledHtaccess[];

        beforeAll(async () => {
            vi.resetModules();
            vi.doMock('../../constants', async (importActual) => {
                const actual = await importActual<typeof Constants>();
                return { ...actual, SITE_BASE_URL: `${BASE}/` };
            });
            const archiveRules = await import('./htaccessRules');
            archiveContent = archiveRules.getHtaccessContent({ env: 'production' });
            const archiveFile = compileHtaccess(archiveContent, `${BASE}/`);
            deployed = [compileHtaccess(productionContent), archiveFile];
            inFlight = [
                compileHtaccess(getHtaccessContent({ env: 'production', uncachedGridArchive: '36.3.0' })),
                archiveFile,
            ];
        });

        afterAll(() => {
            vi.doUnmock('../../constants');
            vi.resetModules();
        });

        // Every path a rule anywhere is written for, so no rule can hide.
        const probePaths = () => [
            '/',
            '/react-data-grid/getting-started/',
            '/react-data-grid/getting-started',
            '/react-data-grid/whats-new',
            '/index.php',
            '/react-data-grid/index.php',
            '/react-data-grid/page.php/extra/',
            '/javascript-data-grid/',
            '/charts/react',
            '/tag/react/',
            '/2018/11/29/inside-fiber/',
            '/some-post/amp/',
            '/feed/',
            '/theo/',
            // Legacy URLs the harness found 404ing inside archives once the single-hop rewrites were
            // dropped: mod_alias's broad /{fw}-grid/ prefix rule maps them onto a page that does not exist.
            '/javascript-grid/themes-customising/',
            '/react-grid/themes-provided/',
            '/react-grid/fine-tuning/',
            '/forum/x',
            ...SITE_SINGLE_HOP_REWRITES.map((rule) => rule.from),
            ...SITE_301_REDIRECTS.map((rule) => ('from' in rule ? rule.from : samplePath(rule.fromPattern))),
        ];
        const HOSTS = [
            'https://www.ag-grid.com',
            'http://www.ag-grid.com',
            'https://ag-grid.com',
            'https://blog.ag-grid.com',
            'https://angulargrid.com',
            'https://react-grid.ag-grid.com',
        ];

        it('canonicalises every alias host onto the same archive URL on https://www, in one hop', () => {
            for (const host of HOSTS.slice(1)) {
                const chain = followRedirects(deployed, { url: `${host}${BASE}/react-data-grid/getting-started/?x=1` });
                expect(chain.hops, host).toHaveLength(1);
                expect(chain.final.url, host).toBe(`${WWW}${BASE}/react-data-grid/getting-started/?x=1`);
                // waf-finding.md §20.2: a slash-less directory path gets its slash in that same hop.
                const slashless = followRedirects(deployed, {
                    url: `${host}${BASE}/react-data-grid/getting-started?x=1`,
                });
                expect(
                    slashless.hops.map((hop) => hop.location),
                    host
                ).toEqual([`${WWW}${BASE}/react-data-grid/getting-started/?x=1`]);
            }
        });

        it('never redirects an archive URL out of the archive, from any host', () => {
            const escapes = HOSTS.flatMap((host) =>
                probePaths().flatMap((path) => {
                    const outcome = route(deployed, { url: `${host}${BASE}${path}` });
                    if (outcome.type !== 'redirect') {
                        return [];
                    }
                    const target = new URL(outcome.location);
                    return target.hostname === 'www.ag-grid.com' && target.pathname.startsWith(`${BASE}/`)
                        ? []
                        : [`${host}${BASE}${path} -> ${outcome.location}`];
                })
            );
            expect(escapes).toEqual([]);
        });

        const at = (path: string, host = WWW) => route(deployed, { url: `${host}${BASE}${path}` });
        const rebased = (to: string) => to.replace(WWW, `${WWW}${BASE}`);
        const keptSingleHops = SITE_SINGLE_HOP_REWRITES.filter(
            (r) => !/^https:\/\/www\.ag-grid\.com\/(charts|blog)\//.test(r.to)
        );
        const droppedSingleHops = SITE_SINGLE_HOP_REWRITES.filter((r) => !keptSingleHops.includes(r));

        it('sends legacy single-hop URLs to their page inside the archive, in one hop', () => {
            expect(at('/javascript-grid/themes-customising/')).toMatchObject({
                location: `${WWW}${BASE}/javascript-data-grid/themes/`,
            });
            expect(at('/react-grid/themes-provided/')).toMatchObject({
                location: `${WWW}${BASE}/react-data-grid/themes/`,
            });
            expect(at('/react-grid/fine-tuning/')).toMatchObject({
                location: `${WWW}${BASE}/react-data-grid/react-hooks/`,
            });
            // Ahead of the trailing-slash fix, which would otherwise make it two hops.
            expect(at('/react-data-grid/whats-new')).toMatchObject({ location: `${WWW}${BASE}/whats-new/` });
        });

        it('keeps every single-hop rewrite whose target the archive has a copy of, landing on a final URL', () => {
            expect(keptSingleHops.length).toBeGreaterThan(0);
            const wrong = keptSingleHops.flatMap(({ from, to }) => {
                const chain = followRedirects(deployed, { url: `${WWW}${BASE}${from}` });
                const ok = chain.hops.length === 1 && chain.final.url === rebased(to);
                return ok ? [] : [`${from} -> ${chain.hops.map((hop) => hop.location).join(' -> ')}`];
            });
            expect(wrong).toEqual([]);
        });

        it('drops the single-hop rewrites onto charts and the blog, which no grid archive holds', () => {
            expect(droppedSingleHops.length).toBeGreaterThan(0);
            for (const { from, to } of droppedSingleHops) {
                const outcome = at(from);
                expect(outcome.type === 'redirect' ? outcome.location : null, from).not.toBe(to);
            }
            expect(archiveContent).not.toContain('https://www.ag-grid.com/charts/');
        });

        it('skips the single-hop rewrites on other hosts, which canonicalise first', () => {
            for (const host of ['https://angulargrid.com', 'https://react-grid.ag-grid.com']) {
                for (const { from } of keptSingleHops) {
                    // Canonicalising a slash-less directory path adds its slash in the same hop.
                    const canonical = /\/[^/.]+$/.test(from) ? `${from}/` : from;
                    expect(at(from, host), `${host}${from}`).toMatchObject({ location: `${WWW}${BASE}${canonical}` });
                }
            }
        });

        it('keeps the archive-internal fixes working: index.php, path-after-php, trailing slash, base-aware redirects', () => {
            const at = (path: string) => route(deployed, { url: `${WWW}${BASE}${path}` });
            expect(at('/index.php')).toMatchObject({ location: `${WWW}${BASE}/` });
            expect(at('/react-data-grid/index.php')).toMatchObject({ location: `${WWW}${BASE}/react-data-grid/` });
            expect(at('/react-data-grid/page.php/extra/')).toMatchObject({
                location: `${WWW}${BASE}/react-data-grid/page.php`,
            });
            expect(at('/react-data-grid/getting-started')).toMatchObject({
                location: `${WWW}${BASE}/react-data-grid/getting-started/`,
            });
            expect(at('/react-data-grid/whats-new/')).toMatchObject({ location: `${WWW}${BASE}/whats-new/` });
            expect(at('/javascript-grid-virtual-paging/x/')).toMatchObject({
                location: `${WWW}${BASE}/javascript-data-grid/infinite-scrolling/`,
            });
            expect(at('/forum/x/')).toMatchObject({ type: 'status', status: 410 });
            expect(at('/react-data-grid/getting-started/')).toMatchObject({ type: 'serve' });
        });

        it('negotiates markdown inside the archive, with Vary on both representations', () => {
            const page = `${BASE}/react-data-grid/getting-started/`;
            const md = route(deployed, { url: `${WWW}${page}`, accept: 'text/markdown', fileExists: () => true });
            expect(md).toEqual({
                type: 'serve',
                path: `${BASE}/react-data-grid/getting-started.md`,
                query: '',
                vary: ['Accept'],
            });
            const home = route(deployed, { url: `${WWW}${BASE}/`, accept: 'text/markdown', fileExists: () => true });
            expect(home).toMatchObject({ path: `${BASE}/index.md` });
            const html = responseHeaders(deployed, { uri: `${page}index.html`, status: 200, contentType: 'text/html' });
            expect(html.get('vary')?.join(', ')).toMatch(/\bAccept\b/);
        });

        // A content type and URL matrix covering every class an archive serves.
        const archiveResponses = () =>
            [
                ['/index.html', 'text/html'],
                ['/react-data-grid/getting-started/index.html', 'text/html; charset=utf-8'],
                ['/react-data-grid/getting-started.md', 'text/markdown; charset=utf-8'],
                ['/index.md', 'text/markdown'],
                ['/llms.txt', 'text/plain'],
                ['/scripts/gtm-init.js', 'text/javascript'],
                ['/images/logo.svg', 'image/svg+xml'],
                ['/example-assets/olympic-winners.json', 'application/json'],
                ['/examples/a/b/main.ts', 'application/typescript'],
                ['/_astro/unhashed.js', 'text/javascript'],
                ['/robots.txt', 'text/plain'],
            ].map(([path, contentType]) => ({ uri: `${BASE}${path}`, contentType }));
        const HASHED = `${BASE}/_astro/DocsExampleRunner.CiSTQ4_g.css`;
        const LONG = 'public, max-age=604800, s-maxage=31536000';

        // The archive file is applied after the root, so any Cache-Control it sets on an unhashed
        // URL would override the root's in-flight no-cache for a release candidate (T5).
        it('the archive .htaccess itself caches nothing but content-hashed assets', () => {
            const archiveOnly = [compileHtaccess(archiveContent, `${BASE}/`)];
            for (const { uri, contentType } of archiveResponses()) {
                const cacheControl = responseHeaders(archiveOnly, { uri, status: 200, contentType }).get(
                    'cache-control'
                );
                expect(cacheControl ?? [], uri).not.toContain(LONG);
                expect(
                    (cacheControl ?? []).filter((value) => value.includes('max-age')),
                    uri
                ).toEqual([]);
            }
            expect(
                responseHeaders(archiveOnly, { uri: HASHED, status: 200, contentType: 'text/css' }).get('cache-control')
            ).toEqual([LONG]);
        });

        it('a released archive caches every response long', () => {
            for (const { uri, contentType } of archiveResponses()) {
                expect(responseHeaders(deployed, { uri, status: 200, contentType }).get('cache-control'), uri).toEqual([
                    LONG,
                ]);
            }
        });

        it('a release candidate listed in flight serves every unhashed response no-cache', () => {
            for (const { uri, contentType } of archiveResponses()) {
                expect(responseHeaders(inFlight, { uri, status: 200, contentType }).get('cache-control'), uri).toEqual([
                    'no-cache',
                ]);
            }
            // A hashed asset is a new URL whenever its content changes, so it can never be stale.
            expect(
                responseHeaders(inFlight, { uri: HASHED, status: 200, contentType: 'text/css' }).get('cache-control')
            ).toEqual([LONG]);
        });

        it('in flight applies to that version only, never another archive or the charts archive', () => {
            for (const uri of ['/archive/36.2.0/index.html', '/charts/archive/36.3.0/index.html']) {
                expect(
                    responseHeaders(inFlight, { uri, status: 200, contentType: 'text/html' }).get('cache-control'),
                    uri
                ).toEqual([LONG]);
            }
        });

        it('a 404 inside an archive is served by the root error page, which is never cached long', () => {
            for (const files of [deployed, inFlight]) {
                const errorPage = files[1].errorDocuments.get(404)!;
                expect(
                    responseHeaders(files, {
                        uri: errorPage,
                        status: 404,
                        contentType: 'text/html',
                        onSuccess: true,
                    }).get('cache-control')
                ).toEqual(['no-cache']);
            }
        });

        it('archives keep exactly one enforcing CSP, with the examples policy, and the security headers', () => {
            const headers = responseHeaders(deployed, {
                uri: `${BASE}/react-data-grid/getting-started/index.html`,
                status: 200,
                contentType: 'text/html',
            });
            expect(headers.get('content-security-policy')).toHaveLength(1);
            expect(headers.get('content-security-policy')![0]).toContain("'unsafe-eval'");
            expect(headers.get('referrer-policy')).toEqual(['strict-origin-when-cross-origin']);
            expect(headers.has('x-frame-options')).toBe(false);
        });

        it('sends every archive redirect with Cache-Control: no-cache, from the root rule', () => {
            for (const path of [
                '/react-data-grid/getting-started',
                '/javascript-grid/themes-customising/',
                '/index.php',
            ]) {
                for (const host of [WWW, 'https://ag-grid.com', 'http://www.ag-grid.com']) {
                    const outcome = at(path, host);
                    expect(outcome.type, `${host}${path}`).toBe('redirect');
                    const headers = responseHeaders(deployed, {
                        uri: `${BASE}${path}`,
                        status: (outcome as { status: number }).status,
                        contentType: 'text/html',
                    });
                    expect(headers.get('cache-control'), `${host}${path}`).toEqual(['no-cache']);
                }
            }
        });

        // AG-17157 / SE-24, waf-finding.md §11: archive HTML is noindexed by a <meta name="robots"> the
        // layout emits for archive builds (see getIsArchive in env.test.ts). The .md twins have no
        // <head>, so the root .htaccess noindexes them with a header instead - and they keep the
        // released archive's long cache, unlike a live page's markdown.
        it('noindexes archive markdown twins with X-Robots-Tag, keeping the long cache', () => {
            const headers = responseHeaders(deployed, {
                uri: `${BASE}/react-data-grid/getting-started.md`,
                status: 200,
                contentType: 'text/markdown; charset=utf-8',
            });
            expect(headers.get('x-robots-tag')).toEqual(['noindex']);
            expect(headers.get('cache-control')).toEqual(['public, max-age=604800, s-maxage=31536000']);
        });
    });

    // ---------------------------------------------------------------------------------------------
    // Behaviour, through the simulator: what a request actually gets, rather than what the rules say.
    // ---------------------------------------------------------------------------------------------

    describe('host canonicalisation (AG-17158/AG-17159, SE-4, SE-26, SE-28, SE-29, SE-64, SE-66)', () => {
        const WWW = 'https://www.ag-grid.com';
        const ALIAS_HOSTS = [
            'ag-grid.com',
            'AG-Grid.com',
            'angulargrid.ag-grid.com',
            'angular-grid.ag-grid.com',
            'javascript-grid.ag-grid.com',
            'react-grid.ag-grid.com',
            'angulargrid.com',
            'www.angulargrid.com',
        ];
        const PATHS = ['/', '/react-data-grid/getting-started/', '/license-pricing/?utm_source=x&b=1', '/a/b/c/'];
        const files = () => [compileHtaccess(productionContent)];

        it.each(ALIAS_HOSTS.flatMap((host) => ['http', 'https'].map((scheme) => [scheme, host])))(
            '%s://%s sends every path to the same path on https://www in one hop',
            (scheme, host) => {
                for (const path of PATHS) {
                    const chain = followRedirects(files(), { url: `${scheme}://${host}${path}` });
                    expect(chain.hops, `${scheme}://${host}${path}`).toHaveLength(1);
                    expect(chain.hops[0].status).toBe(301);
                    expect(chain.final.url).toBe(`${WWW}${path}`);
                    expect(chain.final.outcome).toMatchObject({ type: 'serve' });
                }
            }
        );

        it('upgrades http on www to https in one hop, keeping path and query', () => {
            const chain = followRedirects(files(), { url: 'http://www.ag-grid.com/react-data-grid/?x=1' });
            expect(chain.hops.map((hop) => hop.location)).toEqual([`${WWW}/react-data-grid/?x=1`]);
        });

        it('leaves https://www alone', () => {
            for (const path of PATHS) {
                expect(route(files(), { url: `${WWW}${path}` })).toMatchObject({ type: 'serve' });
            }
        });

        it('keeps certificate-validation files reachable over http, without a redirect', () => {
            const path = '/.well-known/pki-validation/0123456789ABCDEF0123456789ABCDEF.txt';
            expect(route(files(), { url: `http://www.ag-grid.com${path}` })).toMatchObject({ type: 'serve' });
        });

        // waf-finding.md §20.1: an HTTP-01 token has no extension, so the add-slash rule took it for a
        // directory and the validation fetch got a 301 to a URL with no token behind it.
        it.each(['/.well-known/acme-challenge/Abc_123-xyz', '/.well-known/cpanel-dcv/Abc_123-xyz'])(
            'serves the certificate-validation token %s as it is, over http and https',
            (path) => {
                for (const scheme of ['http', 'https']) {
                    expect(route(files(), { url: `${scheme}://www.ag-grid.com${path}` }), scheme).toMatchObject({
                        type: 'serve',
                        path,
                    });
                }
                // An alias host is still canonicalised, but onto the token itself, not a slashed path.
                const chain = followRedirects(files(), { url: `http://ag-grid.com${path}` });
                expect(chain.hops.map((hop) => hop.location)).toEqual([`${WWW}${path}`]);
                expect(chain.final.outcome).toMatchObject({ type: 'serve', path });
            }
        );

        // waf-finding.md §20.2: a slash-less directory path on an alias host or over http took two
        // hops, the host swap and then the add-slash. Both now happen in the one redirect.
        it.each([
            ...ALIAS_HOSTS.flatMap((host) => ['http', 'https'].map((scheme) => [scheme, host])),
            ['http', 'www.ag-grid.com'],
        ])(
            '%s://%s adds the slash to a directory path in the same hop as the canonicalisation, and leaves files alone',
            (scheme, host) => {
                for (const path of ['/react-data-grid/getting-started', '/a/b/c']) {
                    const chain = followRedirects(files(), { url: `${scheme}://${host}${path}?x=1` });
                    expect(
                        chain.hops.map((hop) => hop.location),
                        `${scheme}://${host}${path}`
                    ).toEqual([`${WWW}${path}/?x=1`]);
                }
                for (const path of ['/robots.txt', '/react-data-grid/page.html']) {
                    const chain = followRedirects(files(), { url: `${scheme}://${host}${path}` });
                    expect(
                        chain.hops.map((hop) => hop.location),
                        `${scheme}://${host}${path}`
                    ).toEqual([`${WWW}${path}`]);
                }
            }
        );

        it('keeps markdown negotiation on a slash-less docs URL over https on www, without a redirect', () => {
            const path = '/react-data-grid/getting-started';
            expect(
                route(files(), { url: `${WWW}${path}`, accept: 'text/markdown', fileExists: (p) => p === `${path}.md` })
            ).toMatchObject({ type: 'serve', path: `${path}.md` });
        });

        // Apache decodes the path, matches the rules against the decoded bytes, and re-escapes it in
        // the Location (the simulator's escaping is pinned against real Apache in its own suite).
        it.each(ALIAS_HOSTS.flatMap((host) => ['http', 'https'].map((scheme) => [scheme, host])))(
            '%s://%s keeps an encoded path encoded when canonicalising it',
            (scheme, host) => {
                const at = (path: string) => route(files(), { url: `${scheme}://${host}${path}` });
                expect(at('/some%20page/?q=a%20b')).toMatchObject({ location: `${WWW}/some%20page/?q=a%20b` });
                expect(at('/some%20page')).toMatchObject({ location: `${WWW}/some%20page/` });
                expect(at('/caf%C3%A9/')).toMatchObject({ location: `${WWW}/caf%c3%a9/` });
                expect(at('/a%23b/')).toMatchObject({ location: `${WWW}/a%23b/` });
                expect(at('/a%26b/')).toMatchObject({ location: `${WWW}/a&b/` });
                // A %3F would become the start of a query string, which Apache refuses.
                expect(at('/a%3Fb/')).toMatchObject({ type: 'status', status: 403 });
            }
        );

        it('matches a single-hop rule against the decoded path, keeping the query', () => {
            for (const { from, to } of SITE_SINGLE_HOP_REWRITES.filter((rule) => !rule.to.includes('#')).slice(0, 20)) {
                const encoded = from.replace(
                    /[a-z]/,
                    (letter) => `%${letter.charCodeAt(0).toString(16).toUpperCase()}`
                );
                expect(encoded).not.toBe(from);
                for (const origin of [WWW, 'http://ag-grid.com']) {
                    const chain = followRedirects(files(), { url: `${origin}${encoded}?q=a%20b` });
                    expect(
                        chain.hops.map((hop) => hop.location),
                        `${origin}${encoded}`
                    ).toEqual([`${to}?q=a%20b`]);
                }
            }
        });

        it('adds the trailing slash to a directory path in one hop, keeping the query', () => {
            expect(route(files(), { url: `${WWW}/react-data-grid/getting-started?x=1` })).toMatchObject({
                status: 301,
                location: `${WWW}/react-data-grid/getting-started/?x=1`,
            });
            // Files (a dot in the path) are left alone.
            expect(route(files(), { url: `${WWW}/robots.txt` })).toMatchObject({ type: 'serve' });
        });

        it('does not touch hosts it does not own, such as charts.ag-grid.com or studio.ag-grid.com', () => {
            for (const host of ['charts.ag-grid.com', 'studio.ag-grid.com']) {
                expect(route(files(), { url: `https://${host}/react-data-grid/` }), host).toMatchObject({
                    type: 'serve',
                });
            }
        });
    });

    // SE-85..SE-113 (SE-86, SE-91 in particular): blog.ag-grid.com moved to www.ag-grid.com/blog/.
    // Every blog-host URL must leave the blog host in ONE hop - to its final destination, never via
    // an intermediate slug Ghost would redirect again - or answer 410 for content that is gone.
    describe('blog.ag-grid.com migration (SE-85..SE-113)', () => {
        const files = () => [compileHtaccess(productionContent)];
        const onBlog = (path: string) => route(files(), { url: `https://blog.ag-grid.com${path}` });

        it.each([
            // host swap, path kept
            ['/some-post/', 'https://www.ag-grid.com/blog/some-post/'],
            ['/', 'https://www.ag-grid.com/blog/'],
            ['/some-post/?ref=x', 'https://www.ag-grid.com/blog/some-post/?ref=x'],
            // AMP and feeds go straight to the Ghost equivalent
            ['/some-post/amp/', 'https://www.ag-grid.com/blog/some-post/'],
            ['/feed/', 'https://www.ag-grid.com/blog/rss/'],
            ['/rss/', 'https://www.ag-grid.com/blog/rss/'],
            ['/tag/javascript/feed/', 'https://www.ag-grid.com/blog/tag/javascript/rss/'],
            ['/author/sean/rss/', 'https://www.ag-grid.com/blog/author/sean/rss/'],
            ['/page/2/', 'https://www.ag-grid.com/blog/page/2/'],
            ['/sitemap-posts.xml', 'https://www.ag-grid.com/blog/sitemap-posts.xml'],
            ['/content/images/2020/a.png', 'https://www.ag-grid.com/blog/content/images/2020/a.png'],
            // renamed tags map directly, not via the old tag
            ['/tag/react/', 'https://www.ag-grid.com/blog/tag/react-data-grid/'],
            ['/tag/react/feed/', 'https://www.ag-grid.com/blog/tag/react-data-grid/rss/'],
            ['/tag/angular-grid/', 'https://www.ag-grid.com/blog/tag/angular/'],
            ['/tag/vue-table/page/3/', 'https://www.ag-grid.com/blog/tag/vuejs/'],
            ['/tag/jest/rss/', 'https://www.ag-grid.com/blog/tag/testing/rss/'],
            // retired and renamed posts resolve in one hop
            ['/showcase/', 'https://www.ag-grid.com/blog/ag-grid-showcase-examples-demos-samples-and-extensions/'],
            ['/SHOWCASE/amp/', 'https://www.ag-grid.com/blog/ag-grid-showcase-examples-demos-samples-and-extensions/'],
            [
                '/javascript-grid-comparison-column-pinning-ag-grid/',
                'https://www.ag-grid.com/react-data-grid/column-pinning/',
            ],
            ['/vuestic-ui-app-with-ag-grid-tutorial/', 'https://epicmax.co/blog/vuestic-ui-with-ag-grid'],
            ['/private/', 'https://www.ag-grid.com/blog/'],
            // WordPress-era permalinks
            ['/2018/11/29/inside-fiber/', 'https://www.ag-grid.com/blog/inside-fiber/'],
            ['/index.php/2019/01/02/some-post/feed/', 'https://www.ag-grid.com/blog/some-post/'],
            [
                '/2018/04/20/get-started-with-react-grid-in-5-minutes/',
                'https://www.ag-grid.com/blog/react-get-started-with-react-grid-in-5-minutes/',
            ],
            ['/index.php/category/react/', 'https://www.ag-grid.com/blog/tag/react-data-grid/'],
            ['/index.php/category/angular/feed/', 'https://www.ag-grid.com/blog/tag/angular/rss/'],
            ['/index.php/tag/vue/', 'https://www.ag-grid.com/blog/tag/vue/'],
            ['/index.php/author/niall/', 'https://www.ag-grid.com/blog/author/niall/'],
            ['/index.php/feed/', 'https://www.ag-grid.com/blog/rss/'],
            [
                '/index.php/2018/11/29/inside-fiber',
                'https://www.ag-grid.com/blog/inside-fiber-an-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/',
            ],
        ])('%s -> %s in one hop', (path, location) => {
            expect(onBlog(path)).toMatchObject({ type: 'redirect', status: 301, location });
        });

        it.each([
            '/whats-new-in-ag-grid-v24/',
            '/whats-new-in-ag-grid-v24/amp/amp/',
            '/Whats-New-In-AG-Grid-V24/feed/',
            '/avoiding-react-18-double-mount/',
            '/email-sign-up/',
            '/untitled/anything/',
            '/wp-json/wp/v2/posts',
            '/index.php/wp-json/',
            '/wp-includes/js/jquery.js',
            '/wp-content/plugins/x/readme.txt',
            '/rsslatest.xml',
            '/.well-known/nodeinfo',
            '/.ghost/activitypub/inbox',
            '/ag-grid-vs-datatables/',
            '/tag/sorting/',
            '/tag/redux/page/2/',
        ])('%s is 410 Gone (SE-91 / SE-188)', (path) => {
            expect(onBlog(path)).toMatchObject({ type: 'status', status: 410 });
        });

        it('never serves anything from the blog host: every request leaves it or is Gone', () => {
            const probes = [
                '/',
                '/robots.txt',
                '/react-data-grid/getting-started/',
                '/charts/react/bar-series/',
                '/studio/',
                '/archive/36.0.0/',
                '/llms.txt',
                '/sitemap.xml',
                '/favicon.ico',
                '/index.php',
            ];
            for (const path of probes) {
                const outcome = onBlog(path);
                expect(outcome.type, path).not.toBe('serve');
                if (outcome.type === 'redirect') {
                    expect(new URL(outcome.location).hostname, path).not.toBe('blog.ag-grid.com');
                }
            }
        });

        it('every docs page a blog redirect targets is served directly, without another hop on www', () => {
            const docsTargets = [
                ...productionContent.matchAll(/https:\/\/www\.ag-grid\.com\/([a-z]+-data-grid\/[^ ]+\/) \[/g),
            ]
                .map(([, path]) => `/${path}`)
                .filter((path) => !path.includes('$'));
            expect(docsTargets.length).toBeGreaterThan(10);
            for (const path of new Set(docsTargets)) {
                expect(route(files(), { url: `https://www.ag-grid.com${path}` }), path).toMatchObject({
                    type: 'serve',
                });
            }
        });
    });

    describe('security headers and CSP (AG-17133, AG-17134, SE-38, SE-40, SE-93)', () => {
        const pageClasses: [string, string][] = [
            ['site', '/react-data-grid/getting-started/index.html'],
            ['home', '/index.html'],
            ['examples', '/examples/cell-editing/basic/reactFunctionalTs/index.html'],
            ['archive', '/archive/36.0.0/react-data-grid/getting-started/index.html'],
            ['campaigns', '/campaigns/bryntum-gantt/index.html'],
            ['archived campaigns', '/archive/36.0.0/campaigns/bryntum-gantt/index.html'],
            ['ecommerce', '/ecommerce/index.html'],
        ];
        const cspOf = (headers: Map<string, string[]>) => headers.get('content-security-policy') ?? [];
        const scriptSrc = (csp: string) => csp.match(/script-src ([^;]*)/)?.[1] ?? '';

        it.each(pageClasses)(
            '%s: one enforcing CSP with frame-ancestors, both other headers always, no X-Frame-Options',
            (_, uri) => {
                const files = [compileHtaccess(productionContent)];
                for (const status of [200, 301, 404, 410]) {
                    const headers = responseHeaders(files, {
                        uri: status === 404 ? '/404.html' : uri,
                        status,
                        contentType: 'text/html',
                        onSuccess: status === 404 ? true : undefined,
                    });
                    expect(cspOf(headers), `${uri} ${status}`).toHaveLength(1);
                    expect(cspOf(headers)[0]).toMatch(/frame-ancestors 'self' https:\/\/\*\.ag-grid\.com/);
                    expect(headers.has('content-security-policy-report-only'), `${uri} ${status}`).toBe(
                        PRODUCTION_CSP_PHASE === 'report-only'
                    );
                    expect(headers.get('referrer-policy'), `${uri} ${status}`).toEqual([
                        'strict-origin-when-cross-origin',
                    ]);
                    expect(headers.get('permissions-policy'), `${uri} ${status}`).toEqual([
                        'geolocation=(), microphone=(), camera=()',
                    ]);
                    expect(headers.has('x-frame-options')).toBe(false);
                }
            }
        );

        it("scopes 'unsafe-eval' and the bryntum.com allowance to the paths that need them", () => {
            const files = [compileHtaccess(productionContent)];
            const enforced = (uri: string) =>
                cspOf(responseHeaders(files, { uri, status: 200, contentType: 'text/html' }))[0];
            expect(scriptSrc(enforced('/react-data-grid/getting-started/index.html'))).not.toContain("'unsafe-eval'");
            expect(scriptSrc(enforced('/examples/a/b/index.html'))).toContain("'unsafe-eval'");
            expect(scriptSrc(enforced('/archive/36.0.0/react-data-grid/x/index.html'))).toContain("'unsafe-eval'");
            expect(enforced('/campaigns/bryntum-gantt/index.html')).toContain('https://bryntum.com');
            expect(scriptSrc(enforced('/campaigns/bryntum-gantt/index.html'))).not.toContain("'unsafe-eval'");
            expect(enforced('/archive/36.0.0/campaigns/bryntum-gantt/index.html')).toContain('https://bryntum.com');
            expect(enforced('/react-data-grid/getting-started/index.html')).not.toContain('bryntum.com');
            expect(scriptSrc(enforced('/ecommerce/index.html'))).toContain("'unsafe-eval'");
        });

        it('staging: one enforcing CSP per class, and none at all under /branch-builds/', () => {
            const files = [compileHtaccess(stagingContent)];
            for (const [, uri] of pageClasses) {
                expect(cspOf(responseHeaders(files, { uri, status: 200, contentType: 'text/html' })), uri).toHaveLength(
                    1
                );
            }
            expect(
                responseHeaders(files, {
                    uri: '/branch-builds/x/index.html',
                    status: 200,
                    contentType: 'text/html',
                }).has('content-security-policy')
            ).toBe(false);
        });

        // /blog/ is reverse-proxied to Ghost and never reads the .htaccess; the vhost fragment
        // carries its headers, each guarded by an expr on the path.
        it('blog (vhost fragment): one enforcing CSP, both other headers, X-Robots-Tag stripped, nothing outside /blog/', () => {
            const vhost = [compileHtaccess(getBlogVhostHeaderFragment({ env: 'production' }, 'enforce'))];
            const blog = responseHeaders(vhost, { uri: '/blog/some-post/', status: 200, contentType: 'text/html' });
            expect(cspOf(blog)).toHaveLength(1);
            expect(cspOf(blog)[0]).toContain('frame-ancestors');
            expect(blog.get('referrer-policy')).toEqual(['strict-origin-when-cross-origin']);
            expect(blog.get('permissions-policy')).toEqual(['geolocation=(), microphone=(), camera=()']);
            expect(blog.has('x-robots-tag')).toBe(false);
            expect([...responseHeaders(vhost, { uri: '/react-data-grid/', status: 200 }).keys()]).toEqual([]);
        });
    });

    describe('SE-81: Link header only on successful HTML documents', () => {
        const files = () => [compileHtaccess(productionContent)];
        const link = (uri: string, status: number, contentType: string, onSuccess?: boolean) =>
            responseHeaders(files(), { uri, status, contentType, onSuccess }).get('link');

        it('is on a 200 HTML page, pointing at llms.txt, the sitemap index and the MCP docs', () => {
            expect(link('/react-data-grid/getting-started/index.html', 200, 'text/html; charset=utf-8')).toEqual([
                '</llms.txt>; rel=describedby, </sitemap-index.xml>; rel=sitemap, <https://www.ag-grid.com/javascript-data-grid/mcp-server/>; rel=related',
            ]);
        });

        it.each([
            ['the 404 page', '/404.html', 404, 'text/html', true],
            ['a redirect', '/react-data-grid/getting-started/index.html', 301, 'text/html', false],
            ['an image', '/images/logo.png', 200, 'image/png', undefined],
            ['a script', '/_astro/a.abcdefgh.js', 200, 'text/javascript', undefined],
            ['llms.txt', '/llms.txt', 200, 'text/plain', undefined],
            ['the sitemap', '/sitemap-index.xml', 200, 'application/xml', undefined],
            ['a markdown twin', '/react-data-grid/getting-started.md', 200, 'text/markdown', undefined],
        ] as const)('is not on %s', (_, uri, status, contentType, onSuccess) => {
            expect(link(uri, status, contentType, onSuccess)).toBeUndefined();
        });

        it('is on staging too, so it can be verified there', () => {
            expect(
                responseHeaders([compileHtaccess(stagingContent)], {
                    uri: '/index.html',
                    status: 200,
                    contentType: 'text/html',
                }).has('link')
            ).toBe(true);
        });
    });

    // SE-189 and the 2026-09-18 crawler-storm work: what each class of response is cached for.
    describe('Cache-Control per response class (SE-189)', () => {
        const LONG = 'public, max-age=604800, s-maxage=31536000';
        const DAY = 'public, max-age=86400';
        const cache = (content: string, uri: string, contentType: string, status = 200) =>
            responseHeaders([compileHtaccess(content)], { uri, status, contentType }).get('cache-control');

        it.each([
            ['/index.html', 'text/html; charset=utf-8', ['no-cache']],
            ['/react-data-grid/getting-started/index.html', 'text/html', ['no-cache']],
            ['/example/index.html', 'text/html', ['no-cache']],
            ['/example-assets/flags/index.html', 'text/html', ['no-cache']],
            ['/images/foo/index.html', 'text/html', ['no-cache']],
            ['/_astro/design-system.BcXAtF3c.css', 'text/css', [LONG]],
            ['/_astro/fonts/2eb6e0e4fc33dd24.woff2', 'font/woff2', [LONG]],
            ['/_astro/unhashed.css', 'text/css', undefined],
            ['/images/ag-logos/png-logos/react.png', 'image/png', [DAY]],
            ['/example-assets/olympic-winners.json', 'application/json', [DAY]],
            ['/theme-icons/quartz/quartz-icons.zip', 'application/zip', [DAY]],
            ['/videos/getting-started.json', 'application/json', [DAY]],
            ['/scripts/gtm-init.js', 'text/javascript', [DAY]],
            ['/robots.txt', 'text/plain', [DAY]],
            ['/favicon.ico', 'image/x-icon', [DAY]],
            ['/llms.txt', 'text/plain', undefined],
            ['/sitemap-index.xml', 'application/xml', undefined],
            ['/studio/archive/1.0.0/_astro/a.abcdefgh.js', 'text/javascript', ['no-cache']],
            ['/studio/archive/1.0.0/index.html', 'text/html', ['no-cache']],
            ['/studio/index.html', 'text/html', ['no-cache']],
        ])('production: %s (%s) -> %j', (uri, contentType, expected) => {
            expect(cache(productionContent, uri, contentType)).toEqual(expected);
        });

        it('never long-caches HTML outside a released archive', () => {
            const htmlUris = [
                '/index.html',
                '/react-data-grid/index.html',
                '/images/a/index.html',
                '/scripts/index.html',
                '/archive/index.html',
                '/documentation-archive/index.html',
                '/charts/documentation-archive/index.html',
            ];
            for (const uri of htmlUris) {
                expect(cache(productionContent, uri, 'text/html'), uri).toEqual(['no-cache']);
            }
        });

        it('serves 404s through the error page, which is never cached long', () => {
            for (const content of [productionContent, stagingContent]) {
                const files = [compileHtaccess(content)];
                const errorPage = files[0].errorDocuments.get(404)!;
                expect(errorPage).toBe('/404.html');
                expect(
                    responseHeaders(files, {
                        uri: errorPage,
                        status: 404,
                        contentType: 'text/html',
                        onSuccess: true,
                    }).get('cache-control')
                ).toEqual(['no-cache']);
            }
        });

        it('staging never caches anything long, so testers never see a stale asset', () => {
            for (const [uri, type] of [
                ['/_astro/design-system.BcXAtF3c.css', 'text/css'],
                ['/images/a.png', 'image/png'],
                ['/archive/36.0.0/index.html', 'text/html'],
            ]) {
                expect(cache(stagingContent, uri, type) ?? [], uri).not.toContain(LONG);
                expect(cache(stagingContent, uri, type) ?? [], uri).not.toContain(DAY);
            }
        });
    });

    // SE-80: Accept: text/markdown negotiates each docs page to its .md twin, and every response
    // for a negotiated URL - HTML or markdown - must say Vary: Accept so a shared cache keeps them apart.
    describe('SE-80: markdown negotiation, end to end', () => {
        const WWW = 'https://www.ag-grid.com';
        const negotiable = [
            '/react-data-grid/cell-editing/',
            '/javascript-data-grid/getting-started/',
            '/react-data-grid/',
            '/about/',
            '/community/events/',
            '/eula/community/',
            '/session/opening-keynote/',
            '/campaigns/bryntum-gantt/',
            '/landing-pages/react-data-grid/',
            '/theme-builder/',
        ];
        const notNegotiable = [
            '/javascript-data-grid/',
            '/react-data-grid/errors/123/',
            '/data-grid/cell-editing/',
            '/contact/success/',
            '/eula/',
            '/examples/cell-editing/component-editor/reactFunctionalTs/',
            '/debug/files/',
        ];
        const twin = (path: string) => (path === '/' ? '/index.md' : `${path.replace(/\/$/, '')}.md`);
        const everyTwinExists = () => true;

        const negotiate = (content: string, path: string, accept: string) =>
            route([compileHtaccess(content)], { url: `${WWW}${path}`, accept, fileExists: everyTwinExists });

        it.each([...negotiable, '/'])(
            '%s serves its twin to Accept: text/markdown, with and without the slash',
            (path) => {
                for (const content of [productionContent, stagingContent]) {
                    for (const requested of new Set([path, path === '/' ? '/' : path.replace(/\/$/, '')])) {
                        // A slash-less URL with its own single-hop rewrite is slashed first; the
                        // slashed URL then negotiates.
                        const first = negotiate(content, requested, 'text/markdown');
                        const variant =
                            first.type === 'redirect' && first.location === `${WWW}${path}` ? path : requested;
                        expect(negotiate(content, variant, 'text/markdown'), requested).toEqual({
                            type: 'serve',
                            path: twin(path),
                            query: '',
                            vary: ['Accept'],
                        });
                    }
                }
            }
        );

        it.each([...negotiable, '/'])('%s carries Vary: Accept on both the HTML and the markdown response', (path) => {
            for (const content of [productionContent, stagingContent]) {
                const files = [compileHtaccess(content)];
                const html = responseHeaders(files, {
                    uri: `${path}index.html`,
                    status: 200,
                    contentType: 'text/html',
                });
                expect(html.get('vary')?.join(', '), `${path} html`).toMatch(/\bAccept\b/);
                const markdown = negotiate(content, path, 'text/markdown');
                const md = responseHeaders(files, {
                    uri: twin(path),
                    status: 200,
                    contentType: 'text/markdown',
                    varyFromRewrite: markdown.type === 'serve' ? markdown.vary : [],
                });
                expect(md.get('vary')?.join(', '), `${path} md`).toMatch(/\bAccept\b/);
            }
        });

        it.each(notNegotiable)('%s is never negotiated and keeps a URL-only cache key', (path) => {
            const outcome = negotiate(productionContent, path, 'text/markdown');
            expect(outcome).not.toMatchObject({ path: twin(path) });
            expect(outcome.type === 'serve' ? outcome.vary : []).toEqual([]);
            const headers = responseHeaders([compileHtaccess(productionContent)], {
                uri: `${path}index.html`,
                status: 200,
                contentType: 'text/html',
            });
            expect(headers.get('vary') ?? []).toEqual([]);
        });

        it('serves HTML to a browser, and leaves a page without a twin on disk untouched', () => {
            const browser = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
            expect(negotiate(productionContent, '/about/', browser)).toMatchObject({ path: '/about/', vary: [] });
            expect(
                route([compileHtaccess(productionContent)], { url: `${WWW}/about/`, accept: 'text/markdown' })
            ).toMatchObject({ type: 'serve', path: '/about/' });
        });

        it('does not loop a direct .md request into .md.md', () => {
            expect(negotiate(productionContent, '/about.md', 'text/markdown')).toMatchObject({ path: '/about.md' });
        });

        // An explicit refusal must win: q=0 means "not acceptable" (RFC 9110 §12.4.2), but the
        // rule is a substring match on the header.
        it.fails('waf-finding.md §11: does not serve markdown to Accept: text/markdown;q=0', () => {
            expect(negotiate(productionContent, '/about/', 'text/html, text/markdown;q=0')).toMatchObject({
                path: '/about/',
            });
        });

        it('registers .md as UTF-8 text/markdown, and .webp as an image', () => {
            for (const content of [productionContent, stagingContent]) {
                expect(content).toMatch(/^AddType text\/markdown md$/m);
                expect(content).toMatch(/^AddCharset utf-8 \.md$/m);
                expect(content).toMatch(/^AddType image\/webp \.webp$/m);
            }
        });
    });

    describe('basic structure', () => {
        it('should include the autogenerated header', () => {
            expect(productionContent).toContain('### AUTOGENERATED DO NOT EDIT');
        });

        it('should include a 404 error document', () => {
            expect(productionContent).toContain('ErrorDocument 404 /404.html');
        });

        it('should include MIME types for example files', () => {
            expect(productionContent).toContain('AddType text/javascript jsx');
            expect(productionContent).toContain('AddType application/typescript ts tsx');
        });
    });
});
