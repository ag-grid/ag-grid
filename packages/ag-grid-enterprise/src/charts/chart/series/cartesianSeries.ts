import { Series } from "./series";

export abstract class CartesianSeries<D, X, Y> extends Series<D, X, Y> {

    protected _xField: Extract<keyof D, string> | undefined = undefined;
    abstract set xField(value: Extract<keyof D, string> | undefined);
    abstract get xField(): Extract<keyof D, string> | undefined;

    protected _yField: Extract<keyof D, string> | undefined = undefined;
    abstract set yField(value: Extract<keyof D, string> | undefined);
    abstract get yField(): Extract<keyof D, string> | undefined;
}
