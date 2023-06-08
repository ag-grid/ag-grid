var MOBILE = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
export function isDesktop() {
    var userAgent = navigator.userAgent;
    if (MOBILE.some(function (r) { return r.test(userAgent); })) {
        return false;
    }
    return true;
}
