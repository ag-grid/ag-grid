import type { GridApi, RowDragCancelEvent, RowDragEndEvent, RowDragEvent, RowDragMoveEvent } from 'ag-grid-community';

import type { RowElementReference } from '../gridRows/gridHtmlRows';
import { GridHtmlRows } from '../gridRows/gridHtmlRows';
import { mockGridLayout } from '../polyfills/mockGridLayout';
import { initPointerEventPolyfill } from '../polyfills/pointerEvent';
import { TestGridsManager } from '../testGridsManager';
import { asyncSetTimeout } from '../utils';
import type { DragInteractionType } from './drag-event-dispatcher';
import { DragEventDispatcher } from './drag-event-dispatcher';

export type { DragInteractionType } from './drag-event-dispatcher';

export interface DragPointerMoveOptions {
    yOffsetPercent?: number;
    clientX?: number;
    clientY?: number;
}

export type DragPointerMoveFn = (target: Element, options?: DragPointerMoveOptions) => Promise<void>;

export interface DragAndDropIntermediateStepContext {
    api: GridApi;
    dispatcher: DragEventDispatcher;
    stepIndex: number;
    stepElement: Element;
    rowDragMoveEvents: RowDragMoveEvent[];
    movePointer: DragPointerMoveFn;
}

export interface DragAndDropRowStep {
    target: RowElementReference;
    yOffsetPercent?: number;
    clientX?: number;
    clientY?: number;
    afterStep?: (context: DragAndDropIntermediateStepContext) => Promise<void> | void;
}

export interface DragAndDropBeforeDropContext {
    api: GridApi;
    sourceElement: Element;
    targetElement: Element;
    dispatcher: DragEventDispatcher;
    movePointer: DragPointerMoveFn;
}

type DragMoveStep = {
    element: Element;
    yOffsetPercent: number;
    afterStep?: DragAndDropRowStep['afterStep'];
    clientX?: number;
    clientY?: number;
};

type DragContextResolution = DragContextSuccess | DragContextError;

interface DragContextSuccess {
    gridHtmlRows: GridHtmlRows;
    sourceElement: HTMLElement;
    moveSteps: DragMoveStep[];
    finalTarget: HTMLElement;
    sourceRowId: string;
    sourceYOffsetPercent: number;
}

interface DragContextError {
    error: string;
}

function resolveDragContext(api: GridApi, steps: ReadonlyArray<DragAndDropRowStep>): DragContextResolution {
    if (!steps.length) {
        return { error: 'No drag steps provided' };
    }

    const gridHtmlRows = new GridHtmlRows(api);
    const [sourceStep, ...remainingSteps] = steps;

    const sourceElement = gridHtmlRows.getRowHtmlElement(sourceStep.target);
    if (!sourceElement) {
        return { error: 'Drop source row not found' };
    }

    const moveSteps: DragMoveStep[] = [];
    let finalTarget: HTMLElement | null = null;

    for (let index = 0; index < remainingSteps.length; index += 1) {
        const step = remainingSteps[index];
        const stepElement = gridHtmlRows.getRowHtmlElement(step.target);
        if (!stepElement) {
            if (index === remainingSteps.length - 1) {
                return { error: 'Drop Target row not found' };
            }
            continue;
        }

        moveSteps.push({
            element: stepElement,
            yOffsetPercent: step.yOffsetPercent ?? 0.5,
            clientX: step.clientX,
            clientY: step.clientY,
            afterStep: step.afterStep,
        });
        finalTarget = stepElement;
    }

    if (!finalTarget) {
        return { error: 'Drop Target row not found' };
    }

    return {
        gridHtmlRows,
        sourceElement,
        moveSteps,
        finalTarget,
        sourceRowId: sourceElement.getAttribute('row-id') || '',
        sourceYOffsetPercent: sourceStep.yOffsetPercent ?? 0.5,
    };
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
    steps: ReadonlyArray<DragAndDropRowStep>;
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

    private settlePromise: Promise<void> | undefined = undefined;
    private resolveSettle: (() => void) | undefined = undefined;
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

export async function dragAndDropRow({
    api,
    steps,
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

    const dragContext = resolveDragContext(api, steps);

    if ('error' in dragContext) {
        result.error = dragContext.error;
        return result;
    }

    const { gridHtmlRows, sourceElement, moveSteps, finalTarget, sourceRowId, sourceYOffsetPercent } = dragContext;
    const gridElement = TestGridsManager.getHTMLElement(api);
    const dropContainer =
        (gridElement?.querySelector('.ag-body-viewport') as Element | null) ??
        gridHtmlRows.ownerDocument.documentElement;

    const dragHandle = sourceElement.querySelector('.ag-drag-handle');

    if (!dragHandle) {
        result.error = 'Row drag handle not found';
        return result;
    }

    const dispatcher = new DragEventDispatcher(eventType, dropContainer);

    const sourceRect = sourceElement.getBoundingClientRect();
    const handleRect = dragHandle.getBoundingClientRect();
    const pointerDownX = handleRect.left + handleRect.width / 2;
    const pointerDownY = handleRect.top + linearInterpolation(0, handleRect.height, sourceYOffsetPercent);

    const firstDragClientX = pointerDownX >= sourceRect.right - 5 ? pointerDownX - 5 : pointerDownX + 5;
    const firstDragClientY = pointerDownY >= sourceRect.bottom - 5 ? pointerDownY - 5 : pointerDownY + 5;

    let finalDropTargetElement: Element | null = null;

    await withRowDragListeners(api, recorder.listeners, async () => {
        await dispatcher.startDrag(dragHandle, pointerDownX, pointerDownY);

        const applyPostMoveEffects = () => {
            gridHtmlRows.invalidateHtml();
            if (shouldAssertDropIndicator(api)) {
                assertDropIndicatorVisible(api);
            }
            finalDropTargetElement = dispatcher.currentDropTarget;
        };

        await dispatcher.movePointer(sourceElement, firstDragClientX, firstDragClientY);
        applyPostMoveEffects();

        const movePointer: DragPointerMoveFn = async (targetElement, options = {}) => {
            const yOffsetPercent = options.yOffsetPercent ?? 0.5;
            const rect = targetElement.getBoundingClientRect();
            const computedPoint = computeStepPoint(rect, yOffsetPercent, dispatcher.currentY);
            const stepX = options.clientX ?? computedPoint.x;
            const stepY = options.clientY ?? computedPoint.y;

            await dispatcher.movePointer(targetElement, stepX, stepY);
            applyPostMoveEffects();
        };

        for (let index = 0; index < moveSteps.length; index += 1) {
            const step = moveSteps[index];
            await performDragStep(api, dispatcher, recorder.rowDragMoveEvents, step, index, movePointer);
        }

        finalDropTargetElement = dispatcher.currentDropTarget;

        if (!finalDropTargetElement) {
            result.error = 'Drop Target row not found';
            return;
        }

        if (beforeDrop) {
            await beforeDrop({
                api,
                sourceElement,
                targetElement: finalDropTargetElement,
                dispatcher,
                movePointer,
            });

            finalDropTargetElement = dispatcher.currentDropTarget;

            if (!finalDropTargetElement) {
                result.error = 'Drop Target row not found';
                return;
            }
        }

        if (cancel) {
            await dispatcher.cancelDrag();
        } else {
            await dispatcher.finishDrag(finalDropTargetElement);
        }
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
    api: GridApi,
    dispatcher: DragEventDispatcher,
    rowDragMoveEvents: RowDragMoveEvent[],
    step: DragMoveStep,
    stepIndex: number,
    movePointer: DragPointerMoveFn
): Promise<void> {
    const { element, yOffsetPercent, clientX, clientY, afterStep } = step;
    await movePointer(element, { yOffsetPercent, clientX, clientY });

    if (afterStep) {
        await asyncSetTimeout(0);
        await afterStep({
            api,
            dispatcher,
            stepIndex,
            stepElement: element,
            movePointer,
            rowDragMoveEvents,
        });
    }
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
