import { Series, SeriesNodeDataContext, SeriesNodeDatum, SeriesNodePickMode, SeriesNodePickMatch } from '../series';
import { ChartAxis, ChartAxisDirection } from '../../chartAxis';
import { SeriesMarker, SeriesMarkerFormatterParams } from '../seriesMarker';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Marker } from '../../marker/marker';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Node } from '../../../scene/node';
import { PointLabelDatum } from '../../../util/labelPlacement';
import { Point } from '../../../scene/point';
declare type NodeDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<N, Group, ContextType['nodeData'][number], any>;
declare type LabelDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<N, Group, ContextType['labelData'][number], any>;
declare type PickGroupInclude = 'mainPath' | 'datumNodes' | 'markers';
declare type SeriesFeature = 'markers';
interface SeriesOpts {
    pickGroupIncludes: PickGroupInclude[];
    pathsPerSeries: number;
    pathsZIndexSubOrderOffset: number[];
    features: SeriesFeature[];
}
export declare abstract class CartesianSeries<C extends SeriesNodeDataContext<any, any>, N extends Node = Marker> extends Series<C> {
    private _contextNodeData;
    get contextNodeData(): C[];
    private highlightSelection;
    private highlightLabelSelection;
    private subGroups;
    private subGroupId;
    private readonly opts;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    protected readonly seriesItemEnabled: Map<string, boolean>;
    protected constructor(opts?: Partial<SeriesOpts> & {
        pickModes?: SeriesNodePickMode[];
    });
    directionKeys: {
        [key in ChartAxisDirection]?: string[];
    };
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
    update(): void;
    protected updateSelections(seriesHighlighted: boolean | undefined, anySeriesItemEnabled: boolean): void;
    private updateSeriesGroups;
    protected updateNodes(seriesHighlighted: boolean | undefined, anySeriesItemEnabled: boolean): void;
    protected updateHighlightSelection(seriesHighlighted?: boolean): void;
    protected pickNodeExactShape(point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeClosestDatum(point: Point): SeriesNodePickMatch | undefined;
    protected pickNodeMainAxisFirst(point: Point, requireCategoryAxis: boolean): {
        datum: SeriesNodeDatum;
        distance: number;
    } | undefined;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    protected updatePaths(opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        contextData: C;
        paths: Path[];
        seriesIdx: number;
    }): void;
    protected updatePathNodes(_opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        paths: Path[];
        seriesIdx: number;
    }): void;
    protected updateHighlightSelectionItem(opts: {
        item?: C['nodeData'][number];
        highlightSelection: NodeDataSelection<N, C>;
    }): NodeDataSelection<N, C>;
    protected updateHighlightSelectionLabel(opts: {
        item?: C['labelData'][number];
        highlightLabelSelection: LabelDataSelection<Text, C>;
    }): LabelDataSelection<Text, C>;
    protected updateDatumSelection(opts: {
        nodeData: C['nodeData'];
        datumSelection: NodeDataSelection<N, C>;
        seriesIdx: number;
    }): NodeDataSelection<N, C>;
    protected updateDatumNodes(_opts: {
        datumSelection: NodeDataSelection<N, C>;
        isHighlight: boolean;
        seriesIdx: number;
    }): void;
    protected updateMarkerSelection(opts: {
        nodeData: C['nodeData'];
        markerSelection: NodeDataSelection<Marker, C>;
        seriesIdx: number;
    }): NodeDataSelection<Marker, C>;
    protected updateMarkerNodes(_opts: {
        markerSelection: NodeDataSelection<Marker, C>;
        isHighlight: boolean;
        seriesIdx: number;
    }): void;
    protected abstract updateLabelSelection(opts: {
        labelData: C['labelData'];
        labelSelection: LabelDataSelection<Text, C>;
        seriesIdx: number;
    }): LabelDataSelection<Text, C>;
    protected abstract updateLabelNodes(opts: {
        labelSelection: LabelDataSelection<Text, C>;
        seriesIdx: number;
    }): void;
}
export interface CartesianSeriesMarkerFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    size?: number;
}
export declare class CartesianSeriesMarker extends SeriesMarker {
    formatter?: (params: CartesianSeriesMarkerFormatterParams) => CartesianSeriesMarkerFormat;
}
export interface CartesianSeriesMarkerFormatterParams extends SeriesMarkerFormatterParams {
    xKey: string;
    yKey: string;
}
export {};
