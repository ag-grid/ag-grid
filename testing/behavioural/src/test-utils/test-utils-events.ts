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

export type EditEventCounts = {
    cellEditingStarted: number;
    cellEditingStopped: number;
    cellValueChanged: number;
    rowValueChanged: number;
    cellEditRequest: number;
};

const DEFAULT_EDIT_EVENT_COUNTS = {
    cellEditingStarted: 0,
    cellEditingStopped: 0,
    cellValueChanged: 0,
    rowValueChanged: 0,
    cellEditRequest: 0,
};

export class EditEventTracker {
    public readonly counts: EditEventCounts = { ...DEFAULT_EDIT_EVENT_COUNTS };

    private readonly listeners: Array<{ event: AgPublicEventType; listener: () => void }> = [];

    constructor(private readonly api: GridApi) {
        this.track('cellEditingStarted');
        this.track('cellEditingStopped');
        this.track('cellValueChanged');
        this.track('rowValueChanged');
        this.track('cellEditRequest');
    }

    private track(event: AgPublicEventType): void {
        const listener = () => {
            this.counts[event] += 1;
        };

        this.listeners.push({ event, listener });
        this.api.addEventListener(event, listener);
    }

    public destroy(): void {
        for (const { event, listener } of this.listeners) {
            this.api.removeEventListener(event, listener);
        }
        this.listeners.length = 0;
    }

    public reset(): void {
        Object.assign(this.counts, DEFAULT_EDIT_EVENT_COUNTS);
    }
}
