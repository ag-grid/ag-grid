import type { CspViolationReporter } from '@ag-website-shared/components/website-monitoring/cspViolationReporter';
import { createCspViolationReporter } from '@ag-website-shared/components/website-monitoring/cspViolationReporter';
import { WEBSITE_MONITORING_QUEUE } from '@ag-website-shared/components/website-monitoring/gtmTags';
import type * as Dash0 from '@dash0/sdk-web';

type EventAttributes = Record<string, string | number | boolean>;
type EventSeverity = 'INFO' | 'WARN' | 'ERROR';

export interface WebsiteMonitoringConfig {
    serviceName: string;
    serviceVersion?: string;
    environment: string;
    endpointUrl: string;
    authToken: string;
}

const SESSION_INACTIVITY_TIMEOUT_MILLIS = 30 * 60 * 1000;
const SESSION_TERMINATION_TIMEOUT_MILLIS = 4 * 60 * 60 * 1000;

const REDACTED = 'REDACTED';
// e.g. /javascript-data-grid/errors/200
const ERROR_PAGE_PATH = /\/errors\/[^/]+/;

/**
 * Redacts the query string of an error page's URL, in the URL attributes the SDK adds to its
 * telemetry. The grid links an error with its arguments in the query string, and those can hold
 * data from the visitor's grid. The page itself still shows them. Other pages' queries, such as
 * campaign parameters, are kept.
 *
 * The SDK also writes URLs outside these attributes, which this cannot reach: see
 * `loadedOnErrorPage`, and the referrer policy of the error page.
 */
export function scrubErrorPageQuery(attributes: Dash0.UrlAttributeRecord): Dash0.UrlAttributeRecord {
    if (!attributes['url.query'] || !ERROR_PAGE_PATH.test(attributes['url.path'] ?? '')) {
        return attributes;
    }
    const fullUrl = new URL(attributes['url.full']);
    fullUrl.search = REDACTED;
    return { ...attributes, 'url.full': fullUrl.href, 'url.query': REDACTED };
}

// 'starting' covers the SDK import, which a stop can overtake
let state: 'stopped' | 'starting' | 'running' = 'stopped';
let sdk: typeof Dash0 | undefined;
let cspViolations: CspViolationReporter | undefined;
let stopTrackingPageViews: (() => void) | undefined;
// The SDK puts the URL the document loaded on, query string included, in its navigation timing log
// without passing it through the URL scrubber. An error page's query can hold data from the
// visitor's grid, so monitoring never starts in a document that loaded on one, even after the
// visitor navigates away from it.
let loadedOnErrorPage = false;

/**
 * Real user monitoring through Dash0: page views, uncaught errors, fetch/XHR spans and web vitals.
 *
 * Dash0 keeps an anonymous session id in `localStorage`, so it only runs with analytics consent.
 * That decision is made in Google Tag Manager, whose tags send `start` and `stop` commands (see
 * ./gtmTags). This takes over the command queue and runs whatever was sent to it before it loaded.
 *
 * The SDK is imported on start, so a visitor without consent is never sent it. A stop that arrives
 * while it is still loading cancels the start. Once initialised it has no way to stop, so `stop`
 * then ends the session and reloads the page, which leaves it uninitialised.
 *
 * Also reports the page's CSP violations, which the SDK does not.
 *
 * Does not start in a document that loaded on an error page, see `loadedOnErrorPage`.
 *
 * @returns a function that stops listening for CSP violations and page navigations
 */
export function initWebsiteMonitoring(config: WebsiteMonitoringConfig): () => void {
    loadedOnErrorPage = ERROR_PAGE_PATH.test(window.location.pathname);
    cspViolations = createCspViolationReporter((attributes) =>
        trackMonitoringEvent('csp_violation', attributes, 'WARN')
    );

    const globals = window as any;
    const queued: unknown[] = Array.isArray(globals[WEBSITE_MONITORING_QUEUE]) ? globals[WEBSITE_MONITORING_QUEUE] : [];
    globals[WEBSITE_MONITORING_QUEUE] = { push: (command: unknown) => runCommand(command, config) };
    queued.forEach((command) => runCommand(command, config));

    return () => {
        cspViolations?.dispose();
        stopTrackingPageViews?.();
    };
}

function runCommand(command: unknown, config: WebsiteMonitoringConfig) {
    if (command === 'start') {
        startMonitoring(config);
    } else if (command === 'stop') {
        stopMonitoring();
    }
}

async function startMonitoring({
    serviceName,
    serviceVersion,
    environment,
    endpointUrl,
    authToken,
}: WebsiteMonitoringConfig) {
    if (state !== 'stopped' || loadedOnErrorPage) {
        return;
    }
    state = 'starting';

    try {
        const dash0 = await import('@dash0/sdk-web');
        if (state !== 'starting') {
            // Stopped while the SDK was loading, so there is nothing to undo
            return;
        }
        dash0.init({
            serviceName,
            serviceVersion,
            environment,
            endpoint: { url: endpointUrl, authToken },
            sessionInactivityTimeoutMillis: SESSION_INACTIVITY_TIMEOUT_MILLIS,
            sessionTerminationTimeoutMillis: SESSION_TERMINATION_TIMEOUT_MILLIS,
            // Recorded on astro:page-load instead, see trackVirtualPageViews
            pageViewInstrumentation: { trackVirtualPageViews: false },
            urlAttributeScrubber: scrubErrorPageQuery,
        });
        sdk = dash0;
        state = 'running';
        cspViolations?.start();
        stopTrackingPageViews = trackVirtualPageViews(dash0);
    } catch (error) {
        // Let the next start retry, e.g. after a transient network failure loading the SDK
        if (state === 'starting') {
            state = 'stopped';
        }
        // eslint-disable-next-line no-console
        console.warn('Website monitoring failed to start', error);
    }
}

/**
 * Records a page view for each Astro ClientRouter navigation, once the new page is in place.
 *
 * The SDK's own virtual page views are sent from inside `history.pushState`, where the router has
 * set `document.title` back to the previous page's title, so they pair the new URL with the old
 * title. Like the SDK, this only records a change of path.
 *
 * @returns a function that stops recording
 */
function trackVirtualPageViews(dash0: typeof Dash0) {
    let currentPath = window.location.pathname;
    const onPageLoad = () => {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            dash0.startView(document.title);
        }
    };
    document.addEventListener('astro:page-load', onPageLoad);
    return () => document.removeEventListener('astro:page-load', onPageLoad);
}

function stopMonitoring() {
    if (state === 'starting') {
        state = 'stopped';
        cspViolations?.discard();
    } else if (state === 'running') {
        sdk?.terminateSession();
        window.location.reload();
    }
}

/**
 * Sends a custom event, if monitoring is running. Attribute values must not identify the visitor.
 */
export function trackMonitoringEvent(name: string, attributes?: EventAttributes, severity?: EventSeverity) {
    sdk?.sendEvent(name, { attributes, severity });
}

/**
 * Reports a handled error, if monitoring is running. Uncaught errors are reported automatically.
 */
export function reportMonitoringError(error: unknown, attributes?: EventAttributes) {
    sdk?.reportError(error instanceof Error ? error : String(error), { attributes });
}
