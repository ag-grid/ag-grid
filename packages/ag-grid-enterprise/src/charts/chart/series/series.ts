import {Group} from "../../scene/group";
import {Chart} from "../chart";

export abstract class Series<D, X, Y> {

    // Uniquely identify series.
    private createId(): string {
        const constructor = this.constructor as any;
        return constructor.name + '-' + (constructor.id = (constructor.id || 0) + 1);
    };
    readonly id: string = this.createId();

    abstract set data(data: D[]);
    abstract get data(): D[];

    protected _chart: Chart<D, X, Y> | null = null;
    abstract set chart(chart: Chart<D, X, Y> | null);
    abstract get chart(): Chart<D, X, Y> | null;

    readonly group: Group = new Group();

    private _visible: boolean = true;
    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this.update();
        }
    }
    get visible(): boolean {
        return this._visible;
    }

    // private _xAxis: ChartAxis<X>;
    // set xAxis(value: ChartAxis<X>) {
    //     this._xAxis = value;
    // }
    // get xAxis(): ChartAxis<X> {
    //     return this._xAxis;
    // }
    //
    // private _yAxis: ChartAxis<Y>;
    // set yAxis(value: ChartAxis<Y>) {
    //     this._yAxis = value;
    // }
    // get yAxis(): ChartAxis<Y> {
    //     return this._yAxis;
    // }

    /**
     * Returns the names of all properties series use in the given direction.
     * For example, cartesian series have the `xField` and `yField` properties,
     * so `getFields(Direction.X)` will return the value of the `xField`.
     * Stacked cartesian series have the `xField` and `yFields` properties,
     * where the `yFields` is an array of strings, so `getFields(Direction.Y)`
     * will return the values in the `yFields` property.
     * Something like a candlestick series may have `xField`, `openField`, `highField`,
     * `lowField`, `closeField` properties, so the `getFields(Direction.Y)` will
     * return the values of the `openField`, `highField`, `lowField`, `closeField`.
     * @param direction
     */
    // getFields(direction: Direction): string[] {
    //     let fields: string[] = (this as any)['fieldProperties' + direction];
    //     // The `join().split(',')` is equivalent to `flatMap(f => f)` in this case.
    //     return fields.map(field => (this as any)[field]).join().split(',');
    // }

    // updateAxes() {
    //     if (!this.chart) {
    //         return;
    //     }
    //
    //     const xFields = this.getFields(Direction.X);
    //     const yFields = this.getFields(Direction.Y);
    //
    //     const xAxes: ChartAxis[] = [];
    //     const yAxes: ChartAxis[] = [];
    //
    //     this.chart.axes.forEach(axis => {
    //         if (axis.direction === Direction.X) {
    //             xAxes.push(axis)
    //         } else if (axis.direction === Direction.Y) {
    //             yAxes.push(axis);
    //         }
    //     });
    //
    //     const xAxis = this.findMatchingAxis(xAxes, xFields);
    //     const yAxis = this.findMatchingAxis(yAxes, yFields);
    //
    //     if (xAxis) {
    //         this.xAxis = xAxis;
    //     }
    //     if (yAxis) {
    //         this.yAxis = yAxis;
    //     }
    // }

    /**
     * Finds the first matching axis for the series fields.
     * The provides `axes` and `seriesFields` should have the same direction.
     * @param axes
     * @param seriesFields
     */
    // private findMatchingAxis(axes: ChartAxis[], seriesFields: string[]): ChartAxis | null {
    //     for (let i = 0; i < axes.length; i++) {
    //         const axis = axes[i];
    //         const axisFields = axis.fields;
    //         // An axis may not define any fields, but if its direction matches
    //         // the direction of the series' fields, we assume we can use it
    //         // to map the data in those fields.
    //         if (!axisFields.length) {
    //             return axis;
    //         } else {
    //             // Otherwise, we look at least one of the axis fields
    //             // to match one of the series fields.
    //             for (let j = 0; j < seriesFields.length; j++) {
    //                 if (axisFields.indexOf(seriesFields[j]) >= 0) {
    //                     return axis;
    //                 }
    //             }
    //         }
    //     }
    //     return null;
    // }

    abstract getDomainX(): any[];
    abstract getDomainY(): any[];

    abstract processData(): boolean;
    abstract update(): void;
}
