// ag-grid-enterprise v20.2.0
import { Series } from "./series";
export declare abstract class StackedCartesianSeries<D, X, Y> extends Series<D, X, Y> {
    protected fieldPropertiesX: (keyof this)[];
    protected fieldPropertiesY: (keyof this)[];
    protected _xField: Extract<keyof D, string> | null;
    abstract xField: Extract<keyof D, string> | null;
    protected _yFields: Extract<keyof D, string>[];
    abstract yFields: Extract<keyof D, string>[];
    protected _yFieldNames: string[];
    abstract yFieldNames: string[];
    protected _fullStack: boolean;
    protected _fullStackTotal: number;
}
