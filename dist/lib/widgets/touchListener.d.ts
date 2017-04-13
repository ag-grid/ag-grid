// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IEventEmitter } from "../interfaces/iEventEmitter";
export declare class TouchListener implements IEventEmitter {
    private eElement;
    private destroyFuncs;
    private moved;
    private touching;
    private touchStart;
    private eventService;
    static EVENT_TAP: string;
    static EVENT_LONG_TAP: string;
    constructor(eElement: HTMLElement);
    private getActiveTouch(touchList);
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    private onTouchStart(touchEvent);
    private onTouchMove(touchEvent);
    private onTouchEnd(touchEvent);
    destroy(): void;
}
