export interface MouseCapture {
    eRoot: HTMLElement;
    pointerId: number;
    touchAction: string;
}

export const captureMouse = (eRoot: HTMLElement, mouseEvent: MouseEvent): MouseCapture | null => {
    if (typeof PointerEvent === 'undefined' || !(mouseEvent instanceof PointerEvent)) {
        return null;
    }

    const pointerId = mouseEvent.pointerId;
    if (pointerId == null) {
        return null;
    }

    try {
        eRoot.setPointerCapture(pointerId);
        const style = eRoot.style;
        const touchAction = style.touchAction;
        style.touchAction = 'none'; // stop touch scrolling while dragging
        return { eRoot: eRoot, pointerId, touchAction };
    } catch {
        return null; // Capture failed
    }
};

export const releaseMouseCapture = (capture: MouseCapture | null): null => {
    if (!capture) {
        return null;
    }

    const { eRoot, pointerId, touchAction } = capture;
    try {
        eRoot.releasePointerCapture(pointerId);
        if (touchAction != null) {
            eRoot.style.touchAction = touchAction;
        }
    } catch {
        // do nothing, just means pointer capture is not supported
    }
    return null;
};
