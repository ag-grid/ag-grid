import {
    BRANCH_BUILDS_PATH_CONDITION,
    CAMPAIGNS_PATH_CONDITION,
    ECOMMERCE_PATH_CONDITION,
    EXAMPLES_PATH_CONDITION,
} from './cspRules';
import { PRODUCTION_CSP_PHASE, getHtaccessContent } from './htaccessRules';
import { SITE_301_REDIRECTS } from './redirects';

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
        it('should include mod_rewrite rules in production only', () => {
            expect(productionContent).toContain('mod_rewrite.c');
            expect(stagingContent).not.toContain('mod_rewrite.c');
        });

        it('should include mod_expires rules in production only', () => {
            expect(productionContent).toContain('mod_expires.c');
            expect(stagingContent).not.toContain('mod_expires.c');
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
