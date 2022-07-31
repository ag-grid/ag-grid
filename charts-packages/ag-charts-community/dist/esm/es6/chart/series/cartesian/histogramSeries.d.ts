import { Group } from '../../../scene/group';
import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text, FontStyle, FontWeight } from '../../../scene/shape/text';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDatum, CartesianTooltipRendererParams as HistogramTooltipRendererParams, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { Label } from '../../label';
import { LegendDatum } from '../../legend';
import { CartesianSeries } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { TooltipRendererResult } from '../../chart';
import { TypedEvent } from '../../../util/observable';
declare class HistogramSeriesLabel extends Label {
    formatter?: (params: {
        value: number;
    }) => string;
}
export { HistogramTooltipRendererParams };
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
export interface HistogramSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: HistogramSeries;
    readonly datum: any;
    readonly xKey: string;
}
export declare type HistogramAggregation = 'count' | 'sum' | 'mean';
export declare class HistogramBin {
    data: any[];
    aggregatedValue: number;
    frequency: number;
    domain: [number, number];
    constructor([domainMin, domainMax]: [number, number]);
    addDatum(datum: any): void;
    get domainWidth(): number;
    get relativeHeight(): number;
    calculateAggregatedValue(aggregationName: HistogramAggregation, yKey: string): void;
    getY(areaPlot: boolean): number;
}
export declare class HistogramSeriesTooltip extends SeriesTooltip {
    renderer?: (params: HistogramTooltipRendererParams) => string | TooltipRendererResult;
}
export declare class HistogramSeries extends CartesianSeries<SeriesNodeDataContext<HistogramNodeDatum>, Rect> {
    static className: string;
    static type: "histogram";
    private binnedData;
    private xDomain;
    private yDomain;
    readonly label: HistogramSeriesLabel;
    tooltip: HistogramSeriesTooltip;
    fill: string | undefined;
    stroke: string | undefined;
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
    binCount: number | undefined;
    xName: string;
    yKey: string;
    yName: string;
    strokeWidth: number;
    shadow?: DropShadow;
    setColors(fills: string[], strokes: string[]): void;
    protected highlightedDatum?: HistogramNodeDatum;
    private deriveBins;
    private calculateNiceBins;
    private getBins;
    private calculateNiceStart;
    private placeDataInBins;
    get xMax(): number;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    fireNodeClickEvent(event: MouseEvent, datum: HistogramNodeDatum): void;
    createNodeData(): {
        itemId: string;
        nodeData: HistogramNodeDatum[];
        labelData: HistogramNodeDatum[];
    }[];
    protected updateDatumSelection(opts: {
        nodeData: HistogramNodeDatum[];
        datumSelection: Selection<Rect, Group, HistogramNodeDatum, any>;
    }): Selection<Rect, Group, HistogramNodeDatum, any>;
    protected updateDatumNodes(opts: {
        datumSelection: Selection<Rect, Group, HistogramNodeDatum, any>;
        isHighlight: boolean;
    }): void;
    protected updateLabelSelection(opts: {
        labelData: HistogramNodeDatum[];
        labelSelection: Selection<Text, Group, HistogramNodeDatum, any>;
    }): Selection<Text, Group, HistogramNodeDatum, any>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, Group, HistogramNodeDatum, any>;
    }): void;
    getTooltipHtml(nodeDatum: HistogramNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
