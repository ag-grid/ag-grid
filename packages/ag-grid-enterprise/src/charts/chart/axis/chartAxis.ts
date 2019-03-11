export enum Direction {
    X = 'X',
    Y = 'Y'
}

export enum AxisType {
    Linear,
    Band,
    Log,
    Time
}

export abstract class ChartAxis<T> {
    // protected constructor(type: AxisType = AxisType.Linear) {
    //     this.type = type;
    // }
    //
    // protected type: AxisType;

    protected _fields: string[] = [];
    set fields(values: string[]) {
        this._fields = values;
    }
    get fields(): string[] {
        return this._fields;
    }

    // abstract get direction(): Direction;

    // abstract calculateRange(): [number, number];

}
