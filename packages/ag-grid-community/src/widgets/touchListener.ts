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

    private readonly localEventService: LocalEventService<TouchListenerEvent> = new LocalEventService();

    private readonly preventMouseClick: boolean;

    constructor(eElement: Element, preventMouseClick = false) {
        this.preventMouseClick = preventMouseClick;

        const startListener = this.onTouchStart.bind(this);
        const moveListener = this.onTouchMove.bind(this);
        const endListener = this.onTouchEnd.bind(this);

        addTempEventHandlers(
            this.handlers,
            [eElement, 'touchstart', startListener, { passive: true }],
            [eElement, 'touchmove', moveListener, { passive: true }],
            // we set passive=false, as we want to prevent default on this event
            [eElement, 'touchend', endListener, { passive: false }]
        );
    }

    public addEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener<T extends TouchListenerEvent>(eventType: T, listener: IEventListener<T>): void {
        this.localEventService.removeEventListener(eventType, listener);
    }

    private onTouchStart(touchEvent: TouchEvent): void {
        // only looking at one touch point at any time
        const touchStart = this.touchStart;
        if (touchStart) {
            return;
        }

        this.touchStart = touchEvent.touches[0];

        this.moved = false;

        const touchStartCopy = this.touchStart;

        this.clearLongPressTimer();
        this.longPressTimer = window.setTimeout(() => {
            if (this.touchStart === touchStartCopy && !this.moved) {
                this.moved = true;
                const event: LongTapEvent = {
                    type: 'longTap',
                    touchStart: this.touchStart,
                    touchEvent: touchEvent,
                };
                this.localEventService.dispatchEvent(event);
            }
        }, LONG_PRESS_MILLISECONDS);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        const touchStart = this.touchStart;
        if (!touchStart) {
            return;
        }

        const touch = _getFirstActiveTouch(touchStart, touchEvent.touches);
        if (!touch) {
            return;
        }

        const eventIsFarAway = !_areEventsNear(touch, touchStart, 4);
        if (eventIsFarAway) {
            this.moved = true;
            this.clearLongPressTimer();
        }
    }

    private onTouchEnd(touchEvent: TouchEvent): void {
        if (!this.touchStart) {
            return;
        }

        this.clearLongPressTimer();

        if (!this.moved) {
            const event: TapEvent = {
                type: 'tap',
                touchStart: this.touchStart,
            };
            this.localEventService.dispatchEvent(event);
            this.checkForDoubleTap();
        }

        // stops the tap from also been processed as a mouse click
        if (this.preventMouseClick && touchEvent.cancelable) {
            touchEvent.preventDefault();
        }

        this.touchStart = null;
    }

    private checkForDoubleTap(): void {
        const touchStart = this.touchStart;
        if (!touchStart) {
            return;
        }
        const now = Date.now();

        if (this.lastTapTime && this.lastTapTime > 0) {
            // if previous tap, see if duration is short enough to be considered double tap
            const interval = now - this.lastTapTime;
            if (interval > DOUBLE_TAP_MILLISECONDS) {
                // dispatch double tap event
                const event: DoubleTapEvent = {
                    type: 'doubleTap',
                    touchStart,
                };
                this.localEventService.dispatchEvent(event);

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
    }

    private clearLongPressTimer(): void {
        window.clearTimeout(this.longPressTimer);
        this.longPressTimer = 0;
    }
}
