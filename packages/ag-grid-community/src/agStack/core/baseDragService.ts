import { KeyCode } from '../constants/keyCode';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { DragListenerParams, IDragService } from '../interfaces/iDrag';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _removeFromArray } from '../utils/array';
import { _isBrowserSafari } from '../utils/browser';
import { _getDocument, _getRootNode } from '../utils/document';
import { _isFocusableFormField } from '../utils/dom';
import { _areEventsNear, _isEventFromThisInstance } from '../utils/event';
import { _exists } from '../utils/generic';
import { AgBeanStub } from './agBeanStub';

export class BaseDragService<
        TBeanCollection extends AgCoreBeanCollection<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService
        >,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IDragService
{
    beanName = 'dragSvc' as const;

    private currentDragParams: DragListenerParams | null;
    public dragging: boolean;
    public startTarget: EventTarget | null;
    private mouseStartEvent: MouseEvent | null;
    private touchLastTime: Touch | null;
    private touchStart: Touch | null;
    private pointerId: number | null = null;
    private pointerEl: Element | null = null;
    private prevTouchAction: string | undefined = undefined;

    private dragEndFunctions: ((...args: any[]) => any)[] = [];
    private handledEvents: WeakSet<Event> | null = null;
    private lastDragEvent: MouseEvent | Touch | null = null;

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

    private readonly dragSources: DragSourceAndListener[] = [];

    public override destroy(): void {
        const { dragSources } = this;
        dragSources.forEach(this.removeListener.bind(this));
        dragSources.length = 0;
        super.destroy();
    }

    private removeListener(dragSourceAndListener: DragSourceAndListener): void {
        const element = dragSourceAndListener.dragSource.eElement;
        element.removeEventListener('pointerdown', dragSourceAndListener.pointerDownListener);
        element.removeEventListener('mousedown', dragSourceAndListener.mouseDownListener);

        const touchStartListener = dragSourceAndListener.touchStartListener;
        if (touchStartListener) {
            element.removeEventListener('touchstart', touchStartListener);
        }
    }

    public removeDragSource(params: DragListenerParams): void {
        const { dragSources } = this;
        const dragSourceAndListener = dragSources.find((item) => item.dragSource === params);

        if (!dragSourceAndListener) {
            return;
        }

        this.removeListener(dragSourceAndListener);
        _removeFromArray(dragSources, dragSourceAndListener);
    }

    public addDragSource(params: DragListenerParams): void {
        const { eElement, includeTouch, stopPropagationForTouch } = params;

        const pointerListener = (event: PointerEvent) => this.onPointerDown(params, event);
        // eElement.addEventListener('pointerdown', pointerListener);

        // Fallback to legacy Mouse/Touch

        const mouseListener = (event: MouseEvent) => this.onMouseDown(params, event);
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
                this.onTouchStart(params, touchEvent);
            };
            // we set passive=false, as we want to prevent default on this event
            eElement.addEventListener('touchstart', touchListener, { passive: false });
        }

        this.dragSources.push({
            dragSource: params,
            pointerDownListener: pointerListener,
            mouseDownListener: mouseListener,
            touchStartListener: touchListener,
        });
    }

    // Pointer Events path (preferred when supported)
    private onPointerDown(params: DragListenerParams, event: PointerEvent): void {
        if (!this.addHandledEvent(event)) {
            return;
        }

        // handle suppressTouch/includeTouch for touch pointers
        if (event.pointerType === 'touch') {
            if (this.gos.get('suppressTouch') || !params.includeTouch) {
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
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        // capture pointer to keep receiving events even if pointer leaves the element
        try {
            params.eElement.setPointerCapture?.(event.pointerId);
        } catch {
            return; // ignore capture errors and fallback to mouse/touch events
        }

        this.resetDragProperties();

        this.currentDragParams = params;
        this.dragging = false;

        this.mouseStartEvent = event;
        this.startTarget = event.target;
        this.pointerId = event.pointerId;
        this.pointerEl = params.eElement;

        // prevent touch scrolling while dragging on touch pointers using CSS touch-action
        const style = (params.eElement as HTMLElement).style;
        if (style) {
            this.prevTouchAction = style.touchAction;
            style.touchAction = 'none';
        }

        const eElement = params.eElement;
        const onMove = (ev: PointerEvent) => this.onPointerMove(ev, eElement);
        const onUp = (ev: PointerEvent) => this.onUpCommon(ev, eElement);
        const onCancel = () => this.cancelDrag(eElement);
        const onScroll = this.onScroll.bind(this);
        const contextEvent = (event: MouseEvent) => event.preventDefault();
        const keydownEvent = (event: KeyboardEvent) => {
            if (event.key === KeyCode.ESCAPE) {
                this.cancelDrag(eElement);
            }
        };

        const rootEl = _getRootNode(this.beans);
        const eDocument = _getDocument(this.beans);
        const win = eDocument.defaultView || window;

        // add listeners for the duration of the drag
        const baseEvents = [
            { target: params.eElement, type: 'pointermove', listener: onMove },
            { target: params.eElement, type: 'pointerup', listener: onUp },
            { target: params.eElement, type: 'pointercancel', listener: onCancel },
            { target: params.eElement, type: 'lostpointercapture', listener: onCancel },
            { target: rootEl, type: 'contextmenu', listener: contextEvent },
            { target: rootEl, type: 'keydown', listener: keydownEvent },
            { target: eDocument, type: 'scroll', listener: onScroll, options: { capture: true } },
            { target: win, type: 'scroll', listener: onScroll },
        ];
        this.addTemporaryEvents(baseEvents);

        // start immediately if threshold is zero
        if (params.dragStartPixels === 0) {
            this.onPointerMove(event, eElement);
        }
    }

    // gets called whenever mouse down on any drag source
    private onTouchStart(params: DragListenerParams, touchEvent: TouchEvent): void {
        if (this.pointerEl) {
            return; // We are handling the pointer events
        }

        if (!this.addHandledEvent(touchEvent)) {
            return;
        }

        this.currentDragParams = params;
        this.dragging = false;

        const touch = touchEvent.touches[0];

        this.touchLastTime = touch;
        this.touchStart = touch;
        this.startTarget = touchEvent.target;

        const touchMoveEvent = (e: TouchEvent) => this.onTouchMove(e, params.eElement);
        const touchEndEvent = (e: TouchEvent) => this.onTouchUp(e, params.eElement);
        const documentTouchMove = (e: TouchEvent) => {
            if (e.cancelable) {
                e.preventDefault();
            }
        };
        const onScroll = this.onScroll.bind(this);

        const target = touchEvent.target as Document | ShadowRoot | EventTarget;
        const eDocument = _getDocument(this.beans);
        const win = eDocument.defaultView || window;
        const events = [
            // Prevents the page document from moving while we are dragging items around.
            // preventDefault needs to be called in the touchmove listener and never inside the
            // touchstart, because using touchstart causes the click event to be cancelled on touch devices.
            {
                target: _getRootNode(this.beans),
                type: 'touchmove',
                listener: documentTouchMove,
                options: { passive: false },
            },
            { target, type: 'touchmove', listener: touchMoveEvent, options: { passive: true } },
            { target, type: 'touchend', listener: touchEndEvent, options: { passive: true } },
            { target, type: 'touchcancel', listener: touchEndEvent, options: { passive: true } },
            { target: eDocument, type: 'scroll', listener: onScroll, options: { capture: true } },
            { target: win, type: 'scroll', listener: onScroll },
        ];
        // temporally add these listeners, for the duration of the drag
        this.addTemporaryEvents(events);

        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onCommonMove(touch, this.touchStart, params.eElement);
        }
    }

    // gets called whenever mouse down on any drag source
    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {
        if (this.pointerEl) {
            return; // We are handling the pointer events
        }

        // if there are two elements with parent / child relationship, and both are draggable,
        // when we drag the child, we should NOT drag the parent. an example of this is row moving
        // and range selection - row moving should get preference when use drags the rowDrag component.
        if (!this.addHandledEvent(mouseEvent)) {
            return;
        }

        // only interested in left button clicks
        if (mouseEvent.button !== 0) {
            return;
        }

        if (this.shouldPreventMouseEvent(mouseEvent)) {
            mouseEvent.preventDefault();
        }

        this.currentDragParams = params;
        this.dragging = false;

        this.mouseStartEvent = mouseEvent;
        this.startTarget = mouseEvent.target;

        const mouseMoveEvent = (event: MouseEvent) => this.onMouseMove(event, params.eElement);
        const mouseUpEvent = (event: MouseEvent) => this.onUpCommon(event, params.eElement);
        const contextEvent = (event: MouseEvent) => event.preventDefault();
        const keydownEvent = (event: KeyboardEvent) => {
            if (event.key === KeyCode.ESCAPE) {
                this.cancelDrag(params.eElement);
            }
        };

        const target = _getRootNode(this.beans);
        const eDocument = _getDocument(this.beans);
        const win = eDocument.defaultView || window;
        const onScroll = this.onScroll.bind(this);
        const baseEvents = [
            { target, type: 'mousemove', listener: mouseMoveEvent },
            { target, type: 'mouseup', listener: mouseUpEvent },
            { target, type: 'contextmenu', listener: contextEvent },
            { target, type: 'keydown', listener: keydownEvent },
            { target: eDocument, type: 'scroll', listener: onScroll, options: { capture: true } },
            { target: win, type: 'scroll', listener: onScroll },
        ];
        // temporally add these listeners, for the duration of the drag
        this.addTemporaryEvents(baseEvents);

        //see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent, params.eElement);
        }
    }

    private onScroll(event: Event): void {
        if (!this.addHandledEvent(event)) {
            return;
        }
        const lastDragEvent = this.lastDragEvent;
        if (!lastDragEvent || !this.dragging) {
            return;
        }
        this.currentDragParams?.onDragging(lastDragEvent);
    }

    private addTemporaryEvents(
        events: {
            target: Document | ShadowRoot | EventTarget;
            type: string;
            listener: (e: Event) => void;
            options?: boolean | AddEventListenerOptions;
        }[]
    ): void {
        events.forEach((currentEvent) => {
            const { target, type, listener, options } = currentEvent;
            target.addEventListener(type, listener, options);
        });

        this.dragEndFunctions.push(() => {
            events.forEach((currentEvent) => {
                const { target, type, listener, options } = currentEvent;
                target.removeEventListener(type, listener, options);
            });
        });
    }

    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    private isEventNearStartEvent(currentEvent: MouseEvent | Touch, startEvent: MouseEvent | Touch): boolean {
        // by default, we wait 4 pixels before starting the drag
        const { dragStartPixels } = this.currentDragParams!;
        const requiredPixelDiff = _exists(dragStartPixels) ? dragStartPixels : 4;
        return _areEventsNear(currentEvent, startEvent, requiredPixelDiff);
    }

    private getFirstActiveTouch(touchList: TouchList): Touch | null {
        for (let i = 0; i < touchList.length; i++) {
            if (touchList[i].identifier === this.touchStart!.identifier) {
                return touchList[i];
            }
        }
        return null;
    }

    private onCommonMove(currentEvent: MouseEvent | Touch, startEvent: MouseEvent | Touch, el: Element): void {
        this.lastDragEvent = currentEvent;
        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            if (this.isEventNearStartEvent(currentEvent, startEvent)) {
                return;
            }

            this.dragging = true;
            this.eventSvc.dispatchEvent({
                type: 'dragStarted',
                target: el,
            });

            this.currentDragParams!.onDragStart(startEvent);
            // we need ONE drag action at the startEvent, so that we are guaranteed the drop target
            // at the start gets notified. this is because the drag can start outside of the element
            // that started it, as the mouse is allowed drag away from the mouse down before it's
            // considered a drag (the isEventNearStartEvent() above). if we didn't do this, then
            // it would be possible to click a column by the edge, then drag outside of the drop zone
            // in less than 4 pixels and the drag officially starts outside of the header but the header
            // wouldn't be notified of the dragging.

            // if currentDragParams is null here, it means that drag has been cancelled.
            if (!this.currentDragParams) {
                this.dragging = false;
                return;
            }

            this.currentDragParams.onDragging(startEvent);
        }

        this.currentDragParams?.onDragging(currentEvent);
    }

    private onTouchMove(touchEvent: TouchEvent, el: Element): void {
        const touch = this.getFirstActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }

        // this.___statusPanel.setInfoText(Math.random() + ' onTouchMove preventDefault stopPropagation');
        this.onCommonMove(touch, this.touchStart!, el);
    }

    private beforeMove(mouseEvent: MouseEvent): void {
        if (_isBrowserSafari()) {
            _getDocument(this.beans).getSelection()?.removeAllRanges();
        }

        if (this.shouldPreventMouseEvent(mouseEvent)) {
            mouseEvent.preventDefault();
        }
    }

    private onPointerMove(pointerEvent: PointerEvent, el: Element): void {
        if (this.pointerEl) {
            this.beforeMove(pointerEvent);
            this.onCommonMove(pointerEvent, this.mouseStartEvent!, el);
        }
    }

    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    private onMouseMove(mouseEvent: MouseEvent, el: Element): void {
        this.beforeMove(mouseEvent);
        this.onCommonMove(mouseEvent, this.mouseStartEvent!, el);
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

    public onTouchUp(touchEvent: TouchEvent, el: Element): void {
        let touch = this.getFirstActiveTouch(touchEvent.changedTouches);

        // i haven't worked this out yet, but there is no matching touch
        // when we get the touch up event. to get around this, we swap in
        // the last touch. this is a hack to 'get it working' while we
        // figure out what's going on, why we are not getting a touch in
        // current event.
        if (!touch) {
            touch = this.touchLastTime;
        }

        // if mouse was left up before we started to move, then this is a tap.
        // we check this before onUpCommon as onUpCommon resets the dragging

        this.onUpCommon(touch!, el);
    }

    public onUpCommon(eventOrTouch: MouseEvent | Touch, el: Element): void {
        if (this.dragging) {
            this.dragging = false;
            this.currentDragParams!.onDragStop(eventOrTouch);
            this.eventSvc.dispatchEvent({
                type: 'dragStopped',
                target: el,
            });
        }
        this.resetDragProperties();
    }

    public cancelDrag(el: Element): void {
        this.eventSvc.dispatchEvent({
            type: 'dragCancelled',
            target: el,
        });

        this.currentDragParams?.onDragCancel?.();
        this.resetDragProperties();
    }

    private resetDragProperties(): void {
        // remove any temporary listeners first
        const dragEndFunctions = this.dragEndFunctions;
        for (const func of dragEndFunctions) {
            func();
        }
        dragEndFunctions.length = 0;

        // release pointer capture and restore touch-action
        if (this.pointerEl && this.pointerId != null) {
            try {
                this.pointerEl.releasePointerCapture(this.pointerId);
            } catch {
                // ignore
            }
        }
        if (this.pointerEl && this.prevTouchAction != null) {
            try {
                (this.pointerEl as HTMLElement).style.touchAction = this.prevTouchAction;
            } catch {
                // ignore
            }
        }

        this.mouseStartEvent = null;
        this.startTarget = null;
        this.touchStart = null;
        this.touchLastTime = null;
        this.currentDragParams = null;
        this.pointerId = null;
        this.pointerEl = null;
        this.prevTouchAction = undefined;
        this.lastDragEvent = null;
        this.handledEvents = null;
    }
}

interface DragSourceAndListener {
    dragSource: DragListenerParams;
    pointerDownListener: (event: PointerEvent) => void;
    mouseDownListener: (mouseEvent: MouseEvent) => void;
    touchStartListener: ((touchEvent: TouchEvent) => void) | null;
}

const INTERACTIVE_TAG_REGEX = /^(a|textarea|input|select|button)$/i;

function isOverFormFieldElement(event: Event): boolean {
    const el = event.target as HTMLElement | null;
    const tag = el?.tagName;
    return tag ? INTERACTIVE_TAG_REGEX.test(tag) : false;
}
