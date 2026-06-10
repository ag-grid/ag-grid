import { getHtaccessContent } from './htaccessRules';
import { SITE_301_REDIRECTS } from './redirects';

describe('htaccessRules', () => {
    let productionContent: string;
    let stagingContent: string;

    beforeAll(() => {
        productionContent = getHtaccessContent({ env: 'production' });
        stagingContent = getHtaccessContent({ env: 'staging' });
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

        it('should include CSP in both environments', () => {
            expect(productionContent).toContain('Content-Security-Policy');
            expect(stagingContent).toContain('Content-Security-Policy');
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
