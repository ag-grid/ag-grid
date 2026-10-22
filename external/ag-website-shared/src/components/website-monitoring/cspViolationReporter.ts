type ViolationAttributes = Record<string, string | number>;

// Bounds what is held while waiting for consent, e.g. on a page with a broken policy
const MAX_PENDING_VIOLATIONS = 20;

// Filled by ./cspViolationBuffer.js until the reporter takes it over
const EARLY_VIOLATIONS = 'agCspViolations';

// Violations the site CSP knowingly produces, so not worth ingesting on every page view. Keep in step
// with ACCEPTED_CSP_VIOLATIONS in each site's cspRules.ts, and as narrow.
const IGNORED_VIOLATIONS = [
    // Enzuzo's cookie banner calls eval() on load, in a fallback that is harmless when blocked
    { directive: 'script-src', blockedUri: 'eval', sourceFilePrefix: 'https://app.enzuzo.com/scripts/cookiebar/' },
];

export interface CspViolationReporter {
    /** Sends the violations held so far, and every later one as it happens */
    start: () => void;
    /** Drops the violations held so far, without sending them */
    discard: () => void;
    /** Stops listening for violations */
    dispose: () => void;
}

function isIgnored({ directive, blockedUri, sourceFile }: Record<string, string | number>): boolean {
    return IGNORED_VIOLATIONS.some(
        (ignored) =>
            directive === ignored.directive &&
            blockedUri === ignored.blockedUri &&
            String(sourceFile).startsWith(ignored.sourceFilePrefix)
    );
}

// Origin and path only: a query string can carry anything
function withoutQuery(uri: string): string {
    try {
        const url = new URL(uri);
        return url.origin + url.pathname;
    } catch {
        // Not a URL, e.g. 'inline' or 'eval'
        return uri;
    }
}

/**
 * Reports the page's Content-Security-Policy violations, each distinct one once per page.
 *
 * The site CSP authorises GTM's inline tags by hash, so editing one in the container stops it
 * running without any other sign; this makes that visible. Violations seen before `start` are only
 * held in memory, so nothing is sent without consent.
 *
 * Takes over the violations ./cspViolationBuffer.js held from the start of the page, if it ran.
 */
export function createCspViolationReporter(send: (attributes: ViolationAttributes) => void): CspViolationReporter {
    let isStarted = false;
    let pending: ViolationAttributes[] = [];
    const seen = new Set<string>();

    const onViolation = (event: SecurityPolicyViolationEvent) => {
        const attributes = {
            directive: event.effectiveDirective,
            blockedUri: withoutQuery(event.blockedURI),
            sourceFile: withoutQuery(event.sourceFile),
            lineNumber: event.lineNumber,
            disposition: event.disposition,
        };
        const key = JSON.stringify(attributes);
        if (seen.has(key) || isIgnored(attributes)) {
            return;
        }
        seen.add(key);

        if (isStarted) {
            send(attributes);
        } else if (pending.length < MAX_PENDING_VIOLATIONS) {
            pending.push(attributes);
        }
    };
    document.addEventListener('securitypolicyviolation', onViolation);

    const globals = window as any;
    const earlyViolations = globals[EARLY_VIOLATIONS];
    globals[EARLY_VIOLATIONS] = 'taken';
    if (Array.isArray(earlyViolations)) {
        earlyViolations.forEach(onViolation);
    }

    return {
        start: () => {
            isStarted = true;
            pending.forEach((attributes) => send(attributes));
            pending = [];
        },
        discard: () => {
            pending = [];
        },
        dispose: () => document.removeEventListener('securitypolicyviolation', onViolation),
    };
}
