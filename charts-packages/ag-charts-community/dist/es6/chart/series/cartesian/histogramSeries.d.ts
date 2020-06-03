import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import { HighlightStyle, SeriesNodeDatum, CartesianTooltipRendererParams as HistogramTooltipRendererParams } from "../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TypedEvent } from "../../../util/observable";
declare class HistogramSeriesLabel extends Label {
    formatter?: (bin: HistogramBin) => string;
}
export { HistogramTooltipRendererParams };
interface HistogramNodeDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    label: {
        text: string;
        x: number;
        y: number;
        fontStyle: FontStyle;
        fontWeight: FontWeight;
        fontSize: number;
        fontFamily: string;
        fill: string;
    };
}
export interface HistogramSeriesNodeClickEvent extends TypedEvent {
    type: 'nodeClick';
    series: HistogramSeries;
    datum: any;
    xKey: string;
}
declare type AggregationName = 'count' | 'sum' | 'mean';
export declare class HistogramBin {
    data: any[];
    aggregatedValue: number;
    frequency: number;
    domain: [number, number];
    constructor([domainMin, domainMax]: [number, number]);
    addDatum(datum: any): void;
    readonly domainWidth: number;
    readonly relativeHeight: number;
    calculateAggregatedValue(aggregationName: AggregationName, yKey: string): void;
    getY(areaPlot: boolean): number;
}
export declare class HistogramSeries extends CartesianSeries {
    static className: string;
    static type: string;
    private rectGroup;
    private textGroup;
    private rectSelection;
    private textSelection;
    private binnedData;
    private xDomain;
    private yDomain;
    readonly label: HistogramSeriesLabel;
    private seriesItemEnabled;
    tooltipRenderer?: (params: HistogramTooltipRendererParams) => string;
    fill: string;
    stroke: string;
    fillOpacity: number;
    strokeOpacity: number;
    constructor();
    directionKeys: {
        x: string[];
        y: string[];
    };
    getKeys(direction: ChartAxisDirection): string[];
    protected _xKey: string;
    xKey: string;
    private _areaPlot;
    areaPlot: boolean;
    private _bins;
    bins: [number, number][];
    private _aggregation;
    aggregation: AggregationName;
    private _binCount;
    binCount: number;
    protected _xName: string;
    xName: string;
    protected _yKey: string;
    yKey: string;
    protected _yName: string;
    yName: string;
    private _strokeWidth;
    strokeWidth: number;
    private _shadow?;
    shadow: DropShadow | undefined;
    highlightStyle: HighlightStyle;
    onHighlightChange(): void;
    protected highlightedDatum?: HistogramNodeDatum;
    private deriveBins;
    private placeDataInBins;
    readonly xMax: number;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    fireNodeClickEvent(datum: HistogramNodeDatum): void;
    update(): void;
    private generateNodeData;
    private updateRectSelection;
    private updateRectNodes;
    private updateTextSelection;
    private updateTextNodes;
    getTooltipHtml(nodeDatum: HistogramNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
