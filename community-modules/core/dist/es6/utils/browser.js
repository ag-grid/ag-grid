/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
/**
 * These variables are lazy loaded, as otherwise they try and get initialised when we are loading
 * unit tests and we don't have references to window or document in the unit tests
 * from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
 */
var isSafari;
var isIE;
var isEdge;
var isChrome;
var isFirefox;
var isIOS;
var invisibleScrollbar;
var browserScrollbarWidth;
export function isBrowserIE() {
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
        var win = window;
        isChrome = (!!win.chrome && (!!win.chrome.webstore || !!win.chrome.runtime)) ||
            (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));
    }
    return isChrome;
}
export function isBrowserFirefox() {
    if (isFirefox === undefined) {
        var win = window;
        isFirefox = typeof win.InstallTrigger !== 'undefined';
    }
    return isFirefox;
}
export function isIOSUserAgent() {
    if (isIOS === undefined) {
        // taken from https://stackoverflow.com/a/58064481/1388233
        isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
            // eslint-disable-next-line
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
            !window.MSStream;
    }
    return isIOS;
}
export function getTabIndex(el) {
    if (!el) {
        return null;
    }
    var numberTabIndex = el.tabIndex;
    var tabIndex = el.getAttribute('tabIndex');
    if (isBrowserIE() && numberTabIndex === 0 && tabIndex === null) {
        var map = {
            a: true,
            body: true,
            button: true,
            frame: true,
            iframe: true,
            img: true,
            input: true,
            isindex: true,
            object: true,
            select: true,
            textarea: true
        };
        return map[el.nodeName.toLowerCase()] === true ? '0' : null;
    }
    if (numberTabIndex === -1 && (tabIndex === null || (tabIndex === '' && !isBrowserFirefox()))) {
        return null;
    }
    return numberTabIndex.toString();
}
export function getMaxDivHeight() {
    if (!document.body) {
        return -1;
    }
    var res = 1000000;
    // FF reports the height back but still renders blank after ~6M px
    var testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
    var div = document.createElement('div');
    document.body.appendChild(div);
    while (true) {
        var test = res * 2;
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
    var body = document.body;
    var div = document.createElement('div');
    div.style.width = div.style.height = '100px';
    div.style.opacity = '0';
    div.style.overflow = 'scroll';
    div.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    div.style.position = 'absolute';
    body.appendChild(div);
    var width = div.offsetWidth - div.clientWidth;
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
    var prefixes = ['webkit', 'moz', 'o', 'ms'];
    var div = document.createElement('div');
    var body = document.getElementsByTagName('body')[0];
    var found = false;
    var p;
    body.appendChild(div);
    div.setAttribute('style', prefixes.map(function (prefix) { return "-" + prefix + "-overflow-scrolling: touch"; }).concat('overflow-scrolling: touch').join(';'));
    var computedStyle = window.getComputedStyle(div);
    if (computedStyle.overflowScrolling === 'touch') {
        found = true;
    }
    if (!found) {
        for (var _i = 0, prefixes_1 = prefixes; _i < prefixes_1.length; _i++) {
            p = prefixes_1[_i];
            if (computedStyle[p + "OverflowScrolling"] === 'touch') {
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
