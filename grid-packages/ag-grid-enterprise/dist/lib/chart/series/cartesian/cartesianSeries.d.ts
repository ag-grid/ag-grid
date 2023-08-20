import type { SeriesNodeDataContext, SeriesNodeDatum, SeriesNodePickMode, SeriesNodePickMatch } from '../series';
import { Series, SeriesNodeBaseClickEvent } from '../series';
import type { ChartAxis } from '../../chartAxis';
import { SeriesMarker } from '../seriesMarker';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import type { Marker } from '../../marker/marker';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import type { Node, ZIndexSubOrder } from '../../../scene/node';
import type { PointLabelDatum } from '../../../util/labelPlacement';
import type { Point } from '../../../scene/point';
import type { BBox } from '../../../scene/bbox';
import type { AgCartesianSeriesMarkerFormatterParams, AgCartesianSeriesMarkerFormat } from '../../agChartOptions';
import type { DataModel, ProcessedData } from '../../data/dataModel';
import type { LegendItemClickChartEvent, LegendItemDoubleClickChartEvent } from '../../interaction/chartEventManager';
import { StateMachine } from '../../../motion/states';
import type { ModuleContext } from '../../../util/moduleContext';
declare type NodeDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<N, ContextType['nodeData'][number]>;
declare type LabelDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<N, ContextType['labelData'][number]>;
export interface CartesianSeriesNodeDatum extends SeriesNodeDatum {
    readonly xKey: string;
    readonly yKey: string;
    readonly xValue: any;
    readonly yValue: any;
}
interface SeriesOpts {
    pathsPerSeries: number;
    pathsZIndexSubOrderOffset: number[];
    hasMarkers: boolean;
    hasHighlightedLabels: boolean;
}
export declare class CartesianSeriesNodeBaseClickEvent<Datum extends {
    datum: any;
}> extends SeriesNodeBaseClickEvent<Datum> {
    readonly xKey: string;
    readonly yKey: string;
    constructor(xKey: string, yKey: string, nativeEvent: MouseEvent, datum: Datum, series: Series<any>);
}
export declare class CartesianSeriesNodeClickEvent<Datum extends {
    datum: any;
}> extends CartesianSeriesNodeBaseClickEvent<Datum> {
    readonly type = "nodeClick";
}
export declare class CartesianSeriesNodeDoubleClickEvent<Datum extends {
    datum: any;
}> extends CartesianSeriesNodeBaseClickEvent<Datum> {
    readonly type = "nodeDoubleClick";
}
declare type CartesianAnimationState = 'empty' | 'ready' | 'waiting';
declare type CartesianAnimationEvent = 'update' | 'updateData' | 'highlight' | 'highlightMarkers' | 'resize';
declare class CartesianStateMachine extends StateMachine<CartesianAnimationState, CartesianAnimationEvent> {
}
export declare abstract class CartesianSeries<C extends SeriesNodeDataContext<any, any>, N extends Node = Group> extends Series<C> {
    legendItemName?: string;
    private _contextNodeData;
    get contextNodeData(): C[];
    private nodeDataDependencies;
    private highlightSelection;
    private highlightLabelSelection;
    private subGroups;
    private subGroupId;
    private readonly opts;
    protected animationState: CartesianStateMachine;
    protected datumSelectionGarbageCollection: boolean;
    protected dataModel?: DataModel<any, any, any>;
    protected processedData?: ProcessedData<any>;
    protected constructor(opts: Partial<SeriesOpts> & {
        moduleCtx: ModuleContext;
        pickModes?: SeriesNodePickMode[];
    });
    addChartEventListeners(): void;
    destroy(): void;
    /**
     * Note: we are passing `isContinuousX` and `isContinuousY` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param x A domain value to be plotted along the x-axis.
     * @param y A domain value to be plotted along the y-axis.
     * @param isContinuousX Typically this will be the value of `xAxis.scale instanceof ContinuousScale`.
     * @param isContinuousY Typically this will be the value of `yAxis.scale instanceof ContinuousScale`.
     * @returns `[x, y]`, if both x and y are valid domain values for their respective axes/scales, or `undefined`.
     */
    protected checkDomainXY<T, K>(x: T, y: K, isContinuousX: boolean, isContinuousY: boolean): [T, K] | undefined;
    /**
     * Note: we are passing the xAxis and yAxis because the calling code is supposed to make sure
     *       that series has both of them defined, and also to avoid one level of indirection,
     *       e.g. `this.xAxis!.inRange(x)`, both of which are suboptimal in tight loops where this method is used.
     * @param x A range value to be plotted along the x-axis.
     * @param y A range value to be plotted along the y-axis.
     * @param xAxis The series' x-axis.
     * @param yAxis The series' y-axis.
     * @returns
     */
    protected checkRangeXY(x: number, y: number, xAxis: ChartAxis, yAxis: ChartAxis): boolean;
    update({ seriesRect }: {
        seriesRect?: BBox;
    }): Promise<void>;
    protected updateSelections(seriesHighlighted: boolean | undefined, anySeriesItemEnabled: boolean): Promise<void>;
    private updateSeriesGroupSelections;
    protected nodeFactory(): Node;
    protected markerFactory(): Marker;
    private updateSeriesGroups;
    getGroupZIndexSubOrder(type: 'data' | 'labels' | 'highlight' | 'path' | 'marker' | 'paths', subIndex?: number): ZIndexSubOrder;
    protected updateNodes(seriesHighlighted: boolean | undefined, anySeriesItemEnabled: boolean): Promise<void>;
    protected updateHighlightSelection(seriesHighlighted?: boolean): Promise<void>;
    protected pickNodeExactShape(point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeClosestDatum(point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeMainAxisFirst(point: Point, requireCategoryAxis: boolean): {
        datum: CartesianSeriesNodeDatum;
        distance: number;
    } | undefined;
    onLegendItemClick(event: LegendItemClickChartEvent): void;
    onLegendItemDoubleClick(event: LegendItemDoubleClickChartEvent): void;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    protected updateHighlightSelectionItem(opts: {
        item?: C['nodeData'][number];
        highlightSelection: NodeDataSelection<N, C>;
    }): Promise<NodeDataSelection<N, C>>;
    protected updateHighlightSelectionLabel(opts: {
        item?: C['labelData'][number];
        highlightLabelSelection: LabelDataSelection<Text, C>;
    }): Promise<LabelDataSelection<Text, C>>;
    protected updateDatumSelection(opts: {
        nodeData: C['nodeData'];
        datumSelection: NodeDataSelection<N, C>;
        seriesIdx: number;
    }): Promise<NodeDataSelection<N, C>>;
    protected updateDatumNodes(_opts: {
        datumSelection: NodeDataSelection<N, C>;
        isHighlight: boolean;
        seriesIdx: number;
    }): Promise<void>;
    protected updateMarkerSelection(opts: {
        nodeData: C['nodeData'];
        markerSelection: NodeDataSelection<Marker, C>;
        seriesIdx: number;
    }): Promise<NodeDataSelection<Marker, C>>;
    protected updateMarkerNodes(_opts: {
        markerSelection: NodeDataSelection<Marker, C>;
        isHighlight: boolean;
        seriesIdx: number;
    }): Promise<void>;
    protected animateEmptyUpdateReady(_data: {
        datumSelections: Array<NodeDataSelection<N, C>>;
        markerSelections: Array<NodeDataSelection<Marker, C>>;
        labelSelections: Array<LabelDataSelection<Text, C>>;
        contextData: Array<C>;
        paths: Array<Array<Path>>;
        seriesRect?: BBox;
    }): void;
    protected animateReadyUpdate(_data: {
        datumSelections: Array<NodeDataSelection<N, C>>;
        markerSelections: Array<NodeDataSelection<Marker, C>>;
        contextData: Array<C>;
        paths: Array<Array<Path>>;
        seriesRect?: BBox;
    }): void;
    protected animateWaitingUpdateReady(_data: {
        datumSelections: Array<NodeDataSelection<N, C>>;
    }): void;
    protected animateReadyHighlight(_data: NodeDataSelection<N, C>): void;
    protected animateReadyHighlightMarkers(_data: NodeDataSelection<Marker, C>): void;
    protected animateReadyResize(_data: {
        datumSelections: Array<NodeDataSelection<N, C>>;
        markerSelections: Array<NodeDataSelection<Marker, C>>;
        contextData: Array<C>;
        paths: Array<Array<Path>>;
    }): void;
    protected abstract updateLabelSelection(opts: {
        labelData: C['labelData'];
        labelSelection: LabelDataSelection<Text, C>;
        seriesIdx: number;
    }): Promise<LabelDataSelection<Text, C>>;
    protected abstract updateLabelNodes(opts: {
        labelSelection: LabelDataSelection<Text, C>;
        seriesIdx: number;
    }): Promise<void>;
    protected abstract isLabelEnabled(): boolean;
}
export declare class CartesianSeriesMarker extends SeriesMarker {
    formatter?: (params: AgCartesianSeriesMarkerFormatterParams<any>) => AgCartesianSeriesMarkerFormat;
}
export {};
//# sourceMappingURL=cartesianSeries.d.ts.map