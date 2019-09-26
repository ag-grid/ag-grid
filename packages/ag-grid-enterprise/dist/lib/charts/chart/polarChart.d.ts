// ag-grid-enterprise v21.2.2
import { Chart } from "./chart";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";
import { Series } from "./series/series";
export declare class PolarChart extends Chart {
    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number;
    centerY: number;
    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number;
    protected _padding: Padding;
    constructor();
    readonly seriesRoot: Node;
    protected _series: Series<PolarChart>[];
    series: Series<PolarChart>[];
    performLayout(): void;
}
