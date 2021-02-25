import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import { HighlightStyle, SeriesNodeDatum, CartesianTooltipRendererParams as BarTooltipRendererParams, SeriesTooltip } from "../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult } from "../../chart";
import { TypedEvent } from "../../../util/observable";
export interface BarSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
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
export declare class BarSeriesTooltip extends SeriesTooltip {
    renderer?: (params: BarTooltipRendererParams) => string | TooltipRendererResult;
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
    /**
     * @deprecated Use {@link tooltip.renderer} instead.
     */
    tooltipRenderer?: (params: BarTooltipRendererParams) => string | TooltipRendererResult;
    tooltip: BarSeriesTooltip;
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
    private cumYKeyCount;
    private flatYKeys;
    hideInLegend: string[];
    /**
     * yKeys: [['coffee']] - regular bars, each category has a single bar that shows a value for coffee
     * yKeys: [['coffee'], ['tea'], ['milk']] - each category has three bars that show values for coffee, tea and milk
     * yKeys: [['coffee', 'tea', 'milk']] - each category has a single bar with three stacks that show values for coffee, tea and milk
     * yKeys: [['coffee', 'tea', 'milk'], ['paper', 'ink']] - each category has 2 stacked bars,
     *     first showing values for coffee, tea and milk and second values for paper and ink
     */
    protected _yKeys: string[][];
    yKeys: string[][];
    protected _grouped: boolean;
    grouped: boolean;
    /**
     * A map of `yKeys` to their names (used in legends and tooltips).
     * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
     */
    protected _yNames: {
        [key in string]: string;
    };
    yNames: {
        [key in string]: string;
    };
    setColors(fills: string[], strokes: string[]): void;
    /**
     * The value to normalize the bars to.
     * Should be a finite positive value or `undefined`.
     * Defaults to `undefined` - bars are not normalized.
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
    findLargestMinMax(groups: {
        min: number;
        max: number;
    }[][]): {
        min: number;
        max: number;
    };
    getDomain(direction: ChartAxisDirection): any[];
    fireNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): void;
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
