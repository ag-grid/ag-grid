// @vitest-environment jsdom
import { replaceHistoryUrl } from '@ag-website-shared/utils/historyUrl';
import { vi } from 'vitest';

import {
    WEBSITE_MONITORING_GTM_START_SCRIPT,
    WEBSITE_MONITORING_GTM_STOP_SCRIPT,
    WEBSITE_MONITORING_QUEUE,
} from './gtmTags';

const dash0 = vi.hoisted(() => ({
    init: vi.fn(),
    sendEvent: vi.fn(),
    startView: vi.fn(),
    reportError: vi.fn(),
    terminateSession: vi.fn(),
}));
// Lets a test hold the SDK import open, or fail it, to reproduce what can happen while it loads
const sdkLoader = vi.hoisted(() => ({
    pending: undefined as Promise<void> | undefined,
    failuresLeft: 0,
}));
const loadSdk = async () => {
    await sdkLoader.pending;
    if (sdkLoader.failuresLeft > 0) {
        sdkLoader.failuresLeft--;
        throw new Error('Failed to fetch dynamically imported module');
    }
    return dash0;
};

function holdSdkImport() {
    let release!: () => void;
    sdkLoader.pending = new Promise<void>((resolve) => {
        release = resolve;
    });
    return async () => {
        release();
        sdkLoader.pending = undefined;
        await vi.dynamicImportSettled();
    };
}

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

let dispose: (() => void) | undefined;

// Each test gets a fresh module, as a page load would, since monitoring starts at most once
async function initWebsiteMonitoring() {
    vi.resetModules();
    const websiteMonitoring = await import('./websiteMonitoring');
    dispose = websiteMonitoring.initWebsiteMonitoring(CONFIG);
    await vi.dynamicImportSettled();
    return websiteMonitoring;
}

// jsdom has no SecurityPolicyViolationEvent, so build one with the fields the reporter reads
function dispatchCspViolation() {
    const event = Object.assign(new Event('securitypolicyviolation'), {
        effectiveDirective: 'script-src-elem',
        blockedURI: 'inline',
        sourceFile: 'https://www.ag-grid.com/contact/',
        lineNumber: 12,
        disposition: 'enforce',
    });
    document.dispatchEvent(event);
}

beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any)[WEBSITE_MONITORING_QUEUE];
    sdkLoader.pending = undefined;
    sdkLoader.failuresLeft = 0;
    // Registered per test, since a vi.mock factory's result outlives vi.resetModules
    vi.doMock('@dash0/sdk-web', loadSdk);
});

function stubReload() {
    const reload = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload });
    return reload;
}

afterEach(() => {
    dispose?.();
    dispose = undefined;
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
        const reload = stubReload();
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        await fireGtmTag(WEBSITE_MONITORING_GTM_STOP_SCRIPT);

        expect(dash0.terminateSession).toHaveBeenCalledTimes(1);
        expect(reload).toHaveBeenCalledTimes(1);
    });

    test('ignores stop when monitoring never started', async () => {
        const reload = stubReload();
        await fireGtmTag(WEBSITE_MONITORING_GTM_STOP_SCRIPT);
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_STOP_SCRIPT);

        expect(dash0.init).not.toHaveBeenCalled();
        expect(dash0.terminateSession).not.toHaveBeenCalled();
        expect(reload).not.toHaveBeenCalled();
    });

    describe('while the SDK is loading', () => {
        // Commands are pushed without awaiting the import, which is being held open
        const pushCommand = (script: string) => new Function(script)();

        test('cancels the start when GTM sends stop, without initialising the SDK', async () => {
            const reload = stubReload();
            const releaseSdkImport = holdSdkImport();
            vi.resetModules();
            const { initWebsiteMonitoring } = await import('./websiteMonitoring');
            dispose = initWebsiteMonitoring(CONFIG);

            pushCommand(WEBSITE_MONITORING_GTM_START_SCRIPT);
            pushCommand(WEBSITE_MONITORING_GTM_STOP_SCRIPT);
            await releaseSdkImport();

            expect(dash0.init).not.toHaveBeenCalled();
            expect(dash0.terminateSession).not.toHaveBeenCalled();
            expect(reload).not.toHaveBeenCalled();
        });

        test('cancels a start queued before monitoring loaded when a stop is queued after it', async () => {
            const releaseSdkImport = holdSdkImport();
            pushCommand(WEBSITE_MONITORING_GTM_START_SCRIPT);
            pushCommand(WEBSITE_MONITORING_GTM_STOP_SCRIPT);
            vi.resetModules();
            const { initWebsiteMonitoring } = await import('./websiteMonitoring');
            dispose = initWebsiteMonitoring(CONFIG);
            await releaseSdkImport();

            expect(dash0.init).not.toHaveBeenCalled();
        });

        test('starts once when consent is withdrawn and granted again', async () => {
            const releaseSdkImport = holdSdkImport();
            vi.resetModules();
            const { initWebsiteMonitoring } = await import('./websiteMonitoring');
            dispose = initWebsiteMonitoring(CONFIG);

            pushCommand(WEBSITE_MONITORING_GTM_START_SCRIPT);
            pushCommand(WEBSITE_MONITORING_GTM_STOP_SCRIPT);
            pushCommand(WEBSITE_MONITORING_GTM_START_SCRIPT);
            await releaseSdkImport();

            expect(dash0.init).toHaveBeenCalledTimes(1);
        });
    });

    test('retries on the next start when the SDK fails to load', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        sdkLoader.failuresLeft = 1;
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);
        expect(dash0.init).not.toHaveBeenCalled();

        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        expect(dash0.init).toHaveBeenCalledTimes(1);
    });
});

describe('page views', () => {
    // What the ClientRouter does once a navigation has finished: the new path and title are in place
    function finishNavigation(path: string, title: string) {
        replaceHistoryUrl(path);
        document.title = title;
        document.dispatchEvent(new Event('astro:page-load'));
    }

    afterEach(() => {
        replaceHistoryUrl('/');
    });

    test('turns off the SDK virtual page views, which would pair the new path with the old title', async () => {
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        expect(dash0.init).toHaveBeenCalledWith(
            expect.objectContaining({ pageViewInstrumentation: { trackVirtualPageViews: false } })
        );
    });

    test('records a navigation under the title of the page navigated to', async () => {
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        finishNavigation('/charts/line-series/', 'Line Series');

        expect(dash0.startView).toHaveBeenCalledTimes(1);
        expect(dash0.startView).toHaveBeenCalledWith('Line Series');
    });

    test('does not record the page that the SDK has already recorded as the initial page view', async () => {
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        document.dispatchEvent(new Event('astro:page-load'));

        expect(dash0.startView).not.toHaveBeenCalled();
    });

    test('does not record a navigation that keeps the path, such as to a heading', async () => {
        await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);
        finishNavigation('/charts/line-series/', 'Line Series');
        dash0.startView.mockClear();

        finishNavigation('/charts/line-series/#options', 'Line Series');

        expect(dash0.startView).not.toHaveBeenCalled();
    });

    test('records nothing before monitoring has started', async () => {
        await initWebsiteMonitoring();

        finishNavigation('/charts/line-series/', 'Line Series');

        expect(dash0.startView).not.toHaveBeenCalled();
    });
});

describe('URL scrubbing', () => {
    const urlAttributes = (url: string) => {
        const { href, pathname, hostname, protocol, hash, search } = new URL(url);
        return {
            'url.full': href,
            'url.path': pathname,
            'url.domain': hostname,
            'url.scheme': protocol.replace(':', ''),
            'url.fragment': hash ? hash.replace('#', '') : undefined,
            'url.query': search ? search.replace('?', '') : undefined,
        };
    };

    test('is applied to the URLs the SDK adds to its telemetry', async () => {
        const { scrubErrorPageQuery } = await initWebsiteMonitoring();
        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        expect(dash0.init).toHaveBeenCalledWith(expect.objectContaining({ urlAttributeScrubber: scrubErrorPageQuery }));
    });

    test('redacts the query of an error page, which holds the error arguments', async () => {
        const { scrubErrorPageQuery } = await initWebsiteMonitoring();
        const attributes = urlAttributes(
            'https://www.ag-grid.com/javascript-data-grid/errors/200/?_version_=36.2.0&row=%7B%22name%22%3A%22Ada%22%7D'
        );

        expect(scrubErrorPageQuery(attributes)).toEqual({
            ...attributes,
            'url.full': 'https://www.ag-grid.com/javascript-data-grid/errors/200/?REDACTED',
            'url.query': 'REDACTED',
        });
    });

    test('keeps the fragment of an error page', async () => {
        const { scrubErrorPageQuery } = await initWebsiteMonitoring();

        expect(
            scrubErrorPageQuery(urlAttributes('https://www.ag-grid.com/react-data-grid/errors/7?a=1#details'))
        ).toEqual(
            expect.objectContaining({
                'url.full': 'https://www.ag-grid.com/react-data-grid/errors/7?REDACTED#details',
                'url.fragment': 'details',
            })
        );
    });

    test('keeps the query of any other page', async () => {
        const { scrubErrorPageQuery } = await initWebsiteMonitoring();
        const attributes = urlAttributes('https://www.ag-grid.com/charts/?utm_source=newsletter');

        expect(scrubErrorPageQuery(attributes)).toBe(attributes);
    });

    test('leaves an error page without a query as it is', async () => {
        const { scrubErrorPageQuery } = await initWebsiteMonitoring();
        const attributes = urlAttributes('https://www.ag-grid.com/javascript-data-grid/errors/200/');

        expect(scrubErrorPageQuery(attributes)).toBe(attributes);
    });
});

describe('CSP violations', () => {
    test('are reported once monitoring starts, including those from before it started', async () => {
        await initWebsiteMonitoring();
        dispatchCspViolation();
        expect(dash0.sendEvent).not.toHaveBeenCalled();

        await fireGtmTag(WEBSITE_MONITORING_GTM_START_SCRIPT);

        expect(dash0.sendEvent).toHaveBeenCalledWith('csp_violation', {
            attributes: expect.objectContaining({ directive: 'script-src-elem', blockedUri: 'inline' }),
            severity: 'WARN',
        });
    });

    test('are never sent when GTM stops monitoring before it has started', async () => {
        const releaseSdkImport = holdSdkImport();
        vi.resetModules();
        const { initWebsiteMonitoring } = await import('./websiteMonitoring');
        dispose = initWebsiteMonitoring(CONFIG);
        dispatchCspViolation();

        new Function(WEBSITE_MONITORING_GTM_START_SCRIPT)();
        new Function(WEBSITE_MONITORING_GTM_STOP_SCRIPT)();
        await releaseSdkImport();

        expect(dash0.sendEvent).not.toHaveBeenCalled();
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
