import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import { HighlightStyle, SeriesNodeDatum, CartesianTooltipRendererParams as BarTooltipRendererParams } from "../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult } from "../../chart";
import { TypedEvent } from "../../../util/observable";
export interface BarSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly series: BarSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}
export { BarTooltipRendererParams };
interface BarNodeDatum extends SeriesNodeDatum {
    readonly yKey: string;
    readonly yValue: number;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly label?: {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly fill: string;
        readonly x: number;
        readonly y: number;
    };
}
declare class BarSeriesLabel extends Label {
    formatter?: (params: {
        value: number;
    }) => string;
}
export interface BarSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly highlighted: boolean;
    readonly xKey: string;
    readonly yKey: string;
}
export interface BarSeriesFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export declare class BarSeries extends CartesianSeries {
    static className: string;
    static type: string;
    private rectGroup;
    private textGroup;
    private rectSelection;
    private textSelection;
    private xData;
    private yData;
    private yDomain;
    readonly label: BarSeriesLabel;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled;
    tooltipRenderer?: (params: BarTooltipRendererParams) => string | TooltipRendererResult;
    flipXY: boolean;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    formatter?: (params: BarSeriesFormatterParams) => BarSeriesFormat;
    constructor();
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    directionKeys: {
        x: string[];
        y: string[];
    };
    getKeys(direction: ChartAxisDirection): string[];
    protected _xKey: string;
    xKey: string;
    protected _xName: string;
    xName: string;
    /**
     * With a single value in the `yKeys` array we get the regular bar series.
     * With multiple values, we get the stacked bar series.
     * If the {@link grouped} set to `true`, we get the grouped bar series.
     * @param values
     */
    protected _yKeys: string[];
    yKeys: string[];
    protected _yNames: string[];
    yNames: string[];
    setColors(fills: string[], strokes: string[]): void;
    grouped: boolean;
    /**
     * The value to normalize the stacks to, when {@link grouped} is `false`.
     * Should be a finite positive value or `undefined`.
     * Defaults to `undefined` - stacks are not normalized.
     */
    private _normalizedTo?;
    normalizedTo: number | undefined;
    private _strokeWidth;
    strokeWidth: number;
    private _shadow?;
    shadow: DropShadow | undefined;
    highlightStyle: HighlightStyle;
    onHighlightChange(): void;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    fireNodeClickEvent(datum: BarNodeDatum): void;
    private generateNodeData;
    update(): void;
    private updateRectSelection;
    private updateRectNodes;
    private updateTextSelection;
    private updateTextNodes;
    getTooltipHtml(nodeDatum: BarNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
