import type { ModuleContext } from '../../../module/moduleContext';
import type { AgScatterSeriesLabelFormatterParams, AgScatterSeriesOptionsKeys, AgScatterSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import { ColorScale } from '../../../scale/colorScale';
import { Group } from '../../../scene/group';
import type { Selection } from '../../../scene/selection';
import type { Text } from '../../../scene/shape/text';
import type { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import { Label } from '../../label';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import type { Marker } from '../../marker/marker';
import { SeriesMarker } from '../seriesMarker';
import { SeriesTooltip } from '../seriesTooltip';
import type { ErrorBoundSeriesNodeDatum } from '../seriesTypes';
import type { CartesianAnimationData, CartesianSeriesNodeDatum } from './cartesianSeries';
import { CartesianSeries } from './cartesianSeries';
interface ScatterNodeDatum extends Required<CartesianSeriesNodeDatum>, ErrorBoundSeriesNodeDatum {
    readonly label: MeasuredLabel;
    readonly fill: string | undefined;
}
type ScatterAnimationData = CartesianAnimationData<Group, ScatterNodeDatum>;
export declare class ScatterSeries extends CartesianSeries<Group, ScatterNodeDatum> {
    static className: string;
    static type: "scatter";
    readonly marker: SeriesMarker<AgScatterSeriesOptionsKeys, ScatterNodeDatum>;
    readonly label: Label<AgScatterSeriesLabelFormatterParams, any>;
    title?: string;
    labelKey?: string;
    xName?: string;
    yName?: string;
    labelName?: string;
    xKey?: string;
    yKey?: string;
    colorKey?: string;
    colorName?: string;
    colorDomain?: number[];
    colorRange: string[];
    colorScale: ColorScale;
    readonly tooltip: SeriesTooltip<AgScatterSeriesTooltipRendererParams<any>>;
    constructor(moduleCtx: ModuleContext);
    processData(dataController: DataController): Promise<void>;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<{
        itemId: string;
        nodeData: ScatterNodeDatum[];
        labelData: ScatterNodeDatum[];
        scales: {
            x?: import("./cartesianSeries").Scaling | undefined;
            y?: import("./cartesianSeries").Scaling | undefined;
        };
        visible: boolean;
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    protected markerFactory(): Marker;
    protected updateMarkerSelection(opts: {
        nodeData: ScatterNodeDatum[];
        markerSelection: Selection<Marker, ScatterNodeDatum>;
    }): Promise<Selection<Marker, ScatterNodeDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, ScatterNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: ScatterNodeDatum[];
        labelSelection: Selection<Text, ScatterNodeDatum>;
    }): Promise<Selection<Text, ScatterNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, ScatterNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: ScatterNodeDatum): string;
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    animateEmptyUpdateReady(data: ScatterAnimationData): void;
    protected isLabelEnabled(): boolean;
    protected nodeFactory(): Group;
}
export {};
