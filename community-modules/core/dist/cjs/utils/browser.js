/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
var isSafari;
var isIE;
var isEdge;
var isChrome;
var isFirefox;
var isIOS;
function isBrowserIE() {
    if (isIE === undefined) {
        isIE = /*@cc_on!@*/ false || !!document.documentMode; // At least IE6
    }
    return isIE;
}
exports.isBrowserIE = isBrowserIE;
function isBrowserEdge() {
    if (isEdge === undefined) {
        isEdge = !isBrowserIE() && !!window.StyleMedia;
    }
    return isEdge;
}
exports.isBrowserEdge = isBrowserEdge;
function isBrowserSafari() {
    if (isSafari === undefined) {
        // taken from https://github.com/ag-grid/ag-grid/issues/550
        var anyWindow = window;
        var hasNotification = function (p) { return p && p.toString() === '[object SafariRemoteNotification]'; };
        isSafari = Object.prototype.toString.call(anyWindow.HTMLElement).indexOf('Constructor') > 0
            || hasNotification(anyWindow.safari && anyWindow.safari.pushNotification);
    }
    return isSafari;
}
exports.isBrowserSafari = isBrowserSafari;
function isBrowserChrome() {
    if (isChrome === undefined) {
        var win = window;
        isChrome = (!!win.chrome && (!!win.chrome.webstore || !!win.chrome.runtime)) ||
            (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));
    }
    return isChrome;
}
exports.isBrowserChrome = isBrowserChrome;
function isBrowserFirefox() {
    if (isFirefox === undefined) {
        var win = window;
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
            !window.MSStream;
    }
    return isIOS;
}
exports.isIOSUserAgent = isIOSUserAgent;
function getTabIndex(el) {
    if (!el) {
        return null;
    }
    var numberTabIndex = el.tabIndex;
    var tabIndex = el.getAttribute('tabIndex');
    if (isBrowserIE() && numberTabIndex === 0 && el.getAttribute('tabIndex') === null) {
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
exports.getTabIndex = getTabIndex;
function getMaxDivHeight() {
    if (!document.body) {
        return -1;
    }
    var res = 1000000;
    // FF reports the height back but still renders blank after ~6M px
    var testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
    var div = document.createElement('div');
    document.body.appendChild(div);
    while (true) {
        var test_1 = res * 2;
        div.style.height = test_1 + 'px';
        if (test_1 > testUpTo || div.clientHeight !== test_1) {
            break;
        }
        else {
            res = test_1;
        }
    }
    document.body.removeChild(div);
    return res;
}
exports.getMaxDivHeight = getMaxDivHeight;
function getScrollbarWidth() {
    var body = document.body;
    var div = document.createElement('div');
    div.style.width = div.style.height = '100px';
    div.style.opacity = '0';
    div.style.overflow = 'scroll';
    div.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    div.style.position = 'absolute';
    body.appendChild(div);
    var width = div.offsetWidth - div.clientWidth;
    // remove divs
    if (div.parentNode) {
        div.parentNode.removeChild(div);
    }
    return width;
}
exports.getScrollbarWidth = getScrollbarWidth;
/** @deprecated */
function hasOverflowScrolling() {
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
