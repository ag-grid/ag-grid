// ag-grid-enterprise v21.0.1
import { CartesianChart } from "../cartesianChart";
import { DropShadow } from "../../scene/dropShadow";
import { Series, SeriesNodeDatum } from "./series";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
interface GroupSelectionDatum extends SeriesNodeDatum {
    yField: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    label?: {
        text: string;
        font: string;
        fill: string;
        x: number;
        y: number;
    };
}
export interface BarTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
}
export declare class BarSeries extends Series<CartesianChart> {
    static className: string;
    tooltipRenderer?: (params: BarTooltipRendererParams) => string;
    /**
     * The selection of Group elements, each containing a Rect (bar) and a Text (label) nodes.
     */
    private groupSelection;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    protected readonly enabled: Map<string, boolean>;
    private _fills;
    fills: string[];
    private _strokes;
    strokes: string[];
    private xData;
    private yData;
    private domainY;
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    chart: CartesianChart | null;
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
    private _strokeWidth;
    strokeWidth: number;
    private _shadow;
    shadow: DropShadow | undefined;
    private _labelEnabled;
    labelEnabled: boolean;
    private _labelFont;
    labelFont: string;
    private _labelColor;
    labelColor: string;
    /**
     * Vertical and horizontal label padding as an array of two numbers.
     */
    private _labelPadding;
    labelPadding: {
        x: number;
        y: number;
    };
    highlightStyle: {
        fill?: string;
        stroke?: string;
    };
    private highlightedNode?;
    highlight(node: Shape): void;
    dehighlight(): void;
    processData(): boolean;
    getDomainX(): string[];
    getDomainY(): number[];
    update(): void;
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
export {};
