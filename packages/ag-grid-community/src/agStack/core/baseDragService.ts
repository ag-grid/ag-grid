import { KeyCode } from '../constants/keyCode';
import type { PointerCapture } from '../events/pointerCapture';
import { capturePointer, releasePointerCapture } from '../events/pointerCapture';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { DragListenerParams, IDragService } from '../interfaces/iDrag';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _isBrowserSafari } from '../utils/browser';
import { _getDocument, _getRootNode } from '../utils/document';
import { _isFocusableFormField } from '../utils/dom';
import type { TempEventHandler } from '../utils/event';
import {
    _areEventsNear,
    _getFirstActiveTouch,
    _isEventFromThisInstance,
    addTempEventHandlers,
    clearTempEventHandlers,
    preventEventDefault,
} from '../utils/event';
import { AgBeanStub } from './agBeanStub';

/**
 * We keep a map document - Dragging to keep only one active drag also if multiple instances
 * of BaseDragService exists for pointer events, to avoid conflicts if there are multiple grids
 * in a page. Only one drag can be active in the whole document at a time */
let activePointerDrags: WeakMap<Document | ShadowRoot, Dragging> | undefined;

/**
 * We keep a WeakSet of events that have already been handled to avoid processing
 * the same event multiple times when there are multiple instances of BaseDragService.
 */
let handledDragEvents: WeakSet<Event> | undefined;

const addHandledDragEvent = (event: Event): boolean => {
    if (!handledDragEvents) {
        handledDragEvents = new WeakSet<Event>();
    } else if (handledDragEvents.has(event)) {
        return false; // Already processed
    }
    handledDragEvents.add(event);
    return true;
};

export class BaseDragService<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IDragService
{
    beanName = 'dragSvc' as const;

    public dragging: boolean = false;
    private drag: Dragging | null = null;
    private readonly dragSources: DragSourceEntry[] = [];

    public get startTarget(): EventTarget | null {
        return this.drag?.start.target ?? null;
    }

    /** True if there is at least one active pointer drag in any BaseDragService instance in the page */
    private isPointer(): boolean {
        return !!activePointerDrags?.has(_getRootNode(this.beans));
    }

    public hasPointerCapture(): boolean {
        const capture = this.drag?.pointerCapture;
        return !!(capture && this.beans.eRootDiv.hasPointerCapture?.(capture.pointerId));
    }

    public override destroy(): void {
        if (this.drag) {
            this.cancelDrag();
        }
        const dragSources = this.dragSources;
        for (const entry of dragSources) {
            destroyDragSourceEntry(entry);
        }
        dragSources.length = 0;
        super.destroy();
    }

    public removeDragSource(params: DragListenerParams): void {
        const dragSources = this.dragSources;
        for (let i = 0, len = dragSources.length; i < len; ++i) {
            const entry = dragSources[i];
            if (entry.params === params) {
                dragSources.splice(i, 1);
                destroyDragSourceEntry(entry);
                break;
            }
        }
    }

    public addDragSource(params: DragListenerParams): void {
        if (!this.isAlive()) {
            return; // Destroyed
        }
        const { eElement, includeTouch } = params;
        const handlers: TempEventHandler[] = [];

        let oldTouchAction: string | undefined;
        if (includeTouch) {
            const style = (eElement as Partial<HTMLElement>).style;
            if (style) {
                oldTouchAction = style.touchAction;
                style.touchAction = 'none'; // stop touch scrolling while dragging
            }
        }

        const dragSource = { handlers, params, oldTouchAction };
        this.dragSources.push(dragSource);

        // Modern Pointer Events (preferred when supported)
        const pointerDownListener = (event: PointerEvent) => this.onPointerDown(params, event);

        // Fallback to legacy Mouse handler
        const mouseListener = (event: MouseEvent) => this.onMouseDown(params, event);
        addTempEventHandlers(
            handlers,
            [eElement, 'pointerdown', pointerDownListener, { passive: false }],
            [eElement, 'mousedown', mouseListener]
        );

        const suppressTouch = this.gos.get('suppressTouch');
        if (includeTouch && !suppressTouch) {
            // Fallback to legacy Mouse touch handler
            const touchListener = (touchEvent: TouchEvent) => this.onTouchStart(params, touchEvent);

            // we set passive=false, as we want to prevent default on this event
            addTempEventHandlers(handlers, [eElement, 'touchstart', touchListener, { passive: false }]);
        }
    }

    public cancelDrag(eElement?: Element | undefined): void {
        const drag = this.drag;
        eElement ??= drag?.eElement;
        if (eElement) {
            this.eventSvc.dispatchEvent({ type: 'dragCancelled', target: eElement });
        }
        drag?.params.onDragCancel?.();
        this.destroyDrag();
    }

    protected shouldPreventMouseEvent(mouseEvent: MouseEvent): boolean {
        const type = mouseEvent.type;
        const isMouseMove = type === 'mousemove' || type === 'pointermove';
        return (
            isMouseMove &&
            mouseEvent.cancelable &&
            _isEventFromThisInstance(this.beans, mouseEvent) &&
            !_isFocusableFormField(getEventTargetElement(mouseEvent))
        );
    }

    private initDrag(drag: Dragging, ...handlers: TempEventHandler[]): void {
        this.drag = drag;
        const beans = this.beans;
        const onScroll = (event: Event) => this.onScroll(event);
        const keydownEvent = (ev: KeyboardEvent) => this.onKeyDown(ev);
        const rootEl = _getRootNode(beans);
        const eDocument = _getDocument(beans);

        addTempEventHandlers(
            drag.handlers,
            [rootEl, 'contextmenu', preventEventDefault],
            [rootEl, 'keydown', keydownEvent],
            [eDocument, 'scroll', onScroll, { capture: true }],
            [eDocument.defaultView || window, 'scroll', onScroll],
            ...handlers
        );
    }

    private destroyDrag(): void {
        this.dragging = false;
        const drag = this.drag;
        if (drag) {
            const rootEl = drag.rootEl;
            if (activePointerDrags?.get(rootEl) === drag) {
                activePointerDrags.delete(rootEl);
            }
            this.drag = null;
            releasePointerCapture(drag.pointerCapture);
            clearTempEventHandlers(drag.handlers);
        }
    }

    // Pointer Events path (preferred when supported)
    private onPointerDown(params: DragListenerParams, pointerEvent: PointerEvent): void {
        if (this.isPointer()) {
            return; // Another pointer drag in progress
        }

        const beans = this.beans;
        if (handledDragEvents?.has(pointerEvent)) {
            return; // Already handled
        }

        // handle suppressTouch/includeTouch for touch pointers
        const pointerType = pointerEvent.pointerType;
        if (pointerType === 'touch') {
            if (beans.gos.get('suppressTouch') || !params.includeTouch) {
                return;
            }
            if (params.stopPropagationForTouch) {
                pointerEvent.stopPropagation();
            }
            if (_isFocusableFormField(getEventTargetElement(pointerEvent))) {
                return;
            }
        }

        // only primary pointer; for mouse, only left button
        if (!pointerEvent.isPrimary) {
            return;
        }
        if (pointerType === 'mouse' && pointerEvent.button !== 0) {
            return;
        }

        this.destroyDrag();

        const rootEl = _getRootNode(beans);
        const eElement = params.eElement;
        const pointerId = pointerEvent.pointerId;
        const pointerDrag = new Dragging(rootEl, params, pointerEvent, pointerId);

        activePointerDrags ??= new WeakMap();
        activePointerDrags.set(rootEl, pointerDrag);

        const onPointerMove = (ev: PointerEvent) => {
            if (ev.pointerId === pointerId) {
                this.onMouseOrPointerMove(ev);
            }
        };

        const onUp = (ev: PointerEvent) => {
            if (ev.pointerId === pointerId) {
                this.onMouseOrPointerUp(ev);
            }
        };

        const onCancel = (ev: PointerEvent) => {
            if (ev.pointerId === pointerId && addHandledDragEvent(ev)) {
                this.cancelDrag();
            }
        };

        this.initDrag(
            pointerDrag,
            [rootEl, 'pointerup', onUp],
            [rootEl, 'pointercancel', onCancel],
            [rootEl, 'pointermove', onPointerMove, { passive: false }],
            [rootEl, 'touchmove', preventEventDefault, { passive: false }],
            [eElement, 'mousemove', preventEventDefault, { passive: false }]
        );

        // start immediately if threshold is zero
        if (params.dragStartPixels === 0) {
            this.onMouseOrPointerMove(pointerEvent);
        } else {
            addHandledDragEvent(pointerEvent);
        }
    }

    // gets called whenever mouse down on any drag source
    private onTouchStart(params: DragListenerParams, touchEvent: TouchEvent): void {
        const suppressTouch = this.gos.get('suppressTouch');
        if (suppressTouch || !params.includeTouch) {
            return;
        }

        if (!addHandledDragEvent(touchEvent)) {
            return; // Already handled
        }

        if (_isFocusableFormField(getEventTargetElement(touchEvent))) {
            return;
        }

        if (params.stopPropagationForTouch) {
            touchEvent.stopPropagation();
        }

        if (this.isPointer()) {
            preventEventDefault(touchEvent);
            return; // Active pointer drag in progress, ignore legacy touch start
        }

        this.destroyDrag();

        const beans = this.beans;
        const rootEl = _getRootNode(beans);
        const touchDrag = new Dragging(rootEl, params, touchEvent.touches[0]);

        const touchMoveEvent = (e: TouchEvent) => this.onTouchMove(e);
        const touchEndEvent = (e: TouchEvent) => this.onTouchUp(e);

        const target = touchEvent.target ?? params.eElement;
        this.initDrag(
            touchDrag,
            [_getRootNode(beans), 'touchmove', preventEventDefault, { passive: false }],
            [target, 'touchmove', touchMoveEvent, { passive: true }],
            [target, 'touchend', touchEndEvent, { passive: true }],
            [target, 'touchcancel', touchEndEvent, { passive: true }]
        );

        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMove(touchDrag.start);
        }
    }

    // gets called whenever mouse down on any drag source
    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {
        if (mouseEvent.button !== 0) {
            return; // only interested in left button clicks
        }
        // if there are two elements with parent / child relationship, and both are draggable,
        // when we drag the child, we should NOT drag the parent. an example of this is row moving
        // and range selection - row moving should get preference when use drags the rowDrag component.
        if (handledDragEvents?.has(mouseEvent)) {
            return; // Already handled
        }

        if (this.isPointer()) {
            return; // Pointer-based drag in progress, ignore mouse down
        }

        const beans = this.beans;
        this.destroyDrag();

        const mouseDrag = new Dragging(_getRootNode(beans), params, mouseEvent);

        const mouseMoveEvent = (event: MouseEvent) => this.onMouseOrPointerMove(event);
        const mouseUpEvent = (event: MouseEvent) => this.onMouseOrPointerUp(event);

        const target = _getRootNode(beans);
        this.initDrag(mouseDrag, [target, 'mousemove', mouseMoveEvent], [target, 'mouseup', mouseUpEvent]);

        //see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseOrPointerMove(mouseEvent);
        } else {
            addHandledDragEvent(mouseEvent);
        }
    }

    private onScroll(event: Event): void {
        if (!addHandledDragEvent(event)) {
            return;
        }
        const drag = this.drag;
        const lastDrag = drag?.lastDrag;
        if (lastDrag && this.dragging) {
            drag.params?.onDragging?.(lastDrag);
        }
    }

    /** only gets called after a mouse down - as this is only added after mouseDown and is removed when mouseUp happens */
    private onMouseOrPointerMove(mouseEvent: MouseEvent): void {
        if (!addHandledDragEvent(mouseEvent)) {
            return;
        }

        if (_isBrowserSafari()) {
            _getDocument(this.beans).getSelection()?.removeAllRanges();
        }

        if (this.shouldPreventMouseEvent(mouseEvent)) {
            preventEventDefault(mouseEvent);
        }

        this.onMove(mouseEvent);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        const drag = this.drag;
        if (!drag || !addHandledDragEvent(touchEvent)) {
            return;
        }
        const touch = _getFirstActiveTouch(drag.start as Touch, touchEvent.touches);
        if (touch) {
            touchEvent.preventDefault();
            this.onMove(touch);
        }
    }

    private onMove(currentEvent: PointerEvent | MouseEvent | Touch): void {
        const drag = this.drag;
        if (!drag) {
            return;
        }

        drag.lastDrag = currentEvent;

        const dragSource = drag.params;
        if (!this.dragging) {
            const start = drag.start;
            const dragStartPixels = dragSource.dragStartPixels;
            const requiredPixelDiff = dragStartPixels ?? 4;

            // if pointer hasn't travelled from the start position enough, do nothing
            if (_areEventsNear(currentEvent, start, requiredPixelDiff)) {
                return;
            }

            this.dragging = true;

            if (dragSource.capturePointer) {
                drag.pointerCapture = capturePointer(this.beans.eRootDiv, currentEvent);
            }

            this.eventSvc.dispatchEvent({
                type: 'dragStarted',
                target: dragSource.eElement,
            });

            dragSource.onDragStart?.(start);

            // we need ONE drag action at the start event, so that we are guaranteed the drop target
            // at the start gets notified. this is because the drag can start outside of the element
            // that started it, as the mouse is allowed drag away from the mouse down before it's
            // considered a drag (the _areEventsNear() above). if we didn't do this, then
            // it would be possible to click a column by the edge, then drag outside of the drop zone
            // in less than 4 pixels and the drag officially starts outside of the header but the header
            // wouldn't be notified of the dragging.

            if (this.drag !== drag) {
                return; // drag has been cancelled.
            }

            dragSource.onDragging?.(start);

            if (this.drag !== drag) {
                return; // drag has been cancelled.
            }
        }

        dragSource.onDragging?.(currentEvent);
    }

    private onTouchUp(touchEvent: TouchEvent): void {
        const drag = this.drag;
        if (drag && addHandledDragEvent(touchEvent)) {
            this.onUp(_getFirstActiveTouch(drag.start as Touch, touchEvent.changedTouches));
        }
    }

    private onMouseOrPointerUp(mouseEvent: MouseEvent | PointerEvent): void {
        if (addHandledDragEvent(mouseEvent)) {
            this.onUp(mouseEvent);
        }
    }

    private onUp(eventOrTouch: PointerEvent | MouseEvent | Touch | null | undefined): void {
        const drag = this.drag;
        if (!drag) {
            return;
        }
        if (!eventOrTouch) {
            eventOrTouch = drag.lastDrag;
        }
        if (eventOrTouch && this.dragging) {
            this.dragging = false;
            drag.params.onDragStop?.(eventOrTouch);
            this.eventSvc.dispatchEvent({
                type: 'dragStopped',
                target: drag.params.eElement,
            });
        }
        this.destroyDrag();
    }

    // shared keydown handler to cancel current drag with ESC
    private onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyCode.ESCAPE) {
            this.cancelDrag();
        }
    }
}

interface DragSourceEntry {
    readonly handlers: TempEventHandler[];
    readonly params: DragListenerParams;
    readonly oldTouchAction: string | null | undefined;
}

const destroyDragSourceEntry = (dragSource: DragSourceEntry): void => {
    clearTempEventHandlers(dragSource.handlers);
    const oldTouchAction = dragSource.oldTouchAction;
    if (oldTouchAction != null) {
        const style = (dragSource.params.eElement as Partial<HTMLElement>).style;
        if (style) {
            style.touchAction = oldTouchAction;
        }
    }
};

class Dragging {
    public readonly eElement: Element & Partial<HTMLElement>;
    public readonly handlers: TempEventHandler[] = [];
    public lastDrag: PointerEvent | MouseEvent | Touch | null = null;
    public pointerCapture: PointerCapture | null = null;

    constructor(
        public readonly rootEl: Document | ShadowRoot,
        public readonly params: DragListenerParams,
        public readonly start: PointerEvent | MouseEvent | Touch,
        public readonly pointerId: number | null = null
    ) {
        this.eElement = params.eElement;
    }
}

const getEventTargetElement = (event: Event): Element | null => {
    const target = event.target;
    return target instanceof Element ? target : null;
};
