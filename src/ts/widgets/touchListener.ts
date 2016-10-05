
import {EventService} from "../eventService";
import {IEventEmitter} from "../interfaces/iEventEmitter";
import {Utils as _} from "../utils";

export class TouchListener implements IEventEmitter {

    private eElement: HTMLElement;

    private destroyFuncs: Function[] = [];

    private moved: boolean;

    private touching = false;
    private touchStart: Touch;

    private eventService: EventService = new EventService();

    // private mostRecentTouch: Touch;

    public static EVENT_TAP = 'tap';
    public static EVENT_LONG_TAP = 'longTap';

    constructor(eElement: HTMLElement) {
        this.eElement = eElement;

        var startListener = this.onTouchStart.bind(this);
        var moveListener = this.onTouchMove.bind(this);
        var endListener = this.onTouchEnd.bind(this);

        this.eElement.addEventListener('touchstart', startListener);
        this.eElement.addEventListener('touchmove', moveListener);
        this.eElement.addEventListener('touchend', endListener);

        this.destroyFuncs.push( ()=> {
            this.eElement.addEventListener('touchstart', startListener);
            this.eElement.addEventListener('touchmove', moveListener);
            this.eElement.addEventListener('touchend', endListener);
        });
    }

    private getActiveTouch(touchList: TouchList): Touch {
        for (var i = 0; i<touchList.length; i++) {
            var matches = touchList[i].identifier === this.touchStart.identifier;
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
        if (this.touching) { return; }

        this.touchStart = touchEvent.touches[0];
        this.touching = true;

        this.moved = false;

        let touchStartCopy = this.touchStart;

        setTimeout( ()=> {

            let touchesMatch = this.touchStart === touchStartCopy;

            console.log(`touching = ${this.touching}`);

            if (this.touching && touchesMatch && !this.moved) {
                console.log(`dispatching`);
                this.moved = true;
                this.eventService.dispatchEvent(TouchListener.EVENT_LONG_TAP, this.touchStart);
            }
        }, 500);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        if (!this.touching) { return; }

        var touch = this.getActiveTouch(touchEvent.touches);
        if (!touch) {
            console.log(`no matching`);
            return;
        }

        var eventIsFarAway = !_.areEventsNear(touch, this.touchStart, 4);
        if (eventIsFarAway) {
            console.log(`eventIsFarAway`);
            this.moved = true;
        }
    }

    private onTouchEnd(touchEvent: TouchEvent): void {

        if (!this.touching) { return; }

        if (!this.moved) {
            this.eventService.dispatchEvent(TouchListener.EVENT_TAP, this.touchStart);
        }

        this.touching = false;
    }

    public destroy(): void {
        this.destroyFuncs.forEach( func => func() );
    }
}