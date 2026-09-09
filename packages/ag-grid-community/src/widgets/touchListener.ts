import type { AgEvent, IEventEmitter, IEventListener, TempEventHandler } from 'ag-stack';
import {
    FAST_TEST_TIMINGS,
    LocalEventService,
    _areEventsNear,
    _getFirstActiveTouch,
    addTempEventHandlers,
    clearTempEventHandlers,
    preventEventDefault,
} from 'ag-stack';

export interface TapEvent extends AgEvent<'tap'> {
    touchStart: Touch;
}
export interface DoubleTapEvent extends AgEvent<'doubleTap'> {
    touchStart: Touch;
}

export interface LongTapEvent extends AgEvent<'longTap'> {
    touchStart: Touch;
    touchEvent: TouchEvent;
}

const DOUBLE_TAP_MILLISECONDS = 500;

/**
 * The delay before a long tap event is fired.
 * This needs to be bigger than 500 as is the browser long tap for the context menu.
 */
const LONG_PRESS_MILLISECONDS = FAST_TEST_TIMINGS ? 0 : 550;

// Nested listeners share only the state of the DOM event currently propagating through them.
const AG_GRID_TOUCH_LISTENER_STATE = '__ag_Grid_Touch_Listener_State';

type TouchListenerState = {
    handledEvents?: Set<TouchListenerEvent>;
    longTapCandidates?: TouchListener[];
    touchStartClaimed?: boolean;
};

type TrackedTouchEvent = Event & {
    [AG_GRID_TOUCH_LISTENER_STATE]?: TouchListenerState;
};

const getTouchListenerState = (event: Event): TouchListenerState => {
    const trackedEvent = event as TrackedTouchEvent;
    return (trackedEvent[AG_GRID_TOUCH_LISTENER_STATE] ??= {});
};

const claimTouchStart = (event: Event): boolean => {
    const state = getTouchListenerState(event);
    if (state.touchStartClaimed) {
        return false;
    }
    state.touchStartClaimed = true;
    return true;
};

const addHandledTouchEvent = (event: Event, eventType: TouchListenerEvent): boolean => {
    const state = getTouchListenerState(event);
    let eventTypes = state.handledEvents;
    if (!eventTypes) {
        eventTypes = new Set();
        state.handledEvents = eventTypes;
    } else if (eventTypes.has(eventType)) {
        return false;
    }
    eventTypes.add(eventType);
    return true;
};

export type TouchListenerEvent = 'tap' | 'doubleTap' | 'longTap';

export interface TouchListenerOptions {
    /** Prevent the compatibility click emitted when the touch ends. */
    preventClick?: boolean;
    /** Observe touch starts during capture without taking normal tap ownership from nested controls. */
    capture?: boolean;
    /** Whether this listener may claim the current long-press gesture. */
    shouldHandleLongTap?: () => boolean;
    /** Cede the long press to any competing listener, owning it only when no other candidate can. */
    yieldsLongTap?: boolean;
    /** Whether this listener should observe this touch gesture. */
    shouldTrackTouch?: (event: TouchEvent) => boolean;
    /** Resolves the element represented by a delegated long-press listener. */
    getLongTapTarget?: (event: TouchEvent, touchStart: Touch) => Element | undefined;
}

export class TouchListener implements IEventEmitter<TouchListenerEvent> {
    private startListener: ((e: TouchEvent) => void) | null = null;
    private readonly handlers: TempEventHandler[] = [];
    private eventSvc: LocalEventService<TouchListenerEvent> | null | undefined = undefined;

    private touchStart: Touch | null = null;
    private lastTapTime: number | null = null;
    private longPressTimer: number = 0;
    private moved: boolean = false;
    private longTapFired: boolean = false;
    private longTapEligible: boolean | undefined;
    private longTapTarget: Element | undefined;
    private longTapTargetResolved = false;
    private touchStartEvent: TouchEvent | null = null;
    private readonly listenerCounts: Record<TouchListenerEvent, number> = { tap: 0, doubleTap: 0, longTap: 0 };
    private readonly preventClick: boolean;
    private readonly capture: boolean;
    private readonly yieldsLongTap: boolean;
    private readonly shouldHandleLongTap?: () => boolean;
    private readonly shouldTrackTouch?: (event: TouchEvent) => boolean;
    private readonly getLongTapTarget?: (event: TouchEvent, touchStart: Touch) => Element | undefined;

    constructor(
        private eElement: Element | Document,
        options?: boolean | TouchListenerOptions
    ) {
        const resolvedOptions = typeof options === 'boolean' ? { preventClick: options } : options;
        this.preventClick = resolvedOptions?.preventClick ?? false;
        this.capture = resolvedOptions?.capture ?? false;
        this.yieldsLongTap = resolvedOptions?.yieldsLongTap ?? false;
        this.shouldHandleLongTap = resolvedOptions?.shouldHandleLongTap;
        this.shouldTrackTouch = resolvedOptions?.shouldTrackTouch;
        this.getLongTapTarget = resolvedOptions?.getLongTapTarget;
    }

    public addEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        let eventSvc = this.eventSvc;
        if (!eventSvc) {
            if (eventSvc === null) {
                return; // destroyed
            }
            this.eventSvc = eventSvc = new LocalEventService<TouchListenerEvent>();
            const startListener = this.onTouchStart.bind(this);
            this.startListener = startListener;
            this.eElement.addEventListener('touchstart', startListener, { passive: true, capture: this.capture });
        }
        eventSvc.addEventListener(eventType, listener);
        this.listenerCounts[eventType]++;
    }

    public removeEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        this.eventSvc?.removeEventListener(eventType, listener);
        this.listenerCounts[eventType]--;
    }

    private onTouchStart(touchEvent: TouchEvent): void {
        // Capture listeners observe the gesture without taking normal tap ownership. This lets the
        // tooltip listener arbitrate long presses while the deepest regular listener keeps tap/double-tap.
        if (
            this.touchStart ||
            this.shouldTrackTouch?.(touchEvent) === false ||
            (!this.capture && !claimTouchStart(touchEvent))
        ) {
            return;
        }

        const touchStart = touchEvent.touches[0];
        this.touchStart = touchStart;
        this.touchStartEvent = touchEvent;
        this.registerLongTapCandidate(touchEvent);

        const handlers = this.handlers;
        if (!handlers.length) {
            const eElement = this.eElement;
            const doc = eElement.ownerDocument ?? eElement;
            const touchMove = this.onTouchMove.bind(this);
            const touchEnd = this.onTouchEnd.bind(this);
            const touchCancel = this.onTouchCancel.bind(this);
            const contextMenu = this.onContextMenu.bind(this);
            const passiveTrue = { passive: true };
            const passiveFalse = { passive: false };
            addTempEventHandlers(
                handlers,
                [eElement, 'touchmove', touchMove, passiveTrue],
                [doc, 'touchcancel', touchCancel, passiveTrue],
                // we set passive=false, as we want to prevent default on this event
                [doc, 'touchend', touchEnd, passiveFalse],
                [doc, 'contextmenu', contextMenu, passiveFalse]
            );
        }

        this.clearLongPress();
        this.longPressTimer = window.setTimeout(() => {
            this.longPressTimer = 0;
            if (this.touchStart === touchStart && !this.moved) {
                const ownsLongTap = this.isLongTapOwner(touchEvent, touchStart);
                this.moved = true;
                this.longTapFired = ownsLongTap && addHandledTouchEvent(touchEvent, 'longTap');
                if (this.longTapFired) {
                    this.eventSvc?.dispatchEvent<LongTapEvent>({ type: 'longTap', touchStart, touchEvent });
                }
            }
        }, LONG_PRESS_MILLISECONDS);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        const { moved, touchStart } = this;
        if (!moved && touchStart) {
            const touch = _getFirstActiveTouch(touchStart, touchEvent.touches);
            const eventIsFarAway = touch && !_areEventsNear(touch, touchStart, 4);
            if (eventIsFarAway) {
                this.clearLongPress();
                this.moved = true;
            }
        }
    }

    private onTouchEnd(touchEvent: TouchEvent): void {
        const touchStart = this.touchStart;
        if (!touchStart || !_getFirstActiveTouch(touchStart, touchEvent.changedTouches)) {
            return; // touchEnd not for us
        }

        const longTapHandled =
            !!this.touchStartEvent && getTouchListenerState(this.touchStartEvent).handledEvents?.has('longTap');
        if (!this.moved && !longTapHandled) {
            if (this.listenerCounts.tap > 0 && addHandledTouchEvent(touchEvent, 'tap')) {
                this.eventSvc?.dispatchEvent<TapEvent>({ type: 'tap', touchStart });
            }
            this.checkDoubleTap(touchStart, touchEvent);
        }

        // a fired long tap (e.g. opening a context menu) must not also emit the emulated mouse
        // click iOS dispatches on release, which would otherwise activate the element under the finger
        if (this.preventClick || this.longTapFired) {
            preventEventDefault(touchEvent);
        }

        this.cancel();
    }

    private onTouchCancel(touchEvent: TouchEvent): void {
        const touchStart = this.touchStart;
        if (!touchStart || !_getFirstActiveTouch(touchStart, touchEvent.changedTouches)) {
            return; // touchCancel not for us
        }

        this.lastTapTime = null; // clear double tap
        this.cancel();
    }

    private onContextMenu(event: Event): void {
        if (this.resolveLongTapTarget() && this.canHandleLongTap()) {
            preventEventDefault(event);
        }
    }

    private canHandleLongTap(): boolean {
        return (this.longTapEligible ??= this.shouldHandleLongTap?.() ?? true);
    }

    private registerLongTapCandidate(touchEvent: TouchEvent): void {
        if (this.listenerCounts.longTap === 0) {
            return;
        }
        const state = getTouchListenerState(touchEvent);
        const candidates = state.longTapCandidates;
        if (candidates) {
            candidates.push(this);
        } else {
            state.longTapCandidates = [this];
        }
    }

    private isLongTapOwner(touchEvent: TouchEvent, touchStart: Touch): boolean {
        const candidates = getTouchListenerState(touchEvent).longTapCandidates;
        let owner: TouchListener | undefined;

        for (const candidate of candidates ?? []) {
            if (!candidate.canOwnLongTap(touchStart)) {
                continue;
            }
            if (!owner) {
                owner = candidate;
            } else if (owner.yieldsLongTap !== candidate.yieldsLongTap) {
                if (owner.yieldsLongTap) {
                    owner = candidate;
                }
            } else {
                const ownerTarget = owner.resolveLongTapTarget()!;
                const candidateTarget = candidate.resolveLongTapTarget()!;
                if (ownerTarget !== candidateTarget && ownerTarget.contains(candidateTarget)) {
                    owner = candidate;
                }
            }
        }

        return owner === this;
    }

    private canOwnLongTap(touchStart: Touch): boolean {
        return (
            this.touchStart?.identifier === touchStart.identifier &&
            !this.moved &&
            this.listenerCounts.longTap > 0 &&
            !!this.resolveLongTapTarget() &&
            this.canHandleLongTap()
        );
    }

    private resolveLongTapTarget(): Element | undefined {
        if (!this.longTapTargetResolved) {
            this.longTapTargetResolved = true;
            const touchStart = this.touchStart;
            const touchStartEvent = this.touchStartEvent;
            this.longTapTarget =
                touchStart && touchStartEvent && this.getLongTapTarget
                    ? this.getLongTapTarget(touchStartEvent, touchStart)
                    : this.eElement instanceof Element
                      ? this.eElement
                      : undefined;
        }
        return this.longTapTarget;
    }

    private checkDoubleTap(touchStart: Touch, touchEvent: TouchEvent): void {
        let now: number | null = Date.now();
        const lastTapTime = this.lastTapTime;
        if (lastTapTime) {
            // if previous tap, see if duration is short enough to be considered double tap
            const interval = now - lastTapTime;
            if (
                interval <= DOUBLE_TAP_MILLISECONDS &&
                this.listenerCounts.doubleTap > 0 &&
                addHandledTouchEvent(touchEvent, 'doubleTap')
            ) {
                this.eventSvc?.dispatchEvent<DoubleTapEvent>({ type: 'doubleTap', touchStart });
                now = null; // this stops a triple tap ending up as two double taps
            }
        }
        this.lastTapTime = now;
    }

    private cancel(): void {
        this.clearLongPress();
        clearTempEventHandlers(this.handlers);
        this.touchStart = null;
        this.touchStartEvent = null;
    }

    private clearLongPress(): void {
        if (this.longPressTimer !== 0) {
            window.clearTimeout(this.longPressTimer);
            this.longPressTimer = 0;
        }
        this.moved = false;
        this.longTapFired = false;
        this.longTapEligible = undefined;
        this.longTapTarget = undefined;
        this.longTapTargetResolved = false;
    }

    public destroy(): void {
        const startListener = this.startListener;
        if (startListener) {
            this.startListener = null;
            this.eElement.removeEventListener('touchstart', startListener, this.capture);
        }
        this.cancel();
        this.eElement = null!;
        this.eventSvc = null;
    }
}
