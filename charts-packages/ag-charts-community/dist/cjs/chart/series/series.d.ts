import { Group } from "../../scene/group";
import { LegendDatum } from "../legend";
import { Observable } from "../../util/observable";
import { ChartAxis, ChartAxisDirection } from "../chartAxis";
import { Chart } from "../chart";
import { Label } from "../label";
import { PointLabelDatum } from "../../util/labelPlacement";
/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
    readonly series: Series;
    readonly itemId?: any;
    readonly seriesDatum: any;
    readonly point?: {
        readonly x: number;
        readonly y: number;
    };
}
export interface TooltipRendererParams {
    readonly datum: any;
    readonly title?: string;
    readonly color?: string;
}
export interface CartesianTooltipRendererParams extends TooltipRendererParams {
    readonly xKey: string;
    readonly xValue: any;
    readonly xName?: string;
    readonly yKey: string;
    readonly yValue: any;
    readonly yName?: string;
}
export interface PolarTooltipRendererParams extends TooltipRendererParams {
    readonly angleKey: string;
    readonly angleValue: any;
    readonly angleName?: string;
    readonly radiusKey?: string;
    readonly radiusValue?: any;
    readonly radiusName?: string;
}
export declare class SeriesHighlightStyle {
    private static defaultDimOpacity;
    enabled: boolean;
    strokeWidth?: number;
    protected _dimOpacity: number;
    dimOpacity: number;
}
export declare class HighlightStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    readonly series: SeriesHighlightStyle;
}
export declare class SeriesTooltip extends Observable {
    enabled: boolean;
}
export declare abstract class Series extends Observable {
    readonly id: string;
    readonly type: string;
    readonly group: Group;
    readonly pickGroup: Group;
    chart?: Chart;
    xAxis: ChartAxis;
    yAxis: ChartAxis;
    directions: ChartAxisDirection[];
    directionKeys: {
        [key in ChartAxisDirection]?: string[];
    };
    readonly label: Label;
    tooltip: SeriesTooltip;
    data?: any[];
    visible: boolean;
    showInLegend: boolean;
    cursor: string;
    setColors(fills: string[], strokes: string[]): void;
    highlight(itemId?: any): void;
    dehighlight(): void;
    dim(): void;
    undim(itemId?: any): void;
    getKeys(direction: ChartAxisDirection): string[];
    abstract getDomain(direction: ChartAxisDirection): any[];
    abstract processData(): boolean;
    generateNodeData(): SeriesNodeDatum[];
    getNodeData(): readonly SeriesNodeDatum[];
    getLabelData(): readonly PointLabelDatum[];
    abstract update(): void;
    abstract getTooltipHtml(seriesDatum: any): string;
    fireNodeClickEvent(event: MouseEvent, datum: SeriesNodeDatum): void;
    /**
     * @private
     * Populates the given {@param data} array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     * @param data
     */
    abstract listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: any, enabled: boolean): void;
    readonly highlightStyle: HighlightStyle;
    onHighlightChange(): void;
    readonly scheduleLayout: () => void;
    readonly scheduleData: () => void;
    protected fixNumericExtent(extent?: [number | Date, number | Date], type?: string): [number, number];
}
