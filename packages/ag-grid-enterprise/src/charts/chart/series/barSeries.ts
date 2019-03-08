import {StackedCartesianSeries} from "./stackedCartesianSeries";
import {Chart} from "../chart";

export class BarSeries<D> extends StackedCartesianSeries<D> {
    set chart(chart: Chart<D> | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): Chart<D> | null {
        return this._chart;
    }

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        this.processData();

        if (this.chart && this.chart.isLayoutPending) {
            return;
        }

        this.update();
    }
    get data(): any[] {
        return this._data;
    }

    set xField(value: keyof D | null) {
        if (this._xField !== value) {
            this._xField = value;
            this.processData();
            this.update();
        }
    }
    get xField(): keyof D | null {
        return this._xField;
    }

    set yFields(values: (keyof D)[]) {
        this._yFields = values;
        this.processData();
        this.update();
    }
    get yFields(): (keyof D)[] {
        return this._yFields;
    }

    set yFieldNames(values: string[]) {
        this._yFieldNames = values;
        this.update();
    }
    get yFieldNames(): string[] {
        return this._yFieldNames;
    }

    private _isGrouped: boolean = false;
    set isGrouped(value: boolean) {
        if (this._isGrouped !== value) {
            this._isGrouped = value;
        }
    }
    get isGrouped(): boolean {
        return this._isGrouped;
    }

    private domainX: any[] = [];
    private domainY: [number, number] = [0, 1];

    processData(): void {
        const data = this.data;
        const xField = this.xField;
        const yFields = this.yFields;

        // If the data is an array of rows like so:
        //
        //   [{
        //       xField: 'Jan',
        //       yField1: 5,
        //       yField2: 7,
        //       yField3: 9,
        //   }, {
        //       xField: 'Feb',
        //       yField1: 10,
        //       yField2: 15,
        //       yField3: 20
        //   }]
        //
        const xData: any[] = this.domainX = data.map(datum => datum[xField]);
        const yData: number[][] = data.map(datum => {
            const values: number[] = [];
            yFields.forEach(field => values.push(datum[field]));
            return values;
        });

        // Find the tallest positive/negative bar in each group,
        // then find the tallest positive/negative bar overall.
        const yMin = Math.min(...yData.map(groupValues => Math.min(...groupValues)));
        const yMax = Math.max(...yData.map(groupValues => Math.max(...groupValues)));

        this.domainY = [yMin, yMax];
        // const yDataAlt = yFields.map(field => data.map(datum => datum[field]));

        // const axis = this.xAxis;
    }

    getDomainX(): any[] {
        return this.domainX;
    }

    getDomainY(): [number, number] {
        return this.domainY;
    }

    update(): void {

    }
}
