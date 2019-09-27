// ag-grid-enterprise v21.2.2
import { CartesianChart } from "../cartesianChart";
import { DropShadow } from "../../scene/dropShadow";
import { HighlightStyle, Series, SeriesNodeDatum } from "./series";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
interface SelectionDatum extends SeriesNodeDatum {
    yField: string;
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
        fontStyle?: string;
        fontWeight?: string;
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
export interface BarTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}
export declare class BarSeries extends Series<CartesianChart> {
    static className: string;
    tooltipRenderer?: (params: BarTooltipRendererParams) => string;
    private rectGroup;
    private textGroup;
    private rectSelection;
    private textSelection;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    protected readonly enabled: Map<string, boolean>;
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
    private ySums;
    private domainY;
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    chart: CartesianChart | undefined;
    protected _xField: string;
    xField: string;
    /**
     * With a single value in the `yFields` array we get the regular bar series.
     * With multiple values, we get the stacked bar series.
     * If the {@link grouped} set to `true`, we get the grouped bar series.
     * @param values
     */
    protected _yFields: string[];
    yFields: string[];
    protected _yFieldNames: string[];
    yFieldNames: string[];
    private _grouped;
    grouped: boolean;
    /**
     * The value to normalize the stacks to, when {@link grouped} is `false`.
     * Should be a finite positive value or `NaN`.
     * Defaults to `NaN` - stacks are not normalized.
     */
    private _normalizedTo;
    normalizedTo: number;
    private _strokeWidth;
    strokeWidth: number;
    private _shadow;
    shadow: DropShadow | undefined;
    private _labelEnabled;
    labelEnabled: boolean;
    private _labelFontStyle;
    labelFontStyle: string | undefined;
    private _labelFontWeight;
    labelFontWeight: string | undefined;
    private _labelFontSize;
    labelFontSize: number;
    private _labelFontFamily;
    labelFontFamily: string;
    private _labelColor;
    labelColor: string;
    private _labelFormatter;
    labelFormatter: BarLabelFormatter | undefined;
    highlightStyle: HighlightStyle;
    private highlightedNode?;
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    processData(): boolean;
    getDomainX(): string[];
    getDomainY(): number[];
    update(): void;
    getTooltipHtml(nodeDatum: SelectionDatum): string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
export {};
