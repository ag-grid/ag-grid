import { Scene } from "../scene/scene";
import { Series } from "./series/series";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";
import { Rect } from "../scene/shape/rect";
import { Legend } from "./legend";
import { Caption } from "../caption";
import { Observable } from "../util/observable";
import { ChartAxis } from "./chartAxis";
export declare type LegendPosition = 'top' | 'right' | 'bottom' | 'left';
export declare abstract class Chart extends Observable {
    readonly id: string;
    readonly scene: Scene;
    readonly background: Rect;
    protected legendAutoPadding: Padding;
    protected captionAutoPadding: number;
    private tooltipElement;
    private defaultTooltipClass;
    legend: Legend;
    tooltipOffset: number[];
    parent?: HTMLElement;
    title?: Caption;
    subtitle?: Caption;
    padding: Padding;
    size: [number, number];
    height: number;
    width: number;
    protected constructor(document?: Document);
    private createId;
    destroy(): void;
    private readonly onLayoutChange;
    private readonly onLegendPositionChange;
    readonly element: HTMLElement;
    abstract readonly seriesRoot: Node;
    protected _axes: ChartAxis[];
    axes: ChartAxis[];
    protected _series: Series[];
    series: Series[];
    private readonly scheduleLayout;
    private readonly scheduleData;
    addSeries(series: Series, before?: Series): boolean;
    protected initSeries(series: Series): void;
    protected freeSeries(series: Series): void;
    addSeriesAfter(series: Series, after?: Series): boolean;
    removeSeries(series: Series): boolean;
    removeAllSeries(): void;
    /**
     * Finds all the series that use any given axis.
     */
    protected onSeriesChange(): void;
    protected onAxesChange(force?: boolean): void;
    private findMatchingAxis;
    private _data;
    data: any[];
    protected _axesChanged: boolean;
    protected axesChanged: boolean;
    protected _seriesChanged: boolean;
    protected seriesChanged: boolean;
    protected layoutCallbackId: number;
    /**
    * Only `true` while we are waiting for the layout to start.
    * This will be `false` if the layout has already started and is ongoing.
    */
    layoutPending: boolean;
    private readonly _performLayout;
    private dataCallbackId;
    dataPending: boolean;
    processData(): void;
    readonly updateLegend: () => void;
    abstract performLayout(): void;
    protected positionCaptions(): void;
    protected positionLegend(): void;
    private setupListeners;
    private cleanupListeners;
    private pickSeriesNode;
    private lastPick?;
    private readonly onMouseMove;
    private readonly onMouseOut;
    private readonly onClick;
    private onSeriesNodePick;
    private _tooltipClass;
    tooltipClass: string;
    private toggleTooltip;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    private showTooltip;
    private hideTooltip;
}
