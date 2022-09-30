import { CartesianChart } from '../cartesianChart';
import { NavigatorMask } from './navigatorMask';
import { NavigatorHandle } from './navigatorHandle';
interface Offset {
    offsetX: number;
    offsetY: number;
}
export declare class Navigator {
    private readonly rs;
    private readonly chart;
    readonly mask: NavigatorMask;
    readonly minHandle: NavigatorHandle;
    readonly maxHandle: NavigatorHandle;
    private minHandleDragging;
    private maxHandleDragging;
    private panHandleOffset;
    private changedCursor;
    set enabled(value: boolean);
    get enabled(): boolean;
    set x(value: number);
    get x(): number;
    set y(value: number);
    get y(): number;
    set width(value: number);
    get width(): number;
    set height(value: number);
    get height(): number;
    private _margin;
    set margin(value: number);
    get margin(): number;
    set min(value: number);
    get min(): number;
    set max(value: number);
    get max(): number;
    constructor(chart: CartesianChart);
    updateAxes(min: number, max: number): void;
    onDragStart(offset: Offset): void;
    onDrag(offset: Offset): void;
    onDragStop(): void;
    stopHandleDragging(): void;
}
export {};
