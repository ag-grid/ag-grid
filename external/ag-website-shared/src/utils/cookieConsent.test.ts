import { hasCookieConsent } from './cookieConsent';

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
