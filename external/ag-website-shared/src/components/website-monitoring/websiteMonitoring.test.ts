// @vitest-environment jsdom
import { vi } from 'vitest';

const dash0 = vi.hoisted(() => ({
    init: vi.fn(),
    sendEvent: vi.fn(),
    reportError: vi.fn(),
    terminateSession: vi.fn(),
}));
vi.mock('@dash0/sdk-web', () => dash0);

const CONFIG = {
    serviceName: 'test-website',
    serviceVersion: '1.2.3',
    environment: 'staging',
    endpointUrl: 'https://ingress.example.com',
    authToken: 'auth_test',
};

function setAnalyticsConsent(value: 'true' | 'false') {
    document.cookie = `cookies-analytics=${value}; path=/`;
}

let stopListening: (() => void) | undefined;

// Each test gets a fresh module, as a page load would, since monitoring starts at most once
async function initWebsiteMonitoring() {
    vi.resetModules();
    const websiteMonitoring = await import('./websiteMonitoring');
    stopListening = websiteMonitoring.initWebsiteMonitoring(CONFIG);
    await vi.dynamicImportSettled();
    return websiteMonitoring;
}

afterEach(() => {
    stopListening?.();
    stopListening = undefined;
    vi.restoreAllMocks();
});

async function navigate() {
    document.dispatchEvent(new Event('astro:page-load'));
    await vi.dynamicImportSettled();
}

describe('initWebsiteMonitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.cookie = 'cookies-analytics=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    test('does not start before the visitor has answered the consent banner', async () => {
        await initWebsiteMonitoring();

        expect(dash0.init).not.toHaveBeenCalled();
    });

    test('does not start when analytics consent is declined', async () => {
        setAnalyticsConsent('false');
        await initWebsiteMonitoring();

        expect(dash0.init).not.toHaveBeenCalled();
    });

    test('starts with the given config when analytics consent is granted', async () => {
        setAnalyticsConsent('true');
        await initWebsiteMonitoring();

        expect(dash0.init).toHaveBeenCalledTimes(1);
        expect(dash0.init).toHaveBeenCalledWith(
            expect.objectContaining({
                serviceName: 'test-website',
                serviceVersion: '1.2.3',
                environment: 'staging',
                endpoint: { url: 'https://ingress.example.com', authToken: 'auth_test' },
            })
        );
    });

    test('starts on the next navigation once consent is granted', async () => {
        await initWebsiteMonitoring();
        setAnalyticsConsent('true');
        await navigate();
        await navigate();

        expect(dash0.init).toHaveBeenCalledTimes(1);
    });

    test('ends the session and reloads when consent is withdrawn', async () => {
        const reload = vi.fn();
        vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload });
        setAnalyticsConsent('true');
        await initWebsiteMonitoring();

        setAnalyticsConsent('false');
        await navigate();

        expect(dash0.terminateSession).toHaveBeenCalledTimes(1);
        expect(reload).toHaveBeenCalledTimes(1);
    });
});

describe('trackMonitoringEvent and reportMonitoringError', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('do nothing when monitoring has not started', async () => {
        setAnalyticsConsent('false');
        const { trackMonitoringEvent, reportMonitoringError } = await initWebsiteMonitoring();

        trackMonitoringEvent('contact_form_submit', { formLocation: 'Contact page' });
        reportMonitoringError(new Error('reCAPTCHA failed'));

        expect(dash0.sendEvent).not.toHaveBeenCalled();
        expect(dash0.reportError).not.toHaveBeenCalled();
    });

    test('send to Dash0 once monitoring has started', async () => {
        setAnalyticsConsent('true');
        const { trackMonitoringEvent, reportMonitoringError } = await initWebsiteMonitoring();
        const error = new Error('reCAPTCHA failed');

        trackMonitoringEvent('contact_form_submit', { formLocation: 'Contact page' });
        reportMonitoringError(error, { formLocation: 'Contact page' });
        reportMonitoringError('not an error');

        expect(dash0.sendEvent).toHaveBeenCalledWith('contact_form_submit', {
            attributes: { formLocation: 'Contact page' },
        });
        expect(dash0.reportError).toHaveBeenCalledWith(error, { attributes: { formLocation: 'Contact page' } });
        expect(dash0.reportError).toHaveBeenCalledWith('not an error', { attributes: undefined });
    });
});
