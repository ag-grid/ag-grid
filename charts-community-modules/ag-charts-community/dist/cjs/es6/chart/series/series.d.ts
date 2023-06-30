import { Group } from '../../scene/group';
import { ChartLegendDatum } from '../legendDatum';
import { Observable, TypedEvent } from '../../util/observable';
import { ChartAxis } from '../chartAxis';
import { PlacedLabel, PointLabelDatum } from '../../util/labelPlacement';
import { SizedPoint, Point } from '../../scene/point';
import { BBox } from '../../scene/bbox';
import { AnimationManager } from '../interaction/animationManager';
import { ChartEventManager } from '../interaction/chartEventManager';
import { HighlightManager } from '../interaction/highlightManager';
import { ChartAxisDirection } from '../chartAxisDirection';
import { AgChartInteractionRange } from '../agChartOptions';
import { DatumPropertyDefinition } from '../data/dataModel';
import { TooltipPosition } from '../tooltip/tooltip';
import { ModuleContext } from '../../util/module';
/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
    readonly series: Series<any>;
    readonly itemId?: any;
    readonly datum: any;
    readonly point?: Readonly<SizedPoint>;
    nodeMidPoint?: Readonly<Point>;
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
export declare function keyProperty<K>(propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare function valueProperty<K>(propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare function rangedValueProperty<K>(propName: K, opts?: Partial<DatumPropertyDefinition<K>> & {
    min?: number | undefined;
    max?: number | undefined;
}): DatumPropertyDefinition<K>;
export declare function accumulativeValueProperty<K>(propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare function trailingAccumulatedValueProperty<K>(propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare class SeriesNodeBaseClickEvent<Datum extends {
    datum: any;
}> implements TypedEvent {
    readonly type: 'nodeClick' | 'nodeDoubleClick';
    readonly datum: any;
    readonly event: Event;
    readonly seriesId: string;
    constructor(nativeEvent: Event, datum: Datum, series: Series);
}
export declare class SeriesNodeClickEvent<Datum extends {
    datum: any;
}> extends SeriesNodeBaseClickEvent<Datum> {
}
export declare class SeriesNodeDoubleClickEvent<Datum extends {
    datum: any;
}> extends SeriesNodeBaseClickEvent<Datum> {
    readonly type = "nodeDoubleClick";
}
export declare class SeriesItemHighlightStyle {
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
    showArrow?: boolean;
    interaction?: SeriesTooltipInteraction;
    readonly position: TooltipPosition;
}
export declare class SeriesTooltipInteraction {
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
    animationManager?: AnimationManager;
    chartEventManager?: ChartEventManager;
    highlightManager?: HighlightManager;
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;
    directions: ChartAxisDirection[];
    private directionKeys;
    private directionNames;
    protected nodeDataRefresh: boolean;
    abstract tooltip: SeriesTooltip;
    protected _data?: any[];
    set data(input: any[] | undefined);
    get data(): any[] | undefined;
    hasData(): boolean | undefined;
    protected _visible: boolean;
    set visible(value: boolean);
    get visible(): boolean;
    showInLegend: boolean;
    pickModes: SeriesNodePickMode[];
    cursor: string;
    nodeClickRange: AgChartInteractionRange;
    getBandScalePadding(): {
        inner: number;
        outer: number;
    };
    _declarationOrder: number;
    protected readonly ctx: ModuleContext;
    constructor(opts: {
        moduleCtx: ModuleContext;
        useSeriesGroupLayer?: boolean;
        useLabelLayer?: boolean;
        pickModes?: SeriesNodePickMode[];
        directionKeys?: {
            [key in ChartAxisDirection]?: string[];
        };
        directionNames?: {
            [key in ChartAxisDirection]?: string[];
        };
    });
    addChartEventListeners(): void;
    destroy(): void;
    private getDirectionValues;
    getKeys(direction: ChartAxisDirection): string[];
    getNames(direction: ChartAxisDirection): (string | undefined)[];
    protected resolveKeyDirection(direction: ChartAxisDirection): ChartAxisDirection;
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
    fireNodeDoubleClickEvent(event: Event, _datum: C['nodeData'][number]): void;
    protected getNodeClickEvent(event: Event, datum: SeriesNodeDatum): SeriesNodeClickEvent<any>;
    protected getNodeDoubleClickEvent(event: Event, datum: SeriesNodeDatum): SeriesNodeDoubleClickEvent<any>;
    abstract getLegendData(): ChartLegendDatum[];
    protected toggleSeriesItem(_itemId: any, enabled: boolean): void;
    isEnabled(): boolean;
    readonly highlightStyle: HighlightStyle;
    protected fixNumericExtent(extent?: [number | Date, number | Date], axis?: ChartAxis): number[];
}
export {};
//# sourceMappingURL=series.d.ts.map