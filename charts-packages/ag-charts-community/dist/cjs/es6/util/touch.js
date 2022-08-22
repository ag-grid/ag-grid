"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let touchDevice = undefined;
function isTouchDevice() {
    if (touchDevice !== undefined) {
        return touchDevice;
    }
    try {
        document.createEvent('TouchEvent');
        touchDevice = true;
    }
    catch (e) {
        touchDevice = false;
    }
    return touchDevice;
}
exports.isTouchDevice = isTouchDevice;
