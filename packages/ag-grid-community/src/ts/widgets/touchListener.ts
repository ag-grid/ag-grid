import { EventService } from "../eventService";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { _ } from "../utils";
import { AgEvent } from "../events";

export interface TapEvent extends AgEvent {
    touchStart: Touch;
}

export interface LongTapEvent extends AgEvent {
    touchStart: Touch;
    touchEvent: TouchEvent;
}

export class TouchListener implements IEventEmitter {

    public static EVENT_TAP = "tap";
    public static EVENT_DOUBLE_TAP = "doubleTap";
    public static EVENT_LONG_TAP = "longTap";

    private static DOUBLE_TAP_MILLIS = 500;

    private eElement: HTMLElement;

    private destroyFuncs: Function[] = [];

    private moved: boolean;

    private touching = false;
    private touchStart: Touch;

    private lastTapTime: number | null;

    private eventService: EventService = new EventService();

    // private mostRecentTouch: Touch;

    private preventMouseClick: boolean;

    constructor(eElement: HTMLElement, preventMouseClick = false) {
        this.eElement = eElement;
        this.preventMouseClick = preventMouseClick;

        const startListener = this.onTouchStart.bind(this);
        const moveListener = this.onTouchMove.bind(this);
        const endListener = this.onTouchEnd.bind(this);

        this.eElement.addEventListener("touchstart", startListener, {passive: true} as any);
        this.eElement.addEventListener("touchmove", moveListener, {passive: true} as any);
        // we set passive=false, as we want to prevent default on this event
        this.eElement.addEventListener("touchend", endListener, {passive: false} as any);

        this.destroyFuncs.push(() => {
            this.eElement.removeEventListener("touchstart", startListener, {passive: true} as any);
            this.eElement.removeEventListener("touchmove", moveListener, {passive: true} as any);
            this.eElement.removeEventListener("touchend", endListener, {passive: false} as any);
        });
    }

    private getActiveTouch(touchList: TouchList): Touch | null {
        for (let i = 0; i < touchList.length; i++) {
            const matches = touchList[i].identifier === this.touchStart.identifier;
            if (matches) {
                return touchList[i];
            }
        }

        return null;
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.eventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

    private onTouchStart(touchEvent: TouchEvent): void {
        // only looking at one touch point at any time
        if (this.touching) {
            return;
        }

        this.touchStart = touchEvent.touches[0];
        this.touching = true;

        this.moved = false;

        const touchStartCopy = this.touchStart;

        window.setTimeout(() => {
            const touchesMatch = this.touchStart === touchStartCopy;

            if (this.touching && touchesMatch && !this.moved) {
                this.moved = true;
                const event: LongTapEvent = {
                    type: TouchListener.EVENT_LONG_TAP,
                    touchStart: this.touchStart,
                    touchEvent: touchEvent
                };
                this.eventService.dispatchEvent(event);
            }
        }, 500);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        if (!this.touching) {
            return;
        }

        const touch = this.getActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }

        const eventIsFarAway = !_.areEventsNear(touch, this.touchStart, 4);
        if (eventIsFarAway) {
            this.moved = true;
        }
    }

    private onTouchEnd(touchEvent: TouchEvent): void {
        if (!this.touching) {
            return;
        }

        if (!this.moved) {
            const event: TapEvent = {
                type: TouchListener.EVENT_TAP,
                touchStart: this.touchStart
            };
            this.eventService.dispatchEvent(event);
            this.checkForDoubleTap();
        }

        // stops the tap from also been processed as a mouse click
        if (this.preventMouseClick) {
            touchEvent.preventDefault();
        }

        this.touching = false;
    }

    private checkForDoubleTap(): void {
        const now = new Date().getTime();

        if (this.lastTapTime && this.lastTapTime > 0) {
            // if previous tap, see if duration is short enough to be considered double tap
            const interval = now - this.lastTapTime;
            if (interval > TouchListener.DOUBLE_TAP_MILLIS) {
                // dispatch double tap event
                const event: TapEvent = {
                    type: TouchListener.EVENT_DOUBLE_TAP,
                    touchStart: this.touchStart
                };
                this.eventService.dispatchEvent(event);

                // this stops a tripple tap ending up as two double taps
                this.lastTapTime = null;
            } else {
                this.lastTapTime = now;
            }
        } else {
            this.lastTapTime = now;
        }
    }

    public destroy(): void {
        this.destroyFuncs.forEach(func => func());
    }
}