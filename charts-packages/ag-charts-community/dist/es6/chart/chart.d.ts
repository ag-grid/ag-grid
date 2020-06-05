import { Scene } from "../scene/scene";
import { Series, SeriesNodeDatum } from "./series/series";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";
import { Rect } from "../scene/shape/rect";
import { Legend } from "./legend";
import { BBox } from "../scene/bbox";
import { Caption } from "../caption";
import { Observable } from "../util/observable";
import { ChartAxis } from "./chartAxis";
export interface TooltipMeta {
    pageX: number;
    pageY: number;
}
export declare abstract class Chart extends Observable {
    readonly id: string;
    readonly scene: Scene;
    readonly background: Rect;
    readonly legend: Legend;
    protected legendAutoPadding: Padding;
    protected captionAutoPadding: number;
    private tooltipElement;
    static readonly defaultTooltipClass = "ag-chart-tooltip";
    private _container;
    container: HTMLElement | undefined;
    private _data;
    data: any[];
    width: number;
    height: number;
    protected _autoSize: boolean;
    autoSize: boolean;
    download(fileName?: string): void;
    padding: Padding;
    title?: Caption;
    subtitle?: Caption;
    private static tooltipDocuments;
    protected constructor(document?: Document);
    destroy(): void;
    private onLayoutChange;
    private onLegendPositionChange;
    private onCaptionChange;
    protected _element: HTMLElement;
    readonly element: HTMLElement;
    abstract readonly seriesRoot: Node;
    protected _axes: ChartAxis[];
    axes: ChartAxis[];
    protected attachAxis(axis: ChartAxis): void;
    protected detachAxis(axis: ChartAxis): void;
    protected _series: Series[];
    series: Series[];
    private scheduleLayout;
    private scheduleData;
    addSeries(series: Series, before?: Series): boolean;
    protected initSeries(series: Series): void;
    protected freeSeries(series: Series): void;
    addSeriesAfter(series: Series, after?: Series): boolean;
    removeSeries(series: Series): boolean;
    removeAllSeries(): void;
    protected assignSeriesToAxes(): void;
    protected assignAxesToSeries(force?: boolean): void;
    private findMatchingAxis;
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
    private updateLegend;
    abstract performLayout(): void;
    protected positionCaptions(): void;
    protected positionLegend(): void;
    protected setupDomListeners(chartElement: HTMLCanvasElement): void;
    protected cleanupDomListeners(chartElement: HTMLCanvasElement): void;
    protected seriesRect?: BBox;
    private pickSeriesNode;
    private lastPick?;
    private pickClosestSeriesNodeDatum;
    private _onMouseDown;
    private _onMouseUp;
    private _onMouseMove;
    private _onMouseOut;
    private _onClick;
    protected onMouseMove(event: MouseEvent): void;
    protected onMouseDown(event: MouseEvent): void;
    protected onMouseUp(event: MouseEvent): void;
    protected onMouseOut(event: MouseEvent): void;
    protected onClick(event: MouseEvent): void;
    private checkSeriesNodeClick;
    private onSeriesNodeClick;
    private checkLegendClick;
    private onSeriesDatumPick;
    highlightedDatum?: SeriesNodeDatum;
    highlightDatum(datum: SeriesNodeDatum): void;
    dehighlightDatum(): void;
    private _tooltipClass;
    tooltipClass: string;
    /**
     * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
     * Only has effect on series with markers.
     */
    tooltipTracking: boolean;
    private toggleTooltip;
    private updateTooltipClass;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    private showTooltip;
    private hideTooltip;
}
