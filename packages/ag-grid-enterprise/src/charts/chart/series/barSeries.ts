import {StackedCartesianSeries} from "./stackedCartesianSeries";
import {Group} from "../../scene/group";
import {Selection} from "../../scene/selection";
import {CartesianChart} from "../cartesianChart";
import {Rect} from "../../scene/shape/rect";

export class BarSeries<D, X = string, Y = number> extends StackedCartesianSeries<D, X, Y> {
    set chart(chart: CartesianChart<D, X, Y> | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): CartesianChart<D, X, Y> | null {
        return this._chart as CartesianChart<D, X, Y>;
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

    set xField(value: Extract<keyof D, string> | null) {
        if (this._xField !== value) {
            this._xField = value;
            this.processData();
            this.update();
        }
    }
    get xField(): Extract<keyof D, string> | null {
        return this._xField;
    }

    /**
     * With a single value in the `yFields` array we get the regular bar series.
     * With multiple values, we get the stacked bar series.
     * If the {@link isGrouped} set to `true`, we get the grouped bar series.
     * @param values
     */
    set yFields(values: Extract<keyof D, string>[]) {
        this._yFields = values;
        this.processData();
        this.update();
    }
    get yFields(): Extract<keyof D, string>[] {
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

    private domainX: string[] = [];
    private domainY: [number, number] = [0, 1];
    private yData: number[][] = [];

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
        const xData: string[] = this.domainX = data.map(datum => datum[xField]);
        const yData: number[][] = this.yData = data.map(datum => {
            const values: number[] = [];
            yFields.forEach(field => values.push(datum[field]));
            return values;
        });

        let yMin: number;
        let yMax: number;

        if (this.isGrouped) {
            // Find the tallest positive/negative bar in each group,
            // then find the tallest positive/negative bar overall.
            yMin = Math.min(...yData.map(groupValues => Math.min(...groupValues)));
            yMax = Math.max(...yData.map(groupValues => Math.max(...groupValues)));
        } else { // stacked or regular
            // Find the height of each stack in the positive and negative directions,
            // then find the tallest stacks in both directions.
            yMin = Math.min(...yData.map(stackValues => {
                let min = 0;
                stackValues.forEach(value => {
                    if (value < 0) {
                        min -= value;
                    }
                });
                return min;
            }));
            yMax = Math.max(...yData.map(stackValues => {
                let max = 0;
                stackValues.forEach(value => {
                    if (value > 0) {
                        max += value;
                    }
                });
                return max;
            }));
        }

        this.domainX = xData;
        this.domainY = [yMin, yMax];
    }

    getDomainX(): string[] {
        return this.domainX;
    }

    getDomainY(): [number, number] {
        return this.domainY;
    }

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    update(): void {
        const chart = this.chart;

        if (!chart || chart && chart.isLayoutPending) {
            return;
        }

        const xAxis = chart.xAxis;
        const yAxis = chart.yAxis;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;

        const updateGroups = this.groupSelection.setData(this.domainX);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group).each((group, datum) => {
            // group.translationX = xScale.convert(datum);
        });
        enterGroups.selectAll().setData((parent, datum, i) => {
            return this.yData[i];
        }).enter.call(enter => enter.append(Rect).each((rect, datum, i) => {
        }));
    }
}
