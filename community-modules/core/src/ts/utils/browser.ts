/**
 * These variables are lazy loaded, as otherwise they try and get initialised when we are loading
 * unit tests and we don't have references to window or document in the unit tests
 * from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
 */
let isSafari: boolean;
let isIE: boolean;
let isEdge: boolean;
let isChrome: boolean;
let isFirefox: boolean;
let isIOS: boolean;

export function isBrowserIE(): boolean {
    if (isIE === undefined) {
        isIE = /*@cc_on!@*/false || !!(document as any).documentMode; // At least IE6
    }

    return isIE;
}

export function isBrowserEdge(): boolean {
    if (isEdge === undefined) {
        isEdge = !isBrowserIE() && !!(window as any).StyleMedia;
    }

    return isEdge;
}

export function isBrowserSafari(): boolean {
    if (isSafari === undefined) {
        // taken from https://github.com/ag-grid/ag-grid/issues/550
        const anyWindow = window as any;
        const hasNotification = (p: any) => p && p.toString() === "[object SafariRemoteNotification]";

        isSafari = Object.prototype.toString.call(anyWindow.HTMLElement).indexOf('Constructor') > 0
            || hasNotification(anyWindow.safari && anyWindow.safari.pushNotification);
    }

    return isSafari;
}

export function isBrowserChrome(): boolean {
    console.log(`isChrome: ${isChrome}`);
    if (isChrome === undefined) {
        const win = window as any;
        isChrome = (!!win.chrome && (!!win.chrome.webstore || !!win.chrome.runtime)) ||
            (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));
    }

    return isChrome;
}

export function isBrowserFirefox(): boolean {
    console.log(`isFirefox: ${isFirefox}`);
    if (isFirefox === undefined) {
        const win = window as any;

        isFirefox = typeof win.InstallTrigger !== 'undefined';
    }

    return isFirefox;
}

export function isIOSUserAgent(): boolean {
    if (isIOS === undefined) {
        // taken from https://stackoverflow.com/a/58064481/1388233
        isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
            // eslint-disable-next-line
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
            !window.MSStream;
    }

    return isIOS;
}
