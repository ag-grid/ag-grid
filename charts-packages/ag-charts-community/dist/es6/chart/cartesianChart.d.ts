import { Chart } from "./chart";
import { Series } from "./series/series";
import { ClipRect } from "../scene/clipRect";
import { Navigator } from "./navigator/navigator";
export declare class CartesianChart extends Chart {
    static className: string;
    static type: string;
    constructor(document?: Document);
    private _seriesRoot;
    readonly seriesRoot: ClipRect;
    readonly navigator: Navigator;
    performLayout(): void;
    protected initSeries(series: Series): void;
    protected freeSeries(series: Series): void;
    protected onMouseDown(event: MouseEvent): void;
    protected onMouseMove(event: MouseEvent): void;
    protected onMouseUp(event: MouseEvent): void;
    protected onMouseOut(event: MouseEvent): void;
    updateAxes(): void;
}
