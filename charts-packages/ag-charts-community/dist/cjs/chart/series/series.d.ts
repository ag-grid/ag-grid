import { Group } from "../../scene/group";
import { LegendDatum } from "../legend";
import { Observable } from "../../util/observable";
import { ChartAxis, ChartAxisDirection } from "../chartAxis";
import { Chart } from "../chart";
/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
    readonly series: Series;
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
export interface HighlightStyle {
    fill?: string;
    stroke?: string;
}
export declare class SeriesTooltip extends Observable {
    enabled: boolean;
}
export declare abstract class Series extends Observable {
    readonly id: string;
    readonly type: string;
    /**
     * The group node that contains all the nodes used to render this series.
     */
    readonly group: Group;
    chart?: Chart;
    xAxis: ChartAxis;
    yAxis: ChartAxis;
    directions: ChartAxisDirection[];
    directionKeys: {
        [key in ChartAxisDirection]?: string[];
    };
    /**
     * @deprecated Use {@link tooltip.enabled} instead.
     */
    tooltipEnabled: boolean;
    tooltip: SeriesTooltip;
    setColors(fills: string[], strokes: string[]): void;
    data?: any[];
    visible: boolean;
    showInLegend: boolean;
    /**
     * Returns the actual keys used (to fetch the values from `data` items) for the given direction.
     */
    getKeys(direction: ChartAxisDirection): string[];
    abstract getDomain(direction: ChartAxisDirection): any[];
    abstract processData(): boolean;
    abstract update(): void;
    abstract getTooltipHtml(seriesDatum: any): string;
    getNodeData(): SeriesNodeDatum[];
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
    onHighlightChange(): void;
    readonly scheduleLayout: () => void;
    readonly scheduleData: () => void;
    protected fixNumericExtent(extent?: [number | Date, number | Date], type?: string): [number, number];
}
