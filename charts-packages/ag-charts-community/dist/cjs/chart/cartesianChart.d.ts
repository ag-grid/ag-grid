import { Chart } from "./chart";
import { Group } from "../scene/group";
import { Series } from "./series/series";
export declare class CartesianChart extends Chart {
    static className: string;
    static type: string;
    constructor(document?: Document);
    private _seriesRoot;
    get seriesRoot(): Group;
    performLayout(): void;
    private _updateAxes;
    protected initSeries(series: Series): void;
    protected freeSeries(series: Series): void;
    updateAxes(): void;
}
