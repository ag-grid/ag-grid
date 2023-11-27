import type { ModuleContext } from '../../../module/moduleContext';
import type { AgBubbleSeriesLabelFormatterParams, AgBubbleSeriesOptionsKeys, AgBubbleSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import { ColorScale } from '../../../scale/colorScale';
import { Group } from '../../../scene/group';
import type { Selection } from '../../../scene/selection';
import type { Text } from '../../../scene/shape/text';
import type { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import { Label } from '../../label';
import type { CategoryLegendDatum } from '../../legendDatum';
import type { Marker } from '../../marker/marker';
import type { SeriesNodeEventTypes } from '../series';
import { SeriesMarker } from '../seriesMarker';
import { SeriesTooltip } from '../seriesTooltip';
import type { CartesianAnimationData, CartesianSeriesNodeDatum } from './cartesianSeries';
import { CartesianSeries, CartesianSeriesNodeClickEvent } from './cartesianSeries';
interface BubbleNodeDatum extends Required<CartesianSeriesNodeDatum> {
    readonly sizeValue: any;
    readonly label: MeasuredLabel;
    readonly fill: string | undefined;
}
type BubbleAnimationData = CartesianAnimationData<Group, BubbleNodeDatum>;
declare class BubbleSeriesNodeClickEvent<TEvent extends string = SeriesNodeEventTypes> extends CartesianSeriesNodeClickEvent<TEvent> {
    readonly sizeKey?: string;
    constructor(type: TEvent, nativeEvent: MouseEvent, datum: BubbleNodeDatum, series: BubbleSeries);
}
declare class BubbleSeriesMarker extends SeriesMarker<AgBubbleSeriesOptionsKeys, BubbleNodeDatum> {
    /**
     * The series `sizeKey` values along with the `size` and `maxSize` configs will be used to
     * determine the size of the marker. All values will be mapped to a marker size within the
     * `[size, maxSize]` range, where the largest values will correspond to the `maxSize` and the
     * lowest to the `size`.
     */
    maxSize: number;
    domain?: [number, number];
}
export declare class BubbleSeries extends CartesianSeries<Group, BubbleNodeDatum> {
    static className: string;
    static type: "bubble";
    protected readonly NodeClickEvent: typeof BubbleSeriesNodeClickEvent;
    private sizeScale;
    readonly marker: BubbleSeriesMarker;
    readonly label: Label<AgBubbleSeriesLabelFormatterParams, any>;
    title?: string;
    labelKey?: string;
    xName?: string;
    yName?: string;
    sizeName?: string;
    labelName?: string;
    xKey?: string;
    yKey?: string;
    sizeKey?: string;
    colorKey?: string;
    colorName?: string;
    colorDomain?: number[];
    colorRange: string[];
    colorScale: ColorScale;
    readonly tooltip: SeriesTooltip<AgBubbleSeriesTooltipRendererParams<any>>;
    constructor(moduleCtx: ModuleContext);
    processData(dataController: DataController): Promise<void>;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<{
        itemId: string;
        nodeData: BubbleNodeDatum[];
        labelData: BubbleNodeDatum[];
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
        nodeData: BubbleNodeDatum[];
        markerSelection: Selection<Marker, BubbleNodeDatum>;
    }): Promise<Selection<Marker, BubbleNodeDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, BubbleNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: BubbleNodeDatum[];
        labelSelection: Selection<Text, BubbleNodeDatum>;
    }): Promise<Selection<Text, BubbleNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, BubbleNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: BubbleNodeDatum): string;
    getLegendData(): CategoryLegendDatum[];
    animateEmptyUpdateReady({ markerSelections, labelSelections }: BubbleAnimationData): void;
    getDatumId(datum: BubbleNodeDatum): string;
    protected isLabelEnabled(): boolean;
    protected nodeFactory(): Group;
}
export {};
