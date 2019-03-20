// ag-grid-enterprise v20.2.0
import { Series } from "./series";
export declare abstract class CartesianSeries<D, X, Y> extends Series<D, X, Y> {
    protected fieldPropertiesX: (keyof this)[];
    protected fieldPropertiesY: (keyof this)[];
    protected _xField: Extract<keyof D, string> | null;
    abstract xField: Extract<keyof D, string> | null;
    protected _yField: Extract<keyof D, string> | null;
    abstract yField: Extract<keyof D, string> | null;
}
