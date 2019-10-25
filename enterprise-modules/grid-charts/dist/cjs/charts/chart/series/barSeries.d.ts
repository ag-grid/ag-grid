import { CartesianChart } from "../cartesianChart";
import { FontStyle, FontWeight } from "../../scene/shape/text";
import { DropShadow } from "../../scene/dropShadow";
import { HighlightStyle, Series, SeriesNodeDatum } from "./series";
import { Label } from "../label";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { BarTooltipRendererParams } from "../../chartOptions";
interface SelectionDatum extends SeriesNodeDatum {
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
export interface BarLabelFormatterParams {
    value: number;
}
export declare type BarLabelFormatter = (params: BarLabelFormatterParams) => string;
declare class BarSeriesLabel extends Label {
    private _formatter?;
    formatter: BarLabelFormatter | undefined;
}
export declare class BarSeries extends Series<CartesianChart> {
    static className: string;
    tooltipRenderer?: (params: BarTooltipRendererParams) => string;
    private rectGroup;
    private textGroup;
    private rectSelection;
    private textSelection;
    readonly label: BarSeriesLabel;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly yKeyEnabled;
    private _fills;
    fills: string[];
    private _strokes;
    strokes: string[];
    private _fillOpacity;
    fillOpacity: number;
    private _strokeOpacity;
    strokeOpacity: number;
    private xData;
    private yData;
    private domainY;
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    chart: CartesianChart | undefined;
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
    private _grouped;
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
    private highlightedNode?;
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    processData(): boolean;
    getDomainX(): string[];
    getDomainY(): number[];
    update(): void;
    private generateSelectionData;
    private updateRectSelection;
    private updateTextSelection;
    getTooltipHtml(nodeDatum: SelectionDatum): string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
export {};
