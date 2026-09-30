// @vitest-environment jsdom
import { vi } from 'vitest';

import {
    WEBSITE_MONITORING_GTM_START_SCRIPT,
    WEBSITE_MONITORING_GTM_STOP_SCRIPT,
    WEBSITE_MONITORING_QUEUE,
} from './gtmTags';

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

// Runs a GTM tag's script exactly as the tag injects it
async function fireGtmTag(script: string) {
    new Function(script)();
    await vi.dynamicImportSettled();
}

// Each test gets a fresh module, as a page load would, since monitoring starts at most once
async function initWebsiteMonitoring() {
    vi.resetModules();
    const websiteMonitoring = await import('./websiteMonitoring');
    websiteMonitoring.initWebsiteMonitoring(CONFIG);
    await vi.dynamicImportSettled();
    return websiteMonitoring;
}

beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any)[WEBSITE_MONITORING_QUEUE];
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('initWebsiteMonitoring', () => {
    test('does not start until GTM sends start', async () => {
        await initWebsiteMonitoring();

        expect(dash0.init).not.toHaveBeenCalled();
    });

    test('starts with the given config when GTM sends start', async () => {
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

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

    test('runs a start that GTM sent before monitoring loaded', async () => {
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);
        await initWebsiteMonitoring();

        expect(dash0.init).toHaveBeenCalledTimes(1);
    });

    test('starts only once when GTM sends start repeatedly', async () => {
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        expect(dash0.init).toHaveBeenCalledTimes(1);
    });

    test('ends the session and reloads when GTM sends stop', async () => {
        const reload = vi.fn();
        vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload });
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        await fireGtmTag(WEBSITE_MONITORING_GTM_STOP_SCRIPT);

        expect(dash0.terminateSession).toHaveBeenCalledTimes(1);
        expect(reload).toHaveBeenCalledTimes(1);
    });

    test('ignores stop when monitoring never started', async () => {
        const reload = vi.fn();
        vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload });
        await fireGtmTag(WEBSITE_MONITORING_GTM_STOP_SCRIPT);
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_STOP_SCRIPT);

        expect(dash0.init).not.toHaveBeenCalled();
        expect(dash0.terminateSession).not.toHaveBeenCalled();
        expect(reload).not.toHaveBeenCalled();
    });
});

describe('trackMonitoringEvent and reportMonitoringError', () => {
    test('do nothing when monitoring has not started', async () => {
        const { trackMonitoringEvent, reportMonitoringError } = await initWebsiteMonitoring();

        trackMonitoringEvent('contact_form_submit', { formLocation: 'Contact page' });
        reportMonitoringError(new Error('reCAPTCHA failed'));

        expect(dash0.sendEvent).not.toHaveBeenCalled();
        expect(dash0.reportError).not.toHaveBeenCalled();
    });

    test('send to Dash0 once monitoring has started', async () => {
        const { trackMonitoringEvent, reportMonitoringError } = await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);
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
