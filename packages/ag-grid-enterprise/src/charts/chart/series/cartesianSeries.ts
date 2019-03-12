import {Series} from "./series";

export abstract class CartesianSeries<D, X, Y> extends Series<D, X, Y> {

    protected fieldPropertiesX: (keyof this)[] = ['xField'];
    protected fieldPropertiesY: (keyof this)[] = ['yField'];

    protected _xField: Extract<keyof D, string> | null = null;
    abstract set xField(value: Extract<keyof D, string> | null);
    abstract get xField(): Extract<keyof D, string> | null;

    protected _yField: Extract<keyof D, string> | null = null;
    abstract set yField(value: Extract<keyof D, string> | null);
    abstract get yField(): Extract<keyof D, string> | null;

    // protected _xAxis: CartesianAxis | null = null;
    // protected _yAxis: CartesianAxis | null = null;
}
