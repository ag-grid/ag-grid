/**
 * Single source of truth for the site's Content-Security-Policy
 *
 * Consumed by:
 *  - `scripts/csp/generate-csp.ts` to emit the policy string for inspection or
 *    hand-placing on a vhost.
 *  - `htaccessRules.ts` to emit the `Content-Security-Policy` header into the
 *    generated `.htaccess`.
 *
 * Keep this module free of Astro/Vite imports so it can be imported by a standalone
 * `tsx` script without pulling in the build graph (Node built-ins and plain-string
 * constants are fine — it is only ever imported build-side, never client-side).
 */
import { createHash } from 'node:crypto';

import { DARK_MODE_INIT_SCRIPT, KBD_PLATFORM_INIT_SCRIPT, PLAUSIBLE_INIT_SCRIPT } from '../csp/inlineScripts';

export type CspEnv = 'dev' | 'staging' | 'production';
export type CspMode = 'report-only' | 'enforce';

/**
 * - 'site': the default policy for ordinary pages.
 * - 'examples': additionally allows 'unsafe-eval'; applies only to the standalone
 *   example-runner documents (and archived doc versions) — see EXAMPLES_PATH_CONDITION.
 * - 'campaigns': additionally allows the bryntum.com origin (script/style/font/
 *   connect) for the partnership campaign pages' embedded Gantt demo — without
 *   'unsafe-eval'. See CAMPAIGNS_PATH_CONDITION.
 * - 'ecommerce': additionally allows 'unsafe-inline' and 'unsafe-eval' in script-src
 *   for the separately-managed SPA served under /ecommerce/, whose index.html carries
 *   inline scripts we do not own and part of which evaluates strings as JavaScript
 *   at runtime — see ECOMMERCE_PATH_CONDITION.
 */
export type CspScope = 'site' | 'examples' | 'campaigns' | 'ecommerce';

export interface CspOptions {
    env: CspEnv;
    /** Which policy variant to build. Defaults to 'site'. */
    scope?: CspScope;
    /** Override the trial-licence form origin. Defaults to the per-env value. */
    trialFormOrigin?: string;
}

/** Ordered map of directive name to its allowed sources. */
export type CspDirectives = Record<string, string[]>;

const SELF = "'self'";
const NONE = "'none'";
// In script-src, 'unsafe-inline' is now scope-specific: the 'site' policy
// authorises its few known inline scripts by SHA-256 hash instead (see
// SITE_SCRIPT_HASHES), while 'examples' and 'campaigns' still carry it. In
// style-src it stays everywhere (Theming API runtime <style> injection).
const UNSAFE_INLINE = "'unsafe-inline'";
// Permits WebAssembly compilation without permitting JS eval() — narrower than
// 'unsafe-eval'. Needed on every page: docs snippets are highlighted in the
// browser by Shiki, whose oniguruma engine instantiates a WASM module
// (see CodeShiki.tsx). Browsers that predate this token fall back to requiring
// 'unsafe-eval' for WASM.
const WASM_UNSAFE_EVAL = "'wasm-unsafe-eval'";
// Allowed only in the 'examples' scope: the standalone example-runner documents
// load modules with legacy SystemJS (fetches source over XHR and evals it), and
// the Angular (JIT compiler) and Vue (runtime template compiler) examples also
// compile code in the browser. Archived doc versions ship the same runner.
// Ordinary site pages do not need it — the theme builder's CSS parser used to,
// but now unescapes string literals without eval (see unescapeStringLiteral).
const UNSAFE_EVAL = "'unsafe-eval'";

// SHA-256 hashes authorising the main-page inline <script>s in the 'site' scope
// instead of 'unsafe-inline'. Derived from the SAME constants the pages render
// (src/utils/csp/inlineScripts.ts) so the policy can never drift from what is
// served — edit the script and the hash follows automatically. Added ONLY to the
// 'site' scope: per CSP2+, the presence of a hash makes the browser ignore
// 'unsafe-inline', so the 'examples'/'campaigns' scopes — which still rely on
// 'unsafe-inline' — must NOT carry them. Dev keeps 'unsafe-inline' (no hashes)
// because the Vite/Astro dev server injects its own inline scripts.
//
// NB: this hashes the source string; the browser hashes the rendered bytes. They
// match as long as Astro emits the inline script verbatim (verified in dev; the
// production report-only window is the backstop before enforcing).
const hashInlineScript = (source: string): string =>
    `'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`;

// Astro injects a small, fixed set of inline hydration-runtime scripts that we
// cannot externalise — they are emitted (and minified) by the framework, not
// authored here. Every OTHER site inline script is externalised to a 'self' bundle
// (see ImageCaption, ExpandingSection, FrameworkRedirectPage, etc.), so these are
// the only inline scripts the 'site' scope authorises by hash.
//
// Because the rendered bytes are Astro's build-time output, there is no source
// string to derive these from — they are pinned, and they change when Astro's
// hydration runtime changes, i.e. on an Astro upgrade. ASTRO_HYDRATION_HASHES_VERIFIED_FOR
// records the Astro version they were captured against; cspRules.test.ts fails when
// the installed version no longer matches, so an upgrade cannot silently leave the
// policy stale (which would block hydration site-wide once the CSP is enforced).
//
// === HOW TO REGENERATE AFTER AN ASTRO UPGRADE ===
//   1. yarn nx build ag-grid-docs
//   2. yarn nx run ag-grid-docs:preview:csp           (serves the build with the enforced policy)
//   3. Open https://localhost:4611/ plus a page using each client: directive
//      (load/idle/only/visible) and read the browser console: every blocked inline
//      script logs the missing 'sha256-...' value in its CSP violation. (Equivalently,
//      hash the inline <script> contents in dist and diff against the list below.)
//   4. Replace the hashes below with the new values, and bump
//      ASTRO_HYDRATION_HASHES_VERIFIED_FOR to the new Astro version.
export const ASTRO_HYDRATION_HASHES_VERIFIED_FOR = '6.1.9';
const ASTRO_HYDRATION_SCRIPT_HASHES = [
    "'sha256-QzWFZi+FLIx23tnm9SBU4aEgx4x8DsuASP07mfqol/c='", // client:load bootstrap
    "'sha256-eIXWvAmxkr251LJZkjniEK5LcPF3NkapbJepohwYRIc='", // client:only bootstrap
    "'sha256-Q2BPg90ZMplYY+FSdApNErhpWafg2hcRRbndmvxuL/Q='", // client:visible bootstrap
    "'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw='", // client:idle bootstrap
    "'sha256-BrDhGE1lwa85arfXcrBxSo+n37uVSX5CAROXnIM6Q+g='", // <astro-island> hydration runtime
];

// SHA-256 of the inline ZoomInfo (WebSights) bootstrap that the shared Google Tag
// Manager container injects as a Custom HTML tag once the visitor accepts functional
// cookie consent. Unlike the scripts above, this one is authored in GTM, not this
// repo — so the value is taken from the browser's CSP violation report, NOT by
// hashing the GTM source (GTM normalises the injected bytes, so the source does not
// reproduce this digest).
//
// FRAGILE — this pins ZoomInfo's exact bytes. If the ZoomInfo tag in GTM is edited,
// or ZoomInfo regenerates its loader snippet, the hash stops matching and ZoomInfo
// silently fails to load for consenting users. The GTM tag carries a note pointing
// back here; if it changes, replace this with the new console-reported hash (here and
// in the ag-studio / ag-charts CSPs — the GTM container is shared). AG-17134.
const GTM_ZOOMINFO_HASH = "'sha256-41l+jvtOjBgKy9345IStB4j1gGPGFMVXADMHn1Acs6E='";

const SITE_SCRIPT_HASHES = [
    hashInlineScript(DARK_MODE_INIT_SCRIPT),
    hashInlineScript(PLAUSIBLE_INIT_SCRIPT),
    hashInlineScript(KBD_PLATFORM_INIT_SCRIPT),
    ...ASTRO_HYDRATION_SCRIPT_HASHES,
    GTM_ZOOMINFO_HASH,
];

// The AG Grid × Bryntum partnership campaign pages embed a live Bryntum Gantt
// demo that loads its bundle, stylesheet, Font Awesome webfonts and dataset from
// bryntum.com. Allowed only in the 'campaigns' scope so the rest of the site does
// not trust this third-party origin. The pages are deliberately NOT granted
// 'unsafe-eval': if the Bryntum bundle's runtime new Function() path turns out to
// be exercised, re-allowing it is a separate, conscious decision.
const BRYNTUM_HOST = 'https://bryntum.com';

// Apache <If> expression matching the URL paths that get the 'examples' scope:
// the standalone example-runner documents and archived doc versions (uploaded
// separately but served from this vhost, so they inherit the root .htaccess).
export const EXAMPLES_PATH_CONDITION = '%{REQUEST_URI} =~ m#^/(examples|archive)/#';

// Apache <If> expression matching the partnership campaign pages that get the
// 'campaigns' scope — both the live page (/campaigns/bryntum-gantt/) and its
// archived copies (/archive/<version>/campaigns/bryntum-gantt/), which are served
// from the same vhost and would otherwise fall under the 'examples' scope (matched
// by EXAMPLES_PATH_CONDITION) and lose the bryntum.com allowances. The optional
// /archive/<version> prefix covers the archived snapshots.
export const CAMPAIGNS_PATH_CONDITION = '%{REQUEST_URI} =~ m#^(?:/archive/[^/]+)?/campaigns/#';

// Apache <If> expression matching the ecommerce SPA (deployed under /ecommerce/ on
// the production www vhost, but built and owned by a separate team). Its index.html
// carries inline <script>s — a Google Tag Manager loader and a base-href bootstrap —
// that the tightened 'site' policy blocks. We do not control that file, so authorising
// the scripts by hash would silently break the checkout the moment the other team
// re-generates index.html. Instead this scope re-allows 'unsafe-inline' in script-src
// for these paths, plus 'unsafe-eval' because part of the app evaluates strings as
// JavaScript at runtime (EvalError without it). The SPA uses hash-based routing, so its
// in-app routes live in the URL fragment, which is never sent to the server — the
// eval-using routes cannot be path-scoped separately, so the whole /ecommerce/ scope
// carries 'unsafe-eval'. The strict connect-src/frame-src/form-action
// that already govern the payment POST, Firebase Auth and Realex HPP iframe stay in
// force. No JS PATH_REGEXP counterpart because the dev/preview middleware never serves
// /ecommerce/. AG-17134.
export const ECOMMERCE_PATH_CONDITION = '%{REQUEST_URI} =~ m#^/ecommerce/#';

// Apache <If> expression matching the staging-only /branch-builds/ tree: a directory
// of full per-branch documentation builds, preserved across deployments (backed up
// and restored by scripts/deployments/*) rather than produced by this build. Each is
// an arbitrary historical snapshot of the docs at whatever code — and CSP needs —
// existed when that branch was built: old example HTML carries inline event handlers
// (onclick=, onchange=, …) and eval that the tightened site policy blocks, and CSP
// cannot authorise inline event handlers by hash at all. The tree is internal and
// password-protected, so it is exempted from the CSP entirely (see
// getBranchBuildsCspIfOverride) rather than force-fitted to a scope. Staging-only:
// the tree does not exist on production www. No JS PATH_REGEXP counterpart because
// the dev/preview middleware never serves these paths.
export const BRANCH_BUILDS_PATH_CONDITION = '%{REQUEST_URI} =~ m#^/branch-builds/#';

// JS equivalents of the *_PATH_CONDITION Apache rules above, for the dev-server
// (agDevCsp) and preview-server (preview-csp) middleware that scope the served
// CSP by URL path. Keep these in sync with the Apache conditions.
export const EXAMPLES_PATH_REGEXP = /^\/(examples|archive)\//;
// Matches /campaigns/ and archived /archive/<version>/campaigns/ — see
// CAMPAIGNS_PATH_CONDITION. An archived campaign path matches BOTH this and
// EXAMPLES_PATH_REGEXP, so the middleware resolvers must test campaigns first
// (mirroring the Apache <If> precedence where the campaigns block trails examples).
export const CAMPAIGNS_PATH_REGEXP = /^(?:\/archive\/[^/]+)?\/campaigns\//;

// 'self' resolves to grid-staging.ag-grid.com on staging / localhost in dev, so
// cross-subdomain references to the production host need an explicit allowance.
// Harmless on production where 'self' already covers www.ag-grid.com.
const AG_GRID_HOSTS = 'https://*.ag-grid.com';

// The trial-licence form posts to a different Cloud Function per environment
// (see PUBLIC_TRIAL_LICENCE_FORM_URL in the .env.build.* files).
const TRIAL_FORM_ORIGIN: Record<CspEnv, string> = {
    dev: 'https://us-central1-stripe-testing-19784.cloudfunctions.net',
    staging: 'https://us-central1-stripe-testing-19784.cloudfunctions.net',
    production: 'https://us-central1-aggrid-ecommerce.cloudfunctions.net',
};

// The contact form posts to Salesforce Web-to-Lead — a sandbox org in non-prod,
// the live org in production (see CONTACT_FORM_DATA in
// external/ag-website-shared/src/constants.ts).
const SALESFORCE_FORM_ORIGIN: Record<CspEnv, string> = {
    dev: 'https://test.salesforce.com',
    staging: 'https://test.salesforce.com',
    production: 'https://webto.salesforce.com',
};

// The ecommerce checkout renders the Realex/Global Payments Hosted Payment Page
// (rxp-hpp.js) in an iframe and POSTs the payment form to it — sandbox host in
// non-prod, live host in production (see globalPaymentsServiceUrl in the
// ag-grid-ecommerce frontend environments). Governs frame-src and form-action.
const REALEX_HPP_ORIGIN: Record<CspEnv, string> = {
    dev: 'https://pay.sandbox.realexpayments.com',
    staging: 'https://pay.sandbox.realexpayments.com',
    production: 'https://pay.realexpayments.com',
};

// Firebase Auth (ecommerce checkout) renders an auth-handshake iframe served from
// the project's authDomain (<projectId>.firebaseapp.com) — the non-prod project is
// stripe-testing-19784 (same project backing the non-prod trial-form Cloud
// Functions), the live project is aggrid-ecommerce. Governs frame-src.
const FIREBASE_AUTH_ORIGIN: Record<CspEnv, string> = {
    dev: 'https://stripe-testing-19784.firebaseapp.com',
    staging: 'https://stripe-testing-19784.firebaseapp.com',
    production: 'https://aggrid-ecommerce.firebaseapp.com',
};

// Dev-server-only extras (HMR + cross-port preview). Never emitted for staging
// or production.
const DEV_SCRIPT_SRC = ['https://localhost:4610', 'https://localhost:4611'];
const DEV_CONNECT_SRC = ['https://localhost:4610', 'https://localhost:4611', 'ws://localhost:*', 'wss://localhost:*'];

export function getCspDirectives(options: CspOptions): CspDirectives {
    const { env } = options;
    const scope = options.scope ?? 'site';
    const trialFormOrigin = options.trialFormOrigin ?? TRIAL_FORM_ORIGIN[env];
    const salesforceFormOrigin = SALESFORCE_FORM_ORIGIN[env];
    const realexHppOrigin = REALEX_HPP_ORIGIN[env];
    const firebaseAuthOrigin = FIREBASE_AUTH_ORIGIN[env];

    const directives: CspDirectives = {
        'default-src': [SELF],
        'script-src': [
            SELF,
            AG_GRID_HOSTS,
            'https://plausible.io',
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com', // Universal Analytics analytics.js (GTM-injected after cookie consent)
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'https://js.zi-scripts.com', // ZoomInfo tag (injected via GTM)
            'https://*.zoominfo.com', // ZoomInfo FormComplete
            'https://www.google.com', // reCAPTCHA
            'https://www.gstatic.com', // reCAPTCHA
            'https://apis.google.com', // Firebase Auth (ecommerce checkout): GAPI client loads the auth iframe
            'https://www.youtube.com', // YouTube iframe JS API (loads into the page)
            'https://cdn.cookielaw.org', // OneTrust cookie-consent SDK (GTM-injected, prod-only)
            'blob:', // ZoomInfo zi-tag.js bootstraps a blob: URL script
            WASM_UNSAFE_EVAL,
            // 'unsafe-inline' (examples/campaigns/dev) or SHA-256 hashes (site) added per scope below.
        ],
        // 'unsafe-inline' stays: the Theming API injects <style> elements at
        // runtime (live grids run directly on the homepage/demo pages), inline
        // style attributes are pervasive, and static Apache hosting rules out
        // per-request nonces.
        'style-src': [
            SELF,
            'https://fonts.googleapis.com',
            'https://use.fontawesome.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            UNSAFE_INLINE,
        ],
        'font-src': [
            SELF,
            'https://fonts.gstatic.com',
            'https://use.fontawesome.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'data:',
        ],
        // Relaxed to https:. Images/media are open-ended (badges, flag CDNs,
        // podcast audio, blog/showcase images) and a weak XSS vector — the strict
        // script-src/connect-src/frame-src below carry the protection.
        'img-src': [SELF, 'data:', 'blob:', 'https:'],
        'connect-src': [
            SELF,
            AG_GRID_HOSTS,
            'https://plausible.io',
            'https://*.algolia.net',
            'https://*.algolianet.com',
            'https://*.google-analytics.com', // GA4 incl. regional collect endpoints (region1/2.google-analytics.com)
            'https://*.analytics.google.com',
            'https://analytics.google.com', // GA4 apex collect endpoint (not matched by the *. wildcard)
            'https://stats.g.doubleclick.net',
            'https://flagcdn.com',
            'https://www.googletagmanager.com',
            'https://cdn.jsdelivr.net', // example-runner SystemJS fetches modules as text (XHR)
            'https://cdnjs.cloudflare.com', // example-runner legacy deps (XHR)
            'https://js.zi-scripts.com', // ZoomInfo
            'https://*.zoominfo.com', // ZoomInfo
            'https://www.google.com', // reCAPTCHA (api2/clr XHR)
            'https://cdn.cookielaw.org', // OneTrust config/JSON/asset XHR (GTM-injected, prod-only)
            'https://*.onetrust.com', // OneTrust geolocation + consent-receipt endpoints
            'https://www.googleapis.com', // Firebase Auth (ecommerce checkout): identitytoolkit REST
            'https://securetoken.googleapis.com', // Firebase Auth ID-token refresh
            trialFormOrigin,
        ],
        'frame-src': [
            SELF,
            'https://www.googletagmanager.com',
            'https://www.youtube.com',
            'https://www.google.com', // reCAPTCHA challenge iframe
            realexHppOrigin, // ecommerce checkout: Realex Hosted Payment Page iframe
            firebaseAuthOrigin, // ecommerce checkout: Firebase Auth handshake iframe
        ],
        'media-src': [SELF, 'data:', 'blob:', 'https:'],
        'worker-src': [SELF, 'blob:'],
        'object-src': [NONE],
        'base-uri': [SELF],
        'form-action': [
            SELF,
            trialFormOrigin,
            salesforceFormOrigin,
            realexHppOrigin, // ecommerce checkout: payment form POST to Realex HPP
            'https://codesandbox.io', // example-runner "Open in CodeSandbox" form POST
            'https://plnkr.co', // example-runner "Open in Plunker" form POST
            'https://ag-grid.us11.list-manage.com', // Beyond the Prompt "notify me" Mailchimp signup POST
        ],
        'frame-ancestors': [SELF, AG_GRID_HOSTS], // allow *.ag-grid.com (e.g. blog) to embed examples
    };

    // script-src inline handling, by scope (and environment for 'site').
    if (scope === 'examples') {
        directives['script-src'].push(UNSAFE_EVAL, UNSAFE_INLINE);
    } else if (scope === 'campaigns') {
        directives['script-src'].push(BRYNTUM_HOST, UNSAFE_INLINE);
        directives['style-src'].push(BRYNTUM_HOST);
        directives['font-src'].push(BRYNTUM_HOST);
        directives['connect-src'].push(BRYNTUM_HOST);
    } else if (scope === 'ecommerce') {
        // Separately-managed SPA under /ecommerce/: allow its inline scripts via
        // 'unsafe-inline' (no site hashes — a hash would make the browser ignore
        // 'unsafe-inline'), plus 'unsafe-eval' because part of the app evaluates
        // strings as JavaScript at runtime. Hash-based routing means the eval-using
        // routes never reach the server, so 'unsafe-eval' cannot be path-scoped narrower
        // than the whole /ecommerce/ scope. See ECOMMERCE_PATH_CONDITION.
        directives['script-src'].push(UNSAFE_INLINE, UNSAFE_EVAL);
    } else if (env === 'dev') {
        // Dev server (Vite/Astro) injects its own inline scripts for HMR/hydration
        // that the static build does not; keep 'unsafe-inline' locally rather than
        // block them. The hash-based site policy is validated on staging/production.
        directives['script-src'].push(UNSAFE_INLINE);
    } else {
        // 'site' on staging/production: authorise the known inline scripts by hash.
        directives['script-src'].push(...SITE_SCRIPT_HASHES);
    }

    if (env === 'dev') {
        directives['script-src'].push(...DEV_SCRIPT_SRC);
        directives['connect-src'].push(...DEV_CONNECT_SRC);
    }

    return directives;
}

/** Build the single-line CSP value (suitable for an HTTP header). */
export function getCspValue(options: CspOptions): string {
    const directives = getCspDirectives(options);
    const names = Object.keys(directives);
    const parts: string[] = [];
    for (let i = 0, len = names.length; i < len; ++i) {
        const name = names[i];
        parts.push(`${name} ${directives[name].join(' ')}`);
    }
    return parts.join('; ');
}

export function getCspHeaderName(mode: CspMode): string {
    return mode === 'enforce' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';
}

/** Build the full Apache `.htaccess`/vhost `Header` directive line. */
export function getCspHtaccessLine(options: CspOptions, mode: CspMode): string {
    return `Header always set ${getCspHeaderName(mode)} "${getCspValue(options)}"`;
}

/**
 * Build the full `.htaccess` CSP block.
 *
 * Unsets both inherited header forms first so the page is governed only by this
 * policy — clears the legacy wildcard CSP set on the staging vhost (otherwise it
 * would be served alongside this one). Use for staging, where this .htaccess fully
 * owns the policy; production keeps the vhost wildcard during its report-only window
 * (dual-policy), so it uses getCspHtaccessLine instead.
 */
export function getCspHtaccessBlock(options: CspOptions, mode: CspMode): string {
    const lines: string[] = ['# Override the CSP set on the staging vhost (the legacy wildcard).'];
    // Always replace the inherited report-only header so it does not double-report. Only
    // unset the inherited *enforced* wildcard when this block enforces — during the
    // report-only window keep it for baseline protection rather than leaving the page
    // with no enforced CSP.
    if (mode === 'enforce') {
        lines.push('Header always unset Content-Security-Policy');
    }
    lines.push('Header always unset Content-Security-Policy-Report-Only');
    lines.push(getCspHtaccessLine(options, mode));
    return lines.join('\n');
}

/**
 * Build an Apache `<If>` block that replaces the CSP header for the requests
 * matching `condition` with the given scope's policy.
 *
 * A second CSP policy can only tighten (browsers enforce the intersection), so a
 * relaxation must unset and re-set the header rather than add another one. <If>
 * sections merge after all other configuration, so this unset+set deterministically
 * replaces whatever header was set site-wide for matching requests.
 */
function getCspIfOverride(condition: string, comment: string[], options: CspOptions, mode: CspMode): string {
    const headerName = getCspHeaderName(mode);
    return [
        ...comment,
        `<If "${condition}">`,
        `    Header always unset ${headerName}`,
        `    ${getCspHtaccessLine(options, mode)}`,
        '</If>',
    ].join('\n');
}

/**
 * The `<If>` override re-allowing 'unsafe-eval' for the example-runner documents
 * and archived doc versions matched by EXAMPLES_PATH_CONDITION.
 */
export function getExamplesCspIfOverride(options: Omit<CspOptions, 'scope'>, mode: CspMode): string {
    return getCspIfOverride(
        EXAMPLES_PATH_CONDITION,
        [
            "# Example-runner documents and archived doc versions additionally need 'unsafe-eval'",
            '# (SystemJS eval-loads modules; the Angular JIT and Vue runtime template compilers',
            '# also compile in the browser).',
        ],
        { ...options, scope: 'examples' },
        mode
    );
}

/**
 * The `<If>` override allowing the bryntum.com origin for the partnership campaign
 * pages matched by CAMPAIGNS_PATH_CONDITION (no extra 'unsafe-eval').
 */
export function getCampaignsCspIfOverride(options: Omit<CspOptions, 'scope'>, mode: CspMode): string {
    return getCspIfOverride(
        CAMPAIGNS_PATH_CONDITION,
        [
            '# Partnership campaign pages embed a live Bryntum Gantt demo that loads its bundle,',
            '# stylesheet, Font Awesome webfonts and dataset from bryntum.com.',
        ],
        { ...options, scope: 'campaigns' },
        mode
    );
}

/**
 * The `<If>` override re-allowing 'unsafe-inline' and 'unsafe-eval' in script-src for
 * the separately-managed ecommerce SPA matched by ECOMMERCE_PATH_CONDITION.
 */
export function getEcommerceCspIfOverride(options: Omit<CspOptions, 'scope'>, mode: CspMode): string {
    return getCspIfOverride(
        ECOMMERCE_PATH_CONDITION,
        [
            '# The ecommerce SPA (served under /ecommerce/, built by a separate team) has inline',
            '# <script>s in its index.html (a GTM loader and a base-href bootstrap) that the site',
            "# policy blocks. We do not own that file, so re-allow 'unsafe-inline' in script-src for",
            "# these paths, plus 'unsafe-eval' because part of the app eval-compiles at runtime",
            '# (hash routing keeps it under this same /ecommerce/ scope).',
        ],
        { ...options, scope: 'ecommerce' },
        mode
    );
}

/**
 * The `<If>` override that drops the CSP header entirely for the staging-only
 * /branch-builds/ tree matched by BRANCH_BUILDS_PATH_CONDITION.
 *
 * Unlike the examples/campaigns overrides — which unset the inherited header and
 * re-set a relaxed-but-still-restrictive policy — this one only unsets it, leaving
 * no Content-Security-Policy for these paths. Branch builds are arbitrary, internal,
 * password-protected snapshots of past documentation builds whose pages predate (and
 * cannot satisfy) the tightened site policy; notably their example HTML uses inline
 * event handlers, which CSP cannot authorise by hash. `mode` selects which header
 * form to clear so this drops whichever header the site-wide block set for the page.
 */
export function getBranchBuildsCspIfOverride(mode: CspMode): string {
    const headerName = getCspHeaderName(mode);
    return [
        '# /branch-builds/ holds preserved per-branch documentation builds (staging only):',
        '# arbitrary historical snapshots, internal and password-protected, whose pages predate',
        "# the tightened policy (e.g. inline event handlers, which CSP can't authorise by hash).",
        '# Drop the CSP entirely for them rather than force-fit a scope.',
        `<If "${BRANCH_BUILDS_PATH_CONDITION}">`,
        `    Header always unset ${headerName}`,
        '</If>',
    ].join('\n');
}

/**
 * Build the full `.htaccess` CSP block with the path-scoped policy split: the
 * 'site' policy (no 'unsafe-eval', no third-party embeds) for ordinary pages,
 * replaced by the 'examples' policy for EXAMPLES_PATH_CONDITION paths, the
 * 'campaigns' policy for CAMPAIGNS_PATH_CONDITION paths, and the 'ecommerce' policy
 * for ECOMMERCE_PATH_CONDITION paths.
 *
 * The overrides target non-overlapping path prefixes (/examples|/archive, /campaigns,
 * /ecommerce), so their relative order does not matter.
 */
export function getScopedCspHtaccessBlock(options: Omit<CspOptions, 'scope'>, mode: CspMode): string {
    return [
        getCspHtaccessBlock({ ...options, scope: 'site' }, mode),
        '',
        getExamplesCspIfOverride(options, mode),
        '',
        getCampaignsCspIfOverride(options, mode),
        '',
        getEcommerceCspIfOverride(options, mode),
    ].join('\n');
}
