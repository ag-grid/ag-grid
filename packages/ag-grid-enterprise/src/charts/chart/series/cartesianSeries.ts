import {Series} from "./series";

export abstract class CartesianSeries<D, X, Y> extends Series<D, X, Y> {

    protected fieldPropertiesX: (keyof this)[] = ['xField'];
    protected fieldPropertiesY: (keyof this)[] = ['yField'];

    protected _xField: string = '';
    abstract set xField(value: string);
    abstract get xField(): string;

    protected _yField: string = '';
    abstract set yField(value: string);
    abstract get yField(): string;

    // protected _xAxis: CartesianAxis | null = null;
    // protected _yAxis: CartesianAxis | null = null;
}
