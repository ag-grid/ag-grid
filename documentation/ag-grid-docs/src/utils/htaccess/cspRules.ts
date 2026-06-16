/**
 * Single source of truth for the site's Content-Security-Policy
 *
 * Consumed by:
 *  - `scripts/csp/generate-csp.ts` to emit the policy string for inspection or
 *    hand-placing on a vhost.
 *  - `htaccessRules.ts` to emit the `Content-Security-Policy` header into the
 *    generated `.htaccess`.
 *
 * Keep this module dependency-free so it can be imported by a standalone `tsx`
 * script without pulling in the Astro/Vite build graph.
 */

export type CspEnv = 'dev' | 'staging' | 'production';
export type CspMode = 'report-only' | 'enforce';

/**
 * 'site' is the default policy for ordinary pages. 'examples' additionally
 * allows 'unsafe-eval' and applies only to the standalone example-runner
 * documents (and archived doc versions) — see EXAMPLES_PATH_CONDITION.
 */
export type CspScope = 'site' | 'examples';

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

// Apache <If> expression matching the URL paths that get the 'examples' scope:
// the standalone example-runner documents and archived doc versions (uploaded
// separately but served from this vhost, so they inherit the root .htaccess).
export const EXAMPLES_PATH_CONDITION = '%{REQUEST_URI} =~ m#^/(examples|archive)/#';

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
            UNSAFE_INLINE,
            WASM_UNSAFE_EVAL,
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
        ],
        'frame-ancestors': [SELF, AG_GRID_HOSTS], // allow *.ag-grid.com (e.g. blog) to embed examples
    };

    if (scope === 'examples') {
        directives['script-src'].push(UNSAFE_EVAL);
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
 * Build the full `.htaccess` CSP block with the path-scoped policy split: the
 * 'site' policy (no 'unsafe-eval') for ordinary pages, replaced by the
 * 'examples' policy for the paths matched by EXAMPLES_PATH_CONDITION.
 *
 * A second CSP policy can only tighten (browsers enforce the intersection), so
 * the relaxation must unset and re-set the header rather than add another one.
 */
export function getScopedCspHtaccessBlock(options: Omit<CspOptions, 'scope'>, mode: CspMode): string {
    const headerName = getCspHeaderName(mode);
    return [
        getCspHtaccessBlock({ ...options, scope: 'site' }, mode),
        '',
        "# Example-runner documents and archived doc versions additionally need 'unsafe-eval'",
        '# (SystemJS eval-loads modules; the Angular JIT and Vue runtime template compilers',
        '# also compile in the browser). <If> sections merge after all other configuration,',
        '# so this unset+set replaces the header set above for matching requests.',
        `<If "${EXAMPLES_PATH_CONDITION}">`,
        `    Header always unset ${headerName}`,
        `    ${getCspHtaccessLine({ ...options, scope: 'examples' }, mode)}`,
        '</If>',
    ].join('\n');
}
