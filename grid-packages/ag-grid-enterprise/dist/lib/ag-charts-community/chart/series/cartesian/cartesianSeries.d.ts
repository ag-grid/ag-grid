import type { AnimationValue } from '../../../motion/animation';
import { StateMachine } from '../../../motion/states';
import { BBox } from '../../../scene/bbox';
import type { Node, NodeWithOpacity, ZIndexSubOrder } from '../../../scene/node';
import type { Point } from '../../../scene/point';
import { Selection } from '../../../scene/selection';
import { Path } from '../../../scene/shape/path';
import { Text } from '../../../scene/shape/text';
import type { PointLabelDatum } from '../../../scene/util/labelPlacement';
import type { ChartAnimationPhase } from '../../chartAnimationPhase';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { LegendItemClickChartEvent, LegendItemDoubleClickChartEvent } from '../../interaction/chartEventManager';
import type { Marker } from '../../marker/marker';
import { DataModelSeries } from '../dataModelSeries';
import type { Series, SeriesNodeDataContext, SeriesNodeEventTypes, SeriesNodePickMatch } from '../series';
import { SeriesNodeClickEvent } from '../series';
import type { SeriesGroupZIndexSubOrderType } from '../seriesLayerManager';
import { SeriesProperties } from '../seriesProperties';
import type { SeriesNodeDatum } from '../seriesTypes';
import type { Scaling } from './scaling';
export interface CartesianSeriesNodeDatum extends SeriesNodeDatum {
    readonly xKey: string;
    readonly yKey?: string;
    readonly xValue?: any;
    readonly yValue?: any;
}
interface SeriesOpts<TNode extends Node, TDatum extends CartesianSeriesNodeDatum, TLabel extends SeriesNodeDatum> {
    pathsPerSeries: number;
    pathsZIndexSubOrderOffset: number[];
    hasMarkers: boolean;
    hasHighlightedLabels: boolean;
    directionKeys: {
        [key in ChartAxisDirection]?: string[];
    };
    directionNames: {
        [key in ChartAxisDirection]?: string[];
    };
    datumSelectionGarbageCollection: boolean;
    markerSelectionGarbageCollection: boolean;
    animationAlwaysUpdateSelections: boolean;
    animationResetFns?: {
        path?: (path: Path) => Partial<Path>;
        datum?: (node: TNode, datum: TDatum) => AnimationValue & Partial<TNode>;
        label?: (node: Text, datum: TLabel) => AnimationValue & Partial<Text>;
        marker?: (node: Marker, datum: TDatum) => AnimationValue & Partial<Marker>;
    };
}
export declare class CartesianSeriesNodeClickEvent<TEvent extends string = SeriesNodeEventTypes> extends SeriesNodeClickEvent<SeriesNodeDatum, TEvent> {
    readonly xKey?: string;
    readonly yKey?: string;
    constructor(type: TEvent, nativeEvent: MouseEvent, datum: SeriesNodeDatum, series: Series<any, any> & {
        properties: {
            xKey?: string;
            yKey?: string;
        };
    });
}
type CartesianAnimationState = 'empty' | 'ready' | 'waiting' | 'clearing';
type CartesianAnimationEvent = 'update' | 'updateData' | 'highlight' | 'highlightMarkers' | 'resize' | 'clear' | 'reset' | 'skip';
export interface CartesianAnimationData<TNode extends Node, TDatum extends CartesianSeriesNodeDatum, TLabel extends SeriesNodeDatum = TDatum, TContext extends CartesianSeriesNodeDataContext<TDatum, TLabel> = CartesianSeriesNodeDataContext<TDatum, TLabel>> {
    datumSelections: Selection<TNode, TDatum>[];
    markerSelections: Selection<Marker, TDatum>[];
    labelSelections: Selection<Text, TLabel>[];
    annotationSelections: Selection<NodeWithOpacity, TDatum>[];
    contextData: TContext[];
    previousContextData?: TContext[];
    paths: Path[][];
    seriesRect?: BBox;
    duration?: number;
}
export declare abstract class CartesianSeriesProperties<T extends object> extends SeriesProperties<T> {
    legendItemName?: string;
}
export interface CartesianSeriesNodeDataContext<TDatum extends CartesianSeriesNodeDatum = CartesianSeriesNodeDatum, TLabel extends SeriesNodeDatum = TDatum> extends SeriesNodeDataContext<TDatum, TLabel> {
    scales: {
        [key in ChartAxisDirection]?: Scaling;
    };
    animationValid?: boolean;
    visible: boolean;
}
export declare abstract class CartesianSeries<TNode extends Node, TDatum extends CartesianSeriesNodeDatum, TLabel extends SeriesNodeDatum = TDatum, TContext extends CartesianSeriesNodeDataContext<TDatum, TLabel> = CartesianSeriesNodeDataContext<TDatum, TLabel>> extends DataModelSeries<TDatum, TLabel, TContext> {
    abstract properties: CartesianSeriesProperties<any>;
    private _contextNodeData;
    get contextNodeData(): TContext[];
    protected readonly NodeClickEvent: typeof CartesianSeriesNodeClickEvent;
    private highlightSelection;
    private highlightLabelSelection;
    annotationSelections: Set<Selection<NodeWithOpacity, TDatum>>;
    private subGroups;
    private subGroupId;
    private readonly opts;
    private readonly debug;
    protected animationState: StateMachine<CartesianAnimationState, CartesianAnimationEvent>;
    protected constructor({ pathsPerSeries, hasMarkers, hasHighlightedLabels, pathsZIndexSubOrderOffset, directionKeys, directionNames, datumSelectionGarbageCollection, markerSelectionGarbageCollection, animationAlwaysUpdateSelections, animationResetFns, ...otherOpts }: Partial<SeriesOpts<TNode, TDatum, TLabel>> & ConstructorParameters<typeof DataModelSeries>[0]);
    resetAnimation(phase: ChartAnimationPhase): void;
    addChartEventListeners(): void;
    destroy(): void;
    update({ seriesRect }: {
        seriesRect?: BBox;
    }): Promise<void>;
    protected updateSelections(anySeriesItemEnabled: boolean): Promise<void>;
    private updateSeriesGroupSelections;
    protected abstract nodeFactory(): TNode;
    protected markerFactory(): Marker;
    private updateSeriesGroups;
    getGroupZIndexSubOrder(type: SeriesGroupZIndexSubOrderType, subIndex?: number): ZIndexSubOrder;
    protected updateNodes(highlightedItems: TDatum[] | undefined, seriesHighlighted: boolean | undefined, anySeriesItemEnabled: boolean): Promise<void>;
    protected getHighlightLabelData(labelData: TLabel[], highlightedItem: TDatum): TLabel[] | undefined;
    protected getHighlightData(_nodeData: TDatum[], highlightedItem: TDatum): TDatum[] | undefined;
    protected updateHighlightSelection(seriesHighlighted?: boolean): Promise<TDatum[] | undefined>;
    protected pickNodeExactShape(point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeClosestDatum(point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeMainAxisFirst(point: Point, requireCategoryAxis: boolean): SeriesNodePickMatch | undefined;
    onLegendItemClick(event: LegendItemClickChartEvent): void;
    onLegendItemDoubleClick(event: LegendItemDoubleClickChartEvent): void;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    shouldFlipXY(): boolean;
    /**
     * Get the minimum bounding box that contains any adjacent two nodes. The axes are treated independently, so this
     * may not represent the same two points for both directions. The dimensions represent the greatest distance
     * between any two adjacent nodes.
     */
    getMinRect(): BBox | undefined;
    protected updateHighlightSelectionItem(opts: {
        items?: TDatum[];
        highlightSelection: Selection<TNode, TDatum>;
    }): Promise<Selection<TNode, TDatum>>;
    protected updateHighlightSelectionLabel(opts: {
        items?: TLabel[];
        highlightLabelSelection: Selection<Text, TLabel>;
    }): Promise<Selection<Text, TLabel>>;
    protected updateDatumSelection(opts: {
        nodeData: TDatum[];
        datumSelection: Selection<TNode, TDatum>;
        seriesIdx: number;
    }): Promise<Selection<TNode, TDatum>>;
    protected updateDatumNodes(_opts: {
        datumSelection: Selection<TNode, TDatum>;
        highlightedItems?: TDatum[];
        isHighlight: boolean;
        seriesIdx: number;
    }): Promise<void>;
    protected updateMarkerSelection(opts: {
        nodeData: TDatum[];
        markerSelection: Selection<Marker, TDatum>;
        seriesIdx: number;
    }): Promise<Selection<Marker, TDatum>>;
    protected updateMarkerNodes(_opts: {
        markerSelection: Selection<Marker, TDatum>;
        isHighlight: boolean;
        seriesIdx: number;
    }): Promise<void>;
    protected updatePaths(opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        contextData: TContext;
        paths: Path[];
        seriesIdx: number;
    }): Promise<void>;
    protected updatePathNodes(opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        paths: Path[];
        seriesIdx: number;
        opacity: number;
        visible: boolean;
        animationEnabled: boolean;
    }): Promise<void>;
    protected resetAllAnimation(data: CartesianAnimationData<TNode, TDatum, TLabel, TContext>): void;
    protected animateEmptyUpdateReady(data: CartesianAnimationData<TNode, TDatum, TLabel, TContext>): void;
    protected animateWaitingUpdateReady(data: CartesianAnimationData<TNode, TDatum, TLabel, TContext>): void;
    protected animateReadyHighlight(data: Selection<TNode, TDatum>): void;
    protected animateReadyHighlightMarkers(data: Selection<Marker, TDatum>): void;
    protected animateReadyResize(data: CartesianAnimationData<TNode, TDatum, TLabel, TContext>): void;
    protected animateClearingUpdateEmpty(data: CartesianAnimationData<TNode, TDatum, TLabel, TContext>): void;
    protected animationTransitionClear(): void;
    private getAnimationData;
    protected abstract updateLabelSelection(opts: {
        labelData: TLabel[];
        labelSelection: Selection<Text, TLabel>;
        seriesIdx: number;
    }): Promise<Selection<Text, TLabel>>;
    protected abstract updateLabelNodes(opts: {
        labelSelection: Selection<Text, TLabel>;
        seriesIdx: number;
    }): Promise<void>;
    protected abstract isLabelEnabled(): boolean;
    protected calculateScaling(): TContext['scales'];
}
export {};
