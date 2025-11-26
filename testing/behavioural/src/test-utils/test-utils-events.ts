import type { AgPublicEventType, GridApi } from 'ag-grid-community';

import { asyncSetTimeout } from './utils';

export function waitForEvent(event: AgPublicEventType, api: GridApi, n = 1): Promise<void> {
    let count = n;
    return new Promise((resolve) => {
        function listener() {
            if (--count === 0) {
                api.removeEventListener(event, listener);
                resolve();
            }
        }
        api.addEventListener(event, listener);
    });
}

const POINTER_EVENT_SUPPORTED = typeof PointerEvent === 'function';

export async function firePointerLikeClick(element: string | HTMLElement | null | undefined): Promise<boolean> {
    if (typeof element === 'string') {
        element = document.querySelector<HTMLElement>(element);
    }
    if (!element) {
        return false;
    }
    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;
    const button = 0;
    const buttons = 1;

    const pointerDownInit: PointerEventInit = {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        clientX,
        clientY,
        button,
        buttons,
    };

    if (POINTER_EVENT_SUPPORTED) {
        element.dispatchEvent(new PointerEvent('pointerdown', pointerDownInit));
    }

    const mouseDownInit: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
        button,
        buttons,
    };
    element.dispatchEvent(new MouseEvent('mousedown', mouseDownInit));

    await asyncSetTimeout(0);

    const pointerUpInit: PointerEventInit = {
        ...pointerDownInit,
        buttons: 0,
    };
    if (POINTER_EVENT_SUPPORTED) {
        element.dispatchEvent(new PointerEvent('pointerup', pointerUpInit));
    }

    const mouseUpInit: MouseEventInit = {
        ...mouseDownInit,
        buttons: 0,
    };
    element.dispatchEvent(new MouseEvent('mouseup', mouseUpInit));

    element.click();
    const clickNotCancelled = true;

    return clickNotCancelled;
}
