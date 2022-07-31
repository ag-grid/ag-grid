let touchDevice = undefined;
export function isTouchDevice() {
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
