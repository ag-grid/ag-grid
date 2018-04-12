import { EventService } from "../eventService";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { Utils as _ } from "../utils";
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

    private lastTapTime: number;

    private eventService: EventService = new EventService();

    // private mostRecentTouch: Touch;

    private preventMouseClick: boolean;

    constructor(eElement: HTMLElement, preventMouseClick = false) {
        this.eElement = eElement;
        this.preventMouseClick = preventMouseClick;

        let startListener = this.onTouchStart.bind(this);
        let moveListener = this.onTouchMove.bind(this);
        let endListener = this.onTouchEnd.bind(this);

        this.eElement.addEventListener("touchstart", startListener, <any>{ passive: true });
        this.eElement.addEventListener("touchmove", moveListener, <any>{ passive: true });
        // we set passive=false, as we want to prevent default on this event
        this.eElement.addEventListener("touchend", endListener, <any>{ passive: false });

        this.destroyFuncs.push(() => {
            this.eElement.addEventListener("touchstart", startListener, <any>{ passive: true });
            this.eElement.addEventListener("touchmove", moveListener, <any>{ passive: true });
            this.eElement.addEventListener("touchend", endListener, <any>{ passive: false });
        });
    }

    private getActiveTouch(touchList: TouchList): Touch {
        for (let i = 0; i < touchList.length; i++) {
            let matches = touchList[i].identifier === this.touchStart.identifier;
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

        let touchStartCopy = this.touchStart;

        setTimeout(() => {
            let touchesMatch = this.touchStart === touchStartCopy;

            if (this.touching && touchesMatch && !this.moved) {
                this.moved = true;
                let event: LongTapEvent = {
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

        let touch = this.getActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }

        let eventIsFarAway = !_.areEventsNear(touch, this.touchStart, 4);
        if (eventIsFarAway) {
            this.moved = true;
        }
    }

    private onTouchEnd(touchEvent: TouchEvent): void {
        if (!this.touching) {
            return;
        }

        if (!this.moved) {
            let event: TapEvent = {
                type: TouchListener.EVENT_TAP,
                touchStart: this.touchStart
            };
            this.eventService.dispatchEvent(event);
            this.checkForDoubleTap();

            // stops the tap from also been processed as a mouse click
            if (this.preventMouseClick) {
                touchEvent.preventDefault();
            }
        }

        this.touching = false;
    }

    private checkForDoubleTap(): void {
        let now = new Date().getTime();

        if (this.lastTapTime>0) {
            // if previous tap, see if duration is short enough to be considered double tap
            let interval = now - this.lastTapTime;
            if (interval > TouchListener.DOUBLE_TAP_MILLIS) {
                // dispatch double tap event
                let event: TapEvent = {
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