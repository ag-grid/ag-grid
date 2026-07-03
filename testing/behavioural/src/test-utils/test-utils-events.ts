import type { AgPublicEventType, GridApi } from 'ag-grid-community';

import { asyncSetTimeout } from './node-utils';

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

function isPointerEventSupported(): boolean {
    return typeof PointerEvent === 'function';
}

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

    if (isPointerEventSupported()) {
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
    if (isPointerEventSupported()) {
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
    bulkEditingStarted: number;
    bulkEditingStopped: number;
    batchEditingStarted: number;
    batchEditingStopped: number;
};

export type UndoCounts = {
    undoStarted: number;
    undoEnded: number;
    redoStarted: number;
    redoEnded: number;
};
const DEFAULT_EDIT_EVENT_COUNTS = {
    cellEditingStarted: 0,
    cellEditingStopped: 0,
    cellValueChanged: 0,
    rowValueChanged: 0,
    cellEditRequest: 0,
    bulkEditingStarted: 0,
    bulkEditingStopped: 0,
    batchEditingStarted: 0,
    batchEditingStopped: 0,
};

const DEFAULT_UNDO_COUNTS = {
    undoStarted: 0,
    undoEnded: 0,
    redoStarted: 0,
    redoEnded: 0,
};

export class EditEventTracker {
    public readonly counts: EditEventCounts = { ...DEFAULT_EDIT_EVENT_COUNTS };
    public readonly undoCounts: UndoCounts = { ...DEFAULT_UNDO_COUNTS };

    private readonly listeners: Array<{ event: AgPublicEventType; listener: () => void }> = [];

    constructor(private readonly api: GridApi) {
        this.track('cellEditingStarted');
        this.track('cellEditingStopped');
        this.track('cellValueChanged');
        this.track('rowValueChanged');
        this.track('cellEditRequest');
        this.track('bulkEditingStarted');
        this.track('bulkEditingStopped');
        this.track('batchEditingStarted');
        this.track('batchEditingStopped');
        this.trackUndo('undoStarted');
        this.trackUndo('undoEnded');
        this.trackUndo('redoStarted');
        this.trackUndo('redoEnded');
    }

    private track(event: keyof EditEventCounts): void {
        const listener = () => {
            this.counts[event] += 1;
        };

        this.listeners.push({ event, listener });
        this.api.addEventListener(event, listener);
    }

    private trackUndo(event: keyof UndoCounts): void {
        const listener = () => {
            this.undoCounts[event] += 1;
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
        Object.assign(this.undoCounts, DEFAULT_UNDO_COUNTS);
    }
}
