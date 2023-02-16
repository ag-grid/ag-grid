"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDesktop = void 0;
const MOBILE = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
function isDesktop() {
    const userAgent = navigator.userAgent;
    if (MOBILE.some((r) => r.test(userAgent))) {
        return false;
    }
    return true;
}
exports.isDesktop = isDesktop;
