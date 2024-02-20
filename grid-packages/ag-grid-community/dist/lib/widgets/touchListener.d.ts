import { AgEvent, AgEventListener } from "../events";
import { IEventEmitter } from "../interfaces/iEventEmitter";
export interface TapEvent extends AgEvent {
    touchStart: Touch;
}
export interface LongTapEvent extends AgEvent {
    touchStart: Touch;
    touchEvent: TouchEvent;
}
export declare class TouchListener implements IEventEmitter {
    static EVENT_TAP: string;
    static EVENT_DOUBLE_TAP: string;
    static EVENT_LONG_TAP: string;
    private static DOUBLE_TAP_MILLIS;
    private eElement;
    private destroyFuncs;
    private moved;
    private touching;
    private touchStart;
    private lastTapTime;
    private eventService;
    private preventMouseClick;
    constructor(eElement: Element, preventMouseClick?: boolean);
    private getActiveTouch;
    addEventListener(eventType: string, listener: AgEventListener): void;
    removeEventListener(eventType: string, listener: AgEventListener): void;
    private onTouchStart;
    private onTouchMove;
    private onTouchEnd;
    private checkForDoubleTap;
    destroy(): void;
}
