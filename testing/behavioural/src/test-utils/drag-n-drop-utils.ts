import type { GridApi, RowDragCancelEvent, RowDragEndEvent, RowDragEvent, RowDragMoveEvent } from 'ag-grid-community';

import { initDataTransferPolyfill } from './polyfills/dataTransfer';
import { mockGridLayout } from './polyfills/mockGridLayout';
import { TestGridsManager } from './testGridsManager';
import { asyncSetTimeout } from './utils';

export interface DragAndDropRowOptions {
    api: GridApi;
    source: Element | string | null | undefined;
    target: Element | string | null | undefined;
    sourceYOffsetPercent?: number;
    targetYOffsetPercent?: number;
    cancel?: boolean;
}

export async function dragAndDropRow({
    api,
    source,
    target,
    sourceYOffsetPercent = 0.5,
    targetYOffsetPercent = 0.5,
}: DragAndDropRowOptions) {
    mockGridLayout.init();
    initDataTransferPolyfill();

    const rowDragEnterEvents: RowDragEvent[] = [];
    const rowDragMoveEvents: RowDragMoveEvent[] = [];
    const rowDragEndEvents: RowDragEndEvent[] = [];
    const rowDragCancelEvents: RowDragCancelEvent[] = [];

    const result = {
        error: null as null | string,
        rowDragEnterEvents,
        rowDragMoveEvents,
        rowDragEndEvents,
        rowDragCancelEvents,
    };

    const gridElement = TestGridsManager.getHTMLElement(api);

    if (typeof source === 'string') {
        source = gridElement?.querySelector(`[row-id="${source}"]`);
    } else {
        source = source?.classList.contains('ag-row') ? source : source?.closest('.ag-row') ?? source;
    }

    if (typeof target === 'string') {
        target = gridElement?.querySelector(`[row-id="${target}"]`);
    } else {
        target = target?.classList.contains('ag-row') ? target : target?.closest('.ag-row') ?? target;
    }

    if (!source) {
        result.error = 'Drop source row not found';
        return result;
    }

    const sourceRowId = source.getAttribute('row-id') || '';

    if (!target) {
        result.error = 'Drop Target row not found';
        return result;
    }

    // Find the drag handle inside the row
    const dragHandle = source.querySelector('.ag-drag-handle');

    if (!dragHandle) {
        result.error = 'Row drag handle not found';
        return result;
    }

    let dragEndedPromise: Promise<void> | undefined;
    let dragEndedPromiseResolved = () => {};

    const rowDragEnter = (event: RowDragEvent) => {
        dragEndedPromise ??= new Promise<void>((resolve) => (dragEndedPromiseResolved = resolve));
        rowDragEnterEvents.push(event);
    };

    const rowDragMove = (event: RowDragMoveEvent) => {
        dragEndedPromise ??= new Promise<void>((resolve) => (dragEndedPromiseResolved = resolve));
        rowDragMoveEvents.push(event);
    };

    const rowDragEnd = (event: RowDragEndEvent) => {
        rowDragEndEvents.push(event);
        dragEndedPromiseResolved();
    };

    const rowDragCancel = (event: RowDragCancelEvent) => {
        rowDragCancelEvents.push(event);
        dragEndedPromiseResolved();
    };

    const dataTransfer = new DataTransfer();

    const fireMouseEvent = async (
        element: Element | Document,
        eventType: string,
        options: MouseEventInit & { dataTransfer?: DataTransfer } = {}
    ) => {
        const event = new MouseEvent(eventType, { bubbles: true, cancelable: true, ...options });
        element.dispatchEvent(event);
        await asyncSetTimeout(0);
    };

    const sourceRect = source.getBoundingClientRect();
    const handleRect = dragHandle.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const startX = handleRect.left + handleRect.width / 2;
    let startY = handleRect.top + linearInterpolation(0, handleRect.height, sourceYOffsetPercent);

    const endX = targetRect.left + Math.min(10, targetRect.width);
    let endY = targetRect.top + linearInterpolation(0, targetRect.height, targetYOffsetPercent);
    if (endY === startY) {
        endY += endY >= sourceRect.bottom - 5 ? -5 : 5;
    }

    api.addEventListener('rowDragEnter', rowDragEnter);
    api.addEventListener('rowDragMove', rowDragMove);
    api.addEventListener('rowDragEnd', rowDragEnd);
    api.addEventListener('rowDragCancel', rowDragCancel);
    try {
        await fireMouseEvent(dragHandle, 'mousedown', { clientX: startX, clientY: startY, buttons: 1 });

        startY += startY >= sourceRect.bottom - 5 ? -5 : 5;

        await fireMouseEvent(document, 'mousemove', { clientX: startX, clientY: startY, buttons: 1 });
        await fireMouseEvent(dragHandle, 'dragstart', { dataTransfer, clientX: startX, clientY: startY });
        await fireMouseEvent(source, 'dragenter', { dataTransfer, clientX: startX, clientY: startY });
        await fireMouseEvent(source, 'dragover', { dataTransfer, clientX: startX, clientY: startY });

        await fireMouseEvent(document, 'mousemove', { clientX: endX, clientY: endY, buttons: 1 });
        await fireMouseEvent(source, 'dragleave', { dataTransfer, clientX: startX, clientY: startY });
        await fireMouseEvent(target, 'dragenter', { dataTransfer, clientX: endX, clientY: endY });
        await fireMouseEvent(target, 'dragover', { dataTransfer, clientX: endX, clientY: endY });
        await fireMouseEvent(dragHandle, 'drag', { dataTransfer, clientX: startX, clientY: startY });

        await fireMouseEvent(target, 'drop', { dataTransfer, clientX: endX, clientY: endY });
        await fireMouseEvent(dragHandle, 'dragend', { dataTransfer, clientX: endX, clientY: endY });
        await fireMouseEvent(document, 'mouseup', { clientX: endX, clientY: endY, buttons: 0 });

        for (let repeat = 0; !dragEndedPromise && repeat < 50; ++repeat) {
            await asyncSetTimeout(2);
        }
        await dragEndedPromise;

        if (rowDragEnterEvents.length > 1) {
            throw new Error('Row drag enter event fired more than once');
        }

        if (rowDragEnterEvents.length === 1) {
            expect(rowDragEnterEvents[0].node.id).toBe(sourceRowId);

            const expectedOverId = rowDragEnterEvents[0].overNode?.id;
            if (expectedOverId !== sourceRowId && expectedOverId !== target.getAttribute('row-id')) {
                expect(expectedOverId).toBe(sourceRowId);
            }

            expect(rowDragMoveEvents.length).toBeGreaterThan(0);

            expect(rowDragEndEvents.length).toBe(1);
            expect(rowDragEndEvents[0].node).toBe(rowDragEnterEvents[0].node);
            expect(rowDragEndEvents[0].nodes).toBe(rowDragEnterEvents[0].nodes);
        }

        if (source.isConnected) {
            expect(source.classList.contains('ag-row-dragging')).toBe(false);
        }
    } finally {
        api.removeEventListener('rowDragEnter', rowDragEnter);
        api.removeEventListener('rowDragMove', rowDragMove);
        api.removeEventListener('rowDragEnd', rowDragEnd);
    }

    return result;
}

function linearInterpolation(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
}
