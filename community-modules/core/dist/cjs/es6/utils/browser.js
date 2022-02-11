/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
let isIOS;
let invisibleScrollbar;
let browserScrollbarWidth;
function isBrowserIE() {
    if (isIE === undefined) {
        isIE = /*@cc_on!@*/ false || !!document.documentMode; // At least IE6
    }
    return isIE;
}
function isBrowserEdge() {
    if (isEdge === undefined) {
        isEdge = !isBrowserIE() && !!window.StyleMedia;
    }
    return isEdge;
}
exports.isBrowserEdge = isBrowserEdge;
function isBrowserSafari() {
    if (isSafari === undefined) {
        // taken from https://stackoverflow.com/a/23522755/1388233
        isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    return isSafari;
}
exports.isBrowserSafari = isBrowserSafari;
function isBrowserChrome() {
    if (isChrome === undefined) {
        const win = window;
        isChrome = (!!win.chrome && (!!win.chrome.webstore || !!win.chrome.runtime)) ||
            (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));
    }
    return isChrome;
}
exports.isBrowserChrome = isBrowserChrome;
function isBrowserFirefox() {
    if (isFirefox === undefined) {
        const win = window;
        isFirefox = typeof win.InstallTrigger !== 'undefined';
    }
    return isFirefox;
}
exports.isBrowserFirefox = isBrowserFirefox;
function isIOSUserAgent() {
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
exports.isIOSUserAgent = isIOSUserAgent;
function getTabIndex(el) {
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
exports.getTabIndex = getTabIndex;
function getMaxDivHeight() {
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
exports.getMaxDivHeight = getMaxDivHeight;
function getScrollbarWidth() {
    if (browserScrollbarWidth == null) {
        initScrollbarWidthAndVisibility();
    }
    return browserScrollbarWidth;
}
exports.getScrollbarWidth = getScrollbarWidth;
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
function isInvisibleScrollbar() {
    if (invisibleScrollbar == null) {
        initScrollbarWidthAndVisibility();
    }
    return invisibleScrollbar;
}
exports.isInvisibleScrollbar = isInvisibleScrollbar;
/** @deprecated */
function hasOverflowScrolling() {
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
exports.hasOverflowScrolling = hasOverflowScrolling;
/**
 * Gets the document body width
 * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
 * @returns {number}
 */
function getBodyWidth() {
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
exports.getBodyWidth = getBodyWidth;
/**
 * Gets the body height
 * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
 * @returns {number}
 */
function getBodyHeight() {
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
exports.getBodyHeight = getBodyHeight;

//# sourceMappingURL=browser.js.map
