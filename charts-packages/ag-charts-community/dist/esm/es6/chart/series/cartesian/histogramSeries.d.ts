import { Group } from '../../../scene/group';
import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { Label } from '../../label';
import { LegendDatum } from '../../legend';
import { CartesianSeries, CartesianSeriesNodeClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { AgCartesianSeriesLabelFormatterParams, AgTooltipRendererResult, AgHistogramSeriesOptions, FontStyle, FontWeight, AgHistogramSeriesTooltipRendererParams } from '../../agChartOptions';
declare class HistogramSeriesLabel extends Label {
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
}
interface HistogramNodeDatum extends SeriesNodeDatum {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
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
    private binnedData;
    private xDomain;
    private yDomain;
    readonly label: HistogramSeriesLabel;
    tooltip: HistogramSeriesTooltip;
    fill?: string;
    stroke?: string;
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    constructor();
    directionKeys: {
        x: string[];
        y: string[];
    };
    getKeys(direction: ChartAxisDirection): string[];
    xKey: string;
    areaPlot: boolean;
    bins: [number, number][] | undefined;
    aggregation: HistogramAggregation;
    binCount?: number;
    xName: string;
    yKey: string;
    yName: string;
    strokeWidth: number;
    shadow?: DropShadow;
    protected highlightedDatum?: HistogramNodeDatum;
    private deriveBins;
    private calculateNiceBins;
    private getBins;
    private calculateNiceStart;
    private placeDataInBins;
    get xMax(): number;
    processData(): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: HistogramNodeDatum): CartesianSeriesNodeClickEvent<any>;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: HistogramNodeDatum[];
        labelData: HistogramNodeDatum[];
    }[]>;
    protected updateDatumSelection(opts: {
        nodeData: HistogramNodeDatum[];
        datumSelection: Selection<Rect, Group, HistogramNodeDatum, any>;
    }): Promise<Selection<Rect, Group, HistogramNodeDatum, any>>;
    protected updateDatumNodes(opts: {
        datumSelection: Selection<Rect, Group, HistogramNodeDatum, any>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: HistogramNodeDatum[];
        labelSelection: Selection<Text, Group, HistogramNodeDatum, any>;
    }): Promise<Selection<Text, Group, HistogramNodeDatum, any>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, Group, HistogramNodeDatum, any>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: HistogramNodeDatum): string;
    getLegendData(): LegendDatum[];
    protected isLabelEnabled(): boolean;
}
export {};
