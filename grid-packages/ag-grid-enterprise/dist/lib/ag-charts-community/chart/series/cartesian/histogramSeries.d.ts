import type { ModuleContext } from '../../../module/moduleContext';
import type { AgHistogramSeriesLabelFormatterParams, AgHistogramSeriesOptions, AgHistogramSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import type { FontStyle, FontWeight } from '../../../options/chart/types';
import type { DropShadow } from '../../../scene/dropShadow';
import type { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import type { Text } from '../../../scene/shape/text';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import { Label } from '../../label';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import { SeriesTooltip } from '../seriesTooltip';
import { type CartesianAnimationData, CartesianSeries, type CartesianSeriesNodeDatum } from './cartesianSeries';
interface HistogramNodeDatum extends CartesianSeriesNodeDatum {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly aggregatedValue: number;
    readonly frequency: number;
    readonly domain: [number, number];
    readonly label?: {
        readonly text: string;
        readonly x: number;
        readonly y: number;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly fill: string;
    };
}
type HistogramAggregation = NonNullable<AgHistogramSeriesOptions['aggregation']>;
type HistogramAnimationData = CartesianAnimationData<Rect, HistogramNodeDatum>;
export declare class HistogramSeries extends CartesianSeries<Rect, HistogramNodeDatum> {
    static className: string;
    static type: "histogram";
    readonly label: Label<AgHistogramSeriesLabelFormatterParams, any>;
    tooltip: SeriesTooltip<AgHistogramSeriesTooltipRendererParams<HistogramNodeDatum>>;
    fill?: string;
    stroke?: string;
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    constructor(moduleCtx: ModuleContext);
    xKey?: string;
    areaPlot: boolean;
    bins?: [number, number][];
    aggregation: HistogramAggregation;
    binCount?: number;
    xName?: string;
    yKey?: string;
    yName?: string;
    strokeWidth: number;
    shadow?: DropShadow;
    calculatedBins: [number, number][];
    private deriveBins;
    private calculateNiceBins;
    private getBins;
    private calculateNiceStart;
    processData(dataController: DataController): Promise<void>;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<{
        itemId: string;
        nodeData: HistogramNodeDatum[];
        labelData: HistogramNodeDatum[];
        scales: {
            x?: import("./cartesianSeries").Scaling | undefined;
            y?: import("./cartesianSeries").Scaling | undefined;
        };
        animationValid: boolean;
        visible: true;
    }[]>;
    protected nodeFactory(): Rect;
    protected updateDatumSelection(opts: {
        nodeData: HistogramNodeDatum[];
        datumSelection: Selection<Rect, HistogramNodeDatum>;
    }): Promise<Selection<Rect, HistogramNodeDatum>>;
    protected updateDatumNodes(opts: {
        datumSelection: Selection<Rect, HistogramNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: HistogramNodeDatum[];
        labelSelection: Selection<Text, HistogramNodeDatum>;
    }): Promise<Selection<Text, HistogramNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, HistogramNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: HistogramNodeDatum): string;
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    animateEmptyUpdateReady({ datumSelections, labelSelections }: HistogramAnimationData): void;
    animateWaitingUpdateReady(data: HistogramAnimationData): void;
    getDatumId(datum: HistogramNodeDatum): string;
    protected isLabelEnabled(): boolean;
}
export {};
