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
import { PlacedLabel } from "../util/labelPlacement";
import { AgChartOptions } from "./agChartOptions";
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
    constructor(chart: Chart, document: Document);
    destroy(): void;
    isVisible(): boolean;
    updateClass(visible?: boolean, constrained?: boolean): void;
    private showTimeout;
    private constrained;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta: TooltipMeta, html?: string, instantly?: boolean): void;
    toggle(visible?: boolean): void;
}
export declare abstract class Chart extends Observable {
    readonly id: string;
    options: AgChartOptions;
    userOptions: AgChartOptions;
    readonly scene: Scene;
    readonly background: Rect;
    readonly legend: Legend;
    protected legendAutoPadding: Padding;
    protected captionAutoPadding: number;
    static readonly defaultTooltipClass = "ag-chart-tooltip";
    private _container;
    set container(value: HTMLElement | undefined | null);
    get container(): HTMLElement | undefined | null;
    protected _data: any;
    set data(data: any);
    get data(): any;
    set width(value: number);
    get width(): number;
    set height(value: number);
    get height(): number;
    protected _autoSize: boolean;
    set autoSize(value: boolean);
    get autoSize(): boolean;
    readonly tooltip: ChartTooltip;
    download(fileName?: string): void;
    padding: Padding;
    title?: Caption;
    subtitle?: Caption;
    private static tooltipDocuments;
    protected constructor(document?: Document);
    destroy(): void;
    private onLegendPositionChange;
    private onCaptionChange;
    protected _element: HTMLElement;
    get element(): HTMLElement;
    abstract get seriesRoot(): Node;
    protected _axes: ChartAxis[];
    set axes(values: ChartAxis[]);
    get axes(): ChartAxis[];
    protected attachAxis(axis: ChartAxis): void;
    protected detachAxis(axis: ChartAxis): void;
    protected _series: Series[];
    set series(values: Series[]);
    get series(): Series[];
    protected scheduleLayout(): void;
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
    protected set axesChanged(value: boolean);
    protected get axesChanged(): boolean;
    protected _seriesChanged: boolean;
    protected set seriesChanged(value: boolean);
    protected get seriesChanged(): boolean;
    protected layoutCallbackId: number;
    set layoutPending(value: boolean);
    /**
     * Only `true` while we are waiting for the layout to start.
     * This will be `false` if the layout has already started and is ongoing.
     */
    get layoutPending(): boolean;
    private readonly _performLayout;
    private dataCallbackId;
    set dataPending(value: boolean);
    get dataPending(): boolean;
    processData(): void;
    private nodeData;
    createNodeData(): void;
    placeLabels(): Map<Series, PlacedLabel[]>;
    private updateLegend;
    abstract performLayout(): void;
    private updateCallbackId;
    set updatePending(value: boolean);
    get updatePending(): boolean;
    update(): void;
    protected positionCaptions(): void;
    protected legendBBox: BBox;
    protected positionLegend(): void;
    private _onMouseDown;
    private _onMouseMove;
    private _onMouseUp;
    private _onMouseOut;
    private _onClick;
    protected setupDomListeners(chartElement: HTMLCanvasElement): void;
    protected cleanupDomListeners(chartElement: HTMLCanvasElement): void;
    protected seriesRect?: BBox;
    getSeriesRect(): Readonly<BBox | undefined>;
    private pickSeriesNode;
    lastPick?: {
        datum: SeriesNodeDatum;
        node?: Shape;
        event?: MouseEvent;
    };
    private pickClosestSeriesNodeDatum;
    protected onMouseMove(event: MouseEvent): void;
    protected handleTooltip(event: MouseEvent): void;
    protected onMouseDown(event: MouseEvent): void;
    protected onMouseUp(event: MouseEvent): void;
    protected onMouseOut(event: MouseEvent): void;
    protected onClick(event: MouseEvent): void;
    private checkSeriesNodeClick;
    private onSeriesNodeClick;
    private checkLegendClick;
    private pointerInsideLegend;
    private pointerOverLegendDatum;
    private handleLegendMouseMove;
    private onSeriesDatumPick;
    highlightedDatum?: SeriesNodeDatum;
    highlightDatum(datum: SeriesNodeDatum): void;
    dehighlightDatum(): void;
}
