import astroPackageJson from 'astro/package.json';
import { createHash } from 'node:crypto';

import { DARK_MODE_INIT_SCRIPT, KBD_PLATFORM_INIT_SCRIPT, PLAUSIBLE_INIT_SCRIPT } from '../csp/inlineScripts';
import {
    ASTRO_HYDRATION_HASHES_VERIFIED_FOR,
    BRANCH_BUILDS_PATH_CONDITION,
    CAMPAIGNS_PATH_CONDITION,
    CAMPAIGNS_PATH_REGEXP,
    ECOMMERCE_PATH_CONDITION,
    EXAMPLES_PATH_REGEXP,
    getBranchBuildsCspIfOverride,
    getCspDirectives,
    getScopedCspHtaccessBlock,
} from './cspRules';

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
            const scopes = ['site', 'examples', 'campaigns', 'ecommerce'] as const;
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

    describe('ecommerce scope (AG-17134: separately-managed checkout SPA)', () => {
        it("re-allows 'unsafe-inline' and 'unsafe-eval' in script-src without hashes", () => {
            const scriptSrc = getCspDirectives({ env: 'production', scope: 'ecommerce' })['script-src'];
            expect(scriptSrc).toContain("'unsafe-inline'");
            // Part of the app eval-compiles at runtime; hash routing keeps it in this scope.
            expect(scriptSrc).toContain("'unsafe-eval'");
            // A hash would make the browser ignore 'unsafe-inline', re-blocking the scripts.
            expect(hasHash(scriptSrc)).toBe(false);
        });

        it('differs from the site scope only in script-src', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            const ecommerce = getCspDirectives({ env: 'production', scope: 'ecommerce' });

            expect(Object.keys(ecommerce)).toEqual(Object.keys(site));
            const otherNames = Object.keys(site).filter((name) => name !== 'script-src');
            for (let i = 0, len = otherNames.length; i < len; ++i) {
                expect(ecommerce[otherNames[i]]).toEqual(site[otherNames[i]]);
            }
        });

        it('matches only paths under /ecommerce/', () => {
            const matches = (uri: string) =>
                new RegExp(ECOMMERCE_PATH_CONDITION.replace('%{REQUEST_URI} =~ m#', '').replace(/#$/, '')).test(uri);
            expect(matches('/ecommerce/')).toBe(true);
            expect(matches('/ecommerce/#/ecommerce/')).toBe(true);
            expect(matches('/getting-started/')).toBe(false);
            expect(EXAMPLES_PATH_REGEXP.test('/ecommerce/')).toBe(false);
        });
    });

    describe('RTI-3353: campaigns path matching covers archived campaign pages', () => {
        // The live campaign page and its archived snapshots both embed the Bryntum
        // demo, so both must resolve to the campaigns scope. An archived campaign path
        // matches EXAMPLES_PATH_REGEXP too (it lives under /archive/), so the middleware
        // resolvers test campaigns first — these assertions pin the matchers down.
        it('matches the live and archived campaign pages', () => {
            expect(CAMPAIGNS_PATH_REGEXP.test('/campaigns/bryntum-gantt/')).toBe(true);
            expect(CAMPAIGNS_PATH_REGEXP.test('/archive/36.0.0/campaigns/bryntum-gantt/')).toBe(true);
        });

        it('does not match plain archived doc pages (they stay on the examples scope)', () => {
            expect(CAMPAIGNS_PATH_REGEXP.test('/archive/36.0.0/getting-started/')).toBe(false);
            // ...which the examples scope still covers.
            expect(EXAMPLES_PATH_REGEXP.test('/archive/36.0.0/getting-started/')).toBe(true);
        });

        it('archived campaign paths match both regexps, so campaigns must take precedence', () => {
            const archivedCampaign = '/archive/36.0.0/campaigns/bryntum-gantt/';
            expect(CAMPAIGNS_PATH_REGEXP.test(archivedCampaign)).toBe(true);
            expect(EXAMPLES_PATH_REGEXP.test(archivedCampaign)).toBe(true);
        });

        it('the Apache condition string carries the optional /archive/<version> prefix', () => {
            expect(CAMPAIGNS_PATH_CONDITION).toContain('/archive/');
            expect(CAMPAIGNS_PATH_CONDITION).toContain('/campaigns/');
        });
    });

    describe("AG-17134 Phase B: script-src 'unsafe-inline' removed from the site scope", () => {
        it('site scope authorises the inline scripts by hash, not unsafe-inline', () => {
            const scriptSrc = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(scriptSrc).not.toContain("'unsafe-inline'");
            expect(scriptSrc).toContain(sha256Source(DARK_MODE_INIT_SCRIPT));
            expect(scriptSrc).toContain(sha256Source(PLAUSIBLE_INIT_SCRIPT));
            expect(scriptSrc).toContain(sha256Source(KBD_PLATFORM_INIT_SCRIPT));
        });

        it('site scope authorises the (non-externalisable) Astro hydration scripts by hash', () => {
            // Every site inline script we author is externalised to a 'self' bundle;
            // only Astro's framework-injected hydration scripts remain, pinned by hash
            // (see ASTRO_HYDRATION_SCRIPT_HASHES). Regenerate these when bumping Astro.
            const scriptSrc = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(scriptSrc).toContain("'sha256-BrDhGE1lwa85arfXcrBxSo+n37uVSX5CAROXnIM6Q+g='"); // <astro-island> runtime
            expect(scriptSrc).toContain("'sha256-QzWFZi+FLIx23tnm9SBU4aEgx4x8DsuASP07mfqol/c='"); // client:load
            expect(scriptSrc).toContain("'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw='"); // client:idle
        });

        it('site scope authorises the GTM-injected ZoomInfo bootstrap by hash', () => {
            // Authored in the shared GTM container (not this repo); hash captured from
            // the browser CSP violation. Site only — examples keeps unsafe-inline.
            const site = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(site).toContain("'sha256-41l+jvtOjBgKy9345IStB4j1gGPGFMVXADMHn1Acs6E='");
            const examples = getCspDirectives({ env: 'production', scope: 'examples' })['script-src'];
            expect(examples).not.toContain("'sha256-41l+jvtOjBgKy9345IStB4j1gGPGFMVXADMHn1Acs6E='");
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

        it('Astro hydration-script hashes are still verified for the installed Astro version', () => {
            // The 'site' policy pins Astro's framework-injected hydration-runtime
            // script hashes (ASTRO_HYDRATION_SCRIPT_HASHES). Astro emits and minifies
            // these, so an upgrade can change them — leaving the pinned hashes stale
            // and (once the CSP is enforced) blocking hydration across the whole site.
            //
            // This test fails when Astro is upgraded so the staleness is caught here
            // rather than in production. To fix it, regenerate the hashes and bump the
            // version — see the "HOW TO REGENERATE AFTER AN ASTRO UPGRADE" steps above
            // ASTRO_HYDRATION_SCRIPT_HASHES in cspRules.ts:
            //   1. yarn nx build ag-grid-docs
            //   2. yarn nx run ag-grid-docs:preview:csp
            //   3. load the homepage + a page per client: directive; blocked inline
            //      scripts log their missing 'sha256-...' hashes in the console.
            //   4. update ASTRO_HYDRATION_SCRIPT_HASHES and ASTRO_HYDRATION_HASHES_VERIFIED_FOR.
            expect(astroPackageJson.version).toBe(ASTRO_HYDRATION_HASHES_VERIFIED_FOR);
        });
    });

    describe('AG-17134: /branch-builds/ CSP exemption (staging-only)', () => {
        it('matches only paths under /branch-builds/', () => {
            const matches = (uri: string) =>
                new RegExp(BRANCH_BUILDS_PATH_CONDITION.replace('%{REQUEST_URI} =~ m#', '').replace(/#$/, '')).test(
                    uri
                );
            expect(matches('/branch-builds/')).toBe(true);
            expect(matches('/branch-builds/my-branch/getting-started/')).toBe(true);
            // A branch build's own /examples/ paths live under /branch-builds/, so they
            // must NOT be picked up by the site-wide examples/campaigns conditions.
            expect(EXAMPLES_PATH_REGEXP.test('/branch-builds/my-branch/examples/foo/')).toBe(false);
            expect(CAMPAIGNS_PATH_REGEXP.test('/branch-builds/my-branch/campaigns/bryntum-gantt/')).toBe(false);
            expect(matches('/getting-started/')).toBe(false);
        });

        it('unsets the CSP header without re-setting one (no policy served)', () => {
            const block = getBranchBuildsCspIfOverride('enforce');
            expect(block).toContain(`<If "${BRANCH_BUILDS_PATH_CONDITION}">`);
            expect(block).toContain('Header always unset Content-Security-Policy');
            // Exempt, not scoped: nothing is re-set inside the override.
            expect(block).not.toContain('Header always set Content-Security-Policy');
        });

        it('clears the header form matching the mode', () => {
            expect(getBranchBuildsCspIfOverride('report-only')).toContain(
                'Header always unset Content-Security-Policy-Report-Only'
            );
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

        it("emits an /ecommerce/ <If> override allowing 'unsafe-inline' and 'unsafe-eval'", () => {
            const block = getScopedCspHtaccessBlock({ env: 'production' }, 'enforce');
            const start = block.indexOf(`<If "${ECOMMERCE_PATH_CONDITION}">`);
            expect(start).toBeGreaterThan(-1);
            const ifBlock = block.slice(start, block.indexOf('</If>', start));
            expect(ifBlock).toContain("'unsafe-inline'");
            expect(ifBlock).toContain("'unsafe-eval'");
        });
    });
});
