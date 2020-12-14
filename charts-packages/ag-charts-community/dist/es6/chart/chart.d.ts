import { Scene } from "../scene/scene";
import { Series, SeriesNodeDatum } from "./series/series";
import { Padding } from "../util/padding";
import { Shape } from "../scene/shape/shape";
import { Node } from "../scene/node";
import { Rect } from "../scene/shape/rect";
import { Legend } from "./legend";
import { BBox } from "../scene/bbox";
import { Caption } from "../caption";
import { Observable, SourceEvent } from "../util/observable";
import { ChartAxis } from "./chartAxis";
export interface ChartClickEvent extends SourceEvent<Chart> {
    event: MouseEvent;
}
export interface TooltipMeta {
    pageX: number;
    pageY: number;
}
export interface TooltipRendererResult {
    content?: string;
    title?: string;
    color?: string;
    backgroundColor?: string;
}
export declare function toTooltipHtml(input: string | TooltipRendererResult, defaults?: TooltipRendererResult): string;
export declare class ChartTooltip extends Observable {
    chart: Chart;
    element: HTMLDivElement;
    private observer?;
    enabled: boolean;
    class: string;
    delay: number;
    /**
     * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
     * Only has effect on series with markers.
     */
    tracking: boolean;
    isVisible(): boolean;
    updateClass(visible?: boolean, constrained?: boolean): void;
    private showTimeout;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta: TooltipMeta, html?: string, instantly?: boolean): void;
    toggle(visible?: boolean): void;
    constructor(chart: Chart);
    destroy(): void;
}
export declare abstract class Chart extends Observable {
    readonly id: string;
    readonly scene: Scene;
    readonly background: Rect;
    readonly legend: Legend;
    protected legendAutoPadding: Padding;
    protected captionAutoPadding: number;
    static readonly defaultTooltipClass = "ag-chart-tooltip";
    private _container;
    container: HTMLElement | undefined | null;
    private _data;
    data: any[];
    width: number;
    height: number;
    protected _autoSize: boolean;
    autoSize: boolean;
    readonly tooltip: ChartTooltip;
    private _tooltipClass;
    /**
     * @deprecated Please use {@link tooltip.class} instead.
     */
    tooltipClass: string;
    /**
     * @deprecated Please use {@link tooltip.tracking} instead.
     */
    tooltipTracking: boolean;
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
    lastPick?: {
        datum: SeriesNodeDatum;
        node?: Shape;
        event?: MouseEvent;
    };
    private pickClosestSeriesNodeDatum;
    private _onMouseDown;
    private _onMouseUp;
    private _onMouseMove;
    private _onMouseOut;
    private _onClick;
    protected onMouseMove(event: MouseEvent): void;
    protected handleTooltip(event: MouseEvent): void;
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
}
