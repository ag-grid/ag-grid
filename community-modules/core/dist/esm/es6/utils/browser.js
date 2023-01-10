/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
/**
 * These variables are lazy loaded, as otherwise they try and get initialised when we are loading
 * unit tests and we don't have references to window or document in the unit tests
 * from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
 */
let isSafari;
let isIE;
let isEdge;
let isChrome;
let isFirefox;
let isMacOs;
let isIOS;
let invisibleScrollbar;
let browserScrollbarWidth;
let browserInfo;
/**
 * from https://stackoverflow.com/a/16938481/1388233
 */
export function getBrowserInfo() {
    if (browserInfo) {
        return browserInfo;
    }
    const userAgent = navigator.userAgent;
    let match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    let tem;
    let version;
    if (/trident/i.test(match[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
        version = tem[1] != null ? parseFloat(tem[1]) : 0;
        return {
            name: 'IE',
            version
        };
    }
    if (match[1] === 'Chrome') {
        tem = userAgent.match(/\bOPR|Edge\/(\d+)/);
        if (tem != null) {
            version = tem[1] != null ? parseFloat(tem[1]) : 0;
            return {
                name: 'Opera',
                version
            };
        }
    }
    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = userAgent.match(/version\/(\d+)/i);
    if (tem != null) {
        match.splice(1, 1, tem[1]);
    }
    const name = match[0];
    version = match[1] != null ? parseFloat(match[1]) : 0;
    browserInfo = { name, version };
    return browserInfo;
}
function isBrowserIE() {
    if (isIE === undefined) {
        isIE = /*@cc_on!@*/ false || !!document.documentMode; // At least IE6
    }
    return isIE;
}
export function isBrowserEdge() {
    if (isEdge === undefined) {
        isEdge = !isBrowserIE() && !!window.StyleMedia;
    }
    return isEdge;
}
export function isBrowserSafari() {
    if (isSafari === undefined) {
        // taken from https://stackoverflow.com/a/23522755/1388233
        isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    return isSafari;
}
export function isBrowserChrome() {
    if (isChrome === undefined) {
        const win = window;
        isChrome = (!!win.chrome && (!!win.chrome.webstore || !!win.chrome.runtime)) ||
            (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));
    }
    return isChrome;
}
export function isBrowserFirefox() {
    if (isFirefox === undefined) {
        const win = window;
        isFirefox = typeof win.InstallTrigger !== 'undefined';
    }
    return isFirefox;
}
export function isMacOsUserAgent() {
    if (isMacOs === undefined) {
        isMacOs = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    }
    return isMacOs;
}
export function isIOSUserAgent() {
    if (isIOS === undefined) {
        // taken from https://stackoverflow.com/a/58064481/1388233
        isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
            // eslint-disable-next-line
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
            // @ts-ignore
            !window.MSStream;
    }
    return isIOS;
}
export function browserSupportsPreventScroll() {
    // all browsers except safari support focus({ preventScroll: true }).
    // this feature was added on Safari 15+
    return !isBrowserSafari() || getBrowserInfo().version >= 15;
}
export function getTabIndex(el) {
    if (!el) {
        return null;
    }
    const numberTabIndex = el.tabIndex;
    const tabIndex = el.getAttribute('tabIndex');
    if (numberTabIndex === -1 && (tabIndex === null || (tabIndex === '' && !isBrowserFirefox()))) {
        return null;
    }
    return numberTabIndex.toString();
}
export function getMaxDivHeight() {
    if (!document.body) {
        return -1;
    }
    let res = 1000000;
    // FF reports the height back but still renders blank after ~6M px
    const testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
    const div = document.createElement('div');
    document.body.appendChild(div);
    while (true) {
        const test = res * 2;
        div.style.height = test + 'px';
        if (test > testUpTo || div.clientHeight !== test) {
            break;
        }
        else {
            res = test;
        }
    }
    document.body.removeChild(div);
    return res;
}
export function getScrollbarWidth() {
    if (browserScrollbarWidth == null) {
        initScrollbarWidthAndVisibility();
    }
    return browserScrollbarWidth;
}
function initScrollbarWidthAndVisibility() {
    const body = document.body;
    const div = document.createElement('div');
    div.style.width = div.style.height = '100px';
    div.style.opacity = '0';
    div.style.overflow = 'scroll';
    div.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    div.style.position = 'absolute';
    body.appendChild(div);
    let width = div.offsetWidth - div.clientWidth;
    // if width is 0 and client width is 0, means the DOM isn't ready
    if (width === 0 && div.clientWidth === 0) {
        width = null;
    }
    // remove div
    if (div.parentNode) {
        div.parentNode.removeChild(div);
    }
    if (width != null) {
        browserScrollbarWidth = width;
        invisibleScrollbar = width === 0;
    }
}
export function isInvisibleScrollbar() {
    if (invisibleScrollbar == null) {
        initScrollbarWidthAndVisibility();
    }
    return invisibleScrollbar;
}
/** @deprecated */
export function hasOverflowScrolling() {
    const prefixes = ['webkit', 'moz', 'o', 'ms'];
    const div = document.createElement('div');
    const body = document.getElementsByTagName('body')[0];
    let found = false;
    let p;
    body.appendChild(div);
    div.setAttribute('style', prefixes.map(prefix => `-${prefix}-overflow-scrolling: touch`).concat('overflow-scrolling: touch').join(';'));
    const computedStyle = window.getComputedStyle(div);
    if (computedStyle.overflowScrolling === 'touch') {
        found = true;
    }
    if (!found) {
        for (p of prefixes) {
            if (computedStyle[`${p}OverflowScrolling`] === 'touch') {
                found = true;
                break;
            }
        }
    }
    if (div.parentNode) {
        div.parentNode.removeChild(div);
    }
    return found;
}
/**
 * Gets the document body width
 * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
 * @returns {number}
 */
export function getBodyWidth() {
    if (document.body) {
        return document.body.clientWidth;
    }
    if (window.innerHeight) {
        return window.innerWidth;
    }
    if (document.documentElement && document.documentElement.clientWidth) {
        return document.documentElement.clientWidth;
    }
    return -1;
}
/**
 * Gets the body height
 * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
 * @returns {number}
 */
export function getBodyHeight() {
    if (document.body) {
        return document.body.clientHeight;
    }
    if (window.innerHeight) {
        return window.innerHeight;
    }
    if (document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }
    return -1;
}
