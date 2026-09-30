/**
 * The visitor's cookie-consent choices, as recorded by the Enzuzo banner.
 *
 * Enzuzo stores each category as its own first-party cookie (`cookies-analytics=true`, and so on).
 * The banner is a tag in the shared Google Tag Manager container rather than code in this repo, and
 * only reads its `window.__enzuzoConfig.callbacks` once, when it loads, so registering a callback
 * from here would race GTM. The cookies are the one interface that does not depend on load order.
 */
export type CookieConsentCategory = 'analytics' | 'functional' | 'marketing' | 'preferences';

// How often the cookies are re-read where the Cookie Store API cannot report changes
const POLL_INTERVAL_MILLIS = 1000;

function getCookie(name: string, cookies: string): string | undefined {
    for (const cookie of cookies.split(';')) {
        const separatorIndex = cookie.indexOf('=');
        if (separatorIndex !== -1 && cookie.slice(0, separatorIndex).trim() === name) {
            return cookie.slice(separatorIndex + 1).trim();
        }
    }
    return undefined;
}

/**
 * Whether the visitor has explicitly granted consent for `category`. A visitor who has not yet
 * answered the banner has not granted it.
 */
export function hasCookieConsent(category: CookieConsentCategory, cookies: string = document.cookie): boolean {
    return getCookie(`cookies-${category}`, cookies) === 'true';
}

/**
 * Calls `listener` whenever consent for `category` changes, with the new state.
 *
 * Changes are picked up as soon as the banner writes its cookie where the Cookie Store API is
 * available, and otherwise by polling, so a change is never left waiting for the visitor to navigate.
 *
 * @returns a function that stops listening
 */
export function onCookieConsentChange(
    category: CookieConsentCategory,
    listener: (isGranted: boolean) => void
): () => void {
    let isGranted = hasCookieConsent(category);
    const checkForChange = () => {
        const isNowGranted = hasCookieConsent(category);
        if (isNowGranted !== isGranted) {
            isGranted = isNowGranted;
            listener(isGranted);
        }
    };

    const cookieStore: EventTarget | undefined = (window as any).cookieStore;
    if (cookieStore) {
        cookieStore.addEventListener('change', checkForChange);
        return () => cookieStore.removeEventListener('change', checkForChange);
    }

    const intervalId = window.setInterval(checkForChange, POLL_INTERVAL_MILLIS);
    return () => window.clearInterval(intervalId);
}
