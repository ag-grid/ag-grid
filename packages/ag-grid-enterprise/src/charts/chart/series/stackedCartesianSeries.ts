import {Series} from "./series";

export abstract class StackedCartesianSeries<D, X, Y> extends Series<D, X, Y> {

    protected fieldPropertiesX: (keyof this)[] = ['xField'];
    protected fieldPropertiesY: (keyof this)[] = ['yFields'];

    protected _xField: Extract<keyof D, string> | null = null;
    abstract set xField(value: Extract<keyof D, string> | null);
    abstract get xField(): Extract<keyof D, string> | null;

    protected _yFields: Extract<keyof D, string>[] = [];
    abstract set yFields(value: Extract<keyof D, string>[]);
    abstract get yFields(): Extract<keyof D, string>[];

    protected _yFieldNames: string[] = [];
    abstract set yFieldNames(value: string[]);
    abstract get yFieldNames(): string[];

    protected _fullStack: boolean = false;
    // abstract set fullStack(value: boolean);
    // abstract get fullStack(): boolean;

    protected _fullStackTotal: number = 100;
    // abstract set fullStackTotal(value: number);
    // abstract get fullStackTotal(): number;
}
