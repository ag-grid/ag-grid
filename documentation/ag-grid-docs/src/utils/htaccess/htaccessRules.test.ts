import {
    BRANCH_BUILDS_PATH_CONDITION,
    CAMPAIGNS_PATH_CONDITION,
    ECOMMERCE_PATH_CONDITION,
    EXAMPLES_PATH_CONDITION,
} from './cspRules';
import { PRODUCTION_CSP_PHASE, UNCACHED_ARCHIVES, getHtaccessContent, getInFlightArchiveRules } from './htaccessRules';
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

    describe('AG-17159 / AG-17158: non-www to www redirect', () => {
        it('should redirect ag-grid.com to www.ag-grid.com', () => {
            expect(productionContent).toContain('RewriteCond %{HTTP_HOST} ^ag-grid\\.com$ [NC]');
            expect(productionContent).toContain('RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]');
        });

        it('should preserve the full path in the redirect', () => {
            const match = productionContent.match(
                /RewriteCond %\{HTTP_HOST\} \^ag-grid\\\.com\$ \[NC\]\s*\n\s*RewriteRule \^\(\.\*\)\$ https:\/\/www\.ag-grid\.com\/\$1/
            );
            expect(match).not.toBeNull();
        });

        it('should not redirect www.ag-grid.com (only bare domain)', () => {
            const nonWwwCond = productionContent.match(/RewriteCond %\{HTTP_HOST\} \^ag-grid\\\.com\$/);
            expect(nonWwwCond).not.toBeNull();
        });
    });

    describe('AG-17136 / SE-26: Phase 1 subdomain 301 redirects', () => {
        const phase1Subdomains = [
            'angulargrid.ag-grid.com',
            'angular-grid.ag-grid.com',
            'javascript-grid.ag-grid.com',
            'react-grid.ag-grid.com',
        ];

        for (const subdomain of phase1Subdomains) {
            it(`should redirect ${subdomain} to www.ag-grid.com`, () => {
                const escapedInHtaccess = subdomain.replace(/\./g, '\\.');
                expect(productionContent).toContain(escapedInHtaccess);
                expect(productionContent).toContain('https://www.ag-grid.com/$1 [R=301,L]');
            });

            it(`should redirect all paths for ${subdomain} (not just root)`, () => {
                const lines = productionContent.split('\n');
                const escapedInHtaccess = subdomain.replace(/\./g, '\\.');
                const condIndex = lines.findIndex((l) => l.includes(escapedInHtaccess));
                expect(condIndex).toBeGreaterThan(-1);
                const ruleLineIndex = condIndex + 1;
                expect(lines[ruleLineIndex]).toContain('^(.*)$');
            });
        }
    });

    describe('AG-17133: Security headers', () => {
        it('should include Referrer-Policy header', () => {
            expect(productionContent).toContain('Referrer-Policy');
            expect(productionContent).toContain('strict-origin-when-cross-origin');
        });

        it('should include Permissions-Policy header', () => {
            expect(productionContent).toContain('Permissions-Policy');
            expect(productionContent).toContain('geolocation=(), microphone=(), camera=()');
        });

        it('should NOT include X-Frame-Options header directive (replaced by CSP frame-ancestors)', () => {
            expect(productionContent).not.toMatch(/Header\s+.*set\s+X-Frame-Options/);
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
            // Staging carries the no-cache document rule but no max-age of any kind.
            expect(stagingContent).not.toContain('max-age');
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

        it('should scope it to HTML documents, not assets', () => {
            expect(getNoCacheRule(productionContent)).toContain('%{CONTENT_TYPE} =~ m#^text/html#');
        });

        it('should exclude archived versions, which are immutable', () => {
            const rule = getNoCacheRule(productionContent);
            expect(rule).toContain('!(');
            expect(rule).toContain('archive/[0-9]');
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
        // A released archive keeps its long heuristic cache. One under test is redeployed for
        // days and fixes must appear within minutes, so it has to be excluded from that.
        const ruleFor = (versions: string[]) => getInFlightArchiveRules(versions).trim();

        it('emits nothing when no archive is in flight', () => {
            expect(getInFlightArchiveRules([])).toBe('');
        });

        it('is empty by default, so a stale entry cannot silently suppress caching', () => {
            expect(UNCACHED_ARCHIVES).toEqual([]);
            expect(productionContent).not.toContain('Release archives under test');
        });

        it('escapes dots so the version matches literally', () => {
            // Unescaped, 36.2.0 would also match 36X2X0.
            expect(ruleFor(['36.2.0'])).toContain('archive/36\\.2\\.0/#');
            expect(ruleFor(['36.2.0'])).not.toContain('archive/36.2.0/#');
        });

        it('covers the charts and studio archive roots', () => {
            expect(ruleFor(['36.2.0'])).toContain('^/(charts/|studio/)?archive/');
        });

        it('uses no-cache, not no-store, so revalidation is a cheap 304', () => {
            expect(ruleFor(['36.2.0'])).toContain('Cache-Control "no-cache"');
            expect(ruleFor(['36.2.0'])).not.toContain('no-store');
        });

        it('emits one rule per in-flight version', () => {
            const rule = ruleFor(['36.2.0', '37.0.0']);
            expect(rule.match(/Header set Cache-Control/g)).toHaveLength(2);
            expect(rule).toContain('archive/36\\.2\\.0/#');
            expect(rule).toContain('archive/37\\.0\\.0/#');
        });

        it('is emitted after the hashed-asset rule, so it wins for in-flight assets', () => {
            // It must override BOTH the document rule (which excludes archives) and the 7-day
            // asset cache, or a tester keeps stale assets for the whole cycle. With the list
            // empty the rule itself is absent, so assert the slot: the asset rule is emitted
            // before mod_deflate, and the in-flight rule sits between them.
            const lines = productionContent.split('\n');
            const assetAt = lines.findIndex((l) => l.includes('max-age=604800'));
            const deflateAt = lines.findIndex((l) => l.includes('<IfModule mod_deflate.c>'));
            expect(assetAt).toBeGreaterThan(-1);
            expect(deflateAt).toBeGreaterThan(assetAt);
        });

        it('applies to staging too, where release testing happens', () => {
            // Staging has no long-cache rule, but its document rule also excludes archives,
            // so an in-flight archive would otherwise keep heuristic caching there as well.
            const staging = getHtaccessContent({ env: 'staging' });
            expect(staging).toContain('no-cache');
        });
    });

    describe('SE-81: agent-useful Link header', () => {
        it('should include a Link header pointing at llms.txt, the sitemap index and the MCP server', () => {
            expect(productionContent).toContain('Header set Link');
            expect(productionContent).toContain('</llms.txt>; rel=describedby');
            expect(productionContent).toContain('</sitemap-index.xml>; rel=sitemap');
            expect(productionContent).toContain(
                '<https://www.ag-grid.com/javascript-data-grid/mcp-server/>; rel=related'
            );
        });

        it('should scope the Link header to successful HTML documents (not assets, redirects or errors)', () => {
            const linkLine = productionContent.split('\n').find((l) => l.includes('set Link'));
            expect(linkLine).toBeDefined();
            // Not `always` (so it is skipped on error responses), and guarded by an expr that
            // requires both a 200 status and an HTML content-type. The status check is what
            // keeps it off the custom text/html 404 page (whose content-type alone would match).
            expect(linkLine).not.toContain('always set Link');
            expect(linkLine).toContain('"expr=%{REQUEST_STATUS} == 200 && %{CONTENT_TYPE} =~ m#^text/html#"');
        });

        it('should include the Link header on staging too so it can be verified before production', () => {
            expect(stagingContent).toContain('Header set Link');
            expect(stagingContent).toContain('</llms.txt>; rel=describedby');
            expect(stagingContent).toContain('"expr=%{REQUEST_STATUS} == 200 && %{CONTENT_TYPE} =~ m#^text/html#"');
        });
    });

    describe('AG-17152: /charts/ framework overview redirects', () => {
        const chartsFrameworkRedirects = [
            { from: '^/javascript-charts', to: 'charts/javascript/quick-start/' },
            { from: '^/angular-charts', to: 'charts/angular/quick-start/' },
            { from: '^/react-charts', to: 'charts/react/quick-start/' },
            { from: '^/vue-charts', to: 'charts/vue/quick-start/' },
        ];

        for (const { from, to } of chartsFrameworkRedirects) {
            it(`should have a server-side 301 for ${from} -> ${to}`, () => {
                const matchingRedirect = SITE_301_REDIRECTS.find(
                    (r) => 'fromPattern' in r && (r as any).fromPattern.includes(from.replace('^', ''))
                );
                expect(matchingRedirect).toBeDefined();
                expect((matchingRedirect as any).to).toContain(to);
            });
        }

        const docChartsRedirects = [
            { from: '^/documentation/javascript/charts', to: 'charts/javascript/quick-start/' },
            { from: '^/documentation/angular/charts', to: 'charts/angular/quick-start/' },
            { from: '^/documentation/react/charts', to: 'charts/react/quick-start/' },
            { from: '^/documentation/vue/charts', to: 'charts/vue/quick-start/' },
        ];

        for (const { from, to } of docChartsRedirects) {
            it(`should have a server-side 301 for ${from} -> ${to}`, () => {
                const matchingRedirect = SITE_301_REDIRECTS.find(
                    (r) => 'fromPattern' in r && (r as any).fromPattern.includes(from.replace('^', ''))
                );
                expect(matchingRedirect).toBeDefined();
                expect((matchingRedirect as any).to).toContain(to);
            });
        }

        it('should render charts redirects as RedirectMatch 301 in the generated htaccess', () => {
            expect(productionContent).toContain('RedirectMatch 301');
            expect(productionContent).toContain('javascript-charts');
        });
    });

    describe('AG-17157: noindex for archive paths', () => {
        it('should have redirect rules for /archive paths', () => {
            const archiveRedirects = SITE_301_REDIRECTS.filter(
                (r) => 'fromPattern' in r && (r as any).fromPattern.includes('archive')
            );
            expect(archiveRedirects.length).toBeGreaterThan(0);
        });
    });

    describe('htaccess quality: redundant directives', () => {
        it('should have only one RewriteEngine On directive', () => {
            const matches = productionContent.match(/RewriteEngine On/g);
            expect(matches).not.toBeNull();
            expect(matches!.length).toBe(1);
        });
    });

    describe('htaccess quality: HTTPS redirect scoping', () => {
        it('should scope the HTTPS redirect to www/bare domain only', () => {
            const lines = productionContent.split('\n');
            const httpsRuleIndex = lines.findIndex((l) => l.includes('RewriteCond %{SERVER_PORT} 80'));
            expect(httpsRuleIndex).toBeGreaterThan(-1);
            const hostCondIndex = lines.findIndex(
                (l, i) =>
                    i >= httpsRuleIndex - 3 &&
                    i <= httpsRuleIndex + 3 &&
                    l.includes('HTTP_HOST') &&
                    (l.includes('ag-grid') || l.includes('www'))
            );
            expect(hostCondIndex).toBeGreaterThan(-1);
        });
    });

    describe('htaccess quality: angulargrid.com redirect', () => {
        it('should use HTTPS for angulargrid.com redirect', () => {
            const lines = productionContent.split('\n');
            const angulargridCondIndex = lines.findIndex(
                (l) => l.includes('angulargrid\\.com') && !l.includes('.ag-grid.com')
            );
            expect(angulargridCondIndex).toBeGreaterThan(-1);
            const nextRuleLine = lines.slice(angulargridCondIndex).find((l) => l.includes('RewriteRule'));
            expect(nextRuleLine).toBeDefined();
            expect(nextRuleLine).toContain('https://www.ag-grid.com');
            expect(nextRuleLine).not.toContain('http\\:');
        });

        it('should redirect all paths for angulargrid.com (not just root)', () => {
            const lines = productionContent.split('\n');
            const angulargridCondIndex = lines.findIndex(
                (l) => l.includes('angulargrid\\.com') && !l.includes('.ag-grid.com')
            );
            expect(angulargridCondIndex).toBeGreaterThan(-1);
            const nextRuleLine = lines.slice(angulargridCondIndex).find((l) => l.includes('RewriteRule'));
            expect(nextRuleLine).toBeDefined();
            expect(nextRuleLine).toContain('^(.*)$');
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
            // present. Staging gets no max-age so testers never hit a stale asset.
            expect(productionContent).toContain('max-age=604800');
            expect(stagingContent).not.toContain('max-age');
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

        it('does not keep a react-only bullet-series entry in the single-hop data (moved to the charts mirror)', () => {
            const reactBullet = SITE_SINGLE_HOP_REWRITES.filter((r) => r.from.includes('bullet-series'));
            expect(reactBullet).toEqual([]);
        });
    });

    describe('SE-66: charts-subdir semantic redirects mirrored into the docroot', () => {
        // The /charts subdir (ag-charts-website repo) owns these semantic redirects, but it only runs
        // after the docroot normalises host/slash — so they are mirrored here to collapse to ONE hop.
        // Assertions cover a representative rule per family; the full block is guarded by the snapshot.

        it('collapses bullet-series to linear-gauge for every framework, with [NE] and the correct anchor', () => {
            // #bullet-series (no trailing slash) — the id generated by the "## Bullet Series" heading;
            // the previous react-only rule used the broken "#bullet-series/". [NE] keeps the # verbatim.
            expect(productionContent).toContain(
                'RewriteRule "^/?charts/(javascript|angular|react|vue)/bullet-series/?$" "https://www.ag-grid.com/charts/$1/linear-gauge/#bullet-series" [R=301,NE,L]'
            );
            expect(productionContent).not.toContain('linear-gauge/#bullet-series/');
        });

        it('mirrors the fonts, landing, backreference, catch-all and aggregate-index families', () => {
            expect(productionContent).toContain(
                'RewriteRule "^/?charts/(javascript|angular|react|vue)/fonts/?$" "https://www.ag-grid.com/charts/$1/text/" [R=301,L]'
            );
            expect(productionContent).toContain(
                'RewriteRule "^/?charts/(javascript|angular|react|vue)/?$" "https://www.ag-grid.com/charts/$1/quick-start/" [R=301,L]'
            );
            expect(productionContent).toContain(
                'RewriteRule "^/?charts/react-charts/react/(.+?)/?$" "https://www.ag-grid.com/charts/react/$1/" [R=301,L]'
            );
            expect(productionContent).toContain(
                'RewriteRule "^/?charts/(javascript|angular|react|vue)/series(/.*)?$" "https://www.ag-grid.com/charts/$1/bar-series/" [R=301,L]'
            );
        });

        it('does NOT mirror /charts/privacy (unresolved 410-vs-301, left to the charts subdir)', () => {
            expect(productionContent).not.toContain('"^/?charts/privacy(/.*)?$"');
        });

        it('orders the enterprise-charts/react backreference before the enterprise-charts catch-all', () => {
            // charts repo is first-match-wins: the specific /react/(.+) must win over the broad catch-all.
            const specific = productionContent.indexOf('"^/?charts/enterprise-charts/react/(.+?)/?$"');
            const catchAll = productionContent.indexOf('"^/?charts/enterprise-charts/(?!index\\.html$).+$"');
            expect(specific).toBeGreaterThan(-1);
            expect(catchAll).toBeGreaterThan(specific);
        });

        it('host-scopes the whole chain-shortening block, with an exact [S] skip count', () => {
            // The single-hops + mirror + add-slash all rewrite to the canonical www host, so a host
            // guard skips them for charts.ag-grid.com / studio.ag-grid.com. The [S] count MUST equal
            // the number of RewriteRules it guards — overshoot would also skip the host canonicalisation
            // rules (breaking the phase-1 subdomain redirects), undershoot would leak the chain-shortening.
            const lines = productionContent.split('\n');
            const guardIdx = lines.findIndex((l) => /RewriteRule \^ - \[S=\d+\]/.test(l));
            expect(guardIdx).toBeGreaterThan(-1);
            expect(lines[guardIdx - 1]).toContain('RewriteCond %{HTTP_HOST} !^(www\\.)?ag-grid\\.com$ [NC]');

            const skip = Number(lines[guardIdx].match(/\[S=(\d+)\]/)![1]);
            // The guarded span ends just before the https-upgrade host-swap (first `-> www/$1` rule).
            const hostSwapIdx = lines.findIndex(
                (l, i) => i > guardIdx && l.includes('https://www.ag-grid.com/$1 [R=301,L]')
            );
            expect(hostSwapIdx).toBeGreaterThan(guardIdx);
            const guardedRuleCount = lines
                .slice(guardIdx + 1, hostSwapIdx)
                .filter((l) => /^\s*RewriteRule /.test(l)).length;
            expect(skip).toBe(guardedRuleCount);
        });
    });

    describe('SE-66 follow-up: no-slash /charts/* pages resolve in a single hop', () => {
        it('emits a general single-hop rewrite that adds the trailing slash for any no-slash /charts/* path', () => {
            expect(productionContent).toContain(
                'RewriteRule "^/?(charts/.+[^/])$" "https://www.ag-grid.com/$1/" [R=301,L]'
            );
        });

        it('guards the general charts rewrite so real files (dot in the last segment) are left alone', () => {
            const lines = productionContent.split('\n');
            const ruleIndex = lines.findIndex((l) => l.includes('"^/?(charts/.+[^/])$"'));
            expect(ruleIndex).toBeGreaterThan(0);
            expect(lines[ruleIndex - 1]).toContain('RewriteCond %{REQUEST_URI} /+[^.]+$');
        });

        it('runs the charts semantic mirror before the general add-slash, and both before the host-swap', () => {
            // Ordering is load-bearing: the semantic mirror (divergent targets, e.g. bullet-series) must
            // win over the general add-slash rule ([L]), and both must precede the apex/www host-swap so
            // the whole thing resolves in ONE hop.
            const mirror = productionContent.indexOf('"^/?charts/(javascript|angular|react|vue)/bullet-series/?$"');
            const general = productionContent.indexOf('"^/?(charts/.+[^/])$"');
            const hostSwap = productionContent.indexOf('RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]');
            expect(mirror).toBeGreaterThan(-1);
            expect(general).toBeGreaterThan(mirror);
            expect(hostSwap).toBeGreaterThan(general);
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
            const match = content.match(/<If "%\{REQUEST_URI\} =~ m#\^\/\(\?:(.+)\)\/\?\$#/);
            expect(match).not.toBeNull();
            return new RegExp(`^/(?:${match![1]})/?$`);
        };

        // One representative URL per group in the registry. Every URL in the sitemap must
        // negotiate, so a group added without a matching pattern shows up here.
        const negotiablePaths = [
            '/react-data-grid/cell-editing/',
            '/javascript-data-grid/getting-started/',
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
            '/react-data-grid/', // framework landing page, redirect stub
            '/react-data-grid/errors/123/', // sitemap-excluded
            '/data-grid/cell-editing/', // framework-agnostic redirect stub
            '/contact/success/', // form result, sitemap-excluded
            '/privacy/your-choice/', // opt-out confirmation, robots-disallowed and sitemap-excluded
            '/examples/cell-editing/component-editor/reactFunctionalTs/',
            '/debug/files/',
            '/sitemap-0.xml',
            '/sitemap-index.xml',
        ];

        it('serves the per-page .md variant when Accept: text/markdown, gated by an on-disk check', () => {
            expect(productionContent).toContain('RewriteCond %{HTTP_ACCEPT} text/markdown');
            expect(productionContent).toContain('RewriteCond %{DOCUMENT_ROOT}/%1.md -f');
            expect(productionContent).toContain('RewriteRule ^ /%1.md [L]');
        });

        it('applies the same negotiation rules on staging, in its own mod_rewrite block', () => {
            // Staging has no redirect rewrites, so negotiation gets a dedicated block.
            expect(stagingContent).toContain('mod_rewrite.c');
            expect(stagingContent).toContain('RewriteEngine On');
            expect(stagingContent).toContain('RewriteCond %{HTTP_ACCEPT} text/markdown');
            expect(stagingContent).toContain('RewriteRule ^ /%1.md [L]');
            // Both envs must negotiate exactly the same set of paths.
            expect(extractNegotiationPattern(stagingContent).source).toBe(
                extractNegotiationPattern(productionContent).source
            );
        });

        it('runs the negotiation before the trailing-slash 301 so the canonical URL negotiates in one hop', () => {
            const negotiationIndex = productionContent.indexOf('RewriteRule ^ /%1.md [L]');
            const trailingSlashIndex = productionContent.indexOf('# Add trailing slash for directories');
            expect(negotiationIndex).toBeGreaterThan(-1);
            expect(trailingSlashIndex).toBeGreaterThan(-1);
            expect(negotiationIndex).toBeLessThan(trailingSlashIndex);
        });

        it('negotiates every page group in the registry, with and without a trailing slash', () => {
            const pattern = extractNegotiationPattern(productionContent);
            for (const path of negotiablePaths) {
                expect(pattern.test(path), `${path} should negotiate`).toBe(true);
                expect(pattern.test(path.replace(/\/$/, '')), `${path} (no trailing slash)`).toBe(true);
            }
        });

        it('leaves pages without a .md twin untouched', () => {
            const pattern = extractNegotiationPattern(productionContent);
            for (const path of nonNegotiablePaths) {
                expect(pattern.test(path), `${path} should not negotiate`).toBe(false);
            }
        });

        it('captures the page path in %1 so the -f guard and rewrite target resolve to /<page>.md', () => {
            const pattern = extractNegotiationPattern(productionContent);
            // %1 is the first capture group, reused as `%1.md` in both the guard and the target.
            expect('/community/events/'.match(pattern)?.[1]).toBe('community/events');
            expect('/react-data-grid/cell-editing/'.match(pattern)?.[1]).toBe('react-data-grid/cell-editing');
            expect('/license-pricing'.match(pattern)?.[1]).toBe('license-pricing');
        });

        it('adds Vary: Accept for exactly the negotiated paths (both envs) so shared caches key on the negotiated representation', () => {
            for (const content of [productionContent, stagingContent]) {
                expect(content).toContain('Header append Vary Accept');
                // The Vary scope must cover the negotiated set exactly — narrower and a cache
                // could serve markdown to a browser; wider and unrelated pages lose cache keying.
                const varyPattern = extractVaryPattern(content);
                for (const path of negotiablePaths) {
                    expect(varyPattern.test(path), `${path} should carry Vary: Accept`).toBe(true);
                }
                for (const path of nonNegotiablePaths) {
                    expect(varyPattern.test(path), `${path} should not carry Vary: Accept`).toBe(false);
                }
                expect(content).toContain(`%{REQUEST_URI} == '/'`);
            }
        });

        it('negotiates the homepage (/) to /index.md via a dedicated stanza in both envs', () => {
            // The homepage twin is a separate stanza: the root URL has no path segment to capture.
            const homepageNegotiationRules = [
                'RewriteCond %{REQUEST_URI} ^/$',
                'RewriteCond %{DOCUMENT_ROOT}/index.md -f',
                'RewriteRule ^ /index.md [L]',
            ];
            for (const content of [productionContent, stagingContent]) {
                for (const rule of homepageNegotiationRules) {
                    expect(content).toContain(rule);
                }
            }
        });

        it('registers the markdown MIME type so the .md files are served as text/markdown', () => {
            expect(productionContent).toContain('AddType text/markdown md');
            expect(stagingContent).toContain('AddType text/markdown md');
        });

        it('serves .md as UTF-8 so table glyphs (✓/✗) are not mojibaked', () => {
            expect(productionContent).toContain('AddCharset utf-8 .md');
            expect(stagingContent).toContain('AddCharset utf-8 .md');
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
