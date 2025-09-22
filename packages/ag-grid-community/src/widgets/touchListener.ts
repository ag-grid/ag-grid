import { LocalEventService } from '../agStack/events/localEventService';
import type { AgEvent } from '../agStack/interfaces/agEvent';
import type { IEventEmitter, IEventListener } from '../agStack/interfaces/iEventEmitter';
import {
    _areEventsNear,
    _getFirstActiveTouch,
    addTempEventHandlers,
    preventEventDefault,
    removeTempEventHandlers,
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
    private tempHandlers: TempEventHandler[] | null = null;

    private moved: boolean;

    private readonly touchStartListener: ((e: TouchEvent) => void) | null = null;

    private touchStart: Touch | null = null;
    private lastTapTime: number | null = null;
    private longPressTimer: number = 0;

    private localEventService: LocalEventService<TouchListenerEvent> | null | undefined = undefined;

    constructor(
        private readonly eElement: Element,
        private readonly preventMouseClick = false
    ) {
        this.preventMouseClick = preventMouseClick;

        const startListener = this.onTouchStart.bind(this);
        this.touchStartListener = startListener;
        eElement.addEventListener('touchstart', startListener, { passive: true });
    }

    public addEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        let localEventService = this.localEventService;
        if (localEventService === null) {
            return; // destroyed
        }
        if (!localEventService) {
            this.localEventService = localEventService = new LocalEventService<TouchListenerEvent>();
        }
        localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        this.localEventService?.removeEventListener(eventType, listener);
    }

    private onTouchStart(touchEvent: TouchEvent): void {
        // only looking at one touch point at any time
        if (this.touchStart) {
            return;
        }

        if (!addHandledTouchEvent(touchEvent)) {
            return; // Already handled by a component on top of this one
        }

        let tempHandlers = this.tempHandlers;
        if (!tempHandlers) {
            this.tempHandlers = tempHandlers = [];
            const moveListener = this.onTouchMove.bind(this);
            const endListener = this.onTouchEnd.bind(this);
            const eElement = this.eElement;
            addTempEventHandlers(
                tempHandlers,
                [eElement, 'touchmove', moveListener, { passive: true }],
                [eElement, 'touchcancel', endListener, { passive: true }],
                // we set passive=false, as we want to prevent default on this event
                [eElement, 'touchend', endListener, { passive: false }],
                [eElement.ownerDocument, 'contextmenu', preventEventDefault, { passive: false }]
            );
        }

        const touchStart = touchEvent.touches[0];
        this.touchStart = touchStart;

        this.moved = false;

        this.clearLongPressTimer();
        this.longPressTimer = window.setTimeout(() => {
            this.longPressTimer = 0;
            if (this.touchStart === touchStart && !this.moved) {
                this.moved = true;
                const event: LongTapEvent = { type: 'longTap', touchStart, touchEvent };
                this.localEventService?.dispatchEvent(event);
            }
        }, LONG_PRESS_MILLISECONDS);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        if (this.moved) {
            return;
        }

        const touchStart = this.touchStart;
        const touch = touchStart && _getFirstActiveTouch(touchStart, touchEvent.touches);
        const eventIsFarAway = touch && !_areEventsNear(touch, touchStart, 4);
        if (eventIsFarAway) {
            this.moved = true;
            this.clearLongPressTimer();
        }
    }

    private onTouchEnd(touchEvent: TouchEvent): void {
        const touchStart = this.touchStart;

        if (touchEvent.type !== 'touchcancel') {
            if (touchStart && !this.moved) {
                const event: TapEvent = { type: 'tap', touchStart };
                this.localEventService?.dispatchEvent(event);
                this.checkForDoubleTap(touchStart);
            }

            // stops the tap from also been processed as a mouse click
            if (this.preventMouseClick && touchEvent.cancelable) {
                touchEvent.preventDefault();
            }
        }

        this.clearLongPressTimer();
        this.touchStart = null;
        this.moved = false;
    }

    private checkForDoubleTap(touchStart: Touch): void {
        const now = Date.now();
        if (this.lastTapTime && this.lastTapTime > 0) {
            // if previous tap, see if duration is short enough to be considered double tap
            const interval = now - this.lastTapTime;
            if (interval > DOUBLE_TAP_MILLISECONDS) {
                // dispatch double tap event
                const event: DoubleTapEvent = { type: 'doubleTap', touchStart };
                this.localEventService?.dispatchEvent(event);

                // this stops a triple tap ending up as two double taps
                this.lastTapTime = null;
            } else {
                this.lastTapTime = now;
            }
        } else {
            this.lastTapTime = now;
        }
    }

    public destroy(): void {
        this.eElement.removeEventListener('touchstart', this.touchStartListener!);
        this.clearLongPressTimer();
        this.touchStart = null;
        this.localEventService = null;
        removeTempEventHandlers(this.tempHandlers);
    }

    private clearLongPressTimer(): void {
        window.clearTimeout(this.longPressTimer);
        this.longPressTimer = 0;
    }
}
