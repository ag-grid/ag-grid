"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDesktop = void 0;
var MOBILE = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
function isDesktop() {
    var userAgent = navigator.userAgent;
    if (MOBILE.some(function (r) { return r.test(userAgent); })) {
        return false;
    }
    return true;
}
exports.isDesktop = isDesktop;
//# sourceMappingURL=userAgent.js.map