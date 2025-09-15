import { KeyCode } from '../constants/keyCode';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { DragListenerParams, IDragService } from '../interfaces/iDrag';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _isBrowserSafari } from '../utils/browser';
import { _getDocument, _getRootNode } from '../utils/document';
import { _isFocusableFormField } from '../utils/dom';
import { _areEventsNear, _getFirstActiveTouch, _isEventFromThisInstance } from '../utils/event';
import { _exists } from '../utils/generic';
import { AgBeanStub } from './agBeanStub';

const preventEventDefault = (event: Event) => event.preventDefault();

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
    private handledEvents: WeakSet<Event> | null = null;
    private readonly dragSources: DragSourceEntry[] = [];

    public get startTarget(): EventTarget | null {
        return this.drag?.start.target ?? null;
    }

    private addHandledEvent(event: Event): boolean {
        let set = this.handledEvents;
        if (!set) {
            this.handledEvents = set = new WeakSet<Event>();
        } else if (set.has(event)) {
            return false; // Already processed
        }
        set.add(event);
        return true;
    }

    public override destroy(): void {
        if (this.drag) {
            this.cancelDrag();
        }
        const dragSources = this.dragSources;
        for (const ds of dragSources) {
            removeTempEventHandlers(ds.handlers);
        }
        dragSources.length = 0;
        super.destroy();
        this.handledEvents = null;
    }

    public removeDragSource(params: DragListenerParams): void {
        const dragSources = this.dragSources;
        for (let i = 0, len = dragSources.length; i < len; ++i) {
            const item = dragSources[i];
            if (item.params === params) {
                dragSources.splice(i, 1);
                removeTempEventHandlers(item.handlers);
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
        const dragSource = { handlers, params };
        this.dragSources.push(dragSource);

        // Modern Pointer Events (preferred when supported)
        const pointerDownListener = (event: PointerEvent) => this.onPointerDown(params, event);

        // Fallback to legacy Mouse handler
        const mouseListener = (event: MouseEvent) => this.onMouseDown(params, event);
        addTempEventHandlers(
            handlers,
            [eElement, 'pointerdown', pointerDownListener],
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
            this.drag = null;
            removeTempEventHandlers(drag.handlers);
        }
    }

    // Pointer Events path (preferred when supported)
    private onPointerDown(params: DragListenerParams, pointerEvent: PointerEvent): void {
        const beans = this.beans;
        if (this.handledEvents?.has(pointerEvent)) {
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

        const eRootDiv = beans.eRootDiv;
        const pointerDrag = new Dragging(params, pointerEvent, true);

        const onMove = (ev: PointerEvent) => this.onMouseMove(ev);
        const onUp = (ev: PointerEvent) => this.onUp(ev);
        const onCancel = () => this.cancelDrag();
        const onMouseMove = (mouseEvent: MouseEvent) => {
            if (this.shouldPreventMouseEvent(mouseEvent)) {
                preventEventDefault(mouseEvent);
            }
        };
        this.initDrag(
            pointerDrag,
            [eRootDiv, 'pointermove', onMove],
            [eRootDiv, 'pointerup', onUp],
            [eRootDiv, 'pointercancel', onCancel],
            [eRootDiv, 'lostpointercapture', onCancel],
            [_getRootNode(beans), 'mousemove', onMouseMove]
        );

        // start immediately if threshold is zero
        if (params.dragStartPixels === 0) {
            this.onMouseMove(pointerEvent);
        } else {
            this.addHandledEvent(pointerEvent);
        }
    }

    // gets called whenever mouse down on any drag source
    private onTouchStart(params: DragListenerParams, touchEvent: TouchEvent): void {
        const suppressTouch = this.gos.get('suppressTouch');
        if (suppressTouch || !params.includeTouch) {
            return;
        }

        if (!this.addHandledEvent(touchEvent)) {
            return; // Already handled
        }

        if (_isFocusableFormField(getEventTargetElement(touchEvent))) {
            return;
        }

        const drag = this.drag;
        if (drag?.pointer) {
            return; // We are handling the pointer events, ignore this
        }

        if (params.stopPropagationForTouch) {
            touchEvent.stopPropagation();
        }

        this.destroyDrag();

        const beans = this.beans;
        const touchDrag = new Dragging(params, touchEvent.touches[0], false);

        const touchMoveEvent = (e: TouchEvent) => this.onTouchMove(e);
        const touchEndEvent = (e: TouchEvent) => this.onTouchUp(e);
        const documentTouchMove = (e: TouchEvent) => {
            if (e.cancelable) {
                preventEventDefault(e);
            }
        };

        const target = touchEvent.target ?? params.eElement;
        this.initDrag(
            touchDrag,
            [_getRootNode(beans), 'touchmove', documentTouchMove, { passive: false }],
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
        if (this.handledEvents?.has(mouseEvent)) {
            return; // Already handled
        }

        if (this.drag?.pointer) {
            return; // We are handling the pointer events, ignore this
        }

        const beans = this.beans;
        this.destroyDrag();

        const mouseDrag = new Dragging(params, mouseEvent, false);

        const mouseMoveEvent = (event: MouseEvent) => this.onMouseMove(event);
        const mouseUpEvent = (event: MouseEvent) => this.onUp(event);

        const target = _getRootNode(beans);
        this.initDrag(mouseDrag, [target, 'mousemove', mouseMoveEvent], [target, 'mouseup', mouseUpEvent]);

        //see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent);
        } else {
            this.addHandledEvent(mouseEvent);
        }
    }

    private onScroll(event: Event): void {
        if (!this.addHandledEvent(event)) {
            return;
        }
        const drag = this.drag;
        const lastDrag = drag?.lastDrag;
        if (lastDrag && this.dragging) {
            drag.params?.onDragging(lastDrag);
        }
    }

    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    private onMouseMove(mouseEvent: MouseEvent): void {
        if (!this.addHandledEvent(mouseEvent)) {
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
        if (!drag || !this.addHandledEvent(touchEvent)) {
            return;
        }
        const touch = _getFirstActiveTouch(drag.start as Touch, touchEvent.touches);
        if (touch) {
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
            const requiredPixelDiff = _exists(dragStartPixels) ? dragStartPixels : 4;

            // if pointer hasn't travelled from the start position enough, do nothing
            if (_areEventsNear(currentEvent, start, requiredPixelDiff)) {
                return;
            }

            this.dragging = true;
            this.eventSvc.dispatchEvent({
                type: 'dragStarted',
                target: dragSource.eElement,
            });

            dragSource.onDragStart(start);

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

            dragSource.onDragging(start);

            if (this.drag !== drag) {
                return; // drag has been cancelled.
            }
        }

        dragSource.onDragging(currentEvent);
    }

    private onTouchUp(touchEvent: TouchEvent): void {
        const drag = this.drag;
        if (drag) {
            this.onUp(_getFirstActiveTouch(drag.start as Touch, touchEvent.changedTouches));
        }
    }

    private onUp(eventOrTouch: MouseEvent | Touch | null | undefined): void {
        const drag = this.drag;
        if (!drag) {
            return;
        }
        if (!eventOrTouch) {
            eventOrTouch = drag.lastDrag;
        }
        if (eventOrTouch && this.dragging) {
            this.dragging = false;
            drag.params.onDragStop(eventOrTouch);
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
}

// Tuple [target, type, listener, options?]
type TempEventHandler = [
    target: EventTarget,
    type: string,
    listener: (e: Event) => void,
    options?: boolean | AddEventListenerOptions,
];

const addTempEventHandlers = (list: TempEventHandler[], ...handlers: TempEventHandler[]): void => {
    for (const handler of handlers) {
        const [target, type, eventListener, options] = handler;
        target.addEventListener(type, eventListener, options);
        list.push(handler);
    }
};

const removeTempEventHandlers = (list: TempEventHandler[]): void => {
    for (const [target, type, listener, options] of list) {
        target.removeEventListener(type, listener, options);
    }
};

// New class-based drag model replacing prior interfaces
class Dragging {
    public readonly eElement: Element & Partial<HTMLElement>;
    public readonly handlers: TempEventHandler[] = [];
    public lastDrag: PointerEvent | MouseEvent | Touch | null = null;

    public constructor(
        public readonly params: DragListenerParams,
        public readonly start: PointerEvent | MouseEvent | Touch,
        public readonly pointer: boolean
    ) {
        this.eElement = params.eElement;
    }
}

const getEventTargetElement = (event: Event): Element | null => {
    const target = event.target;
    return target instanceof Element ? target : null;
};
