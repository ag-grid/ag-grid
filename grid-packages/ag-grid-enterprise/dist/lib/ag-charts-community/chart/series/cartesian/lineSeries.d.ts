import type { ModuleContext } from '../../../module/moduleContext';
import type { AgLineSeriesLabelFormatterParams, AgLineSeriesOptionsKeys, AgLineSeriesTooltipRendererParams, FontStyle, FontWeight } from '../../../options/agChartOptions';
import { Group } from '../../../scene/group';
import type { Selection } from '../../../scene/selection';
import type { Path } from '../../../scene/shape/path';
import type { Text } from '../../../scene/shape/text';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import { Label } from '../../label';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import type { Marker } from '../../marker/marker';
import { SeriesMarker } from '../seriesMarker';
import { SeriesTooltip } from '../seriesTooltip';
import type { ErrorBoundSeriesNodeDatum } from '../seriesTypes';
import type { CartesianAnimationData, CartesianSeriesNodeDataContext, CartesianSeriesNodeDatum } from './cartesianSeries';
import { CartesianSeries } from './cartesianSeries';
interface LineNodeDatum extends CartesianSeriesNodeDatum, ErrorBoundSeriesNodeDatum {
    readonly point: CartesianSeriesNodeDatum['point'] & {
        readonly moveTo: boolean;
    };
    readonly label?: {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}
type LineAnimationData = CartesianAnimationData<Group, LineNodeDatum>;
export declare class LineSeries extends CartesianSeries<Group, LineNodeDatum> {
    static className: string;
    static type: "line";
    readonly label: Label<AgLineSeriesLabelFormatterParams, any>;
    readonly marker: SeriesMarker<AgLineSeriesOptionsKeys, LineNodeDatum>;
    readonly tooltip: SeriesTooltip<AgLineSeriesTooltipRendererParams<any>>;
    title?: string;
    stroke?: string;
    lineDash?: number[];
    lineDashOffset: number;
    strokeWidth: number;
    strokeOpacity: number;
    constructor(moduleCtx: ModuleContext);
    xKey?: string;
    xName?: string;
    yKey?: string;
    yName?: string;
    processData(dataController: DataController): Promise<void>;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<{
        itemId: string;
        nodeData: LineNodeDatum[];
        labelData: LineNodeDatum[];
        scales: {
            x?: import("./cartesianSeries").Scaling | undefined;
            y?: import("./cartesianSeries").Scaling | undefined;
        };
        visible: boolean;
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
    protected markerFactory(): Marker;
    protected updatePathNodes(opts: {
        seriesHighlighted?: boolean;
        paths: Path[];
        opacity: number;
        visible: boolean;
        animationEnabled: boolean;
    }): Promise<void>;
    protected updateMarkerSelection(opts: {
        nodeData: LineNodeDatum[];
        markerSelection: Selection<Marker, LineNodeDatum>;
        markerGroup?: Group;
    }): Promise<Selection<Marker, LineNodeDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, LineNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: LineNodeDatum[];
        labelSelection: Selection<Text, LineNodeDatum>;
    }): Promise<Selection<Text, LineNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, LineNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: LineNodeDatum): string;
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    protected updatePaths(opts: {
        contextData: CartesianSeriesNodeDataContext<LineNodeDatum>;
        paths: Path[];
    }): Promise<void>;
    private updateLinePaths;
    protected animateEmptyUpdateReady(animationData: LineAnimationData): void;
    protected animateReadyResize(animationData: LineAnimationData): void;
    protected animateWaitingUpdateReady(animationData: LineAnimationData): void;
    private getDatumId;
    protected isLabelEnabled(): boolean;
    getBandScalePadding(): {
        inner: number;
        outer: number;
    };
    protected nodeFactory(): Group;
}
export {};
