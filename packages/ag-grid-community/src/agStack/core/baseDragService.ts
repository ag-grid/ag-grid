import { KeyCode } from '../constants/keyCode';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { DragListenerParams, IDragService } from '../interfaces/iDrag';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _isBrowserSafari } from '../utils/browser';
import { _getDocument, _getRootNode } from '../utils/document';
import { _isFocusableFormField } from '../utils/dom';
import { _areEventsNear, _isEventFromThisInstance } from '../utils/event';
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
    private readonly dragSources: DragSourceAndListener[] = [];

    public get startTarget(): EventTarget | null {
        return this.drag?.startEvent.target ?? null;
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
        const { dragSources } = this;
        for (const ds of dragSources) {
            removeDragListener(ds);
        }
        dragSources.length = 0;
        this.resetDragProperties();
        super.destroy();
    }

    public removeDragSource(params: DragListenerParams): void {
        const dragSources = this.dragSources;
        for (let i = 0, len = dragSources.length; i < len; ++i) {
            const item = dragSources[i];
            if (item.dragSource === params) {
                dragSources.splice(i, 1);
                removeDragListener(item);
                break;
            }
        }
    }

    public addDragSource(dragSource: DragListenerParams): void {
        const { eElement, includeTouch, stopPropagationForTouch } = dragSource;

        const pointerDownListener = (event: PointerEvent) => this.onPointerDown(dragSource, event);
        eElement.addEventListener('pointerdown', pointerDownListener);

        // Fallback to legacy Mouse/Touch

        const mouseListener = (event: MouseEvent) => this.onMouseDown(dragSource, event);
        eElement.addEventListener('mousedown', mouseListener);

        let touchListener: ((touchEvent: TouchEvent) => void) | null = null;

        const suppressTouch = this.gos.get('suppressTouch');

        if (includeTouch && !suppressTouch) {
            touchListener = (touchEvent: TouchEvent) => {
                if (_isFocusableFormField(touchEvent.target as HTMLElement)) {
                    return;
                }
                if (stopPropagationForTouch) {
                    touchEvent.stopPropagation();
                }
                this.onTouchStart(dragSource, touchEvent);
            };
            // we set passive=false, as we want to prevent default on this event
            eElement.addEventListener('touchstart', touchListener, { passive: false });
        }

        this.dragSources.push({
            dragSource,
            pointerDownListener: pointerDownListener,
            mouseDownListener: mouseListener,
            touchStartListener: touchListener,
        });
    }

    private initDragging(drag: Dragging): void {
        this.drag = drag;
        const beans = this.beans;
        const onScroll = (event: Event) => this.onScroll(event);
        const keydownEvent = (ev: KeyboardEvent) => this.onKeyDown(ev);

        const rootEl = _getRootNode(beans);
        const eDocument = _getDocument(beans);
        drag.addHandlers([
            { target: rootEl, type: 'contextmenu', listener: preventEventDefault },
            { target: rootEl, type: 'keydown', listener: keydownEvent },
            { target: eDocument, type: 'scroll', listener: onScroll, options: { capture: true } },
            { target: eDocument.defaultView || window, type: 'scroll', listener: onScroll },
        ]);
    }

    // Pointer Events path (preferred when supported)
    private onPointerDown(params: DragListenerParams, event: PointerEvent): void {
        const beans = this.beans;
        if (this.handledEvents?.has(event)) {
            return; // Already handled
        }

        const pointerType = event.pointerType;

        // handle suppressTouch/includeTouch for touch pointers
        if (pointerType === 'touch') {
            if (beans.gos.get('suppressTouch') || !params.includeTouch) {
                return;
            }
            if (params.stopPropagationForTouch) {
                event.stopPropagation();
            }
            if (_isFocusableFormField(event.target as HTMLElement)) {
                return;
            }
        }

        // only primary pointer; for mouse, only left button
        if (!event.isPrimary) {
            return;
        }
        if (pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        this.resetDragProperties();

        // attempt pointer capture (no static factory)
        const pointerId = event.pointerId;
        const eElement: Element & Partial<HTMLElement> = params.eElement;
        if (!pointerId || !eElement.setPointerCapture) {
            return; // fallback to legacy handlers
        }
        try {
            eElement.setPointerCapture(pointerId);
        } catch {
            return; // capture failed, fallback to normal events
        }
        let oldTouchAction: string | undefined;
        const style = eElement.style;
        if (style) {
            oldTouchAction = style.touchAction;
            style.touchAction = 'none'; // disable touch actions while dragging
        }
        const pointerDrag = new PointerDragging(params, event, pointerId, oldTouchAction);

        this.addHandledEvent(event);

        const onMove = (ev: PointerEvent) => this.onPointerMove(ev);
        const onUp = (ev: PointerEvent) => this.onUpCommon(ev);
        const onCancel = () => this.cancelDrag();
        this.initDragging(pointerDrag);
        pointerDrag.addHandlers([
            { target: params.eElement, type: 'pointermove', listener: onMove },
            { target: params.eElement, type: 'pointerup', listener: onUp },
            { target: params.eElement, type: 'pointercancel', listener: onCancel },
            { target: params.eElement, type: 'lostpointercapture', listener: onCancel },
        ]);

        // start immediately if threshold is zero
        if (params.dragStartPixels === 0) {
            this.onPointerMove(event);
        }
    }

    // gets called whenever mouse down on any drag source
    private onTouchStart(params: DragListenerParams, touchEvent: TouchEvent): void {
        const beans = this.beans;
        if (!this.addHandledEvent(touchEvent)) {
            return;
        }

        if (this.drag?.kind === 'pointer') {
            return; // We are handling the pointer events
        }

        this.dragging = false;

        const touchDrag = new BaseDragging<'touch', Touch>('touch', params, touchEvent.touches[0]);

        const touchMoveEvent = (e: TouchEvent) => this.onTouchMove(e);
        const touchEndEvent = (e: TouchEvent) => this.onTouchUp(e);
        const documentTouchMove = (e: TouchEvent) => {
            if (e.cancelable) {
                preventEventDefault(e);
            }
        };

        const target = touchEvent.target as Document | ShadowRoot | EventTarget;
        this.initDragging(touchDrag);
        touchDrag.addHandlers([
            // Prevents the page document from moving while we are dragging items around.
            // preventDefault needs to be called in the touchmove listener and never inside the
            // touchstart, because using touchstart causes the click event to be cancelled on touch devices.
            {
                target: _getRootNode(beans),
                type: 'touchmove',
                listener: documentTouchMove,
                options: { passive: false },
            },
            { target, type: 'touchmove', listener: touchMoveEvent, options: { passive: true } },
            { target, type: 'touchend', listener: touchEndEvent, options: { passive: true } },
            { target, type: 'touchcancel', listener: touchEndEvent, options: { passive: true } },
        ]);

        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onCommonMove(touchDrag.startEvent);
        }
    }

    // gets called whenever mouse down on any drag source
    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {
        const beans = this.beans;
        // if there are two elements with parent / child relationship, and both are draggable,
        // when we drag the child, we should NOT drag the parent. an example of this is row moving
        // and range selection - row moving should get preference when use drags the rowDrag component.
        if (!this.addHandledEvent(mouseEvent)) {
            return;
        }

        if (this.drag?.kind === 'pointer') {
            return; // We are handling the pointer events
        }

        if (mouseEvent.button !== 0) {
            return; // only interested in left button clicks
        }

        this.resetDragProperties();

        const mouseDrag = new BaseDragging<'mouse', MouseEvent>('mouse', params, mouseEvent);

        const mouseMoveEvent = (event: MouseEvent) => this.onMouseMove(event);
        const mouseUpEvent = (event: MouseEvent) => this.onUpCommon(event);

        const target = _getRootNode(beans);
        this.initDragging(mouseDrag);
        mouseDrag.addHandlers([
            { target, type: 'mousemove', listener: mouseMoveEvent },
            { target, type: 'mouseup', listener: mouseUpEvent },
        ]);

        //see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent);
        }
    }

    private onScroll(event: Event): void {
        if (!this.addHandledEvent(event)) {
            return;
        }
        const drag = this.drag;
        const lastDrag = drag?.lastDrag;
        if (lastDrag && this.dragging) {
            drag.dragSource?.onDragging(lastDrag);
        }
    }

    private onCommonMove(currentEvent: PointerEvent | MouseEvent | Touch): void {
        const drag = this.drag;
        if (!drag) {
            return;
        }

        drag.lastDrag = currentEvent;

        const dragSource = drag.dragSource;
        if (!this.dragging) {
            const startEvent = drag.startEvent;

            const dragStartPixels = dragSource.dragStartPixels;
            const requiredPixelDiff = _exists(dragStartPixels) ? dragStartPixels : 4;

            // if pointer hasn't travelled from the start position enough, do nothing
            if (_areEventsNear(currentEvent, startEvent, requiredPixelDiff)) {
                return;
            }

            this.dragging = true;
            this.eventSvc.dispatchEvent({
                type: 'dragStarted',
                target: dragSource.eElement,
            });

            dragSource.onDragStart(startEvent);

            // we need ONE drag action at the startEvent, so that we are guaranteed the drop target
            // at the start gets notified. this is because the drag can start outside of the element
            // that started it, as the mouse is allowed drag away from the mouse down before it's
            // considered a drag (the isEventNearStartEvent() above). if we didn't do this, then
            // it would be possible to click a column by the edge, then drag outside of the drop zone
            // in less than 4 pixels and the drag officially starts outside of the header but the header
            // wouldn't be notified of the dragging.

            if (this.drag !== drag) {
                return; // drag has been cancelled.
            }

            dragSource.onDragging(startEvent);

            if (this.drag !== drag) {
                return; // drag has been cancelled.
            }
        }

        dragSource.onDragging(currentEvent);
    }

    private beforeMove(mouseEvent: MouseEvent): void {
        if (_isBrowserSafari()) {
            _getDocument(this.beans).getSelection()?.removeAllRanges();
        }

        if (this.shouldPreventMouseEvent(mouseEvent)) {
            preventEventDefault(mouseEvent);
        }
    }

    private onPointerMove(pointerEvent: PointerEvent): void {
        if (!this.addHandledEvent(pointerEvent)) {
            return;
        }
        this.beforeMove(pointerEvent);
        this.onCommonMove(pointerEvent);
    }

    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    private onMouseMove(mouseEvent: MouseEvent): void {
        if (!this.addHandledEvent(mouseEvent)) {
            return;
        }
        this.beforeMove(mouseEvent);
        this.onCommonMove(mouseEvent);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        const drag = this.drag;
        if (drag?.kind === 'touch') {
            const touch = getFirstActiveTouch(drag.startEvent, touchEvent.touches);
            if (touch) {
                this.onCommonMove(touch);
            }
        }
    }

    protected shouldPreventMouseEvent(mouseEvent: MouseEvent): boolean {
        const type = mouseEvent.type;
        const isMouseMove = type === 'mousemove' || type === 'pointermove';
        return (
            isMouseMove &&
            mouseEvent.cancelable &&
            _isEventFromThisInstance(this.beans, mouseEvent) &&
            !isOverFormFieldElement(mouseEvent)
        );
    }

    private onTouchUp(touchEvent: TouchEvent): void {
        const drag = this.drag;
        if (drag?.kind === 'touch') {
            this.onUpCommon(getFirstActiveTouch(drag.startEvent, touchEvent.changedTouches));
        }
    }

    private onUpCommon(eventOrTouch: MouseEvent | Touch | null | undefined): void {
        const drag = this.drag;
        if (!drag) {
            return;
        }
        if (!eventOrTouch) {
            eventOrTouch = drag.lastDrag;
        }
        if (eventOrTouch && this.dragging) {
            this.dragging = false;
            drag.dragSource.onDragStop(eventOrTouch);
            this.eventSvc.dispatchEvent({
                type: 'dragStopped',
                target: drag.dragSource.eElement,
            });
        }
        this.resetDragProperties();
    }

    public cancelDrag(eElement?: Element | undefined): void {
        const drag = this.drag;
        eElement ??= drag?.eElement;
        if (eElement) {
            this.eventSvc.dispatchEvent({ type: 'dragCancelled', target: eElement });
        }
        drag?.dragSource.onDragCancel?.();
        this.resetDragProperties();
    }

    private resetDragProperties(): void {
        this.dragging = false;
        const drag = this.drag;
        if (drag) {
            this.drag = null;
            drag.release();
        }
    }

    // shared keydown handler to cancel current drag with ESC
    private onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyCode.ESCAPE) {
            this.cancelDrag();
        }
    }
}

interface DragSourceAndListener {
    dragSource: DragListenerParams;
    pointerDownListener: (event: PointerEvent) => void;
    mouseDownListener: (mouseEvent: MouseEvent) => void;
    touchStartListener: ((touchEvent: TouchEvent) => void) | null;
}

interface TemporaryEventHandler {
    target: EventTarget;
    type: string;
    listener: (e: Event) => void;
    options?: boolean | AddEventListenerOptions;
}

type DraggingKind = 'mouse' | 'touch' | 'pointer';

// New class-based drag model replacing prior interfaces
class BaseDragging<TKind extends DraggingKind, TEvent extends PointerEvent | MouseEvent | Touch> {
    public readonly eElement: Element & Partial<HTMLElement>;
    public lastDrag: TEvent | null = null;
    private handlers: TemporaryEventHandler[] = [];

    public constructor(
        public readonly kind: TKind,
        public readonly dragSource: DragListenerParams,
        public readonly startEvent: TEvent
    ) {
        this.eElement = dragSource.eElement;
    }

    public addHandlers(listeners: TemporaryEventHandler[]): void {
        const handlers = this.handlers;
        for (const listener of listeners) {
            const { target, type, listener: eventListener, options } = listener;
            target.addEventListener(type, eventListener, options);
            handlers.push(listener);
        }
    }

    public release(): void {
        for (const { target, type, listener, options } of this.handlers) {
            target.removeEventListener(type, listener, options); // remove all registered handlers
        }
    }
}

class PointerDragging extends BaseDragging<'pointer', PointerEvent> {
    private readonly pointerId: number;
    private oldTouchAction: string | undefined;
    constructor(dragSource: DragListenerParams, event: PointerEvent, pointerId: number, oldTouchAction?: string) {
        super('pointer', dragSource, event);
        this.pointerId = pointerId;
        this.oldTouchAction = oldTouchAction;
    }

    public override release(): void {
        super.release();
        const { pointerId, eElement } = this;
        // release pointer capture & restore touch-action first
        if (pointerId != null) {
            try {
                eElement.releasePointerCapture(pointerId);
            } catch {
                // ignore exception as releasePointerCapture can throw
            }
        }
        if (this.oldTouchAction != null) {
            const style = eElement.style;
            if (style && style.touchAction === 'none') {
                style.touchAction = this.oldTouchAction;
            }
        }
    }
}

// Union type for all drag variants (no any usage)
type Dragging = BaseDragging<'mouse', MouseEvent> | BaseDragging<'touch', Touch> | PointerDragging;

const INTERACTIVE_TAG_REGEX = /^(a|textarea|input|select|button)$/i;

const isOverFormFieldElement = (event: Event): boolean => {
    const tag = (event.target as Element | null)?.tagName;
    return !!tag && INTERACTIVE_TAG_REGEX.test(tag);
};

const removeDragListener = (dragSourceAndListener: DragSourceAndListener): void => {
    const element = dragSourceAndListener.dragSource.eElement;
    element.removeEventListener('pointerdown', dragSourceAndListener.pointerDownListener);
    element.removeEventListener('mousedown', dragSourceAndListener.mouseDownListener);
    const touchStartListener = dragSourceAndListener.touchStartListener;
    if (touchStartListener) {
        element.removeEventListener('touchstart', touchStartListener);
    }
};

const getFirstActiveTouch = ({ identifier }: Touch, touchList: TouchList): Touch | null => {
    for (let i = 0, len = touchList.length; i < len; ++i) {
        if (touchList[i].identifier === identifier) {
            return touchList[i];
        }
    }
    return null;
};
