import { Group } from '../../scene/group';
import { LegendDatum } from '../legend';
import { Observable } from '../../util/observable';
import { ChartAxis, ChartAxisDirection } from '../chartAxis';
import { Chart } from '../chart';
import { Label } from '../label';
import { PointLabelDatum } from '../../util/labelPlacement';
/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
    readonly series: Series<any>;
    readonly itemId?: any;
    readonly datum: any;
    readonly point?: {
        readonly x: number;
        readonly y: number;
    };
}
/** Modes of matching user interactions to rendered nodes (e.g. hover or click) */
export declare enum SeriesNodePickMode {
    /** Pick matches based upon pick coordinates being inside a matching shape/marker. */
    EXACT_SHAPE_MATCH = 0,
    /** Pick matches by nearest category/X-axis value, then distance within that category/X-value. */
    NEAREST_BY_MAIN_AXIS_FIRST = 1,
    /** Pick matches by nearest category value, then distance within that category. */
    NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST = 2,
    /** Pick matches based upon distance to ideal position */
    NEAREST_NODE = 3
}
export declare type SeriesNodePickMatch = {
    datum: SeriesNodeDatum;
    distance: number;
};
export interface TooltipRendererParams {
    readonly datum: any;
    readonly title?: string;
    readonly color?: string;
}
export interface CartesianTooltipRendererParams extends TooltipRendererParams {
    readonly xKey: string;
    readonly xValue: any;
    readonly xName?: string;
    readonly yKey: string;
    readonly yValue: any;
    readonly yName?: string;
}
export interface PolarTooltipRendererParams extends TooltipRendererParams {
    readonly angleKey: string;
    readonly angleValue: any;
    readonly angleName?: string;
    readonly radiusKey?: string;
    readonly radiusValue?: any;
    readonly radiusName?: string;
}
export declare class SeriesItemHighlightStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export declare class SeriesHighlightStyle {
    strokeWidth?: number;
    dimOpacity?: number;
    enabled?: boolean;
}
export declare class HighlightStyle {
    /**
     * @deprecated Use item.fill instead.
     */
    fill?: string;
    /**
     * @deprecated Use item.stroke instead.
     */
    stroke?: string;
    /**
     * @deprecated Use item.strokeWidth instead.
     */
    strokeWidth?: number;
    readonly item: SeriesItemHighlightStyle;
    readonly series: SeriesHighlightStyle;
}
export declare class SeriesTooltip {
    enabled: boolean;
}
export declare type SeriesNodeDataContext<S = SeriesNodeDatum, L = S> = {
    itemId: string;
    nodeData: S[];
    labelData: L[];
};
export declare abstract class Series<C extends SeriesNodeDataContext = SeriesNodeDataContext> extends Observable {
    static readonly SERIES_LAYER_ZINDEX = 100;
    protected static readonly highlightedZIndex = 1000000000000;
    protected static readonly SERIES_MARKER_LAYER_ZINDEX = 110;
    static readonly SERIES_HIGHLIGHT_LAYER_ZINDEX = 150;
    readonly id: string;
    get type(): string;
    readonly group: Group;
    readonly seriesGroup: Group;
    readonly highlightGroup: Group;
    readonly highlightNode: Group;
    readonly highlightLabel: Group;
    readonly pickGroup: Group;
    chart?: Chart;
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;
    directions: ChartAxisDirection[];
    directionKeys: {
        [key in ChartAxisDirection]?: string[];
    };
    protected nodeDataRefresh: boolean;
    readonly label: Label;
    abstract tooltip: SeriesTooltip;
    protected _data?: any[];
    set data(input: any[] | undefined);
    get data(): any[] | undefined;
    protected _visible: boolean;
    set visible(value: boolean);
    get visible(): boolean;
    showInLegend: boolean;
    pickModes: SeriesNodePickMode[];
    cursor: string;
    constructor({ seriesGroupUsesLayer, pickModes }?: {
        seriesGroupUsesLayer?: boolean | undefined;
        pickModes?: SeriesNodePickMode[] | undefined;
    });
    set grouped(g: boolean);
    setColors(_fills: string[], _strokes: string[]): void;
    getKeys(direction: ChartAxisDirection): string[];
    abstract getDomain(direction: ChartAxisDirection): any[];
    abstract processData(): void;
    abstract createNodeData(): C[];
    markNodeDataDirty(): void;
    visibleChanged(): void;
    abstract update(): void;
    protected getOpacity(datum?: {
        itemId?: any;
    }): number;
    protected getStrokeWidth(defaultStrokeWidth: number, datum?: {
        itemId?: any;
    }): number;
    protected getZIndex(datum?: {
        itemId?: any;
    }): number;
    protected isItemIdHighlighted(datum?: {
        itemId?: any;
    }): 'highlighted' | 'other-highlighted' | 'no-highlight';
    abstract getTooltipHtml(seriesDatum: any): string;
    pickNode(x: number, y: number, limitPickModes?: SeriesNodePickMode[]): {
        pickMode: SeriesNodePickMode;
        match: SeriesNodeDatum;
        distance: number;
    } | undefined;
    protected pickNodeExactShape(x: number, y: number): SeriesNodePickMatch | undefined;
    protected pickNodeClosestDatum(_x: number, _y: number): SeriesNodePickMatch | undefined;
    protected pickNodeMainAxisFirst(_x: number, _y: number, _requireCategoryAxis: boolean): SeriesNodePickMatch | undefined;
    abstract getLabelData(): PointLabelDatum[];
    fireNodeClickEvent(_event: MouseEvent, _datum: C['nodeData'][number]): void;
    /**
     * @private
     * Populates the given {@param data} array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     * @param data
     */
    abstract listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(_itemId: any, enabled: boolean): void;
    readonly highlightStyle: HighlightStyle;
    protected fixNumericExtent(extent?: [number | Date, number | Date], axis?: ChartAxis): number[];
}
