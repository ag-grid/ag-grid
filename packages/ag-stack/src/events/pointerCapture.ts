export interface PointerCapture {
    eElement: HTMLElement | null;
    pointerId: number;
    onLost: ((event: PointerEvent) => void) | null;
}

const tryPointerCapture = (eElement: HTMLElement | null | undefined, pointerId: number | null | undefined): boolean => {
    if (pointerId != null && eElement?.setPointerCapture) {
        try {
            eElement.setPointerCapture(pointerId);
            return eElement.hasPointerCapture(pointerId);
        } catch {
            // Capture failed
        }
    }
    return false;
};

export const capturePointer = (eElement: HTMLElement, mouseEvent: Event | Touch): PointerCapture | null => {
    if (typeof PointerEvent === 'undefined' || !(mouseEvent instanceof PointerEvent)) {
        return null;
    }

    const pointerId = mouseEvent.pointerId;
    if (!tryPointerCapture(eElement, pointerId)) {
        return null;
    }

    const capture = {
        eElement: eElement,
        pointerId,
        onLost(pointerEvent: PointerEvent) {
            pointerLostHandler(capture, pointerEvent);
        },
    } satisfies PointerCapture;

    eElement.addEventListener('lostpointercapture', capture.onLost);
    return capture;
};

export const releasePointerCapture = (capture: PointerCapture | null): void => {
    if (!capture) {
        return;
    }
    removeLostHandler(capture);

    const { eElement, pointerId } = capture;
    if (!eElement) {
        return;
    }

    try {
        eElement.releasePointerCapture(pointerId);
    } catch {
        // do nothing, just means pointer capture is not supported
    }
    capture.eElement = null;
};

const removeLostHandler = (capture: PointerCapture) => {
    const { eElement, onLost } = capture;
    if (eElement && onLost) {
        eElement.removeEventListener('lostpointercapture', onLost);
        capture.onLost = null;
    }
};

/** When using touch, we might receive a lostpointercapture, try to recapture the pointer once */
const pointerLostHandler = (capture: PointerCapture, pointerEvent: PointerEvent) => {
    removeLostHandler(capture); // Only once
    const { eElement, pointerId } = capture;
    if (eElement && pointerEvent.pointerId === pointerId) {
        tryPointerCapture(eElement, pointerId);
    }
};
