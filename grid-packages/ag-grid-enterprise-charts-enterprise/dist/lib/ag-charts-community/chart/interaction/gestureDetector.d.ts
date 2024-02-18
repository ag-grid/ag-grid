import { BaseManager } from './baseManager';
type PinchEventTypes = 'pinch-start' | 'pinch-move' | 'pinch-end';
type GestureEventTypes = PinchEventTypes;
type Finger = {
    identifier: number;
    screenX: number;
    screenY: number;
};
export type GestureEvent<T extends GestureEventTypes = GestureEventTypes> = {
    type: T;
};
export type PinchEvent<T extends PinchEventTypes = PinchEventTypes> = {
    type: T;
    finger1: Finger;
    finger2: Finger;
    origin: {
        x: number;
        y: number;
    };
    deltaDistance: number;
};
export declare class GestureDetector extends BaseManager<GestureEventTypes, GestureEvent> {
    private readonly element;
    private touchstart;
    private touchmove;
    private touchend;
    private touchcancel;
    private pinch;
    constructor(element: HTMLElement);
    destroy(): void;
    private findPinchTouches;
    private copyTouchData;
    private dispatchPinchEvent;
    private onTouchStart;
    private onTouchMove;
    private onTouchEnd;
    private onTouchCancel;
    private stopPinchTracking;
}
export {};
