import type { TempEventHandler } from 'ag-stack';
import {
    FAST_TEST_TIMINGS,
    _areEventsNear,
    _getDocument,
    _getEventPath,
    _getWindow,
    _isEventFromThisInstance,
    addTempEventHandlers,
    clearTempEventHandlers,
} from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';

const LONG_PRESS_MILLISECONDS = FAST_TEST_TIMINGS ? 0 : 550;
const DOUBLE_TAP_MILLISECONDS = 500;
const MOVE_THRESHOLD = 4;
const COMPATIBILITY_EVENT_WINDOW_MILLISECONDS = 800;

interface LongPressParams {
    element: Element;
    onLongPress: (event: PointerEvent) => void;
    isEnabled?: (event: PointerEvent) => boolean;
    priority?: 'normal' | 'fallback';
}

interface DoubleTapParams {
    element: Element;
    onDoubleTap: (event: PointerEvent) => void;
}

interface LongPressRegistration extends LongPressParams {
    active: boolean;
}

interface ActiveGesture {
    pointerId: number;
    startEvent: PointerEvent;
    eventPath: EventTarget[];
    timer: number;
    longPressFired: boolean;
}

/** Coordinates touch gestures once per grid. */
export class TouchGesturesService extends BeanStub implements NamedBean {
    beanName = 'touchGesturesSvc' as const;

    private readonly longPressRegistrations = new Map<Element, LongPressRegistration[]>();
    private activeGesture: ActiveGesture | undefined;
    private readonly gestureHandlers: TempEventHandler[] = [];
    private readonly suppressionHandlers: TempEventHandler[] = [];
    private suppressionTimer = 0;

    private readonly onPointerDownListener = (event: Event) => this.onPointerDown(event as PointerEvent);
    private readonly onPointerMoveListener = (event: Event) => this.onPointerMove(event as PointerEvent);
    private readonly onPointerEndListener = (event: Event) => this.onPointerEnd(event as PointerEvent);
    private readonly onContextMenuListener = (event: Event) => this.onContextMenu(event as MouseEvent);
    private readonly onCompatibilityMouseEventListener = (event: Event) =>
        this.onCompatibilityMouseEvent(event as MouseEvent);

    public postConstruct(): void {
        // Pointer down deliberately bubbles so custom components can opt out with stopPropagation().
        _getDocument(this.beans).addEventListener('pointerdown', this.onPointerDownListener);
    }

    public registerLongPress(params: LongPressParams): () => void {
        const registration: LongPressRegistration = { ...params, priority: params.priority ?? 'normal', active: true };
        const registrations = this.longPressRegistrations.get(params.element);
        if (registrations) {
            registrations.push(registration);
        } else {
            this.longPressRegistrations.set(params.element, [registration]);
        }

        return () => this.unregisterLongPress(registration);
    }

    /**
     * The registration listens on the element itself: components stop touch pointer downs from
     * propagating (e.g. the resize handle's drag source), which would starve a delegated listener.
     */
    public registerDoubleTap(params: DoubleTapParams): () => void {
        const { element, onDoubleTap } = params;
        const handlers: TempEventHandler[] = [];
        let lastTapTime = 0;
        let holdTimer = 0;
        let pending: { pointerId: number; startEvent: PointerEvent } | undefined;

        const abandon = (resetLastTap: boolean) => {
            pending = undefined;

            if (holdTimer) {
                _getWindow(this.beans).clearTimeout(holdTimer);
                holdTimer = 0;
            }

            clearTempEventHandlers(handlers);

            if (resetLastTap) {
                lastTapTime = 0;
            }
        };

        const onMove = (event: Event) => {
            const pointerEvent = event as PointerEvent;
            if (pending?.pointerId === pointerEvent.pointerId && !this.isWithinMoveThreshold(pointerEvent, pending)) {
                abandon(true);
            }
        };
        const onEnd = (event: Event) => {
            const pointerEvent = event as PointerEvent;
            if (pending?.pointerId !== pointerEvent.pointerId) {
                return;
            }
            const { startEvent } = pending;
            const cancelled = pointerEvent.type === 'pointercancel';
            abandon(cancelled);
            if (cancelled) {
                return;
            }
            const now = Date.now();
            if (now - lastTapTime <= DOUBLE_TAP_MILLISECONDS) {
                lastTapTime = 0; // a triple tap must not count as two double taps
                onDoubleTap(startEvent);
            } else {
                lastTapTime = now;
            }
        };
        const onDown = (event: PointerEvent) => {
            if (!this.isTrackableTouch(event)) {
                return;
            }
            abandon(false);
            pending = { pointerId: event.pointerId, startEvent: event };
            // a press held to the long-press mark is not a tap and must not seed a double tap
            holdTimer = _getWindow(this.beans).setTimeout(() => {
                holdTimer = 0;
                abandon(true);
            }, LONG_PRESS_MILLISECONDS);
            const doc = _getDocument(this.beans);
            const options = { capture: true, passive: true };
            addTempEventHandlers(
                handlers,
                [doc, 'pointermove', onMove, options],
                [doc, 'pointerup', onEnd, options],
                [doc, 'pointercancel', onEnd, options]
            );
        };

        element.addEventListener('pointerdown', onDown);
        return () => {
            abandon(true);
            element.removeEventListener('pointerdown', onDown);
        };
    }

    private isTrackableTouch(event: PointerEvent): boolean {
        return (
            event.pointerType === 'touch' &&
            event.isPrimary !== false &&
            event.button === 0 &&
            !this.gos.get('suppressTouch')
        );
    }

    private isWithinMoveThreshold(event: PointerEvent, gesture: { startEvent: PointerEvent }): boolean {
        return _areEventsNear(event, gesture.startEvent, MOVE_THRESHOLD);
    }

    private onPointerDown(event: PointerEvent): void {
        this.clearActiveGesture();

        // Compatibility mouse events do not include another pointerdown. A new primary interaction does,
        // so it must not inherit suppression from the preceding long press.
        if (event.isPrimary !== false && event.button === 0) {
            this.clearCompatibilityEventSuppression();
        }

        if (!this.isTrackableTouch(event)) {
            return;
        }

        const eventPath = _getEventPath(event);
        if (!this.hasLongPressRegistration(eventPath)) {
            return;
        }

        const gesture: ActiveGesture = {
            pointerId: event.pointerId,
            startEvent: event,
            eventPath,
            timer: 0,
            longPressFired: false,
        };
        this.activeGesture = gesture;

        const doc = _getDocument(this.beans);
        const options = { capture: true, passive: true };
        addTempEventHandlers(
            this.gestureHandlers,
            [doc, 'pointermove', this.onPointerMoveListener, options],
            [doc, 'pointerup', this.onPointerEndListener, options],
            [doc, 'pointercancel', this.onPointerEndListener, options],
            [doc, 'contextmenu', this.onContextMenuListener, { capture: true }]
        );

        gesture.timer = _getWindow(this.beans).setTimeout(() => {
            gesture.timer = 0;
            if (this.activeGesture === gesture) {
                this.fireLongPress(gesture);
            }
        }, LONG_PRESS_MILLISECONDS);
    }

    private onPointerMove(event: PointerEvent): void {
        const gesture = this.activeGesture;
        if (gesture?.pointerId !== event.pointerId || gesture.longPressFired) {
            return;
        }

        if (!this.isWithinMoveThreshold(event, gesture)) {
            this.clearActiveGesture();
        }
    }

    private onPointerEnd(event: PointerEvent): void {
        const gesture = this.activeGesture;
        if (gesture?.pointerId !== event.pointerId) {
            return;
        }
        this.clearActiveGesture();
        if (gesture.longPressFired && event.type === 'pointerup') {
            // the compatibility mouse events follow the release, however long the press was held
            this.suppressCompatibilityEvents();
        }
    }

    private onContextMenu(event: MouseEvent): void {
        const gesture = this.activeGesture;
        if (!gesture || !this.isSameTarget(gesture.startEvent.target, event.target)) {
            return;
        }

        const registration = this.resolveLongPressRegistration(gesture);

        if (!registration) {
            return;
        }
        event.preventDefault();
        if (registration.priority === 'normal') {
            // the winner opens its own menu; the grid's contextmenu listeners must not double-open it
            event.stopImmediatePropagation();
        }
        this.fireLongPress(gesture, registration);
    }

    private fireLongPress(gesture: ActiveGesture, registration = this.resolveLongPressRegistration(gesture)): void {
        if (gesture.longPressFired || !registration) {
            return;
        }

        gesture.longPressFired = true;
        if (gesture.timer) {
            _getWindow(this.beans).clearTimeout(gesture.timer);
            gesture.timer = 0;
        }
        this.suppressCompatibilityEvents();
        registration.onLongPress(gesture.startEvent);
    }

    private resolveLongPressRegistration(gesture: ActiveGesture): LongPressRegistration | undefined {
        if (this.gos.get('suppressTouch')) {
            return undefined;
        }

        const eventFromThisGrid = _isEventFromThisInstance(this.beans, gesture.startEvent);

        for (const priority of ['normal', 'fallback'] as const) {
            for (const pathItem of gesture.eventPath) {
                const registrations = this.longPressRegistrations.get(pathItem as Element);
                if (!registrations) {
                    continue;
                }
                for (let i = registrations.length - 1; i >= 0; i--) {
                    const registration = registrations[i];
                    if (
                        registration.active &&
                        registration.priority === priority &&
                        (eventFromThisGrid || !this.beans.eRootDiv.contains(registration.element)) &&
                        registration.isEnabled?.(gesture.startEvent) !== false
                    ) {
                        return registration;
                    }
                }
            }
        }

        return undefined;
    }

    private hasLongPressRegistration(eventPath: EventTarget[]): boolean {
        return eventPath.some((item) => {
            return (
                this.longPressRegistrations.get(item as Element)?.some((registration) => registration.active) ?? false
            );
        });
    }

    private suppressCompatibilityEvents(): void {
        this.clearCompatibilityEventSuppression();
        const doc = _getDocument(this.beans);
        const options = { capture: true };
        addTempEventHandlers(
            this.suppressionHandlers,
            [doc, 'mousedown', this.onCompatibilityMouseEventListener, options],
            [doc, 'mouseup', this.onCompatibilityMouseEventListener, options],
            [doc, 'click', this.onCompatibilityMouseEventListener, options]
        );
        this.suppressionTimer = _getWindow(this.beans).setTimeout(
            () => this.clearCompatibilityEventSuppression(),
            COMPATIBILITY_EVENT_WINDOW_MILLISECONDS
        );
    }

    /**
     * Suppresses wholesale rather than by target: the emulated events land wherever the finger was,
     * which after a long press is often a popup that just opened underneath it (a ghost click).
     * A real follow-up interaction always starts with its own pointerdown, which lifts the suppression.
     */
    private onCompatibilityMouseEvent(event: MouseEvent): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.type === 'click') {
            this.clearCompatibilityEventSuppression();
        }
    }

    private isSameTarget(first: EventTarget | null, second: EventTarget | null): boolean {
        if (first === second) {
            return true;
        }
        const firstNode = first as Node | null;
        const secondNode = second as Node | null;
        if (typeof firstNode?.contains !== 'function' || typeof secondNode?.contains !== 'function') {
            return false;
        }
        return firstNode.contains(secondNode) || secondNode.contains(firstNode);
    }

    private unregisterLongPress(registration: LongPressRegistration): void {
        if (!registration.active) {
            return;
        }
        registration.active = false;

        const registrations = this.longPressRegistrations.get(registration.element);
        if (!registrations) {
            return;
        }
        const index = registrations.indexOf(registration);
        if (index >= 0) {
            registrations.splice(index, 1);
        }
        if (registrations.length === 0) {
            this.longPressRegistrations.delete(registration.element);
        }
    }

    private clearActiveGesture(): void {
        const gesture = this.activeGesture;
        if (!gesture) {
            return;
        }
        if (gesture.timer) {
            _getWindow(this.beans).clearTimeout(gesture.timer);
            gesture.timer = 0;
        }
        clearTempEventHandlers(this.gestureHandlers);
        this.activeGesture = undefined;
    }

    private clearCompatibilityEventSuppression(): void {
        if (this.suppressionTimer) {
            _getWindow(this.beans).clearTimeout(this.suppressionTimer);
            this.suppressionTimer = 0;
        }
        clearTempEventHandlers(this.suppressionHandlers);
    }

    public override destroy(): void {
        _getDocument(this.beans).removeEventListener('pointerdown', this.onPointerDownListener);
        this.clearActiveGesture();
        this.clearCompatibilityEventSuppression();
        this.longPressRegistrations.clear();
        super.destroy();
    }
}
