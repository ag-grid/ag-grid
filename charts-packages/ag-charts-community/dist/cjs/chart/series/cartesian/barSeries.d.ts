import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import { HighlightStyle, SeriesNodeDatum, CartesianTooltipRendererParams as BarTooltipRendererParams } from "../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TypedEvent } from "../../../util/observable";
interface BarNodeDatum extends SeriesNodeDatum {
    yKey: string;
    yValue: number;
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    label?: {
        text: string;
        fontStyle?: FontStyle;
        fontWeight?: FontWeight;
        fontSize: number;
        fontFamily: string;
        fill: string;
        x: number;
        y: number;
    };
}
export interface BarSeriesNodeClickEvent extends TypedEvent {
    type: 'nodeClick';
    series: BarSeries;
    datum: any;
    xKey: string;
    yKey: string;
}
export { BarTooltipRendererParams };
export interface BarLabelFormatterParams {
    value: number;
}
export declare type BarLabelFormatter = (params: BarLabelFormatterParams) => string;
declare class BarSeriesLabel extends Label {
    formatter?: BarLabelFormatter;
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
    tooltipRenderer?: (params: BarTooltipRendererParams) => string;
    flipXY: boolean;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
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
