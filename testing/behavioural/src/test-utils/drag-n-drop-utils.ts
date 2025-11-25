import type { GridApi, RowDragCancelEvent, RowDragEndEvent, RowDragEvent, RowDragMoveEvent } from 'ag-grid-community';

import { initDataTransferPolyfill } from './polyfills/dataTransfer';
import { mockGridLayout } from './polyfills/mockGridLayout';
import { initPointerEventPolyfill } from './polyfills/pointerEvent';
import { TestGridsManager } from './testGridsManager';
import { asyncSetTimeout } from './utils';

type InteractionEventOptions = (MouseEventInit | PointerEventInit | TouchEventInit) & { dataTransfer?: DataTransfer };

type FireInteractionEventFn = (
    element: Element | Document,
    eventType: string,
    options?: InteractionEventOptions
) => Promise<void>;

export type DragInteractionType = 'mouse' | 'pointer' | 'touch';

export const DRAG_INTERACTION_TYPES: readonly DragInteractionType[] = ['mouse', 'pointer', 'touch'];

export const DRAG_NO_MOVE_INTERACTION_CASES: Array<[boolean, DragInteractionType]> = [true, false].flatMap(
    (suppressMoveWhenRowDragging) =>
        DRAG_INTERACTION_TYPES.map(
            (eventType) => [suppressMoveWhenRowDragging, eventType] as [boolean, DragInteractionType]
        )
);

const INTERACTION_EVENT_NAMES: Record<DragInteractionType, { down: string; move: string; up: string }> = {
    mouse: { down: 'mousedown', move: 'mousemove', up: 'mouseup' },
    pointer: { down: 'pointerdown', move: 'pointermove', up: 'pointerup' },
    touch: { down: 'touchstart', move: 'touchmove', up: 'touchend' },
};

const POINTER_COMPATIBILITY_MOUSE_EVENTS: Record<string, string> = {
    pointerdown: 'mousedown',
    pointermove: 'mousemove',
    pointerup: 'mouseup',
    pointercancel: 'mouseup',
};

function getClientCoordinate(
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined,
    key: 'clientX' | 'clientY'
): number {
    if (!options) {
        return 0;
    }

    const value = (options as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : 0;
}

function buildSyntheticTouch(
    element: Element | Document,
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined
): Touch {
    const clientX = getClientCoordinate(options, 'clientX');
    const clientY = getClientCoordinate(options, 'clientY');
    const touchTarget = element as unknown as EventTarget;
    return new Touch({
        identifier: 0,
        target: touchTarget,
        clientX,
        clientY,
        pageX: clientX,
        pageY: clientY,
        screenX: clientX,
        screenY: clientY,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        force: 1,
        altitudeAngle: Math.PI / 2,
        azimuthAngle: 0,
        touchType: 'direct',
    });
}

function buildTouchList(
    element: Element | Document,
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined,
    includeTouch: boolean
): Touch[] {
    return includeTouch ? [buildSyntheticTouch(element, options)] : [];
}

function attachDataTransfer(event: Event, dataTransfer: DataTransfer | undefined): void {
    if (!dataTransfer) {
        return;
    }
    Object.defineProperty(event, 'dataTransfer', { configurable: true, writable: false, value: dataTransfer });
}

function sanitizeEventInit(options: InteractionEventOptions | undefined): Record<string, unknown> {
    if (!options) {
        return {};
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(options)) {
        if (key !== 'dataTransfer') {
            sanitized[key] = value as unknown;
        }
    }

    return sanitized;
}

function createTouchInteractionEvent(
    element: Element | Document,
    eventName: string,
    options: InteractionEventOptions | undefined
): Event {
    const isEnd = eventName === 'touchend' || eventName === 'touchcancel';
    const touchEventInit: TouchEventInit = {
        bubbles: true,
        cancelable: true,
        touches: buildTouchList(element, options, !isEnd),
        targetTouches: buildTouchList(element, options, !isEnd),
        changedTouches: buildTouchList(element, options, true),
        ...(sanitizeEventInit(options) as TouchEventInit),
    };
    return new TouchEvent(eventName, touchEventInit);
}

function createPointerInteractionEvent(
    eventName: string,
    options: InteractionEventOptions | undefined,
    pointerDefaults: PointerEventInit
): Event {
    const pointerInit = {
        bubbles: true,
        cancelable: true,
        ...pointerDefaults,
        ...sanitizeEventInit(options),
    } as PointerEventInit;

    return new PointerEvent(eventName, pointerInit);
}

function createMouseInteractionEvent(eventName: string, options: InteractionEventOptions | undefined): Event {
    return new MouseEvent(eventName, {
        bubbles: true,
        cancelable: true,
        ...(sanitizeEventInit(options) as MouseEventInit),
    });
}

function createInteractionEvent(
    element: Element | Document,
    eventName: string,
    options: InteractionEventOptions | undefined,
    pointerDefaults: PointerEventInit
): Event {
    if (eventName.startsWith('touch')) {
        return createTouchInteractionEvent(element, eventName, options);
    }

    if (eventName.startsWith('pointer')) {
        return createPointerInteractionEvent(eventName, options, pointerDefaults);
    }

    return createMouseInteractionEvent(eventName, options);
}

export interface DragAndDropRowOptions {
    api: GridApi;
    source: Element | string | null | undefined;
    target: Element | string | null | undefined;
    sourceYOffsetPercent?: number;
    targetYOffsetPercent?: number;
    cancel?: boolean;
    eventType?: DragInteractionType;
    beforeDrop?: (context: {
        api: GridApi;
        sourceElement: Element;
        targetElement: Element;
        dataTransfer: DataTransfer;
        fireUserInteractionEvent: FireInteractionEventFn;
        fireMouseEvent: FireInteractionEventFn;
    }) => Promise<void> | void;
}

export async function dragAndDropRow({
    api,
    source,
    target,
    sourceYOffsetPercent = 0.5,
    targetYOffsetPercent = 0.5,
    cancel = false,
    eventType = 'mouse',
    beforeDrop,
}: DragAndDropRowOptions) {
    mockGridLayout.init();
    initDataTransferPolyfill();
    initPointerEventPolyfill();

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
    const ownerDocument = (gridElement?.ownerDocument ?? document) as Document;
    const rootEventTarget = (gridElement?.getRootNode?.() ?? ownerDocument) as EventTarget & {
        dispatchEvent: (event: Event) => boolean;
    };

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

    const isTouchInteraction = eventType === 'touch';
    const pointerDefaults: PointerEventInit =
        eventType === 'pointer' ? { pointerId: 1, pointerType: 'mouse', isPrimary: true } : {};

    const fireUserInteractionEvent: FireInteractionEventFn = async (element, eventName, options = {}) => {
        const event = createInteractionEvent(element, eventName, options, pointerDefaults);
        attachDataTransfer(event, options.dataTransfer);
        element.dispatchEvent(event);

        const compatibilityMouseEventName = POINTER_COMPATIBILITY_MOUSE_EVENTS[eventName];
        if (compatibilityMouseEventName) {
            const mouseEvent = createMouseInteractionEvent(compatibilityMouseEventName, options);
            attachDataTransfer(mouseEvent, options.dataTransfer);
            element.dispatchEvent(mouseEvent);
        }
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
        const interactionEvents = INTERACTION_EVENT_NAMES[eventType];
        const moveTarget: Element | Document = isTouchInteraction ? dragHandle : document;
        const upTarget: Element | Document = moveTarget;

        await fireUserInteractionEvent(dragHandle, interactionEvents.down, {
            clientX: startX,
            clientY: startY,
            buttons: 1,
            button: 0,
        });

        startY += startY >= sourceRect.bottom - 5 ? -5 : 5;

        await fireUserInteractionEvent(moveTarget, interactionEvents.move, {
            clientX: startX,
            clientY: startY,
            buttons: 1,
        });
        await fireUserInteractionEvent(dragHandle, 'dragstart', { dataTransfer, clientX: startX, clientY: startY });
        await fireUserInteractionEvent(source, 'dragenter', { dataTransfer, clientX: startX, clientY: startY });
        await fireUserInteractionEvent(source, 'dragover', { dataTransfer, clientX: startX, clientY: startY });

        await fireUserInteractionEvent(moveTarget, interactionEvents.move, {
            clientX: endX,
            clientY: endY,
            buttons: 1,
        });
        await fireUserInteractionEvent(source, 'dragleave', { dataTransfer, clientX: startX, clientY: startY });
        await fireUserInteractionEvent(target, 'dragenter', { dataTransfer, clientX: endX, clientY: endY });
        await fireUserInteractionEvent(target, 'dragover', { dataTransfer, clientX: endX, clientY: endY });

        if (api.getGridOption('rowDragManaged') && api.getGridOption('suppressMoveWhenRowDragging')) {
            assertDropIndicatorVisible(api);
        }

        if (beforeDrop) {
            await beforeDrop({
                api,
                sourceElement: source,
                targetElement: target,
                dataTransfer,
                fireUserInteractionEvent,
                fireMouseEvent: fireUserInteractionEvent,
            });
        }
        await fireUserInteractionEvent(dragHandle, 'drag', { dataTransfer, clientX: startX, clientY: startY });

        if (cancel) {
            dataTransfer.dropEffect = 'none';
            if (eventType === 'pointer') {
                await fireUserInteractionEvent(moveTarget, 'pointercancel', {
                    clientX: endX,
                    clientY: endY,
                    buttons: 0,
                });
            } else if (eventType === 'touch') {
                const touchCancelOptions: InteractionEventOptions = {
                    clientX: endX,
                    clientY: endY,
                };
                await fireUserInteractionEvent(moveTarget, 'touchcancel', touchCancelOptions);
                if (ownerDocument !== moveTarget) {
                    await fireUserInteractionEvent(ownerDocument, 'touchcancel', touchCancelOptions);
                }
                await asyncSetTimeout(0);
            } else {
                rootEventTarget.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'Escape',
                        code: 'Escape',
                        bubbles: true,
                        cancelable: true,
                    })
                );
                await asyncSetTimeout(0);
            }

            await fireUserInteractionEvent(dragHandle, 'dragend', { dataTransfer, clientX: endX, clientY: endY });
            await fireUserInteractionEvent(upTarget, interactionEvents.up, {
                clientX: endX,
                clientY: endY,
                buttons: 0,
            });
        } else {
            await fireUserInteractionEvent(target, 'drop', { dataTransfer, clientX: endX, clientY: endY });
            await fireUserInteractionEvent(dragHandle, 'dragend', { dataTransfer, clientX: endX, clientY: endY });
            await fireUserInteractionEvent(upTarget, interactionEvents.up, {
                clientX: endX,
                clientY: endY,
                buttons: 0,
            });
        }

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

            if (cancel) {
                expect(rowDragEndEvents.length).toBe(0);
                expect(rowDragCancelEvents.length).toBeGreaterThan(0);
            } else {
                expect(rowDragEndEvents.length).toBe(1);
                expect(rowDragEndEvents[0].node).toBe(rowDragEnterEvents[0].node);
                expect(rowDragEndEvents[0].nodes).toBe(rowDragEnterEvents[0].nodes);
            }
        }

        if (source.isConnected) {
            expect(source.classList.contains('ag-row-dragging')).toBe(false);
        }
    } finally {
        api.removeEventListener('rowDragEnter', rowDragEnter);
        api.removeEventListener('rowDragMove', rowDragMove);
        api.removeEventListener('rowDragEnd', rowDragEnd);
        api.removeEventListener('rowDragCancel', rowDragCancel);
    }

    return result;
}

function linearInterpolation(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
}

const DROP_INDICATOR_POSITIONS = ['above', 'inside', 'below'] as const;

export function assertDropIndicatorVisible(api: GridApi): void {
    const { row, dropIndicatorPosition } = api.getRowDropPositionIndicator();

    const gridElement = TestGridsManager.getHTMLElement(api);
    expect(!!gridElement).toBeTruthy();

    if (!gridElement) {
        return;
    }

    const highlightElement = DROP_INDICATOR_POSITIONS.map((position) =>
        gridElement.querySelector<HTMLElement>(`.ag-row-highlight-${position}`)
    ).find((element): element is HTMLElement => !!element);

    if (dropIndicatorPosition === 'none') {
        expect(!!row).toBeFalsy();
        expect(highlightElement).toBeUndefined();
        expect(gridElement.querySelector('.ag-row-highlight-indent')).toBeNull();
        return;
    }

    expect(!!row).toBeTruthy();

    if (!row) {
        return;
    }

    const expectedRowId = row.id ?? undefined;
    expect(expectedRowId).toBeTruthy();

    const rowElement = expectedRowId
        ? gridElement.querySelector<HTMLElement>(`.ag-row[row-id="${expectedRowId}"]`)
        : null;

    expect(rowElement).toBeTruthy();

    if (!rowElement) {
        return;
    }

    const elementWithHighlight = highlightElement ?? rowElement;
    expect(elementWithHighlight).toBeTruthy();

    if (!elementWithHighlight) {
        return;
    }

    const activeClasses = DROP_INDICATOR_POSITIONS.filter((position) =>
        elementWithHighlight.classList.contains(`ag-row-highlight-${position}`)
    );

    expect(activeClasses).toHaveLength(1);
    expect(activeClasses.includes(dropIndicatorPosition)).toBe(true);

    const dropEdge = dropIndicatorPosition === 'above' || dropIndicatorPosition === 'below';
    const isTreeData = api.isModuleRegistered('TreeDataModule') && !!api.getGridOption('treeData');
    const hasGrouping = api.isModuleRegistered('RowGroupingModule') && api.getRowGroupColumns().length > 0;
    const shouldIndent = dropEdge && row.uiLevel > 0 && (isTreeData || hasGrouping);

    const hasIndentClass = elementWithHighlight.classList.contains('ag-row-highlight-indent');
    expect(hasIndentClass).toBe(shouldIndent);

    const actualLevel = elementWithHighlight.style.getPropertyValue('--ag-row-highlight-level');
    const normalizedLevel = actualLevel === '' ? '0' : actualLevel;
    const expectedLevel = shouldIndent ? String(row.uiLevel) : '0';
    expect(normalizedLevel).toBe(expectedLevel);
}
