import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import { HighlightStyle, SeriesNodeDatum, CartesianTooltipRendererParams as ColumnTooltipRendererParams } from "../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { Shape } from "../../../scene/shape/shape";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
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
export { ColumnTooltipRendererParams };
export interface ColumnLabelFormatterParams {
    value: number;
}
export declare type ColumnLabelFormatter = (params: ColumnLabelFormatterParams) => string;
declare class ColumnSeriesLabel extends Label {
    formatter?: ColumnLabelFormatter;
}
export declare class ColumnSeries extends CartesianSeries {
    static className: string;
    static type: string;
    private rectGroup;
    private textGroup;
    private rectSelection;
    private textSelection;
    private xData;
    private yData;
    private yDomain;
    readonly label: ColumnSeriesLabel;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled;
    tooltipRenderer?: (params: ColumnTooltipRendererParams) => string;
    flipXY: boolean;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    constructor();
    /**
     * Used to get the position of columns within each group.
     */
    private groupScale;
    directionKeys: {
        x: string[];
        y: string[];
    };
    getKeys(direction: ChartAxisDirection): string[];
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    protected _xName: string;
    set xName(value: string);
    get xName(): string;
    /**
     * With a single value in the `yKeys` array we get the regular column series.
     * With multiple values, we get the stacked column series.
     * If the {@link grouped} set to `true`, we get the grouped column series.
     * @param values
     */
    protected _yKeys: string[];
    set yKeys(values: string[]);
    get yKeys(): string[];
    protected _yNames: string[];
    set yNames(values: string[]);
    get yNames(): string[];
    grouped: boolean;
    /**
     * The value to normalize the stacks to, when {@link grouped} is `false`.
     * Should be a finite positive value or `undefined`.
     * Defaults to `undefined` - stacks are not normalized.
     */
    private _normalizedTo?;
    set normalizedTo(value: number | undefined);
    get normalizedTo(): number | undefined;
    private _strokeWidth;
    set strokeWidth(value: number);
    get strokeWidth(): number;
    private _shadow?;
    set shadow(value: DropShadow | undefined);
    get shadow(): DropShadow | undefined;
    highlightStyle: HighlightStyle;
    private highlightedNode?;
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    update(): void;
    private generateSelectionData;
    private updateRectSelection;
    private updateTextSelection;
    getTooltipHtml(nodeDatum: SelectionDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
