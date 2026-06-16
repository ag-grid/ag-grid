import { createHash } from 'node:crypto';

import { DARK_MODE_INIT_SCRIPT, PLAUSIBLE_INIT_SCRIPT } from '../csp/inlineScripts';
import { CAMPAIGNS_PATH_CONDITION, getCspDirectives, getScopedCspHtaccessBlock } from './cspRules';

const sha256Source = (source: string) => `'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`;
const hasHash = (sources: string[]) => sources.some((s) => s.startsWith("'sha256-"));

describe('cspRules', () => {
    describe('scope', () => {
        it("site scope omits 'unsafe-eval' from script-src", () => {
            const directives = getCspDirectives({ env: 'production', scope: 'site' });
            expect(directives['script-src']).not.toContain("'unsafe-eval'");
        });

        it("examples scope includes 'unsafe-eval' in script-src", () => {
            const directives = getCspDirectives({ env: 'production', scope: 'examples' });
            expect(directives['script-src']).toContain("'unsafe-eval'");
        });

        it("both scopes include 'wasm-unsafe-eval' for browser-side Shiki highlighting", () => {
            // Narrower than 'unsafe-eval'; the site scope relies on it for WASM.
            expect(getCspDirectives({ env: 'production', scope: 'site' })['script-src']).toContain(
                "'wasm-unsafe-eval'"
            );
            expect(getCspDirectives({ env: 'production', scope: 'examples' })['script-src']).toContain(
                "'wasm-unsafe-eval'"
            );
        });

        it('defaults to site scope', () => {
            expect(getCspDirectives({ env: 'production' })).toEqual(
                getCspDirectives({ env: 'production', scope: 'site' })
            );
        });

        it('site and examples scopes differ only in script-src', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            const examples = getCspDirectives({ env: 'production', scope: 'examples' });

            expect(Object.keys(examples)).toEqual(Object.keys(site));
            const otherNames = Object.keys(site).filter((name) => name !== 'script-src');
            for (let i = 0, len = otherNames.length; i < len; ++i) {
                expect(examples[otherNames[i]]).toEqual(site[otherNames[i]]);
            }
        });

        it("style-src keeps 'unsafe-inline' in every scope", () => {
            const scopes = ['site', 'examples', 'campaigns'] as const;
            for (let i = 0, len = scopes.length; i < len; ++i) {
                expect(getCspDirectives({ env: 'production', scope: scopes[i] })['style-src']).toContain(
                    "'unsafe-inline'"
                );
            }
        });
    });

    describe('campaigns scope (AG-17134: Bryntum partnership pages)', () => {
        it('adds the bryntum.com origin to script/style/font/connect-src', () => {
            const campaigns = getCspDirectives({ env: 'production', scope: 'campaigns' });
            expect(campaigns['script-src']).toContain('https://bryntum.com');
            expect(campaigns['style-src']).toContain('https://bryntum.com');
            expect(campaigns['font-src']).toContain('https://bryntum.com');
            expect(campaigns['connect-src']).toContain('https://bryntum.com');
        });

        it("does not add 'unsafe-eval' (Bryntum hosts only, no eval)", () => {
            const campaigns = getCspDirectives({ env: 'production', scope: 'campaigns' });
            expect(campaigns['script-src']).not.toContain("'unsafe-eval'");
        });

        it('adds bryntum.com to style/font/connect-src on top of the site scope', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            const campaigns = getCspDirectives({ env: 'production', scope: 'campaigns' });

            const broadened = ['style-src', 'font-src', 'connect-src'];
            for (let i = 0, len = broadened.length; i < len; ++i) {
                expect(campaigns[broadened[i]]).toEqual([...site[broadened[i]], 'https://bryntum.com']);
            }
            // directives neither scope touches stay identical
            expect(campaigns['frame-src']).toEqual(site['frame-src']);
            expect(campaigns['form-action']).toEqual(site['form-action']);
        });
    });

    describe("AG-17134 Phase B: script-src 'unsafe-inline' removed from the site scope", () => {
        it('site scope authorises the inline scripts by hash, not unsafe-inline', () => {
            const scriptSrc = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(scriptSrc).not.toContain("'unsafe-inline'");
            expect(scriptSrc).toContain(sha256Source(DARK_MODE_INIT_SCRIPT));
            expect(scriptSrc).toContain(sha256Source(PLAUSIBLE_INIT_SCRIPT));
        });

        it('examples and campaigns keep unsafe-inline and carry no hashes', () => {
            const scopes = ['examples', 'campaigns'] as const;
            for (let i = 0, len = scopes.length; i < len; ++i) {
                const scriptSrc = getCspDirectives({ env: 'production', scope: scopes[i] })['script-src'];
                expect(scriptSrc).toContain("'unsafe-inline'");
                expect(hasHash(scriptSrc)).toBe(false);
            }
        });

        it('dev site keeps unsafe-inline (no hashes) for Vite/Astro HMR', () => {
            const scriptSrc = getCspDirectives({ env: 'dev', scope: 'site' })['script-src'];
            expect(scriptSrc).toContain("'unsafe-inline'");
            expect(hasHash(scriptSrc)).toBe(false);
        });
    });

    describe('getScopedCspHtaccessBlock', () => {
        it('enforce mode unsets and re-sets the enforced header inside the <If> override', () => {
            const block = getScopedCspHtaccessBlock({ env: 'production' }, 'enforce');
            const ifIndex = block.indexOf('<If');
            expect(ifIndex).toBeGreaterThan(-1);
            const ifBlock = block.slice(ifIndex);
            expect(ifBlock).toContain('Header always unset Content-Security-Policy\n');
            expect(ifBlock).toContain('Header always set Content-Security-Policy "');
        });

        it('report-only mode never unsets the enforced header', () => {
            const block = getScopedCspHtaccessBlock({ env: 'production' }, 'report-only');
            const lines = block.split('\n');
            const enforcedUnset = lines.find((l) => l.trim() === 'Header always unset Content-Security-Policy');
            expect(enforcedUnset).toBeUndefined();
            expect(block).not.toContain('Header always set Content-Security-Policy "');
            expect(block).toContain('Header always set Content-Security-Policy-Report-Only "');
        });

        it('emits a /campaigns/ <If> override allowing bryntum.com without unsafe-eval', () => {
            const block = getScopedCspHtaccessBlock({ env: 'production' }, 'enforce');
            const campaignsIfOpen = `<If "${CAMPAIGNS_PATH_CONDITION}">`;
            const start = block.indexOf(campaignsIfOpen);
            expect(start).toBeGreaterThan(-1);
            const ifBlock = block.slice(start, block.indexOf('</If>', start));
            expect(ifBlock).toContain('https://bryntum.com');
            expect(ifBlock).not.toContain("'unsafe-eval'");
        });
    });
});
