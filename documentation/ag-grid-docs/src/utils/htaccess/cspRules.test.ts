import astroPackageJson from 'astro/package.json';
import { createHash } from 'node:crypto';

import { aggregateCspViolations } from '../csp/cspViolationReport';
import { DARK_MODE_INIT_SCRIPT, KBD_PLATFORM_INIT_SCRIPT, PLAUSIBLE_INIT_SCRIPT } from '../csp/inlineScripts';
import {
    ACCEPTED_CSP_VIOLATIONS,
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

    describe('blog scope (reverse-proxied Ghost blog)', () => {
        it('allows the Mailchimp newsletter signup end to end', () => {
            const blog = getCspDirectives({ env: 'production', scope: 'blog' });
            // The signup form loads mc-validate.js, which submits via jQuery JSONP — a
            // <script src> pointing at /subscribe/post-json on the list-manage origin —
            // so that origin needs script-src on top of the base form-action entry.
            expect(blog['script-src']).toContain('https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js');
            expect(blog['script-src']).toContain('https://ag-grid.us11.list-manage.com');
            expect(blog['form-action']).toContain('https://ag-grid.us11.list-manage.com');
        });

        it('does not leak the blog script hosts into the site scope', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            expect(site['script-src']).not.toContain('https://ag-grid.us11.list-manage.com');
            expect(site['script-src']).not.toContain('https://platform.twitter.com');
        });
    });

    describe('Enzuzo cookie-consent banner (replaces OneTrust)', () => {
        it('allows the banner bundle in script-src and its APIs in connect-src', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            // GTM injects the loader as an external <script src>, so the origin is enough
            // — no inline hash, unlike the ZoomInfo bootstrap.
            expect(site['script-src']).toContain('https://app.enzuzo.com');
            // Same origin serves the banner config, cookie list and consent analytics...
            expect(site['connect-src']).toContain('https://app.enzuzo.com');
            // ...and the IAB TCF Global Vendor List comes from a sibling host.
            expect(site['connect-src']).toContain('https://gvl.enzuzo.com');
        });

        it("does not need 'unsafe-eval' in the site scope", () => {
            // The banner's new Function paths degrade rather than justify re-opening eval
            // site-wide; see the note above ENZUZO_APP_HOST in cspRules.ts.
            expect(getCspDirectives({ env: 'production', scope: 'site' })['script-src']).not.toContain("'unsafe-eval'");
        });

        it('accepts the blocked eval from its cookiebar bundle, and only that', () => {
            // The shape the post-deploy suite actually observes on staging, so the acceptance
            // stops matching if Enzuzo moves the bundle or the browser reports it differently.
            const observed = {
                directive: 'script-src',
                blockedUri: 'eval',
                disposition: 'enforce' as const,
                sourceFile: 'https://app.enzuzo.com/scripts/cookiebar/061e8460-91b3-11f1-98ff-978c2fcf2681',
                pageUrl: 'https://grid-staging.ag-grid.com/',
            };
            const aggregate = (record: typeof observed) =>
                aggregateCspViolations([{ record, testTitle: 'homepage loads' }], [], ACCEPTED_CSP_VIOLATIONS)[0];

            expect(aggregate(observed).accepted).toEqual(expect.stringContaining('Enzuzo'));
            // The consent-bridge hash going stale must still surface...
            expect(aggregate({ ...observed, blockedUri: 'inline' })).not.toHaveProperty('accepted');
            // ...as must an eval from anything other than the banner bundle.
            expect(
                aggregate({ ...observed, sourceFile: 'https://app.enzuzo.com/scripts/cookies/061e8460' })
            ).not.toHaveProperty('accepted');
        });

        it('applies on every page, not just the ones that render a cookies table', () => {
            // The banner loads site-wide, including under /examples/ and /ecommerce/, so
            // the origins live in the base directives rather than a scope override.
            const scopes = ['site', 'examples', 'campaigns', 'ecommerce'] as const;
            for (let i = 0, len = scopes.length; i < len; ++i) {
                const directives = getCspDirectives({ env: 'production', scope: scopes[i] });
                expect(directives['script-src']).toContain('https://app.enzuzo.com');
                expect(directives['connect-src']).toContain('https://app.enzuzo.com');
            }
        });
    });

    describe('Google Ads conversion tracking (AW-873243008)', () => {
        it('allows the conversion beacon hosts in connect-src', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            // The beacon tries fetch() to these before falling back to an <img> pixel, so the
            // permissive img-src alone is not enough to stop it logging a violation.
            expect(site['connect-src']).toContain('https://www.googleadservices.com');
            expect(site['connect-src']).toContain('https://pagead2.googlesyndication.com');
            // /ccm/s/collect, sent with the Fetch API once marketing consent is granted.
            expect(site['connect-src']).toContain('https://ad.doubleclick.net');
        });

        it('allows the view-through conversion tag in script-src', () => {
            // GTM injects /pagead/viewthroughconversion/<id> as an external <script>, so this
            // is a script-src origin rather than a beacon target. Only fires once marketing
            // consent is granted, which is why it did not show up in consent-denied testing.
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            expect(site['script-src']).toContain('https://googleads.g.doubleclick.net');
        });

        it('keeps the ads hosts out of the directive that does not need them', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            // The remarketing tag is a script source, not a fetch target...
            expect(site['connect-src']).not.toContain('https://googleads.g.doubleclick.net');
            // ...and the conversion beacon hosts are fetch targets, not script sources.
            expect(site['script-src']).not.toContain('https://ad.doubleclick.net');
            expect(site['script-src']).not.toContain('https://pagead2.googlesyndication.com');
        });

        it('trusts no ads origin that only appears as a dead gtag.js fallback', () => {
            // Both show up as unreached fallbacks in every gtag.js payload; add them only if a
            // violation actually shows up — see the note above GOOGLE_ADS_SDK_HOST.
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            const unused = ['https://adservice.google.com', 'https://ade.googlesyndication.com'];
            for (let i = 0, len = unused.length; i < len; ++i) {
                expect(site['script-src']).not.toContain(unused[i]);
                expect(site['connect-src']).not.toContain(unused[i]);
            }
        });

        it('applies in every scope, since GTM loads the tag site-wide', () => {
            const scopes = ['site', 'examples', 'campaigns', 'ecommerce', 'blog'] as const;
            for (let i = 0, len = scopes.length; i < len; ++i) {
                const directives = getCspDirectives({ env: 'production', scope: scopes[i] });
                expect(directives['connect-src']).toContain('https://www.googleadservices.com');
                expect(directives['connect-src']).toContain('https://pagead2.googlesyndication.com');
                expect(directives['connect-src']).toContain('https://ad.doubleclick.net');
                expect(directives['script-src']).toContain('https://googleads.g.doubleclick.net');
            }
        });

        it('authorises the internal promo-tracking GA4 event tag by hash in the site scope', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(site).toContain("'sha256-nC2/ZWBpMyJEdVw5YxKBKxSMNwMN/lOAPrHk4RcIBbc='");
            const examples = getCspDirectives({ env: 'production', scope: 'examples' })['script-src'];
            expect(examples).not.toContain("'sha256-nC2/ZWBpMyJEdVw5YxKBKxSMNwMN/lOAPrHk4RcIBbc='");
        });
    });

    describe('LinkedIn Insight Tag', () => {
        it('allows the tag SDK in script-src and its beacon hosts in connect-src', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            // GTM injects the SDK as an external <script src>, so the origin is enough — no
            // inline hash, unlike the ZoomInfo bootstrap.
            expect(site['script-src']).toContain('https://snap.licdn.com');
            // The website-actions beacon and the attribution trigger are a sendBeacon and a
            // fetch rather than image pixels, so the permissive img-src does not cover them.
            expect(site['connect-src']).toContain('https://px.ads.linkedin.com');
        });

        it('trusts no LinkedIn origin the shipped tag does not contact', () => {
            // Everything else on LinkedIn's published required-domains list is either an image
            // pixel (img-src is deliberately permissive) or absent from both SDK payloads
            // altogether — see the note above LINKEDIN_SDK_HOST in cspRules.ts.
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            expect(site['img-src']).toContain('https:');
            const unused = [
                'https://px4.ads.linkedin.com',
                'https://dc.ads.linkedin.com',
                'https://p.adsymptotic.com',
                'https://cdn.linkedin.oribi.io',
                'https://gw.linkedin.oribi.io',
                'https://sjs.bizographics.com',
            ];
            for (let i = 0, len = unused.length; i < len; ++i) {
                expect(site['script-src']).not.toContain(unused[i]);
                expect(site['connect-src']).not.toContain(unused[i]);
            }
        });

        it('applies in every scope, since GTM loads the tag site-wide', () => {
            const scopes = ['site', 'examples', 'campaigns', 'ecommerce'] as const;
            for (let i = 0, len = scopes.length; i < len; ++i) {
                const directives = getCspDirectives({ env: 'production', scope: scopes[i] });
                expect(directives['script-src']).toContain('https://snap.licdn.com');
                expect(directives['connect-src']).toContain('https://px.ads.linkedin.com');
            }
        });
    });

    describe('Enzuzo → GTM consent bridge', () => {
        it('authorises the inline bridge by hash in the site scope', () => {
            // Enzuzo injects this inline when the visitor makes a consent choice, to pass the
            // decision to GTM. Blocked before this hash was added, so consent never reached GTM.
            const site = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(site).toContain("'sha256-NSYHvOQXo5WNxDt0/+l9AbSTx6N4CkkrbuSSa6ERhlo='");
        });

        it('derives that hash from the recorded script source', () => {
            // The digest is reproducible from ENZUZO_GTM_CONSENT_BRIDGE_SCRIPT (verified against
            // the browser's CSP violation report), so the source and the policy cannot drift.
            // If this fails, the recorded source was edited — re-check it against a real browser
            // rather than just updating the expected digest.
            expect(sha256Source('if (window.enzuzoGtmConsent) { window.enzuzoGtmConsent(); }')).toBe(
                "'sha256-NSYHvOQXo5WNxDt0/+l9AbSTx6N4CkkrbuSSa6ERhlo='"
            );
        });

        it('is site-scope only, since examples keeps unsafe-inline', () => {
            const examples = getCspDirectives({ env: 'production', scope: 'examples' })['script-src'];
            expect(examples).not.toContain("'sha256-NSYHvOQXo5WNxDt0/+l9AbSTx6N4CkkrbuSSa6ERhlo='");
        });
    });

    describe('UTM attribution (GTM Custom HTML tags)', () => {
        it('allows the Make webhook in connect-src', () => {
            // The form-submit tag POSTs the stashed first/last-touch UTMs with fetch().
            expect(getCspDirectives({ env: 'production', scope: 'site' })['connect-src']).toContain(
                'https://hook.eu2.make.com'
            );
        });

        it('applies in every scope, since GTM loads the tags site-wide', () => {
            const scopes = ['site', 'examples', 'campaigns', 'ecommerce'] as const;
            for (let i = 0, len = scopes.length; i < len; ++i) {
                expect(getCspDirectives({ env: 'production', scope: scopes[i] })['connect-src']).toContain(
                    'https://hook.eu2.make.com'
                );
            }
        });

        it('does not grant the webhook script-src (it is a fetch target, not a script source)', () => {
            expect(getCspDirectives({ env: 'production', scope: 'site' })['script-src']).not.toContain(
                'https://hook.eu2.make.com'
            );
        });

        it('authorises both capture tags by hash in the site scope', () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(site).toContain("'sha256-nsp/0430/yfuSNjsteV2fUwjHINMowl9qldFKy6PKJs='"); // page-view capture
            expect(site).toContain("'sha256-7f34QP24yF/YC+G6zSHRCBZrBez6xFf6GbcGIXkZ4K0='"); // webhook POST (live)
        });

        it('also authorises the updated capturing-phase webhook listener', () => {
            // The submit listener now adds a third `true` argument to addEventListener
            // (capturing phase) — otherwise byte-identical to the live tag above. Kept
            // alongside it until the rollout is complete and the old hash is confirmed
            // unused. AG-3390.
            const site = getCspDirectives({ env: 'production', scope: 'site' })['script-src'];
            expect(site).toContain("'sha256-1biJs72+znqmnYHTG0Ps3v04No9BtvG8+3CNYyK5djo='");
        });

        it('is site-scope only, since examples keeps unsafe-inline', () => {
            const examples = getCspDirectives({ env: 'production', scope: 'examples' })['script-src'];
            expect(examples).not.toContain("'sha256-nsp/0430/yfuSNjsteV2fUwjHINMowl9qldFKy6PKJs='");
            expect(examples).not.toContain("'sha256-7f34QP24yF/YC+G6zSHRCBZrBez6xFf6GbcGIXkZ4K0='");
            expect(examples).not.toContain("'sha256-1biJs72+znqmnYHTG0Ps3v04No9BtvG8+3CNYyK5djo='");
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
