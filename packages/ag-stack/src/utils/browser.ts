/**
 * These variables are lazy loaded, as otherwise they try and get initialised when we are loading
 * unit tests and we don't have references to window or document in the unit tests
 */
let isSafari: boolean;
let isFirefox: boolean;
let isMacOs: boolean;
let isIOS: boolean;
let invisibleScrollbar: boolean;
let realCssEngine: boolean | undefined;
let browserScrollbarWidth: number;
let maxDivHeight: number;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isBrowserSafari(): boolean {
    if (isSafari === undefined) {
        isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    return isSafari;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isBrowserFirefox(): boolean {
    if (isFirefox === undefined) {
        isFirefox = /(firefox)/i.test(navigator.userAgent);
    }

    return isFirefox;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isMacOsUserAgent(): boolean {
    if (isMacOs === undefined) {
        isMacOs = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    }

    return isMacOs;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isIOSUserAgent(): boolean {
    if (isIOS === undefined) {
        isIOS =
            /iPad|iPhone|iPod/.test(navigator.platform) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    return isIOS;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getTabIndex(el: HTMLElement | null): string | null {
    if (!el) {
        return null;
    }

    const numberTabIndex = el.tabIndex;
    const tabIndex = el.getAttribute('tabIndex');

    if (numberTabIndex === -1 && (tabIndex === null || (tabIndex === '' && !_isBrowserFirefox()))) {
        return null;
    }

    return numberTabIndex.toString();
}

const CSS_ENGINE_PROBE_PROPERTY = '--ag-css-engine-probe';
const CSS_ENGINE_PROBE_VALUE = '137px';

/**
 * Whether a real CSS engine backs the DOM, as opposed to a headless one (jsdom, happy-dom) that
 * parses styles without computing them. `null` while there is no body to probe against.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _isRealCssEngine(): boolean | null {
    if (realCssEngine !== undefined) {
        return realCssEngine;
    }
    const body = typeof document === 'undefined' ? null : document.body;
    if (!body) {
        return null;
    }
    const parent = document.createElement('div');
    parent.style.setProperty(CSS_ENGINE_PROBE_PROPERTY, CSS_ENGINE_PROBE_VALUE);
    const child = document.createElement('div');
    parent.appendChild(child);
    body.appendChild(parent);
    // A real engine inherits the custom property down to the child, a headless DOM does not. Reading a
    // computed value rather than a measured one so a hidden body still gives a usable answer.
    realCssEngine =
        getComputedStyle(child).getPropertyValue(CSS_ENGINE_PROBE_PROPERTY).trim() === CSS_ENGINE_PROBE_VALUE;
    parent.remove();
    return realCssEngine;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getMaxDivHeight(): number {
    if (maxDivHeight !== undefined) {
        return maxDivHeight;
    }

    if (!document.body) {
        return -1;
    }

    let res = 1000000;
    // FF reports the height back but still renders blank after ~6M px
    const testUpTo = _isBrowserFirefox() ? 6000000 : 1000000000;
    const div = document.createElement('div');
    document.body.appendChild(div);

    while (true) {
        const test = res * 2;
        div.style.height = test + 'px';

        if (test > testUpTo || div.clientHeight !== test) {
            break;
        } else {
            res = test;
        }
    }

    div.remove();
    maxDivHeight = res;
    return res;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getScrollbarWidth(): number | null {
    if (browserScrollbarWidth == null) {
        initScrollbarWidthAndVisibility();
    }
    return browserScrollbarWidth;
}

function initScrollbarWidthAndVisibility(): void {
    const body = document.body;
    const div = document.createElement('div');

    div.style.width = div.style.height = '100px';
    div.style.opacity = '0';
    div.style.overflow = 'scroll';
    (div.style as any).msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    div.style.position = 'absolute';

    body.appendChild(div);

    let width: number | null = div.offsetWidth - div.clientWidth;

    // if width is 0 and client width is 0, means the DOM isn't ready
    if (width === 0 && div.clientWidth === 0) {
        width = null;
    }

    // remove div
    if (div.parentNode) {
        div.remove();
    }

    if (width != null) {
        browserScrollbarWidth = width;
        invisibleScrollbar = width === 0;
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isInvisibleScrollbar(): boolean {
    if (invisibleScrollbar == null) {
        initScrollbarWidthAndVisibility();
    }
    return invisibleScrollbar;
}
