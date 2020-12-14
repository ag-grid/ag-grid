import { CartesianChart } from "../cartesianChart";
import { NavigatorMask } from "./navigatorMask";
import { NavigatorHandle } from "./navigatorHandle";
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
    enabled: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    private _margin;
    margin: number;
    min: number;
    max: number;
    constructor(chart: CartesianChart);
    updateAxes(min: number, max: number): void;
    onDragStart(offset: Offset): void;
    onDrag(offset: Offset): void;
    onDragStop(): void;
    stopHandleDragging(): void;
}
export {};
