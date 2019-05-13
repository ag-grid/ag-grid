import { Series } from "./series";

export abstract class CartesianSeries extends Series {

    protected _xField: string = '';
    abstract set xField(value: string);
    abstract get xField(): string;

    protected _yField: string = '';
    abstract set yField(value: string);
    abstract get yField(): string;
}
