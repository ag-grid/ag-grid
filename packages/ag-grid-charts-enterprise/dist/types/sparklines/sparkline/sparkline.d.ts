import { HighlightStyleOptions } from 'ag-grid-community';
import { _Scale, _Scene, _Util } from 'ag-charts-community';
import { SparklineFactoryOptions } from './agSparkline';
import { SparklineTooltip } from './tooltip/sparklineTooltip';
/**
 * Constants to declare the expected nominal zIndex for nodes in a sparkline rendering.
 */
export declare enum ZINDICIES {
    SERIES_FILL_ZINDEX = 50,
    AXIS_LINE_ZINDEX = 500,
    SERIES_STROKE_ZINDEX = 1000,
    SERIES_LABEL_ZINDEX = 1500,
    CROSSHAIR_ZINDEX = 2000,
    SERIES_MARKERS_ZINDEX = 2500
}
export interface SeriesNodeDatum {
    readonly seriesDatum: any;
    readonly point?: Point;
}
export interface Point {
    readonly x: number;
    readonly y: number;
}
interface SeriesRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
type Container = HTMLElement | undefined | null;
type Data = any[] | undefined | null;
type DataType = 'number' | 'array' | 'object' | undefined;
type AxisType = 'number' | 'category' | 'time';
type ScaleType = _Scale.LinearScale | _Scale.TimeScale | _Scale.BandScale<string>;
export declare class SparklineAxis {
    type?: AxisType;
    stroke: string;
    strokeWidth: number;
}
export declare abstract class Sparkline {
    readonly id: string;
    processedOptions?: SparklineFactoryOptions;
    readonly scene: _Scene.Scene;
    readonly canvasElement: HTMLCanvasElement;
    readonly rootGroup: _Scene.Group;
    tooltip: SparklineTooltip;
    private static tooltipDocuments;
    private mouseMoveEvent;
    protected seriesRect: SeriesRect;
    private _context;
    set context(value: {
        data: any;
    } | undefined);
    get context(): {
        data: any;
    } | undefined;
    private _container;
    set container(value: Container);
    get container(): Container;
    private _data;
    set data(value: Data);
    get data(): Data;
    padding: _Util.Padding;
    xKey: string;
    yKey: string;
    protected dataType: DataType;
    protected xData: any[];
    protected yData: (number | undefined)[];
    protected min: number | undefined;
    protected max: number | undefined;
    protected xScale: any;
    protected yScale: _Scale.LinearScale;
    readonly axis: SparklineAxis;
    readonly highlightStyle: HighlightStyleOptions;
    protected constructor();
    private resizeAndSetDimensions;
    private initialiseTooltipStyles;
    private _width;
    set width(value: number);
    get width(): number;
    private _height;
    set height(value: number);
    get height(): number;
    /**
     * Generate node data from processed data.
     * Produce data joins.
     * Update selection's nodes using node data.
     */
    protected update(): void;
    protected updateYScale(): void;
    protected updateYScaleDomain(): void;
    protected updateYScaleRange(): void;
    protected updateXScale(): void;
    protected updateXScaleRange(): void;
    protected updateXScaleDomain(): void;
    /**
     * Return xScale instance based on the provided type or return a `BandScale` by default.
     * The default type is `category`.
     * @param type
     */
    protected getXScale(type?: AxisType): ScaleType;
    protected updateAxisLine(): void;
    protected updateAxes(): void;
    protected updateCrosshairs(): void;
    protected generateNodeData(): {
        nodeData: SeriesNodeDatum[];
        fillData: SeriesNodeDatum[];
        strokeData: SeriesNodeDatum[];
    } | SeriesNodeDatum[] | undefined;
    protected getNodeData(): readonly SeriesNodeDatum[];
    protected updateNodes(): void;
    protected updateXCrosshairLine(): void;
    protected updateYCrosshairLine(): void;
    protected highlightedDatum?: SeriesNodeDatum;
    protected highlightDatum(closestDatum: SeriesNodeDatum): void;
    protected dehighlightDatum(): void;
    abstract getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
    /**
     * Highlight closest datum and display tooltip if enabled.
     * Only update if necessary, i.e. only update if the highlighted datum is different from previously highlighted datum,
     * or if there is no previously highlighted datum.
     * @param event
     */
    private onMouseMove;
    private updateHitPoint;
    /**
     * Dehighlight all nodes and remove tooltip.
     * @param event
     */
    private onMouseOut;
    protected smallestInterval?: {
        x: number;
        y: number;
    };
    private processData;
    /**
     * Return the type of data provided to the sparkline based on the first truthy value in the data array.
     * If the value is not a number, array or object, return `undefined`.
     * @param data
     */
    private getDataType;
    /**
     * Return the given value depending on the type of axis.
     * Return `undefined` if the value is invalid for the given axis type.
     * @param value
     */
    private getDatum;
    private layoutId;
    /**
     * Only `true` while we are waiting for the layout to start.
     * This will be `false` if the layout has already started and is ongoing.
     */
    get layoutScheduled(): boolean;
    /**
     * Execute update method on the next available screen repaint to make changes to the canvas.
     * If we are waiting for a layout to start and a new layout is requested,
     * cancel the previous layout using the non 0 integer (this.layoutId) returned from requestAnimationFrame.
     */
    protected scheduleLayout(): void;
    private immediateLayout;
    private setSparklineDimensions;
    /**
     * Return the closest data point to x/y canvas coordinates.
     * @param x
     * @param y
     */
    private pickClosestSeriesNodeDatum;
    /**
     * Return the relevant distance between two points.
     * The distance will be calculated based on the x value of the points for all sparklines except bar sparkline, where the distance is based on the y values.
     * @param x
     * @param y
     */
    protected getDistance(p1: Point, p2: Point): number;
    /**
     * calculate x/y coordinates for tooltip based on coordinates of highlighted datum, position of canvas and page offset.
     * @param datum
     */
    private handleTooltip;
    protected formatNumericDatum(datum: number): string;
    private defaultDateFormatter;
    protected formatDatum(datum: any): string;
    private _onMouseMove;
    private _onMouseOut;
    private setupDomEventListeners;
    private cleanupDomEventListeners;
    private invalidData;
    /**
     * Cleanup and remove canvas element from the DOM.
     */
    destroy(): void;
}
export {};
