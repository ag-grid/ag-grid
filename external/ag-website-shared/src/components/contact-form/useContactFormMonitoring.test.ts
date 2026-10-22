// @vitest-environment jsdom
import { vi } from 'vitest';

import { getInvalidFields, getSubmitAttributes, watchForStalledSubmit } from './useContactFormMonitoring';

const { trackMonitoringEvent } = vi.hoisted(() => ({ trackMonitoringEvent: vi.fn() }));
vi.mock('@ag-website-shared/components/website-monitoring/websiteMonitoring', () => ({
    trackMonitoringEvent,
    reportMonitoringError: vi.fn(),
}));

describe('getInvalidFields', () => {
    test('lists each invalid field with the rule it failed, never its value', () => {
        expect(
            getInvalidFields({
                first_name: { type: 'required', message: 'First name is required' },
                email: { type: 'pattern', message: 'Enter a valid email', ref: { value: 'not-an-email' } as any },
            })
        ).toBe('first_name:required,email:pattern');
    });
});

describe('getSubmitAttributes', () => {
    const NOW = 1_000_000;

    test('measures how long ago the captcha was solved and how long the form took', () => {
        expect(
            getSubmitAttributes(
                { captchaTimestamp: String(NOW - 95_000), enquiryType: 'Sales', isDebug: false },
                { firstInteractionTime: NOW - 300_000, failedAttempts: 2, now: NOW }
            )
        ).toEqual({
            captchaAgeMillis: 95_000,
            hasCaptchaTimestamp: true,
            timeOnFormMillis: 300_000,
            failedAttempts: 2,
            isOnline: true,
            enquiryType: 'Sales',
            isDebug: false,
        });
    });

    test('flags a missing captcha timestamp and omits what is unknown', () => {
        expect(getSubmitAttributes({ captchaTimestamp: '', isDebug: true }, { failedAttempts: 0, now: NOW })).toEqual({
            hasCaptchaTimestamp: false,
            failedAttempts: 0,
            isOnline: true,
            isDebug: true,
        });
    });
});

describe('watchForStalledSubmit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        trackMonitoringEvent.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('reports a submit that has not left the page after 10 seconds', () => {
        watchForStalledSubmit('Contact page');

        vi.advanceTimersByTime(9_999);
        expect(trackMonitoringEvent).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);

        expect(trackMonitoringEvent).toHaveBeenCalledWith(
            'contact_form_submit_stalled',
            { formLocation: 'Contact page', waitedMillis: 10_000, isOnline: true },
            'WARN'
        );
    });

    test('does not report once the browser navigates to Salesforce', () => {
        watchForStalledSubmit('Contact page');
        window.dispatchEvent(new Event('pagehide'));
        vi.advanceTimersByTime(10_000);

        expect(trackMonitoringEvent).not.toHaveBeenCalled();
    });

    test('does not report once the visitor navigates to another page of the site', () => {
        watchForStalledSubmit('Contact page');
        document.dispatchEvent(new Event('astro:before-swap'));
        vi.advanceTimersByTime(10_000);

        expect(trackMonitoringEvent).not.toHaveBeenCalled();
    });
});
