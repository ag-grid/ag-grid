import { hasCookieConsent, onCookieConsentChange } from '@ag-website-shared/utils/cookieConsent';
import type * as Dash0 from '@dash0/sdk-web';

type EventAttributes = Record<string, string | number | boolean>;

export interface WebsiteMonitoringConfig {
    serviceName: string;
    serviceVersion?: string;
    environment: string;
    endpointUrl: string;
    authToken: string;
}

const SESSION_INACTIVITY_TIMEOUT_MILLIS = 30 * 60 * 1000;
const SESSION_TERMINATION_TIMEOUT_MILLIS = 4 * 60 * 60 * 1000;

let hasStarted = false;
let sdk: typeof Dash0 | undefined;

/**
 * Real user monitoring through Dash0: page views, uncaught errors, fetch/XHR spans and web vitals.
 *
 * Dash0 keeps an anonymous session id in `localStorage`, so it only runs once the visitor has
 * granted analytics consent. The SDK is imported on demand, so a visitor who has not is never sent
 * it. It has no way to stop once initialised, so withdrawing consent ends the session and reloads
 * the page, which leaves it uninitialised.
 *
 * @returns a function that stops listening for consent changes
 */
export function initWebsiteMonitoring(config: WebsiteMonitoringConfig): () => void {
    if (hasCookieConsent('analytics')) {
        startMonitoring(config);
    }

    return onCookieConsentChange('analytics', (isGranted) => {
        if (isGranted) {
            startMonitoring(config);
        } else if (hasStarted) {
            sdk?.terminateSession();
            window.location.reload();
        }
    });
}

async function startMonitoring({
    serviceName,
    serviceVersion,
    environment,
    endpointUrl,
    authToken,
}: WebsiteMonitoringConfig) {
    if (hasStarted) {
        return;
    }
    hasStarted = true;

    try {
        const dash0 = await import('@dash0/sdk-web');
        dash0.init({
            serviceName,
            serviceVersion,
            environment,
            endpoint: { url: endpointUrl, authToken },
            sessionInactivityTimeoutMillis: SESSION_INACTIVITY_TIMEOUT_MILLIS,
            sessionTerminationTimeoutMillis: SESSION_TERMINATION_TIMEOUT_MILLIS,
        });
        sdk = dash0;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Website monitoring failed to start', error);
    }
}

/**
 * Sends a custom event, if monitoring is running. Attribute values must not identify the visitor.
 */
export function trackMonitoringEvent(name: string, attributes?: EventAttributes) {
    sdk?.sendEvent(name, { attributes });
}

/**
 * Reports a handled error, if monitoring is running. Uncaught errors are reported automatically.
 */
export function reportMonitoringError(error: unknown, attributes?: EventAttributes) {
    sdk?.reportError(error instanceof Error ? error : String(error), { attributes });
}
