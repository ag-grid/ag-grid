import {StackedCartesianSeries} from "./stackedCartesianSeries";
import {Group} from "../../scene/group";
import {Selection} from "../../scene/selection";
import {CartesianChart} from "../cartesianChart";
import {Rect} from "../../scene/shape/rect";
import {Text} from "../../scene/shape/text";
import {BandScale} from "../../scale/bandScale";
import {DropShadow, Offset} from "../../scene/dropShadow";

enum BarSeriesNodeTag {
    Bar,
    Label
}

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
        if (this.processData()) {
            this.update();
        }
    }
    get data(): any[] {
        return this._data;
    }

    set xField(value: Extract<keyof D, string> | null) {
        if (this._xField !== value) {
            this._xField = value;
            if (this.processData()) {
                this.update();
            }
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

        const groupScale = this.groupScale;
        groupScale.domain = values;
        groupScale.padding = 0.1;
        groupScale.round = true;

        if (this.processData()) {
            this.update();
        }
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
            if (this.processData()) {
                this.update();
            }
        }
    }
    get isGrouped(): boolean {
        return this._isGrouped;
    }

    private domainX: X[] = [];
    private domainY: Y[] = [];
    private yData: number[][] = [];

    /**
     * Used to get the position of bars within each group.
     */
    private groupScale = new BandScale<string>();

    processData(): boolean {
        const data = this.data;
        const n = data.length;
        const xField = this.xField;
        const yFields = this.yFields;
        const yFieldCount = yFields.length;

        if (!(n && xField && yFieldCount)) {
            return false;
        }

        // If the data is an array of rows like so:
        //
        // [{
        //   xField: 'Jan',
        //   yField1: 5,
        //   yField2: 7,
        //   yField3: -9,
        // }, {
        //   xField: 'Feb',
        //   yField1: 10,
        //   yField2: -15,
        //   yField3: 20
        // }]
        //
        const xData: X[] = this.domainX = data.map(datum => datum[xField]);
        const yData: number[][] = this.yData = data.map(datum => {
            const values: number[] = [];
            yFields.forEach(field => values.push(datum[field]));
            return values;
        });

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        // Each field corresponds to a subseries.
        // const yData: number[][] = this.yData = yFields.map(field => data.map(datum => datum[field]));

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 10],  // yField1
        //   [7, -15], // yField2
        //   [-9, 20]  // yField3
        // ]

        let yMin: number = Infinity;
        let yMax: number = -Infinity;

        // if (this.isGrouped) {
        //     // Find the largest positive/negative value (tallest bar) in each subseries,
        //     // then find the tallest positive/negative bar overall.
        //     // The minimum value for positive bars is always zero, otherwise the lowest
        //     // positive bar will have zero height.
        //     yMin = Math.min(...yData.map(values => Math.min(0, ...values)));
        //     yMax = Math.max(...yData.map(values => Math.max(...values)));
        // } else {
        //     // Find the height of each stack in the positive and negative directions,
        //     // and the tallest stacks overall in both directions.
        //     for (let j = 0; j < n; j++) {
        //         let lo = 0;
        //         let hi = 0;
        //         for (let i = 0; i < yFieldCount; i++) {
        //             const datum = yData[i][j];
        //             if (datum >= 0) {
        //                 hi += datum;
        //             } else {
        //                 lo += datum;
        //             }
        //         }
        //         if (lo < yMin) {
        //             yMin = lo;
        //         }
        //         if (hi > yMax) {
        //             yMax = hi;
        //         }
        //     }
        // }

        // debugger;

        if (this.isGrouped) {
            // Find the tallest positive/negative bar in each group,
            // then find the tallest positive/negative bar overall.
            yMin = Math.min(...yData.map(groupValues => Math.min(0, ...groupValues)));
            yMax = Math.max(...yData.map(groupValues => Math.max(...groupValues)));
        } else { // stacked or regular
            // Find the height of each stack in the positive and negative directions,
            // then find the tallest stacks in both directions.
            yMin = Math.min(0, ...yData.map(stackValues => {
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
        this.domainY = [yMin, yMax] as unknown as Y[];

        const chart = this.chart;
        if (chart) {
            chart.updateAxes();
        }

        return true;
    }

    getDomainX(): X[] {
        return this.domainX;
    }

    getDomainY(): Y[] {
        return this.domainY;
    }

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    colors: string[] = [
        '#5BC0EB',
        '#FDE74C',
        '#9BC53D',
        '#E55934',
        '#FA7921',
        '#fa3081'
    ];

    private shadow = new DropShadow('rgba(0,0,0,0.2)', new Offset(0, 0), 15);

    update(): void {
        const chart = this.chart;

        if (!chart || chart && chart.isLayoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }

        const n = this.data.length;
        const xAxis = chart.xAxis;
        const yAxis = chart.yAxis;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const groupScale = this.groupScale;
        const yFields = this.yFields;
        const colors = this.colors;
        const seriesHeight = Math.abs(yScale.range[1] - yScale.range[0]);
        const isGrouped = this.isGrouped;

        groupScale.range = [0, xScale.bandwidth!];
        const barWidth = isGrouped ? groupScale.bandwidth! : xScale.bandwidth!;

        const barData: {
            x: number,
            y: number,
            width: number,
            height: number,
            fillStyle: string,
            label: string
        }[] = [];

        for (let i = 0; i < n; i++) {
            const category = this.domainX[i];
            const values = this.yData[i];
            const x = xScale.convert(category);
            let yFieldIndex = 0;
            values.reduce((prev, curr) => {
                const y0 = yScale.convert((isGrouped ? 0 : prev) as unknown as Y);
                const y1 = yScale.convert((isGrouped ? curr : prev + curr) as unknown as Y);
                const color = this.colors[yFieldIndex % this.colors.length];
                barData.push({
                    x: x + (isGrouped ? groupScale.convert(yFields[yFieldIndex]) : 0),
                    y: y1,
                    width: barWidth,
                    height: y0 - y1,
                    fillStyle: color,
                    label: this.yFieldNames[yFieldIndex]
                });

                yFieldIndex++;
                return isGrouped ? curr : curr + prev;
            }, 0);
        }

        const updateGroups = this.groupSelection.setData(barData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Rect).each(node => node.tag = BarSeriesNodeTag.Bar);
        enterGroups.append(Text).each(node => node.tag = BarSeriesNodeTag.Label);

        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.selectByTag<Rect>(BarSeriesNodeTag.Bar)
            .each((rect, datum) => {
                rect.x = datum.x;
                rect.y = datum.y;
                rect.width = datum.width;
                rect.height = datum.height;
                rect.fillStyle = datum.fillStyle;
                rect.strokeStyle = 'black';
                rect.shadow = this.shadow;
            });

        groupSelection.selectByTag<Text>(BarSeriesNodeTag.Label)
            .each((text, datum) => {
                text.text = datum.label;
                text.textAlign = 'center';
                text.x = datum.x + datum.width / 2;
                text.y = datum.y + 20;
                text.fillStyle = 'black';
                text.font = '14px Verdana';
            });

        this.groupSelection = groupSelection;

        // -----------------------------------------------

        // const updateSubseriesGroups = this.groupSelection.setData(this.yFields);
        // updateSubseriesGroups.exit.remove(); // Remove subseries.
        //
        // // Create a Group for each subseries.
        // const enterSubseriesGroups = updateSubseriesGroups.enter.append(Group);
        // // Each bar group contains a bar and its label.
        // const barGroups = enterSubseriesGroups.selectAll().setData((parent, datum, i) => {
        //     debugger;
        //     return this.yData[i];
        // }).enter.append(Group)
        //     .call(enter => enter.append(Rect))
        //     .call(enter => enter.append(Text));
        //
        // barGroups.each(node => console.log(node.datum));

        // const groupSelection = updateSubseriesGroups.merge(enterSubseriesGroups);
        //
        // debugger;
        // barGroups.selectByClass(Rect).each((rect, datum, i) => {
        //     debugger;
        //     rect.x = groupScale.convert(yFields[i]);
        //     rect.y = yScale.convert(datum as unknown as Y);
        //     rect.width = barWidth;
        //     rect.height = seriesHeight - rect.y;
        //     rect.fillStyle = colors[i % colors.length];
        //     rect.strokeStyle = 'black';
        //     rect.shadow = this.shadow;
        // });
        //
        // barGroups.selectByClass(Text).each((label, datum, i) => {
        //     label.text = this.yFieldNames[i];
        //     label.textAlign = 'center';
        //     label.x = groupScale.convert(yFields[i]) + barWidth / 2;
        //     label.y = yScale.convert(datum as unknown as Y) + 20;
        //     label.fillStyle = 'black';
        //     label.font = '14px Verdana';
        // });

        // this.groupSelection = groupSelection;
    }
}
