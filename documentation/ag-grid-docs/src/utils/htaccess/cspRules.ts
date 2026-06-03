/**
 * Single source of truth for the site's Content-Security-Policy
 *
 * Consumed by:
 *  - `scripts/csp/generate-csp.ts` to emit the policy string for hand-placing
 *    on staging and (in future) for generating the deploy-time config.
 *  - `htaccessRules.ts` (planned) to emit the `Content-Security-Policy` header
 *    into the generated `.htaccess`.
 *
 * Keep this module dependency-free so it can be imported by a standalone `tsx`
 * script without pulling in the Astro/Vite build graph.
 */

export type CspEnv = 'dev' | 'staging' | 'production';
export type CspMode = 'report-only' | 'enforce';

export interface CspOptions {
    env: CspEnv;
    /** Override the trial-licence form origin. Defaults to the per-env value. */
    trialFormOrigin?: string;
}

/** Ordered map of directive name to its allowed sources. */
export type CspDirectives = Record<string, string[]>;

const SELF = "'self'";
const NONE = "'none'";
const UNSAFE_INLINE = "'unsafe-inline'";
// Required by the theme-builder CSS parser and the Angular example-runner (JIT
// compilation). Removing it is tracked separately and is larger than a one-liner.
const UNSAFE_EVAL = "'unsafe-eval'";

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

// Dev-server-only extras (HMR + cross-port preview). Never emitted for staging
// or production.
const DEV_SCRIPT_SRC = ['https://localhost:4610', 'https://localhost:4611'];
const DEV_CONNECT_SRC = ['https://localhost:4610', 'https://localhost:4611', 'ws://localhost:*', 'wss://localhost:*'];

export function getCspDirectives(options: CspOptions): CspDirectives {
    const { env } = options;
    const trialFormOrigin = options.trialFormOrigin ?? TRIAL_FORM_ORIGIN[env];
    const salesforceFormOrigin = SALESFORCE_FORM_ORIGIN[env];

    const directives: CspDirectives = {
        'default-src': [SELF],
        'script-src': [
            SELF,
            AG_GRID_HOSTS,
            'https://plausible.io',
            'https://www.googletagmanager.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'https://js.zi-scripts.com', // ZoomInfo tag (injected via GTM)
            'https://*.zoominfo.com', // ZoomInfo FormComplete
            'https://www.google.com', // reCAPTCHA
            'https://www.gstatic.com', // reCAPTCHA
            'https://www.youtube.com', // YouTube iframe JS API (loads into the page)
            UNSAFE_INLINE,
            UNSAFE_EVAL,
        ],
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
            'https://www.google-analytics.com',
            'https://*.analytics.google.com',
            'https://stats.g.doubleclick.net',
            'https://flagcdn.com',
            'https://www.googletagmanager.com',
            'https://cdn.jsdelivr.net', // example-runner SystemJS fetches modules as text (XHR)
            'https://cdnjs.cloudflare.com', // example-runner legacy deps (XHR)
            'https://js.zi-scripts.com', // ZoomInfo
            'https://*.zoominfo.com', // ZoomInfo
            'https://www.google.com', // reCAPTCHA (api2/clr XHR)
            trialFormOrigin,
        ],
        'frame-src': [
            SELF,
            'https://www.googletagmanager.com',
            'https://www.youtube.com',
            'https://www.google.com', // reCAPTCHA challenge iframe
        ],
        'media-src': [SELF, 'data:', 'blob:', 'https:'],
        'worker-src': [SELF, 'blob:'],
        'object-src': [NONE],
        'base-uri': [SELF],
        'form-action': [
            SELF,
            trialFormOrigin,
            salesforceFormOrigin,
            'https://codesandbox.io', // example-runner "Open in CodeSandbox" form POST
            'https://plnkr.co', // example-runner "Open in Plunker" form POST
        ],
        'frame-ancestors': [SELF],
    };

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
