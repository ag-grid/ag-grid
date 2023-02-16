import { Group } from '../../scene/group';
import { LegendDatum } from '../legendDatum';
import { Observable, TypedEvent } from '../../util/observable';
import { ChartAxis } from '../chartAxis';
import { PlacedLabel, PointLabelDatum } from '../../util/labelPlacement';
import { SizedPoint, Point } from '../../scene/point';
import { BBox } from '../../scene/bbox';
import { HighlightManager } from '../interaction/highlightManager';
import { ChartAxisDirection } from '../chartAxisDirection';
/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
    readonly series: Series<any>;
    readonly itemId?: any;
    readonly datum: any;
    readonly point?: Readonly<SizedPoint>;
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
export declare class SeriesNodeClickEvent<Datum extends {
    datum: any;
}> implements TypedEvent {
    readonly type = "nodeClick";
    readonly datum: any;
    readonly event: Event;
    readonly seriesId: string;
    private readonly _series;
    /** @deprecated */
    get series(): Series<SeriesNodeDataContext<SeriesNodeDatum, SeriesNodeDatum>>;
    constructor(nativeEvent: Event, datum: Datum, series: Series);
}
declare class SeriesItemHighlightStyle {
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
}
declare class SeriesHighlightStyle {
    strokeWidth?: number;
    dimOpacity?: number;
    enabled?: boolean;
}
declare class TextHighlightStyle {
    color?: string;
}
export declare class HighlightStyle {
    readonly item: SeriesItemHighlightStyle;
    readonly series: SeriesHighlightStyle;
    readonly text: TextHighlightStyle;
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
    protected static readonly highlightedZIndex = 1000000000000;
    readonly id: string;
    get type(): string;
    readonly rootGroup: Group;
    readonly contentGroup: Group;
    readonly highlightGroup: Group;
    readonly highlightNode: Group;
    readonly highlightLabel: Group;
    readonly labelGroup?: Group;
    chart?: {
        mode: 'standalone' | 'integrated';
        placeLabels(): Map<Series<any>, PlacedLabel[]>;
        getSeriesRect(): Readonly<BBox> | undefined;
    };
    highlightManager?: HighlightManager;
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;
    directions: ChartAxisDirection[];
    directionKeys: {
        [key in ChartAxisDirection]?: string[];
    };
    protected nodeDataRefresh: boolean;
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
    constructor({ useSeriesGroupLayer, useLabelLayer, pickModes, }?: {
        useSeriesGroupLayer?: boolean | undefined;
        useLabelLayer?: boolean | undefined;
        pickModes?: SeriesNodePickMode[] | undefined;
    });
    destroy(): void;
    set grouped(g: boolean);
    getKeys(direction: ChartAxisDirection): string[];
    abstract getDomain(direction: ChartAxisDirection): any[];
    abstract processData(): Promise<void>;
    abstract createNodeData(): Promise<C[]>;
    markNodeDataDirty(): void;
    visibleChanged(): void;
    abstract update(opts: {
        seriesRect?: BBox;
    }): Promise<void>;
    protected getOpacity(datum?: {
        itemId?: any;
    }): number;
    protected getStrokeWidth(defaultStrokeWidth: number, datum?: {
        itemId?: any;
    }): number;
    protected isItemIdHighlighted(datum?: {
        itemId?: any;
    }): 'highlighted' | 'other-highlighted' | 'peer-highlighted' | 'no-highlight';
    abstract getTooltipHtml(seriesDatum: any): string;
    pickNode(point: Point, limitPickModes?: SeriesNodePickMode[]): {
        pickMode: SeriesNodePickMode;
        match: SeriesNodeDatum;
        distance: number;
    } | undefined;
    protected pickNodeExactShape(point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeClosestDatum(_point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeMainAxisFirst(_point: Point, _requireCategoryAxis: boolean): SeriesNodePickMatch | undefined;
    abstract getLabelData(): PointLabelDatum[];
    fireNodeClickEvent(event: Event, _datum: C['nodeData'][number]): void;
    protected getNodeClickEvent(event: Event, datum: SeriesNodeDatum): SeriesNodeClickEvent<any>;
    /**
     * @private
     * Returns an array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     */
    abstract getLegendData(): LegendDatum[];
    toggleSeriesItem(_itemId: any, enabled: boolean): void;
    isEnabled(): boolean;
    readonly highlightStyle: HighlightStyle;
    protected fixNumericExtent(extent?: [number | Date, number | Date], axis?: ChartAxis): number[];
}
export {};
