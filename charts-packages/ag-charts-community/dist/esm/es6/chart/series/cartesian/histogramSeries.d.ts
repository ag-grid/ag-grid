import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import { SeriesNodeDatum, CartesianTooltipRendererParams as HistogramTooltipRendererParams, SeriesTooltip } from "../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult } from "../../chart";
import { TypedEvent } from "../../../util/observable";
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
export declare class HistogramSeries extends CartesianSeries {
    static className: string;
    static type: "histogram";
    private rectGroup;
    private textGroup;
    private rectSelection;
    private textSelection;
    private binnedData;
    private xDomain;
    private yDomain;
    readonly label: HistogramSeriesLabel;
    private seriesItemEnabled;
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
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    private _areaPlot;
    set areaPlot(c: boolean);
    get areaPlot(): boolean;
    private _bins;
    set bins(bins: [number, number][] | undefined);
    get bins(): [number, number][] | undefined;
    private _aggregation;
    set aggregation(aggregation: HistogramAggregation);
    get aggregation(): HistogramAggregation;
    private _binCount;
    set binCount(binCount: number | undefined);
    get binCount(): number | undefined;
    protected _xName: string;
    set xName(value: string);
    get xName(): string;
    protected _yKey: string;
    set yKey(yKey: string);
    get yKey(): string;
    protected _yName: string;
    set yName(values: string);
    get yName(): string;
    private _strokeWidth;
    set strokeWidth(value: number);
    get strokeWidth(): number;
    private _shadow?;
    set shadow(value: DropShadow | undefined);
    get shadow(): DropShadow | undefined;
    onHighlightChange(): void;
    setColors(fills: string[], strokes: string[]): void;
    protected highlightedDatum?: HistogramNodeDatum;
    private deriveBins;
    private placeDataInBins;
    get xMax(): number;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    fireNodeClickEvent(event: MouseEvent, datum: HistogramNodeDatum): void;
    update(): void;
    updateSelections(): void;
    updateNodes(): void;
    createNodeData(): HistogramNodeDatum[];
    private updateRectSelection;
    private updateRectNodes;
    private updateTextSelection;
    private updateTextNodes;
    getTooltipHtml(nodeDatum: HistogramNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
