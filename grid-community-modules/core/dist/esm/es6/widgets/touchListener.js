/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { EventService } from "../eventService";
import { areEventsNear } from "../utils/mouse";
export class TouchListener {
    constructor(eElement, preventMouseClick = false) {
        this.destroyFuncs = [];
        this.touching = false;
        this.eventService = new EventService();
        this.eElement = eElement;
        this.preventMouseClick = preventMouseClick;
        const startListener = this.onTouchStart.bind(this);
        const moveListener = this.onTouchMove.bind(this);
        const endListener = this.onTouchEnd.bind(this);
        this.eElement.addEventListener("touchstart", startListener, { passive: true });
        this.eElement.addEventListener("touchmove", moveListener, { passive: true });
        // we set passive=false, as we want to prevent default on this event
        this.eElement.addEventListener("touchend", endListener, { passive: false });
        this.destroyFuncs.push(() => {
            this.eElement.removeEventListener("touchstart", startListener, { passive: true });
            this.eElement.removeEventListener("touchmove", moveListener, { passive: true });
            this.eElement.removeEventListener("touchend", endListener, { passive: false });
        });
    }
    getActiveTouch(touchList) {
        for (let i = 0; i < touchList.length; i++) {
            const matches = touchList[i].identifier === this.touchStart.identifier;
            if (matches) {
                return touchList[i];
            }
        }
        return null;
    }
    addEventListener(eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    }
    removeEventListener(eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    }
    onTouchStart(touchEvent) {
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
                const event = {
                    type: TouchListener.EVENT_LONG_TAP,
                    touchStart: this.touchStart,
                    touchEvent: touchEvent
                };
                this.eventService.dispatchEvent(event);
            }
        }, 500);
    }
    onTouchMove(touchEvent) {
        if (!this.touching) {
            return;
        }
        const touch = this.getActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }
        const eventIsFarAway = !areEventsNear(touch, this.touchStart, 4);
        if (eventIsFarAway) {
            this.moved = true;
        }
    }
    onTouchEnd(touchEvent) {
        if (!this.touching) {
            return;
        }
        if (!this.moved) {
            const event = {
                type: TouchListener.EVENT_TAP,
                touchStart: this.touchStart
            };
            this.eventService.dispatchEvent(event);
            this.checkForDoubleTap();
        }
        // stops the tap from also been processed as a mouse click
        if (this.preventMouseClick && touchEvent.cancelable) {
            touchEvent.preventDefault();
        }
        this.touching = false;
    }
    checkForDoubleTap() {
        const now = new Date().getTime();
        if (this.lastTapTime && this.lastTapTime > 0) {
            // if previous tap, see if duration is short enough to be considered double tap
            const interval = now - this.lastTapTime;
            if (interval > TouchListener.DOUBLE_TAP_MILLIS) {
                // dispatch double tap event
                const event = {
                    type: TouchListener.EVENT_DOUBLE_TAP,
                    touchStart: this.touchStart
                };
                this.eventService.dispatchEvent(event);
                // this stops a tripple tap ending up as two double taps
                this.lastTapTime = null;
            }
            else {
                this.lastTapTime = now;
            }
        }
        else {
            this.lastTapTime = now;
        }
    }
    destroy() {
        this.destroyFuncs.forEach(func => func());
    }
}
TouchListener.EVENT_TAP = "tap";
TouchListener.EVENT_DOUBLE_TAP = "doubleTap";
TouchListener.EVENT_LONG_TAP = "longTap";
TouchListener.DOUBLE_TAP_MILLIS = 500;
