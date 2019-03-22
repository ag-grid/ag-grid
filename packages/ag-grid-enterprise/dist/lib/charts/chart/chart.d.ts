// ag-grid-enterprise v20.2.0
import { Scene } from "../scene/scene";
import { Series } from "./series/series";
declare type Padding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare abstract class Chart<D, X, Y> {
    readonly scene: Scene;
    constructor(parent?: HTMLElement);
    private _padding;
    padding: Padding;
    size: [number, number];
    /**
     * The width of the chart in CSS pixels.
     */
    width: number;
    /**
     * The height of the chart in CSS pixels.
     */
    height: number;
    private layoutCallbackId;
    /**
    * Only `true` while we are waiting for the layout to start.
    * This will be `false` if the layout has already started and is ongoing.
    */
    layoutPending: boolean;
    private readonly _performLayout;
    abstract performLayout(): void;
    protected _series: Series<D, X, Y>[];
    series: Series<D, X, Y>[];
}
export {};
