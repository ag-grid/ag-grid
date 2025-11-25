import type { GridApi, RowDragCancelEvent, RowDragEndEvent, RowDragEvent, RowDragMoveEvent } from 'ag-grid-community';

import { buildRowElementsMap, collectRowElements, resolveRowElement } from '../gridRows/rowElementLookup';
import { mockGridLayout } from '../polyfills/mockGridLayout';
import { initPointerEventPolyfill } from '../polyfills/pointerEvent';
import { TestGridsManager } from '../testGridsManager';
import { asyncSetTimeout } from '../utils';
import type { FireInteractionEventFn, InteractionEventOptions } from './drag-event-dispatcher';
import { DragEventDispatcher } from './drag-event-dispatcher';

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

export interface DragAndDropIntermediateStepContext {
    api: GridApi;
    stepIndex: number;
    stepElement: Element;
    dataTransfer: DataTransfer;
    currentX: number;
    currentY: number;
    fireUserInteractionEvent: FireInteractionEventFn;
    rowDragMoveEvents: RowDragMoveEvent[];
}

export interface DragAndDropIntermediateTarget {
    target: Element | string | null | undefined;
    targetYOffsetPercent?: number;
    afterStep?: (context: DragAndDropIntermediateStepContext) => Promise<void> | void;
}

export interface DragAndDropBeforeDropContext {
    api: GridApi;
    sourceElement: Element;
    targetElement: Element;
    dataTransfer: DataTransfer;
    fireUserInteractionEvent: FireInteractionEventFn;
    fireMouseEvent: FireInteractionEventFn;
}

type DragMoveStep = {
    element: Element;
    yOffsetPercent: number;
    afterStep?: DragAndDropIntermediateTarget['afterStep'];
};

type DragContextResolution = DragContextSuccess | DragContextError;

interface DragContextSuccess {
    sourceElement: HTMLElement;
    moveSteps: DragMoveStep[];
    finalTarget: HTMLElement;
    ownerDocument: Document;
    rootEventTarget: EventTarget & { dispatchEvent: (event: Event) => boolean };
    sourceRowId: string;
}

interface DragContextError {
    error: string;
}

function resolveDragContext(
    api: GridApi,
    sourceRef: Element | string | null | undefined,
    targetRef: Element | string | null | undefined,
    targetYOffsetPercent: number,
    intermediateTargets: ReadonlyArray<DragAndDropIntermediateTarget>
): DragContextResolution {
    const gridElement = TestGridsManager.getHTMLElement(api);
    const ownerDocument = (gridElement?.ownerDocument ?? document) as Document;
    const rootEventTarget = (gridElement?.getRootNode?.() ?? ownerDocument) as EventTarget & {
        dispatchEvent: (event: Event) => boolean;
    };

    const rowElementsMap = buildRowElementsMap(collectRowElements(gridElement));

    const sourceElement = resolveRowElement(rowElementsMap, sourceRef) as HTMLElement | null;
    if (!sourceElement) {
        return { error: 'Drop source row not found' };
    }

    const targetElement = resolveRowElement(rowElementsMap, targetRef) as HTMLElement | null;
    if (!targetElement) {
        return { error: 'Drop Target row not found' };
    }

    const moveSteps: DragMoveStep[] = [];
    for (const step of intermediateTargets) {
        const stepElement = resolveRowElement(rowElementsMap, step.target);
        if (!stepElement) {
            continue;
        }
        moveSteps.push({
            element: stepElement,
            yOffsetPercent: step.targetYOffsetPercent ?? 0.5,
            afterStep: step.afterStep,
        });
    }

    moveSteps.push({ element: targetElement, yOffsetPercent: targetYOffsetPercent });

    const finalTarget = moveSteps[moveSteps.length - 1]?.element as HTMLElement | undefined;
    if (!finalTarget) {
        return { error: 'Drop Target row not found' };
    }

    return {
        sourceElement,
        moveSteps,
        finalTarget,
        ownerDocument,
        rootEventTarget,
        sourceRowId: sourceElement.getAttribute('row-id') || '',
    };
}

function getInteractionTargets(eventType: DragInteractionType, dragHandle: Element) {
    const moveTarget: Element | Document = eventType === 'touch' ? dragHandle : document;
    return { moveTarget, upTarget: moveTarget };
}

function computeStepPoint(rect: DOMRect, yOffsetPercent: number, previousY: number) {
    const x = rect.left + Math.min(10, rect.width);
    let y = rect.top + linearInterpolation(0, rect.height, yOffsetPercent);
    if (y === previousY) {
        y += y >= rect.bottom - 5 ? -5 : 5;
    }
    return { x, y };
}

const shouldAssertDropIndicator = (api: GridApi) =>
    api.getGridOption('rowDragManaged') && api.getGridOption('suppressMoveWhenRowDragging');

export interface DragAndDropRowOptions {
    api: GridApi;
    source: Element | string | null | undefined;
    target: Element | string | null | undefined;
    sourceYOffsetPercent?: number;
    targetYOffsetPercent?: number;
    intermediateTargets?: ReadonlyArray<DragAndDropIntermediateTarget>;
    cancel?: boolean;
    eventType?: DragInteractionType;
    beforeDrop?: (context: DragAndDropBeforeDropContext) => Promise<void> | void;
}

type RowDragListeners = {
    rowDragEnter: (event: RowDragEvent) => void;
    rowDragMove: (event: RowDragMoveEvent) => void;
    rowDragEnd: (event: RowDragEndEvent) => void;
    rowDragCancel: (event: RowDragCancelEvent) => void;
};

class RowDragEventRecorder {
    readonly rowDragEnterEvents: RowDragEvent[] = [];
    readonly rowDragMoveEvents: RowDragMoveEvent[] = [];
    readonly rowDragEndEvents: RowDragEndEvent[] = [];
    readonly rowDragCancelEvents: RowDragCancelEvent[] = [];
    readonly listeners: RowDragListeners;

    private settlePromise: Promise<void> | undefined;
    private resolveSettle: (() => void) | undefined;
    private settled = false;

    constructor() {
        this.listeners = {
            rowDragEnter: this.createRecorder(this.rowDragEnterEvents),
            rowDragMove: this.createRecorder(this.rowDragMoveEvents),
            rowDragEnd: this.createRecorder(this.rowDragEndEvents, () => this.settle()),
            rowDragCancel: this.createRecorder(this.rowDragCancelEvents, () => this.settle()),
        };
    }

    private ensureSettlePromise() {
        if (!this.settlePromise) {
            this.settlePromise = new Promise<void>((resolve) => {
                this.resolveSettle = resolve;
            });
        }
    }

    private settle() {
        if (!this.settled) {
            this.settled = true;
            this.resolveSettle?.();
            this.resolveSettle = undefined;
        }
    }

    private createRecorder<T>(collection: T[], onEvent?: () => void) {
        return (event: T) => {
            this.ensureSettlePromise();
            collection.push(event);
            onEvent?.();
        };
    }

    async waitForSettle() {
        for (let repeat = 0; !this.settlePromise && repeat < 50; repeat += 1) {
            await asyncSetTimeout(2);
        }
        if (this.settlePromise) {
            await this.settlePromise;
        }
    }
}

async function withRowDragListeners(api: GridApi, listeners: RowDragListeners, callback: () => Promise<void> | void) {
    api.addEventListener('rowDragEnter', listeners.rowDragEnter);
    api.addEventListener('rowDragMove', listeners.rowDragMove);
    api.addEventListener('rowDragEnd', listeners.rowDragEnd);
    api.addEventListener('rowDragCancel', listeners.rowDragCancel);
    try {
        await callback();
    } finally {
        api.removeEventListener('rowDragEnter', listeners.rowDragEnter);
        api.removeEventListener('rowDragMove', listeners.rowDragMove);
        api.removeEventListener('rowDragEnd', listeners.rowDragEnd);
        api.removeEventListener('rowDragCancel', listeners.rowDragCancel);
    }
}

interface DragStepState {
    currentDropTarget: Element | null;
    currentX: number;
    currentY: number;
}

interface DragRuntimeContext {
    api: GridApi;
    dispatcher: DragEventDispatcher;
    moveTarget: Element | Document;
    upTarget: Element | Document;
    dropContainer: Element;
    dragHandle: Element;
    verifyDropIndicator: boolean;
    rowDragMoveEvents: RowDragMoveEvent[];
    interactionEvents: { down: string; move: string; up: string };
}

export async function dragAndDropRow({
    api,
    source: sourceRef,
    target: targetRef,
    sourceYOffsetPercent = 0.5,
    targetYOffsetPercent = 0.5,
    intermediateTargets = [],
    cancel = false,
    eventType = 'mouse',
    beforeDrop,
}: DragAndDropRowOptions) {
    mockGridLayout.init();
    initPointerEventPolyfill();

    const recorder = new RowDragEventRecorder();

    const result = {
        error: null as null | string,
        rowDragEnterEvents: recorder.rowDragEnterEvents,
        rowDragMoveEvents: recorder.rowDragMoveEvents,
        rowDragEndEvents: recorder.rowDragEndEvents,
        rowDragCancelEvents: recorder.rowDragCancelEvents,
    };

    const dragContext = resolveDragContext(api, sourceRef, targetRef, targetYOffsetPercent, intermediateTargets);

    if ('error' in dragContext) {
        result.error = dragContext.error;
        return result;
    }

    const { sourceElement, moveSteps, finalTarget, ownerDocument, rootEventTarget, sourceRowId } = dragContext;
    const gridElement = TestGridsManager.getHTMLElement(api);
    const dropContainer =
        (gridElement?.querySelector('.ag-body-viewport') as Element | null) ?? ownerDocument.documentElement;

    const dragHandle = sourceElement.querySelector('.ag-drag-handle');

    if (!dragHandle) {
        result.error = 'Row drag handle not found';
        return result;
    }

    const pointerDefaults: PointerEventInit =
        eventType === 'pointer' ? { pointerId: 1, pointerType: 'mouse', isPrimary: true } : {};

    const dispatcher = new DragEventDispatcher(pointerDefaults);
    const interactionEvents = INTERACTION_EVENT_NAMES[eventType];
    const { moveTarget, upTarget } = getInteractionTargets(eventType, dragHandle);
    const verifyDropIndicator = !!shouldAssertDropIndicator(api);

    const runtime: DragRuntimeContext = {
        api,
        dispatcher,
        moveTarget,
        upTarget,
        dropContainer,
        dragHandle,
        verifyDropIndicator,
        rowDragMoveEvents: recorder.rowDragMoveEvents,
        interactionEvents,
    };

    const fireUserInteractionEvent = dispatcher.fire;

    const sourceRect = sourceElement.getBoundingClientRect();
    const handleRect = dragHandle.getBoundingClientRect();
    const startX = handleRect.left + handleRect.width / 2;
    let startY = handleRect.top + linearInterpolation(0, handleRect.height, sourceYOffsetPercent);
    const initialY = startY;

    let finalDropTargetElement: Element | null = null;

    await withRowDragListeners(api, recorder.listeners, async () => {
        await dispatcher.fire(dragHandle, interactionEvents.down, {
            clientX: startX,
            clientY: startY,
            buttons: 1,
            button: 0,
        });

        startY += startY >= sourceRect.bottom - 5 ? -5 : 5;

        await dispatcher.fire(moveTarget, interactionEvents.move, { clientX: startX, clientY: startY, buttons: 1 });
        await dispatcher.fire(dragHandle, 'dragstart', { clientX: startX, clientY: startY });
        await dispatcher.fire(dropContainer, 'dragenter', { clientX: startX, clientY: startY });
        await dispatcher.fire(sourceElement, 'dragenter', { clientX: startX, clientY: startY });
        await dispatcher.fire(dragHandle, 'drag', { clientX: startX, clientY: startY });

        let state: DragStepState = {
            currentDropTarget: sourceElement,
            currentX: startX,
            currentY: initialY,
        };

        for (let index = 0; index < moveSteps.length; index += 1) {
            const step = moveSteps[index];
            state = await performDragStep(runtime, step, state, index, fireUserInteractionEvent);
        }

        finalDropTargetElement = state.currentDropTarget;

        if (!finalDropTargetElement) {
            result.error = 'Drop Target row not found';
            return;
        }

        if (beforeDrop) {
            await beforeDrop({
                api,
                sourceElement,
                targetElement: finalDropTargetElement,
                dataTransfer: dispatcher.dataTransfer,
                fireUserInteractionEvent,
                fireMouseEvent: fireUserInteractionEvent,
            });
        }

        await completeDrag(runtime, {
            cancel,
            eventType,
            finalDropTarget: finalDropTargetElement,
            currentX: state.currentX,
            currentY: state.currentY,
            ownerDocument,
            rootEventTarget,
        });
    });

    if (result.error) {
        return result;
    }

    await recorder.waitForSettle();

    validateRowDragLifecycle({
        recorder,
        sourceRowId,
        finalTarget: finalDropTargetElement ?? finalTarget,
        cancel,
    });

    if (sourceElement.isConnected) {
        expect(sourceElement.classList.contains('ag-row-dragging')).toBe(false);
    }

    return result;
}

async function performDragStep(
    runtime: DragRuntimeContext,
    step: DragMoveStep,
    state: DragStepState,
    stepIndex: number,
    fireUserInteractionEvent: FireInteractionEventFn
): Promise<DragStepState> {
    const {
        dispatcher,
        moveTarget,
        interactionEvents,
        dropContainer,
        dragHandle,
        verifyDropIndicator,
        api,
        rowDragMoveEvents,
    } = runtime;
    const { element, yOffsetPercent, afterStep } = step;
    const stepElement = element;
    const { currentDropTarget, currentY } = state;
    const stepRect = stepElement.getBoundingClientRect();
    const { x: stepX, y: stepY } = computeStepPoint(stepRect, yOffsetPercent, currentY);

    await dispatcher.fire(moveTarget, interactionEvents.move, {
        clientX: stepX,
        clientY: stepY,
        buttons: 1,
    });

    if (currentDropTarget) {
        await dispatcher.fire(currentDropTarget, 'dragleave', {
            clientX: stepX,
            clientY: stepY,
        });
    }

    await dispatcher.fire(dropContainer, 'dragleave', {
        clientX: stepX,
        clientY: stepY,
    });

    await dispatcher.fire(dropContainer, 'dragenter', {
        clientX: stepX,
        clientY: stepY,
    });
    await dispatcher.fire(stepElement, 'dragenter', {
        clientX: stepX,
        clientY: stepY,
    });

    dispatcher.dataTransfer.dropEffect = 'move';
    await dispatcher.fire(dropContainer, 'dragover', {
        clientX: stepX,
        clientY: stepY,
    });
    await dispatcher.fire(stepElement, 'dragover', {
        clientX: stepX,
        clientY: stepY,
    });
    await asyncSetTimeout(0);

    if (verifyDropIndicator) {
        assertDropIndicatorVisible(api);
    }

    await dispatcher.fire(dragHandle, 'drag', {
        clientX: stepX,
        clientY: stepY,
    });

    if (afterStep) {
        await asyncSetTimeout(0);
        await afterStep({
            api,
            stepIndex,
            stepElement,
            dataTransfer: dispatcher.dataTransfer,
            currentX: stepX,
            currentY: stepY,
            fireUserInteractionEvent,
            rowDragMoveEvents,
        });
    }

    return {
        currentDropTarget: stepElement,
        currentX: stepX,
        currentY: stepY,
    };
}

interface CompleteDragContext {
    cancel: boolean;
    eventType: DragInteractionType;
    finalDropTarget: Element;
    currentX: number;
    currentY: number;
    ownerDocument: Document;
    rootEventTarget: EventTarget;
}

async function completeDrag(runtime: DragRuntimeContext, context: CompleteDragContext) {
    const { dispatcher, moveTarget, upTarget, interactionEvents, dragHandle } = runtime;
    const { cancel, eventType, finalDropTarget, currentX, currentY, ownerDocument, rootEventTarget } = context;
    if (cancel) {
        dispatcher.dataTransfer.dropEffect = 'none';
        if (eventType === 'pointer') {
            await dispatcher.fire(moveTarget, 'pointercancel', {
                clientX: currentX,
                clientY: currentY,
                buttons: 0,
            });
        } else if (eventType === 'touch') {
            const touchCancelOptions: InteractionEventOptions = {
                clientX: currentX,
                clientY: currentY,
            };
            await dispatcher.fire(moveTarget, 'touchcancel', touchCancelOptions);
            if (ownerDocument !== moveTarget) {
                await dispatcher.fire(ownerDocument, 'touchcancel', touchCancelOptions);
            }
            await asyncSetTimeout(0);
        } else {
            await dispatcher.fireESC(rootEventTarget);
        }
    } else {
        await dispatcher.fire(finalDropTarget, 'drop', { clientX: currentX, clientY: currentY });
    }

    await dispatcher.fire(dragHandle, 'dragend', { clientX: currentX, clientY: currentY });
    await dispatcher.fire(upTarget, interactionEvents.up, { clientX: currentX, clientY: currentY, buttons: 0 });
}

interface ValidateRowDragLifecycleParams {
    recorder: RowDragEventRecorder;
    sourceRowId: string;
    finalTarget: Element;
    cancel: boolean;
}

function validateRowDragLifecycle({ recorder, sourceRowId, finalTarget, cancel }: ValidateRowDragLifecycleParams) {
    const { rowDragEnterEvents, rowDragMoveEvents, rowDragEndEvents, rowDragCancelEvents } = recorder;

    if (rowDragEnterEvents.length > 1) {
        throw new Error('Row drag enter event fired more than once');
    }

    if (rowDragEnterEvents.length === 1) {
        const rowDragEnterEvent = rowDragEnterEvents[0];
        expect(rowDragEnterEvent.node.id).toBe(sourceRowId);

        const expectedOverId = rowDragEnterEvent.overNode?.id;
        if (expectedOverId !== sourceRowId && expectedOverId !== finalTarget.getAttribute('row-id')) {
            expect(expectedOverId).toBe(sourceRowId);
        }

        expect(rowDragMoveEvents.length).toBeGreaterThan(0);

        if (cancel) {
            expect(rowDragEndEvents.length).toBe(0);
            expect(rowDragCancelEvents.length).toBeGreaterThan(0);
        } else {
            expect(rowDragEndEvents.length).toBe(1);
            expect(rowDragEndEvents[0].node).toBe(rowDragEnterEvent.node);
            expect(rowDragEndEvents[0].nodes).toBe(rowDragEnterEvent.nodes);
        }
    }
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
