import { Series } from "./series";

export abstract class StackedCartesianSeries<D, X, Y> extends Series<D, X, Y> {

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    protected readonly enabled = new Map<string, boolean>();

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
