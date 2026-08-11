/**
 * Retain scroll position between page changes
 *
 * Use session storage to store the scroll position and get it on page load
 */
const SCROLL_POSITION_LOCALSTORAGE_KEY = 'docs-scroll-position';
const RESET_SCROLL_ON_UNLOAD_LOCALSTORAGE_KEY = 'ignore-docs-scroll-position';
// NOTE: Need page nav to be on page on page load (ie, not generated on client side)
const NAV_SCROLL_CONTAINER_SELECTOR = '#docs-nav-scroll';

export function initNavScrollPositionSync() {
    const restoreScroll = () => {
        const nav = document.querySelector(NAV_SCROLL_CONTAINER_SELECTOR);
        const top = sessionStorage.getItem(SCROLL_POSITION_LOCALSTORAGE_KEY);

        if (nav && top !== null) {
            nav.scrollTop = parseInt(top, 10);
        }

        // Don't reset on page load - reset should be set after the page has loaded
        sessionStorage.removeItem(RESET_SCROLL_ON_UNLOAD_LOCALSTORAGE_KEY);
    };

    const saveScroll = () => {
        const resetScroll = sessionStorage.getItem(RESET_SCROLL_ON_UNLOAD_LOCALSTORAGE_KEY) === 'true';
        if (resetScroll) {
            sessionStorage.removeItem(RESET_SCROLL_ON_UNLOAD_LOCALSTORAGE_KEY);
            sessionStorage.removeItem(SCROLL_POSITION_LOCALSTORAGE_KEY);
            return;
        }

        const nav = document.querySelector(NAV_SCROLL_CONTAINER_SELECTOR);
        if (!nav) {
            return;
        }

        sessionStorage.setItem(SCROLL_POSITION_LOCALSTORAGE_KEY, nav.scrollTop.toString());
    };

    document.addEventListener('astro:before-preparation', saveScroll);
    document.addEventListener('astro:page-load', restoreScroll);

    // The astro:* events above cover router navigations; these cover hard ones.
    window.addEventListener('load', restoreScroll);
    window.addEventListener('beforeunload', saveScroll);
}

export function resetScrollPosition() {
    sessionStorage.setItem(RESET_SCROLL_ON_UNLOAD_LOCALSTORAGE_KEY, 'true');
}
