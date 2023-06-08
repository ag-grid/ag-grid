const MOBILE = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
export function isDesktop() {
    const userAgent = navigator.userAgent;
    if (MOBILE.some((r) => r.test(userAgent))) {
        return false;
    }
    return true;
}
