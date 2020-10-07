import { CartesianChart } from "../cartesianChart";
import { NavigatorMask } from "./navigatorMask";
import { NavigatorHandle } from "./navigatorHandle";
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
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseOut(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    stopHandleDragging(): void;
}
