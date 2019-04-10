import { Series } from "./series";

export abstract class StackedCartesianSeries<D, X, Y> extends Series<D, X, Y> {

    protected _xField: Extract<keyof D, string> | undefined = undefined;
    abstract set xField(value: Extract<keyof D, string> | undefined);
    abstract get xField(): Extract<keyof D, string> | undefined;

    protected _yFields: Extract<keyof D, string>[] = [];
    abstract set yFields(value: Extract<keyof D, string>[]);
    abstract get yFields(): Extract<keyof D, string>[];

    protected _yFieldNames: string[] = [];
    abstract set yFieldNames(value: string[]);
    abstract get yFieldNames(): string[];
}
