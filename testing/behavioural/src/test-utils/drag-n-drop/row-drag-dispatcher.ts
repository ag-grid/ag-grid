import type { GridApi, RowDragCancelEvent, RowDragEndEvent, RowDragEvent, RowDragMoveEvent } from 'ag-grid-community';

import type { RowElementReference } from '../gridRows/gridHtmlRows';
import { GridHtmlRows } from '../gridRows/gridHtmlRows';
import { mockGridLayout } from '../polyfills/mockGridLayout';
import { initPointerEventPolyfill } from '../polyfills/pointerEvent';
import { TestGridsManager } from '../testGridsManager';
import { asyncSetTimeout } from '../utils';
import type { DragInteractionType } from './drag-event-dispatcher';
import { DragEventDispatcher } from './drag-event-dispatcher';
import { assertDropIndicatorVisible } from './drag-n-drop-utils';

export type { DragInteractionType } from './drag-event-dispatcher';

export interface RowDragMoveOptions {
    yOffsetPercent?: number;
    clientX?: number;
    clientY?: number;
}

export interface DragAndDropBeforeDropContext {
    targetElement: Element;
}

export interface RowDragDispatcherParams {
    api: GridApi;
    eventType?: DragInteractionType;
}

export interface RowDragFinishOptions {
    cancel?: boolean;
    beforeDrop?: (context: DragAndDropBeforeDropContext) => Promise<void> | void;
}

type RowDragListeners = {
    rowDragEnter: (event: RowDragEvent) => void;
    rowDragMove: (event: RowDragMoveEvent) => void;
    rowDragEnd: (event: RowDragEndEvent) => void;
    rowDragCancel: (event: RowDragCancelEvent) => void;
};

export class RowDragDispatcher {
    public readonly rowDragEnterEvents: RowDragEvent[] = [];
    public readonly rowDragMoveEvents: RowDragMoveEvent[] = [];
    public readonly rowDragEndEvents: RowDragEndEvent[] = [];
    public readonly rowDragCancelEvents: RowDragCancelEvent[] = [];

    private readonly api: GridApi;
    private readonly eventType: DragInteractionType;
    private readonly listeners: RowDragListeners;

    private settlePromise: Promise<void> | undefined = undefined;
    private resolveSettle: (() => void) | undefined = undefined;

    private gridHtmlRows: GridHtmlRows;
    private dispatcher: DragEventDispatcher | null = null;
    private sourceElement: HTMLElement | null = null;
    private sourceRowId = '';
    private sourceYOffsetPercent = 0.5;
    private finalDropTarget: Element | null = null;
    private listenersAttached = false;
    private started = false;
    private finished = false;

    constructor({ api, eventType = 'mouse' }: RowDragDispatcherParams) {
        this.api = api;
        this.eventType = eventType;
        this.gridHtmlRows = new GridHtmlRows(api);
        this.listeners = {
            rowDragEnter: this.createRecorder(this.rowDragEnterEvents),
            rowDragMove: this.createRecorder(this.rowDragMoveEvents),
            rowDragEnd: this.createRecorder(this.rowDragEndEvents, true),
            rowDragCancel: this.createRecorder(this.rowDragCancelEvents, true),
        };

        mockGridLayout.init();
        initPointerEventPolyfill();
    }

    public async start(source: RowElementReference, options: RowDragMoveOptions = {}): Promise<void> {
        if (this.started) {
            throw new Error('Row drag already started');
        }
        if (this.finished) {
            throw new Error('Row drag already finished');
        }

        this.gridHtmlRows.invalidateHtml();
        const sourceElement = this.gridHtmlRows.getRowHtmlElement(source);
        if (!sourceElement) {
            throw new Error('Drop source row not found');
        }

        const dragHandle = sourceElement.querySelector('.ag-drag-handle');
        if (!dragHandle) {
            throw new Error('Row drag handle not found');
        }

        const gridElement = TestGridsManager.getHTMLElement(this.api);
        const dropContainer =
            (gridElement?.querySelector('.ag-body-viewport') as Element | null) ??
            this.gridHtmlRows.ownerDocument.documentElement;

        this.sourceElement = sourceElement;
        this.sourceRowId = sourceElement.getAttribute('row-id') || '';
        this.sourceYOffsetPercent = options.yOffsetPercent ?? 0.5;

        this.dispatcher = new DragEventDispatcher(this.eventType, dropContainer);

        this.attachListeners();

        const sourceRect = sourceElement.getBoundingClientRect();
        const handleRect = dragHandle.getBoundingClientRect();

        const pointerDownX = options.clientX ?? handleRect.left + handleRect.width / 2;
        const pointerDownY =
            options.clientY ?? handleRect.top + linearInterpolation(0, handleRect.height, this.sourceYOffsetPercent);

        const firstDragClientX = pointerDownX >= sourceRect.right - 5 ? pointerDownX - 5 : pointerDownX + 5;
        const firstDragClientY = pointerDownY >= sourceRect.bottom - 5 ? pointerDownY - 5 : pointerDownY + 5;

        await this.dispatcher.startDrag(dragHandle, pointerDownX, pointerDownY);
        await this.dispatcher.movePointer(sourceElement, firstDragClientX, firstDragClientY);
        this.applyPostMoveEffects();

        this.started = true;
    }

    public async move(target: RowElementReference, options: RowDragMoveOptions = {}): Promise<void> {
        this.ensureActive();

        const targetElement = this.gridHtmlRows.getRowHtmlElement(target);
        if (!targetElement) {
            throw new Error('Drop Target row not found');
        }

        await this.internalMovePointer(targetElement, options);
    }

    public async hoverTargetCenter(targetElement: RowElementReference): Promise<void> {
        this.ensureActive();

        const targetHtmlElement = this.gridHtmlRows.getRowHtmlElement(targetElement);
        if (!targetHtmlElement) {
            throw new Error('Drop Target row not found');
        }

        const rect = targetHtmlElement.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;

        await this.internalMovePointer(targetHtmlElement, { clientX, clientY });
    }

    public async finish(options: RowDragFinishOptions = {}): Promise<void> {
        if (this.finished) {
            return;
        }

        this.ensureActive();

        const dispatcher = this.dispatcher!;
        let targetElement = dispatcher.currentDropTarget ?? this.finalDropTarget;

        if (!targetElement) {
            throw new Error('Drop Target row not found');
        }

        if (options.beforeDrop) {
            await options.beforeDrop({
                targetElement,
            });
            targetElement = dispatcher.currentDropTarget ?? targetElement;

            if (!targetElement) {
                throw new Error('Drop Target row not found');
            }
        }

        const cancel = options.cancel;
        if (cancel) {
            await dispatcher.cancelDrag();
        } else {
            await dispatcher.finishDrag(targetElement);
        }

        this.finalDropTarget = targetElement ?? this.finalDropTarget;

        this.detachListeners();

        await this.waitForSettle();

        if (this.finalDropTarget && this.sourceRowId) {
            if (this.rowDragEnterEvents.length > 1) {
                throw new Error('Row drag enter event fired more than once');
            }

            if (this.rowDragEnterEvents.length === 1) {
                const rowDragEnterEvent = this.rowDragEnterEvents[0];
                expect(rowDragEnterEvent.node.id).toBe(this.sourceRowId);

                const expectedOverId = rowDragEnterEvent.overNode?.id;
                if (
                    expectedOverId !== this.sourceRowId &&
                    expectedOverId !== this.finalDropTarget.getAttribute('row-id')
                ) {
                    expect(expectedOverId).toBe(this.sourceRowId);
                }

                expect(this.rowDragMoveEvents.length).toBeGreaterThan(0);

                if (cancel) {
                    expect(this.rowDragEndEvents.length).toBe(0);
                    expect(this.rowDragCancelEvents.length).toBeGreaterThan(0);
                } else {
                    expect(this.rowDragEndEvents.length).toBe(1);
                    expect(this.rowDragEndEvents[0].node).toBe(rowDragEnterEvent.node);
                    expect(this.rowDragEndEvents[0].nodes).toBe(rowDragEnterEvent.nodes);
                }
            }
        }

        if (this.sourceElement?.isConnected) {
            expect(this.sourceElement.classList.contains('ag-row-dragging')).toBe(false);
        }

        this.finished = true;
    }

    private async internalMovePointer(targetElement: Element, options: RowDragMoveOptions = {}): Promise<void> {
        const dispatcher = this.dispatcher;
        if (!dispatcher) {
            throw new Error('Row drag has not been started');
        }

        const yOffsetPercent = options.yOffsetPercent ?? 0.5;
        const rect = targetElement.getBoundingClientRect();
        const computedPoint = computeStepPoint(rect, yOffsetPercent, dispatcher.currentY);

        const stepX = options.clientX ?? computedPoint.x;
        const stepY = options.clientY ?? computedPoint.y;

        await dispatcher.movePointer(targetElement, stepX, stepY);

        this.applyPostMoveEffects();
    }

    private applyPostMoveEffects(): void {
        this.gridHtmlRows.invalidateHtml();
        if (shouldAssertDropIndicator(this.api)) {
            assertDropIndicatorVisible(this.api);
        }
        this.finalDropTarget = this.dispatcher?.currentDropTarget ?? null;
    }

    private attachListeners(): void {
        if (this.listenersAttached) {
            return;
        }
        const listeners = this.listeners;
        this.api.addEventListener('rowDragEnter', listeners.rowDragEnter);
        this.api.addEventListener('rowDragMove', listeners.rowDragMove);
        this.api.addEventListener('rowDragEnd', listeners.rowDragEnd);
        this.api.addEventListener('rowDragCancel', listeners.rowDragCancel);
        this.listenersAttached = true;
    }

    private detachListeners(): void {
        if (!this.listenersAttached) {
            return;
        }
        const listeners = this.listeners;
        this.api.removeEventListener('rowDragEnter', listeners.rowDragEnter);
        this.api.removeEventListener('rowDragMove', listeners.rowDragMove);
        this.api.removeEventListener('rowDragEnd', listeners.rowDragEnd);
        this.api.removeEventListener('rowDragCancel', listeners.rowDragCancel);
        this.listenersAttached = false;
    }

    private ensureActive(): void {
        if (!this.started || !this.dispatcher || !this.sourceElement) {
            throw new Error('Row drag has not been started');
        }
        if (this.finished) {
            throw new Error('Row drag already finished');
        }
    }

    private createRecorder<T>(collection: T[], completesDrag = false) {
        return (event: T) => {
            this.ensureSettlePromise();
            collection.push(event);
            if (completesDrag) {
                this.resolveSettle?.();
            }
        };
    }

    private ensureSettlePromise(): void {
        if (!this.settlePromise) {
            this.settlePromise = new Promise<void>((resolve) => {
                this.resolveSettle = () => {
                    this.settlePromise = undefined;
                    this.resolveSettle = undefined;
                    resolve();
                };
            });
        }
    }

    private async waitForSettle(): Promise<void> {
        for (let repeat = 0; !this.settlePromise && repeat < 50; repeat += 1) {
            await asyncSetTimeout(2);
        }
        if (this.settlePromise) {
            await this.settlePromise;
        }
    }

    public reset(): void {
        if (!this.finished) {
            throw new Error('Row drag cannot reset before finish');
        }

        this.detachListeners();

        this.dispatcher = null;
        this.sourceElement = null;
        this.sourceRowId = '';
        this.sourceYOffsetPercent = 0.5;
        this.finalDropTarget = null;
        this.listenersAttached = false;
        this.started = false;
        this.finished = false;

        this.rowDragEnterEvents.length = 0;
        this.rowDragMoveEvents.length = 0;
        this.rowDragEndEvents.length = 0;
        this.rowDragCancelEvents.length = 0;

        this.settlePromise = undefined;
        this.resolveSettle = undefined;

        this.gridHtmlRows = new GridHtmlRows(this.api);
    }
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

function linearInterpolation(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
}
