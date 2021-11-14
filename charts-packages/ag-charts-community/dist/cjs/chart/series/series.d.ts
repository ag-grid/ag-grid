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
    readonly datum: any;
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
export declare class SeriesItemHighlightStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export declare class SeriesHighlightStyle {
    strokeWidth?: number;
    dimOpacity?: number;
}
export declare class HighlightStyle {
    /**
     * @deprecated Use item.fill instead.
     */
    fill?: string;
    /**
     * @deprecated Use item.stroke instead.
     */
    stroke?: string;
    /**
    * @deprecated Use item.strokeWidth instead.
    */
    strokeWidth?: number;
    readonly item: SeriesItemHighlightStyle;
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
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;
    directions: ChartAxisDirection[];
    directionKeys: {
        [key in ChartAxisDirection]?: string[];
    };
    protected static highlightedZIndex: number;
    readonly label: Label;
    abstract tooltip: SeriesTooltip;
    data?: any[];
    visible: boolean;
    showInLegend: boolean;
    cursor: string;
    setColors(fills: string[], strokes: string[]): void;
    getKeys(direction: ChartAxisDirection): string[];
    abstract getDomain(direction: ChartAxisDirection): any[];
    abstract processData(): boolean;
    createNodeData(): SeriesNodeDatum[];
    getNodeData(): readonly SeriesNodeDatum[];
    getLabelData(): readonly PointLabelDatum[];
    private _nodeDataPending;
    nodeDataPending: boolean;
    scheduleNodeDate(): void;
    private _updatePending;
    updatePending: boolean;
    scheduleUpdate(): void;
    abstract update(): void;
    protected getOpacity(datum?: {
        itemId?: any;
    }): number;
    protected getStrokeWidth(defaultStrokeWidth: number, datum?: {
        itemId?: any;
    }): number;
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
