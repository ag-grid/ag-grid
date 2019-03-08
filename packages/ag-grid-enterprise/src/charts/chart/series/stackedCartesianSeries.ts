import {Series} from "./series";

export abstract class StackedCartesianSeries<D> extends Series<D> {

    protected fieldPropertiesX: (keyof this)[] = ['xField'];
    protected fieldPropertiesY: (keyof this)[] = ['yFields'];

    protected _xField: keyof D | null = null;
    abstract set xField(value: keyof D | null);
    abstract get xField(): keyof D | null;

    protected _yFields: (keyof D)[] = [];
    abstract set yFields(value: (keyof D)[]);
    abstract get yFields(): (keyof D)[];

    protected _yFieldNames: string[] = [];
    abstract set yFieldNames(value: string[]);
    abstract get yFieldNames(): string[];

    protected _isFullStack: boolean = false;
    // abstract set isFullStack(value: boolean);
    // abstract get isFullStack(): boolean;

    protected _fullStackTotal: number = 100;
    // abstract set fullStackTotal(value: number);
    // abstract get fullStackTotal(): number;
}
