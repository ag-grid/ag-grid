import type { ModuleContext, SeriesContext } from '../../module/moduleContext';
import type { ModuleContextInitialiser } from '../../module/moduleMap';
import { ModuleMap } from '../../module/moduleMap';
import type { SeriesOptionInstance, SeriesOptionModule } from '../../module/optionModules';
import type { AgChartLabelFormatterParams, AgChartLabelOptions } from '../../options/chart/labelOptions';
import type { InteractionRange } from '../../options/chart/types';
import type { AgSeriesMarkerFormatterParams, AgSeriesMarkerStyle, ISeriesMarker } from '../../options/series/markerOptions';
import type { BBox } from '../../scene/bbox';
import { Group } from '../../scene/group';
import type { ZIndexSubOrder } from '../../scene/node';
import type { Point } from '../../scene/point';
import type { PlacedLabel, PointLabelDatum } from '../../util/labelPlacement';
import type { TypedEvent } from '../../util/observable';
import { Observable } from '../../util/observable';
import type { ChartAxis } from '../chartAxis';
import { ChartAxisDirection } from '../chartAxisDirection';
import type { ChartMode } from '../chartMode';
import type { DataController } from '../data/dataController';
import type { DatumPropertyDefinition, ScopeProvider } from '../data/dataModel';
import type { ChartLegendDatum, ChartLegendType } from '../legendDatum';
import type { Marker } from '../marker/marker';
import type { BaseSeriesEvent, SeriesEventType } from './seriesEvents';
import type { SeriesGroupZIndexSubOrderType } from './seriesLayerManager';
import type { SeriesGrouping } from './seriesStateManager';
import type { SeriesTooltip } from './seriesTooltip';
import type { ISeries, SeriesNodeDatum } from './seriesTypes';
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
export type SeriesNodePickMatch = {
    datum: SeriesNodeDatum;
    distance: number;
};
export declare function keyProperty<K>(scope: ScopeProvider, propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare function valueProperty<K>(scope: ScopeProvider, propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare function rangedValueProperty<K>(scope: ScopeProvider, propName: K, opts?: Partial<DatumPropertyDefinition<K>> & {
    min?: number;
    max?: number;
}): DatumPropertyDefinition<K>;
export declare function trailingValueProperty<K>(scope: ScopeProvider, propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare function trailingValue(): DatumPropertyDefinition<any>['processor'];
export declare function accumulativeValueProperty<K>(scope: ScopeProvider, propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>> & {
    onlyPositive?: boolean;
}): DatumPropertyDefinition<K>;
export declare function trailingAccumulatedValueProperty<K>(scope: ScopeProvider, propName: K, continuous: boolean, opts?: Partial<DatumPropertyDefinition<K>>): DatumPropertyDefinition<K>;
export declare function groupAccumulativeValueProperty<K>(scope: ScopeProvider, propName: K, continuous: boolean, mode: 'normal' | 'trailing' | 'window' | 'window-trailing', sum: "current" | "last" | undefined, opts: Partial<DatumPropertyDefinition<K>> & {
    groupId: string;
}): (DatumPropertyDefinition<K> | import("../data/dataModel").GroupValueProcessorDefinition<any, any>)[];
export type SeriesNodeEventTypes = 'nodeClick' | 'nodeDoubleClick';
interface INodeClickEvent<TEvent extends string = SeriesNodeEventTypes> extends TypedEvent {
    readonly type: TEvent;
    readonly event: MouseEvent;
    readonly datum: unknown;
    readonly seriesId: string;
}
export interface INodeClickEventConstructor<TDatum extends SeriesNodeDatum, TSeries extends Series<TDatum, any>, TEvent extends string = SeriesNodeEventTypes> {
    new (type: TEvent, event: MouseEvent, { datum }: TDatum, series: TSeries): INodeClickEvent<TEvent>;
}
export declare class SeriesNodeClickEvent<TDatum extends SeriesNodeDatum, TEvent extends string = SeriesNodeEventTypes> implements INodeClickEvent<TEvent> {
    readonly type: TEvent;
    readonly event: MouseEvent;
    readonly datum: unknown;
    readonly seriesId: string;
    constructor(type: TEvent, event: MouseEvent, { datum }: TDatum, series: Series<TDatum, any>);
}
export declare class SeriesItemHighlightStyle {
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    lineDash?: number[];
    lineDashOffset?: number;
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
export type SeriesNodeDataContext<S = SeriesNodeDatum, L = S> = {
    itemId: string;
    nodeData: S[];
    labelData: L[];
};
declare enum SeriesHighlight {
    None = 0,
    This = 1,
    Other = 2
}
export type SeriesModuleMap = ModuleMap<SeriesOptionModule, SeriesContext, SeriesOptionInstance>;
export declare abstract class Series<TDatum extends SeriesNodeDatum, TLabel = TDatum, TContext extends SeriesNodeDataContext<TDatum, TLabel> = SeriesNodeDataContext<TDatum, TLabel>> extends Observable implements ISeries<TDatum>, ModuleContextInitialiser<SeriesContext> {
    protected static readonly highlightedZIndex = 1000000000000;
    protected readonly NodeClickEvent: INodeClickEventConstructor<TDatum, any>;
    readonly id: string;
    readonly canHaveAxes: boolean;
    get type(): string;
    readonly rootGroup: Group;
    readonly contentGroup: Group;
    readonly highlightGroup: Group;
    readonly highlightNode: Group;
    readonly highlightLabel: Group;
    readonly labelGroup: Group;
    readonly annotationGroup: Group;
    chart?: {
        mode: ChartMode;
        placeLabels(): Map<Series<any>, PlacedLabel[]>;
        seriesRect?: BBox;
    };
    axes: Record<ChartAxisDirection, ChartAxis | undefined>;
    directions: ChartAxisDirection[];
    private readonly directionKeys;
    private readonly directionNames;
    protected nodeDataRefresh: boolean;
    abstract tooltip: SeriesTooltip<any>;
    protected _data?: any[];
    protected _chartData?: any[];
    set data(input: any[] | undefined);
    get data(): any[] | undefined;
    protected onDataChange(): void;
    setChartData(input: unknown[]): void;
    hasData(): boolean | undefined;
    protected _visible: boolean;
    set visible(value: boolean);
    get visible(): boolean;
    showInLegend: boolean;
    pickModes: SeriesNodePickMode[];
    cursor: string;
    nodeClickRange: InteractionRange;
    seriesGrouping?: SeriesGrouping;
    private onSeriesGroupingChange;
    getBandScalePadding(): {
        inner: number;
        outer: number;
    };
    _declarationOrder: number;
    protected readonly ctx: ModuleContext;
    constructor(seriesOpts: {
        moduleCtx: ModuleContext;
        useSeriesGroupLayer?: boolean;
        useLabelLayer?: boolean;
        pickModes?: SeriesNodePickMode[];
        contentGroupVirtual?: boolean;
        directionKeys?: {
            [key in ChartAxisDirection]?: string[];
        };
        directionNames?: {
            [key in ChartAxisDirection]?: string[];
        };
        canHaveAxes?: boolean;
    });
    getGroupZIndexSubOrder(type: SeriesGroupZIndexSubOrderType, subIndex?: number): ZIndexSubOrder;
    private seriesListeners;
    addListener<T extends SeriesEventType, E extends BaseSeriesEvent<T>, R = void>(type: T, listener: (event: E) => R): () => void;
    protected dispatch<T extends SeriesEventType, E extends BaseSeriesEvent<T>, R>(type: T, event: E): R[] | undefined;
    addChartEventListeners(): void;
    destroy(): void;
    private getDirectionValues;
    getKeys(direction: ChartAxisDirection): string[];
    getNames(direction: ChartAxisDirection): (string | undefined)[];
    protected resolveKeyDirection(direction: ChartAxisDirection): ChartAxisDirection;
    getDomain(direction: ChartAxisDirection): any[];
    abstract getSeriesDomain(direction: ChartAxisDirection): any[];
    abstract processData(dataController: DataController): Promise<void>;
    abstract createNodeData(): Promise<TContext[]>;
    markNodeDataDirty(): void;
    visibleChanged(): void;
    abstract update(opts: {
        seriesRect?: BBox;
    }): Promise<void>;
    getOpacity(): number;
    protected getStrokeWidth(defaultStrokeWidth: number): number;
    protected isItemIdHighlighted(): SeriesHighlight;
    protected getModuleTooltipParams(datum: object): object;
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
    fireNodeClickEvent(event: MouseEvent, datum: TDatum): void;
    fireNodeDoubleClickEvent(event: MouseEvent, datum: TDatum): void;
    abstract getLegendData<T extends ChartLegendType>(legendType: T): ChartLegendDatum<T>[];
    abstract getLegendData(legendType: ChartLegendType): ChartLegendDatum<ChartLegendType>[];
    protected toggleSeriesItem(itemId: any, enabled: boolean): void;
    isEnabled(): boolean;
    readonly highlightStyle: HighlightStyle;
    protected readonly moduleMap: SeriesModuleMap;
    getModuleMap(): SeriesModuleMap;
    createModuleContext(): SeriesContext;
    protected getLabelText<TParams>(label: AgChartLabelOptions<any, TParams>, params: TParams & Omit<AgChartLabelFormatterParams<any>, 'seriesId'>, defaultFormatter?: (value: any) => string): string;
    protected getMarkerStyle<TParams>(marker: ISeriesMarker<TDatum, TParams>, params: TParams & Omit<AgSeriesMarkerFormatterParams<TDatum['datum']>, 'seriesId'>, defaultStyle?: AgSeriesMarkerStyle): AgSeriesMarkerStyle & {
        size: any;
    };
    protected updateMarkerStyle<TParams>(markerNode: Marker, marker: ISeriesMarker<TDatum, TParams>, params: TParams & Omit<AgSeriesMarkerFormatterParams<TDatum['datum']>, 'seriesId'>, defaultStyle?: AgSeriesMarkerStyle, { applyTranslation }?: {
        applyTranslation?: boolean | undefined;
    }): void;
    getMinRect(): BBox | undefined;
    protected nodeDataDependencies: {
        seriesRectWidth?: number;
        seriesRectHeight?: number;
    };
    protected checkResize(newSeriesRect?: BBox): boolean;
}
export {};
