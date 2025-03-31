import type { GridApi, RowDragEndEvent, RowDragEvent, RowDragMoveEvent } from 'ag-grid-community';

import './polyfills/dataTransfer';
import { initDataTransferPolyfill } from './polyfills/dataTransfer';
import { mockGridLayout } from './polyfills/mockGridLayout';
import { asyncSetTimeout } from './utils';

export interface DragAndDropRowOptions {
    api: GridApi | null | undefined;
    source: HTMLElement | null | undefined;
    target: HTMLElement | null | undefined;
    sourceYOffsetPercent?: number;
    targetYOffsetPercent?: number;
    cancel?: boolean;
    onBeforeDrop?: () => void | Promise<void>;
}

export async function dragAndDropRow({
    api,
    source,
    target,
    sourceYOffsetPercent = 0.5,
    targetYOffsetPercent = 0.5,
    onBeforeDrop,
}: DragAndDropRowOptions) {
    mockGridLayout.init();
    initDataTransferPolyfill();

    const rowDragEnterEvents: RowDragEvent[] = [];
    const rowDragMoveEvents: RowDragMoveEvent[] = [];
    const rowDragEndEvents: RowDragEndEvent[] = [];

    const result = {
        error: null as null | string,
        rowDragEnterEvents,
        rowDragMoveEvents,
        rowDragEndEvents,
    };

    source = source?.classList.contains('ag-row') ? source : source?.closest('.ag-row') ?? source;
    target = target?.classList.contains('ag-row') ? target : target?.closest('.ag-row') ?? target;

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

    const rowDragEnter = (event: RowDragEvent) => {
        rowDragEnterEvents.push(event);
    };

    const rowDragMove = (event: RowDragMoveEvent) => {
        rowDragMoveEvents.push(event);
    };

    const rowDragEnd = (event: RowDragEndEvent) => {
        rowDragEndEvents.push(event);
    };

    if (api) {
        api.addEventListener('rowDragEnter', rowDragEnter);
        api.addEventListener('rowDragMove', rowDragMove);
        api.addEventListener('rowDragEnd', rowDragEnd);
    }

    const dataTransfer = new DataTransfer();

    const handleRect = dragHandle.getBoundingClientRect();
    const startX = handleRect.left + handleRect.width / 2;
    const startY = handleRect.top + linearInterpolation(0, handleRect.height, sourceYOffsetPercent);

    await fireMouseEvent(dragHandle, 'mousedown', {
        clientX: startX,
        clientY: startY,
        buttons: 1,
        relatedTarget: dragHandle,
    });

    await fireMouseEvent(dragHandle, 'dragstart', { dataTransfer, clientX: startX, clientY: startY });

    // await fireMouseEvent(target, 'mousemove', {
    //     clientX: startX,
    //     clientY: startY,
    //     buttons: 1,
    //     relatedTarget: dragHandle,
    // });

    const targetRect = target.getBoundingClientRect();
    const endX = targetRect.left + Math.min(10, targetRect.width);
    const endY = targetRect.top + linearInterpolation(0, targetRect.height, targetYOffsetPercent);

    await fireMouseEvent(target, 'dragover', { dataTransfer, clientX: endX, clientY: endY + 1 });

    await fireMouseEvent(target, 'mousemove', {
        clientX: endX,
        clientY: endY,
        buttons: 1,
        relatedTarget: dragHandle,
    });

    if (onBeforeDrop) {
        await onBeforeDrop();
    }

    await fireMouseEvent(target, 'drop', { dataTransfer, clientX: endX, clientY: endY });

    await fireMouseEvent(dragHandle, 'dragend', { dataTransfer, clientX: endX, clientY: endY });

    await fireMouseEvent(document.body, 'mouseup', {
        clientX: endX,
        clientY: endY,
        buttons: 0,
        relatedTarget: dragHandle,
    });

    expect(source.classList.contains('ag-row-dragging')).toBe(false);

    if (api) {
        api.removeEventListener('rowDragEnter', rowDragEnter);
        api.removeEventListener('rowDragMove', rowDragMove);
        api.removeEventListener('rowDragEnd', rowDragEnd);

        if (rowDragEnterEvents.length > 1) {
            throw new Error('Row drag enter event fired more than once');
        }

        if (rowDragEnterEvents.length === 1) {
            expect(rowDragEnterEvents[0].node.id).toBe(sourceRowId);
            expect(rowDragEnterEvents[0].overNode?.id).toBe(sourceRowId);

            expect(rowDragMoveEvents.length).toBeGreaterThan(0);

            expect(rowDragEndEvents.length).toBe(1);
            expect(rowDragEndEvents[0].node).toBe(rowDragEnterEvents[0].node);
            expect(rowDragEndEvents[0].nodes).toBe(rowDragEnterEvents[0].nodes);
        }
    }

    return result;
}

async function fireMouseEvent(
    element: Element | Document,
    eventType: string,
    options: MouseEventInit & { dataTransfer?: DataTransfer } = {}
) {
    const event = new MouseEvent(eventType, { bubbles: true, cancelable: true, ...options });
    element.dispatchEvent(event);
    await asyncSetTimeout(0);
}

function linearInterpolation(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
}
