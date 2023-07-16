import type { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import type { Text } from '../../../scene/shape/text';
import type { DropShadow } from '../../../scene/dropShadow';
import type { SeriesNodeDataContext } from '../series';
import { SeriesTooltip } from '../series';
import { Label } from '../../label';
import type { ChartLegendDatum } from '../../legendDatum';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { AgCartesianSeriesLabelFormatterParams, AgTooltipRendererResult, AgHistogramSeriesOptions, FontStyle, FontWeight, AgHistogramSeriesTooltipRendererParams } from '../../agChartOptions';
import type { ModuleContext } from '../../../util/moduleContext';
import type { DataController } from '../../data/dataController';
declare class HistogramSeriesLabel extends Label {
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
}
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
declare type HistogramAggregation = NonNullable<AgHistogramSeriesOptions['aggregation']>;
declare class HistogramSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgHistogramSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export declare class HistogramSeries extends CartesianSeries<SeriesNodeDataContext<HistogramNodeDatum>, Rect> {
    static className: string;
    static type: "histogram";
    readonly label: HistogramSeriesLabel;
    tooltip: HistogramSeriesTooltip;
    fill?: string;
    stroke?: string;
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    constructor(moduleCtx: ModuleContext);
    xKey?: string;
    areaPlot: boolean;
    bins: [number, number][] | undefined;
    aggregation: HistogramAggregation;
    binCount?: number;
    xName?: string;
    yKey?: string;
    yName?: string;
    strokeWidth: number;
    shadow?: DropShadow;
    calculatedBins: [number, number][];
    protected highlightedDatum?: HistogramNodeDatum;
    private deriveBins;
    private calculateNiceBins;
    private getBins;
    private calculateNiceStart;
    processData(dataController: DataController): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: HistogramNodeDatum): CartesianSeriesNodeClickEvent<any>;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: HistogramNodeDatum): CartesianSeriesNodeDoubleClickEvent<any>;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: HistogramNodeDatum[];
        labelData: HistogramNodeDatum[];
    }[]>;
    protected nodeFactory(): Rect;
    datumSelectionGarbageCollection: boolean;
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
    getLegendData(): ChartLegendDatum[];
    animateEmptyUpdateReady({ datumSelections, labelSelections, }: {
        datumSelections: Array<Selection<Rect, HistogramNodeDatum>>;
        labelSelections: Array<Selection<Text, HistogramNodeDatum>>;
    }): void;
    animateReadyUpdate({ datumSelections }: {
        datumSelections: Array<Selection<Rect, HistogramNodeDatum>>;
    }): void;
    animateReadyHighlight(highlightSelection: Selection<Rect, HistogramNodeDatum>): void;
    animateReadyResize({ datumSelections }: {
        datumSelections: Array<Selection<Rect, HistogramNodeDatum>>;
    }): void;
    animateWaitingUpdateReady({ datumSelections, labelSelections, }: {
        datumSelections: Array<Selection<Rect, HistogramNodeDatum>>;
        labelSelections: Array<Selection<Text, HistogramNodeDatum>>;
    }): void;
    resetSelectionRects(selection: Selection<Rect, HistogramNodeDatum>): void;
    protected isLabelEnabled(): boolean;
}
export {};
//# sourceMappingURL=histogramSeries.d.ts.map