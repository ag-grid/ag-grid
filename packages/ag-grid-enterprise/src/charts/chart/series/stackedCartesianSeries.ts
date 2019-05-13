import { Series } from "./series";

export abstract class StackedCartesianSeries extends Series {

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    protected readonly enabled = new Map<string, boolean>();

    protected _xField: string = '';
    abstract set xField(value: string);
    abstract get xField(): string;

    protected _yFields: string[] = [];
    abstract set yFields(value: string[]);
    abstract get yFields(): string[];

    protected _yFieldNames: string[] = [];
    abstract set yFieldNames(value: string[]);
    abstract get yFieldNames(): string[];
}
