import type { GridApi, RowDragCancelEvent, RowDragEndEvent, RowDragEvent, RowDragMoveEvent } from 'ag-grid-community';

import { DestroyedRowNodesChecker } from '../grid-test-utils';
import type { RowElementReference } from '../gridRows/gridHtmlRows';
import { getGridOwnerDocument, getRowHtmlElement } from '../gridRows/gridHtmlRows';
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
    center?: boolean;
}

export interface RowDragDispatcherParams {
    api: GridApi;
    eventType?: DragInteractionType;
}

export interface RowDragFinishOptions {
    cancel?: boolean;
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
    private destroyedNodeChecker: DestroyedRowNodesChecker | null = null;

    private settlePromise: Promise<void> | undefined = undefined;
    private resolveSettle: (() => void) | undefined = undefined;

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

        const sourceElement = getRowHtmlElement(this.api, source);
        if (!sourceElement) {
            throw new Error('Drop source row not found');
        }

        const dragHandle = sourceElement.querySelector('.ag-drag-handle');
        if (!dragHandle) {
            throw new Error('Row drag handle not found');
        }

        this.destroyedNodeChecker = new DestroyedRowNodesChecker(this.api);

        const gridElement = TestGridsManager.getHTMLElement(this.api);
        const dropContainer =
            (gridElement?.querySelector('.ag-body-viewport') as Element | null) ??
            getGridOwnerDocument(this.api).documentElement;

        this.sourceElement = sourceElement;
        this.sourceRowId = sourceElement.getAttribute('row-id') || '';
        this.sourceYOffsetPercent = options.yOffsetPercent ?? 0.5;

        this.dispatcher = new DragEventDispatcher(this.eventType, dropContainer);

        this.attachListeners();

        const handleRect = dragHandle.getBoundingClientRect();

        const pointerDownX = options.clientX ?? handleRect.left + handleRect.width / 2;
        const pointerDownY =
            options.clientY ?? handleRect.top + linearInterpolation(0, handleRect.height, this.sourceYOffsetPercent);

        await this.dispatcher.startDrag(dragHandle, pointerDownX, pointerDownY);

        this.started = true;

        const sourceRect = sourceElement.getBoundingClientRect();
        const firstDragClientX = pointerDownX >= sourceRect.right - 5 ? pointerDownX - 5 : pointerDownX + 5;
        const firstDragClientY = pointerDownY >= sourceRect.bottom - 5 ? pointerDownY - 5 : pointerDownY + 5;
        await this.move(source, { clientX: firstDragClientX, clientY: firstDragClientY });
    }

    public async move(target: RowElementReference, options: RowDragMoveOptions = {}): Promise<void> {
        this.ensureActive();

        const targetElement = getRowHtmlElement(this.api, target);
        if (!targetElement) {
            throw new Error('Drop Target row not found');
        }

        const dispatcher = this.dispatcher;
        if (!dispatcher) {
            throw new Error('Row drag has not been started');
        }

        let stepX = options.clientX;
        let stepY = options.clientY;

        if (stepX === undefined || stepY === undefined) {
            const rect = targetElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            if (options.center) {
                stepX ??= centerX;
                stepY ??= centerY;
            }

            if (!options.center || options.yOffsetPercent !== undefined) {
                const yOffsetPercent = options.yOffsetPercent ?? 0.5;
                const computedPoint = computeStepPoint(rect, yOffsetPercent, dispatcher.currentY);
                stepX ??= computedPoint.x;
                stepY ??= computedPoint.y;
            }

            stepX ??= centerX;
            stepY ??= centerY;
        }

        await dispatcher.movePointer(targetElement, options.clientX ?? stepX, options.clientY ?? stepY);

        if (shouldAssertDropIndicator(this.api)) {
            assertDropIndicatorVisible(this.api);
        }
        this.finalDropTarget = this.dispatcher?.currentDropTarget ?? null;
    }

    public async finish(options: RowDragFinishOptions = {}): Promise<void> {
        this.ensureActive();

        const dispatcher = this.dispatcher!;
        const targetElement = dispatcher.currentDropTarget ?? this.finalDropTarget;

        if (!targetElement) {
            throw new Error('Drop Target row not found');
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

        this.destroyedNodeChecker?.check();
        this.destroyedNodeChecker = null;
    }

    public getDragGhostLabel(): string | null {
        const ownerDocument = getGridOwnerDocument(this.api);
        const labelElement = ownerDocument.querySelector('.ag-dnd-ghost-label');
        return labelElement?.textContent ?? null;
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
