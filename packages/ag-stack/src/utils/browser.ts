/**
 * These variables are lazy loaded, as otherwise they try and get initialised when we are loading
 * unit tests and we don't have references to window or document in the unit tests
 */
let isSafari: boolean;
let isFirefox: boolean;
let isMacOs: boolean;
let isIOS: boolean;
let invisibleScrollbar: boolean;
let realCssEngine: boolean;
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

/** Class on the probe element {@link _isRealCssEngine} measures. Only ever in the DOM for the
 * duration of that measurement. */
const CSS_ENGINE_PROBE_CLASS = 'ag-css-engine-probe';
/** Arbitrary, but distinctive enough that a coincidental match is not plausible. */
const CSS_ENGINE_PROBE_WIDTH = 137;

/**
 * Whether there is a real CSS layout engine behind the DOM, as opposed to a headless DOM (jsdom,
 * happy-dom) that parses styles but lays nothing out and so reports every measurement as 0.
 *
 * Probed by resolving a custom property through to a width and measuring it: a real engine reports
 * the declared width back, a headless DOM reports 0. Returns `null` while there is no document body
 * to probe - the answer is unknown rather than negative. A definite answer is cached, so the
 * measurement is only ever taken once.
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
    const variable = '--ag-css-engine-probe';
    const parent = document.createElement('div');
    // Out of flow and invisible, but still laid out - `display: none` would measure 0 in a real engine.
    parent.style.cssText = `position:absolute;top:0;left:0;visibility:hidden;pointer-events:none;${variable}:${CSS_ENGINE_PROBE_WIDTH}px`;
    const child = document.createElement('div');
    child.className = CSS_ENGINE_PROBE_CLASS;
    child.style.width = `var(${variable})`;
    parent.appendChild(child);
    body.appendChild(parent);
    realCssEngine = child.clientWidth === CSS_ENGINE_PROBE_WIDTH;
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
