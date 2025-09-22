import { LocalEventService } from '../agStack/events/localEventService';
import type { AgEvent } from '../agStack/interfaces/agEvent';
import type { IEventEmitter, IEventListener } from '../agStack/interfaces/iEventEmitter';
import {
    _areEventsNear,
    _getFirstActiveTouch,
    addTempEventHandlers,
    clearTempEventHandlers,
    preventEventDefault,
} from '../agStack/utils/event';
import type { TempEventHandler } from '../agStack/utils/event';

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
const LONG_PRESS_MILLISECONDS = 550;

let handledTouchEvents: WeakSet<Event> | undefined;

const addHandledTouchEvent = (event: Event): boolean => {
    if (!handledTouchEvents) {
        handledTouchEvents = new WeakSet<Event>();
    } else if (handledTouchEvents.has(event)) {
        return false; // Already processed
    }
    handledTouchEvents.add(event);
    return true;
};

export type TouchListenerEvent = 'tap' | 'doubleTap' | 'longTap';
export class TouchListener implements IEventEmitter<TouchListenerEvent> {
    private touchStartListener: ((e: TouchEvent) => void) | null = null;
    private readonly tempHandlers: TempEventHandler[] = [];
    private eventSvc: LocalEventService<TouchListenerEvent> | null | undefined = undefined;

    private touchStart: Touch | null = null;
    private moved: boolean;
    private lastTapTime: number = 0;
    private longPressTimer: number = 0;

    constructor(
        private eElement: Element,
        private readonly preventMouseClick = false
    ) {}

    public addEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        let eventSvc = this.eventSvc;
        if (!eventSvc) {
            if (eventSvc === null) {
                return; // destroyed
            }
            this.eventSvc = eventSvc = new LocalEventService<TouchListenerEvent>();
            const startListener = this.onTouchStart.bind(this);
            this.touchStartListener = startListener;
            this.eElement.addEventListener('touchstart', startListener, { passive: true });
        }
        eventSvc.addEventListener(eventType, listener);
    }

    public removeEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        this.eventSvc?.removeEventListener(eventType, listener);
    }

    private onTouchStart(touchEvent: TouchEvent): void {
        if (this.touchStart || !addHandledTouchEvent(touchEvent)) {
            return; // Already handled by a component on top of this one
        }

        const touchStart = touchEvent.touches[0];
        this.touchStart = touchStart;

        const tempHandlers = this.tempHandlers;
        if (!tempHandlers.length) {
            const eElement = this.eElement;
            const doc = eElement.ownerDocument;
            const touchMove = this.onTouchMove.bind(this);
            const touchEnd = this.onTouchEnd.bind(this);
            const passiveTrue = { passive: true };
            const passiveFalse = { passive: false };
            addTempEventHandlers(
                tempHandlers,
                [eElement, 'touchmove', touchMove, passiveTrue],
                [doc, 'touchcancel', touchEnd, passiveTrue],
                // we set passive=false, as we want to prevent default on this event
                [doc, 'touchend', touchEnd, passiveFalse],
                [doc, 'contextmenu', preventEventDefault, passiveFalse]
            );
        }

        this.clearLongPress();
        this.longPressTimer = window.setTimeout(() => {
            this.longPressTimer = 0;
            if (this.touchStart === touchStart && !this.moved) {
                this.moved = true;
                this.eventSvc?.dispatchEvent<LongTapEvent>({ type: 'longTap', touchStart, touchEvent });
            }
        }, LONG_PRESS_MILLISECONDS);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        const { touchStart, moved } = this;
        if (!moved && touchStart) {
            const touch = _getFirstActiveTouch(touchStart, touchEvent.touches);
            const eventIsFarAway = touch && !_areEventsNear(touch, touchStart, 4);
            if (eventIsFarAway) {
                this.clearLongPress(true);
            }
        }
    }

    private onTouchEnd(touchEvent: TouchEvent): void {
        const touchStart = this.touchStart;
        if (!touchStart || !_getFirstActiveTouch(touchStart, touchEvent.changedTouches)) {
            return;
        }

        if (touchEvent.type !== 'touchcancel') {
            if (!this.moved) {
                this.eventSvc?.dispatchEvent<TapEvent>({ type: 'tap', touchStart });
                this.checkForDoubleTap(touchStart);
            }

            if (this.preventMouseClick) {
                preventEventDefault(touchEvent); // stops the tap from also been processed as a mouse click
            }
        }

        this.cancel();
    }

    private checkForDoubleTap(touchStart: Touch): void {
        const lastTapTime = this.lastTapTime;
        const now = Date.now();
        if (lastTapTime > 0) {
            const interval = now - lastTapTime; // if previous tap, see if duration is short enough to be considered double tap
            if (interval > DOUBLE_TAP_MILLISECONDS) {
                this.eventSvc?.dispatchEvent<DoubleTapEvent>({ type: 'doubleTap', touchStart });
                this.lastTapTime = 0; // this stops a triple tap ending up as two double taps
                return;
            }
        }

        this.lastTapTime = now;
    }

    private cancel(): void {
        this.clearLongPress();
        clearTempEventHandlers(this.tempHandlers);
        this.touchStart = null;
    }

    private clearLongPress(moved = false): void {
        window.clearTimeout(this.longPressTimer);
        this.longPressTimer = 0;
        this.moved = moved;
    }

    public destroy(): void {
        this.eventSvc = null;
        const touchStartListener = this.touchStartListener;
        if (touchStartListener) {
            this.touchStartListener = null;
            this.eElement.removeEventListener('touchstart', touchStartListener);
        }
        this.cancel();
        this.eElement = null!;
    }
}
