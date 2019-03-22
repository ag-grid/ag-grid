// ag-grid-enterprise v20.2.0
import { StackedCartesianSeries } from "./stackedCartesianSeries";
import { CartesianChart } from "../cartesianChart";
import { DropShadow } from "../../scene/dropShadow";
export declare class BarSeries<D, X = string, Y = number> extends StackedCartesianSeries<D, X, Y> {
    chart: CartesianChart<D, string, number> | null;
    private _data;
    data: any[];
    xField: Extract<keyof D, string> | null;
    /**
     * With a single value in the `yFields` array we get the regular bar series.
     * With multiple values, we get the stacked bar series.
     * If the {@link grouped} set to `true`, we get the grouped bar series.
     * @param values
     */
    yFields: Extract<keyof D, string>[];
    /**
     * If the type of series datum is declared as `any`, one can change the values of the
     * {@link data}, {@link xField} and {@link yFields} configs on the fly, where the type
     * of data and the fields names are completely different from ones currently in use by
     * the series. This can lead to a situation where one sets the new {@link data},
     * which triggers the series to fetch the fields from the datums, but the
     * datums have no such fields. Conversely, one can set the new {@link xField} or {@link yFields}
     * that are not present in the current {@link data}.
     * In such cases, the {@link data}, {@link xField} and {@link yFields} configs have to be set
     * simultaneously, as an atomic operation.
     * @param data
     * @param xField
     * @param yFields
     */
    setDataAndFields(data: any[], xField: Extract<keyof D, string>, yFields: Extract<keyof D, string>[]): void;
    yFieldNames: string[];
    private _grouped;
    grouped: boolean;
    /**
     * The stroke style to use for all bars.
     * `null` value here doesn't mean invisible stroke, as it normally would
     * (see `Shape.strokeStyle` comments), it means derive stroke colors from fill
     * colors by darkening them. To make the stroke appear invisible use the same
     * color as the background of the chart (such as 'white').
     */
    private _strokeStyle;
    strokeStyle: string | null;
    private _lineWidth;
    lineWidth: number;
    private _shadow;
    shadow: DropShadow | null;
    private _labelFont;
    labelFont: string;
    private _labelColor;
    labelColor: string;
    /**
     * Vertical and horizontal label padding as an array of two numbers.
     */
    private _labelPadding;
    labelPadding: [number, number];
    private domainX;
    private domainY;
    private yData;
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    processData(): boolean;
    getDomainX(): string[];
    getDomainY(): number[];
    /**
     * The selection of Group elements, each containing a Rect (bar) and a Text (label) nodes.
     */
    private groupSelection;
    colors: string[];
    private strokeColors;
    update(): void;
}
