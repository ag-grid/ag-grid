import { LocalEventService } from '../agStack/events/localEventService';
import type { AgEvent } from '../agStack/interfaces/agEvent';
import type { IEventEmitter, IEventListener } from '../agStack/interfaces/iEventEmitter';
import {
    _areEventsNear,
    _getFirstActiveTouch,
    addTempEventHandlers,
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

const LONG_PRESS_MILLISECONDS = 500;

export type TouchListenerEvent = 'tap' | 'doubleTap' | 'longTap';
export class TouchListener implements IEventEmitter<TouchListenerEvent> {
    private readonly handlers: TempEventHandler[] = [];

    private moved: boolean;

    private touchStart: Touch | null = null;
    private lastTapTime: number | null = null;
    private longPressTimer: number = 0;

    private localEventService: LocalEventService<TouchListenerEvent> | null | undefined = undefined;

    constructor(
        eElement: Element,
        private readonly preventMouseClick = false
    ) {
        this.preventMouseClick = preventMouseClick;

        const startListener = this.onTouchStart.bind(this);
        const moveListener = this.onTouchMove.bind(this);
        const endListener = this.onTouchEnd.bind(this);
        const cancelListener = this.onTouchCancel.bind(this);

        addTempEventHandlers(
            this.handlers,
            [eElement, 'touchstart', startListener, { passive: true }],
            [eElement, 'touchmove', moveListener, { passive: true }],
            // we set passive=false, as we want to prevent default on this event
            [eElement, 'touchend', endListener, { passive: false }],
            [eElement, 'touchcancel', cancelListener, { passive: false }]
        );
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

        const touchStart = touchEvent.touches[0];
        this.touchStart = touchStart;

        this.moved = false;

        this.clearLongPressTimer();
        this.longPressTimer = window.setTimeout(() => {
            this.longPressTimer = 0;
            if (this.touchStart === touchStart && !this.moved) {
                this.moved = true;
                const event: LongTapEvent = { type: 'longTap', touchStart, touchEvent: touchEvent };
                this.localEventService?.dispatchEvent(event);
            }
        }, LONG_PRESS_MILLISECONDS);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
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
        const touch = touchStart && _getFirstActiveTouch(touchStart, touchEvent.touches);
        if (!touch) {
            return;
        }

        this.clearLongPressTimer();

        if (!this.moved) {
            const event: TapEvent = { type: 'tap', touchStart };
            this.localEventService?.dispatchEvent(event);
            this.checkForDoubleTap(touchStart);
        }

        // stops the tap from also been processed as a mouse click
        if (this.preventMouseClick && touchEvent.cancelable) {
            touchEvent.preventDefault();
        }

        this.touchStart = null;
    }

    private onTouchCancel(_touchEvent: TouchEvent): void {
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
        this.clearLongPressTimer();
        removeTempEventHandlers(this.handlers);
        this.localEventService = null;
    }

    private clearLongPressTimer(): void {
        window.clearTimeout(this.longPressTimer);
        this.longPressTimer = 0;
    }
}
