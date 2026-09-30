// @vitest-environment jsdom
import { vi } from 'vitest';

import { hasCookieConsent, onCookieConsentChange } from './cookieConsent';

describe('hasCookieConsent', () => {
    test('is granted when the category cookie is true', () => {
        expect(hasCookieConsent('analytics', 'cookies-functional=true; cookies-analytics=true')).toBe(true);
    });

    test('is not granted when the category cookie is false', () => {
        expect(hasCookieConsent('analytics', 'cookies-functional=true; cookies-analytics=false')).toBe(false);
    });

    test('is not granted before the visitor has answered the banner', () => {
        expect(hasCookieConsent('analytics', 'cookies-functional=true')).toBe(false);
        expect(hasCookieConsent('analytics', '')).toBe(false);
    });

    test('reads only the requested category', () => {
        const cookies = 'cookies-analytics=false; cookies-marketing=true';
        expect(hasCookieConsent('marketing', cookies)).toBe(true);
        expect(hasCookieConsent('analytics', cookies)).toBe(false);
    });

    test('does not match a cookie whose name only ends with the category cookie name', () => {
        expect(hasCookieConsent('analytics', 'other-cookies-analytics=true')).toBe(false);
    });
});

describe('onCookieConsentChange', () => {
    let stopListening: (() => void) | undefined;

    function setAnalyticsConsent(value: 'true' | 'false') {
        document.cookie = `cookies-analytics=${value}; path=/`;
    }

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
        document.cookie = 'cookies-analytics=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    afterEach(() => {
        stopListening?.();
        stopListening = undefined;
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    describe('without the Cookie Store API', () => {
        test('reports a change while the visitor stays on the page', () => {
            const listener = vi.fn();
            stopListening = onCookieConsentChange('analytics', listener);

            setAnalyticsConsent('true');
            vi.advanceTimersByTime(1000);
            setAnalyticsConsent('false');
            vi.advanceTimersByTime(1000);

            expect(listener.mock.calls).toEqual([[true], [false]]);
        });

        test('does not report when consent is unchanged', () => {
            setAnalyticsConsent('true');
            const listener = vi.fn();
            stopListening = onCookieConsentChange('analytics', listener);

            vi.advanceTimersByTime(5000);

            expect(listener).not.toHaveBeenCalled();
        });

        test('stops polling once unsubscribed', () => {
            const listener = vi.fn();
            onCookieConsentChange('analytics', listener)();

            setAnalyticsConsent('true');
            vi.advanceTimersByTime(5000);

            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('with the Cookie Store API', () => {
        let cookieStore: EventTarget;

        beforeEach(() => {
            cookieStore = new EventTarget();
            vi.stubGlobal('cookieStore', cookieStore);
        });

        test('reports a change as soon as the cookie changes, without polling', () => {
            const listener = vi.fn();
            stopListening = onCookieConsentChange('analytics', listener);

            setAnalyticsConsent('true');
            cookieStore.dispatchEvent(new Event('change'));

            expect(listener).toHaveBeenCalledWith(true);
            expect(vi.getTimerCount()).toBe(0);
        });

        test('stops listening once unsubscribed', () => {
            const listener = vi.fn();
            onCookieConsentChange('analytics', listener)();

            setAnalyticsConsent('true');
            cookieStore.dispatchEvent(new Event('change'));

            expect(listener).not.toHaveBeenCalled();
        });
    });
});
