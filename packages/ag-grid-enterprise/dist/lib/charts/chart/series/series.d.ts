// ag-grid-enterprise v20.2.0
import { Group } from "../../scene/group";
import { Chart } from "../chart";
export declare abstract class Series<D, X, Y> {
    private createId;
    readonly id: string;
    abstract data: D[];
    protected _chart: Chart<D, X, Y> | null;
    abstract chart: Chart<D, X, Y> | null;
    readonly group: Group;
    private _visible;
    visible: boolean;
    /**
     * Returns the names of all properties series use in the given direction.
     * For example, cartesian series have the `xField` and `yField` properties,
     * so `getFields(Direction.X)` will return the value of the `xField`.
     * Stacked cartesian series have the `xField` and `yFields` properties,
     * where the `yFields` is an array of strings, so `getFields(Direction.Y)`
     * will return the values in the `yFields` property.
     * Something like a candlestick series may have `xField`, `openField`, `highField`,
     * `lowField`, `closeField` properties, so the `getFields(Direction.Y)` will
     * return the values of the `openField`, `highField`, `lowField`, `closeField`.
     * @param direction
     */
    /**
     * Finds the first matching axis for the series fields.
     * The provides `axes` and `seriesFields` should have the same direction.
     * @param axes
     * @param seriesFields
     */
    abstract getDomainX(): any[];
    abstract getDomainY(): any[];
    abstract processData(): boolean;
    abstract update(): void;
}
