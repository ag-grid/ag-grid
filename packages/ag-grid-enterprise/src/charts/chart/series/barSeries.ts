import {StackedCartesianSeries} from "./stackedCartesianSeries";
import {Group} from "../../scene/group";
import {Selection} from "../../scene/selection";
import {CartesianChart} from "../cartesianChart";
import {Rect} from "../../scene/shape/rect";
import {Text} from "../../scene/shape/text";
import {BandScale} from "../../scale/bandScale";
import {DropShadow} from "../../scene/dropShadow";
import colors from "../colors";
import {Color} from "../../util/color";

type BarDatum = {
    x: number,
    y: number,
    width: number,
    height: number,
    fillStyle: string | null,
    strokeStyle: string,
    lineWidth: number,
    label?: {
        text: string,
        font: string,
        fillStyle: string,
        x: number,
        y: number
    }
};

enum BarSeriesNodeTag {
    Bar,
    Label
}

export class BarSeries<D, X = string, Y = number> extends StackedCartesianSeries<D, X, Y> {
    set chart(chart: CartesianChart<D, string, number> | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): CartesianChart<D, string, number> | null {
        return this._chart as CartesianChart<D, string, number>;
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
     * If the {@link grouped} set to `true`, we get the grouped bar series.
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

    /**
     * If the type of series datum is declared as `any`, one can change the values of the
     * {@link data}, {@link xField} and {@link yFields} configs on the fly, where the type
     * of data and the fields names are completely different from ones currently in use by
     * the series. This can lead to a situation where one sets the new {@link data},
     * which triggers the series to fetch the fields from the datums, but the
     * datums have no such fields. Conversely, one can set the new {@link xField} or {@link yFields}
     * that are not present in the current {@link data}.
     * In such cases, the {@link data}, {@link xField} and {@link yFields} configs have to be set
     * simultaneously, as an atomic operation.
     * @param data
     * @param xField
     * @param yFields
     */
    setDataAndFields(data: any[], xField: Extract<keyof D, string>, yFields: Extract<keyof D, string>[]) {
        this._xField = xField;
        this._yFields = yFields;
        this._data = data;

        const groupScale = this.groupScale;
        groupScale.domain = yFields;
        groupScale.padding = 0.1;
        groupScale.round = true;

        if (this.processData()) {
            this.update();
        }
    }

    set yFieldNames(values: string[]) {
        this._yFieldNames = values;
        this.update();
    }
    get yFieldNames(): string[] {
        return this._yFieldNames;
    }

    private _grouped: boolean = false;
    set grouped(value: boolean) {
        if (this._grouped !== value) {
            this._grouped = value;
            if (this.processData()) {
                this.update();
            }
        }
    }
    get grouped(): boolean {
        return this._grouped;
    }

    /**
     * The stroke style to use for all bars.
     * `null` value here doesn't mean invisible stroke, as it normally would
     * (see `Shape.strokeStyle` comments), it means derive stroke colors from fill
     * colors by darkening them. To make the stroke appear invisible use the same
     * color as the background of the chart (such as 'white').
     */
    private _strokeStyle: string | null = null;
    set strokeStyle(value: string | null) {
        if (this._strokeStyle !== value) {
            this._strokeStyle = value;
            this.update();
        }
    }
    get strokeStyle(): string | null {
        return this._strokeStyle;
    }

    private _lineWidth: number = 2;
    set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            this.update();
        }
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    private _shadow: DropShadow | null = null;
    set shadow(value: DropShadow | null) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.update();
        }
    }
    get shadow(): DropShadow | null {
        return this._shadow;
    }

    private _labelFont: string = '12px Tahoma';
    set labelFont(value: string) {
        if (this._labelFont !== value) {
            this._labelFont = value;
            this.update();
        }
    }
    get labelFont(): string {
        return this._labelFont;
    }

    private _labelColor: string = 'black';
    set labelColor(value: string) {
        if (this._labelColor !== value) {
            this._labelColor = value;
            this.update();
        }
    }
    get labelColor(): string {
        return this._labelColor;
    }

    /**
     * Vertical and horizontal label padding as an array of two numbers.
     */
    private _labelPadding: [number, number] = [10, 10];
    set labelPadding(value: [number, number]) {
        if (this._labelPadding !== value) {
            this._labelPadding = value;
            this.update();
        }
    }
    get labelPadding(): [number, number] {
        return this._labelPadding;
    }

    private domainX: string[] = [];
    private domainY: number[] = [];
    private yData: number[][] = [];

    /**
     * Used to get the position of bars within each group.
     */
    private groupScale = new BandScale<string>();

    processData(): boolean {
        const data = this.data;
        const xField = this.xField;
        const yFields = this.yFields;

        if (!(xField && yFields.length)) {
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
        const xData: string[] = this.domainX = data.map(datum => {
            const value = datum[xField];
            if (typeof value !== 'string') {
                throw new Error(`The ${xField} value is not a string. `
                    + `This error might be solved by using the 'setDataAndFields' method.`);
            }
            return value;
        });
        const yData: number[][] = this.yData = data.map(datum => {
            const values: number[] = [];
            yFields.forEach(field => {
                const value = datum[field];
                if (isNaN(value)) {
                    throw new Error(`The ${field} value is not a number. `
                        + `This error might be solved by using the 'setDataAndFields' method.`);
                }
                values.push(value);
            });
            return values;
        });

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        let yMin: number = Infinity;
        let yMax: number = -Infinity;

        if (this.grouped) {
            // Find the tallest positive/negative bar in each group,
            // then find the tallest positive/negative bar overall.
            // The `yMin` should always be <= 0,
            // otherwise with the `yData` like [300, 200, 100] the last bar
            // will have zero height, because the y-axis range is [100, 300].
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

        if (yMin === yMax || !isFinite(yMin) || !isFinite(yMax)) {
            yMin = 0;
            yMax = 1;
            // console.warn('Zero or infinite y-range.');
        }

        this.domainX = xData;
        this.domainY = [yMin, yMax];

        const chart = this.chart;
        if (chart) {
            chart.updateAxes();
        }

        return true;
    }

    getDomainX(): string[] {
        return this.domainX;
    }

    getDomainY(): number[] {
        return this.domainY;
    }

    /**
     * The selection of Group elements, each containing a Rect (bar) and a Text (label) nodes.
     */
    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    colors: string[] = colors;
    private strokeColors = colors.map(color => Color.fromHexString(color).darker().toHexString());

    update(): void {
        const chart = this.chart;

        if (!chart || chart && chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
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
        const strokeColor = this.strokeStyle;
        const strokeColors = this.strokeColors;
        const grouped = this.grouped;
        const lineWidth = this.lineWidth;
        const labelFont = this.labelFont;
        const labelColor = this.labelColor;
        const labelPadding = this.labelPadding;

        groupScale.range = [0, xScale.bandwidth!];
        const barWidth = grouped ? groupScale.bandwidth! : xScale.bandwidth!;

        const barData: BarDatum[] = [];

        for (let i = 0; i < n; i++) {
            const category = this.domainX[i];
            const values = this.yData[i];
            let x = xScale.convert(category);
            let yFieldIndex = 0;
            values.reduce((prev, curr) => {
                const barX = grouped ? x + groupScale.convert(yFields[yFieldIndex]) : x;
                const y = yScale.convert(grouped ? curr : prev + curr);
                const bottomY = yScale.convert(grouped ? 0 : prev);
                const labelText = this.yFieldNames[yFieldIndex];

                barData.push({
                    x: barX,
                    y,
                    width: barWidth,
                    height: bottomY - y,
                    fillStyle: colors[yFieldIndex % colors.length],
                    strokeStyle: strokeColor ? strokeColor : strokeColors[yFieldIndex % strokeColors.length],
                    lineWidth,
                    label: labelText ? {
                        text: labelText,
                        font: labelFont,
                        fillStyle: labelColor,
                        x: barX + barWidth / 2,
                        y: y + lineWidth / 2 + labelPadding[0]
                    } : undefined
                });

                yFieldIndex++;
                return grouped ? curr : curr + prev;
            }, 0);
        }

        const updateGroups = this.groupSelection.setData(barData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Rect).each(rect => {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });
        enterGroups.append(Text).each(text => {
            text.tag = BarSeriesNodeTag.Label;
            text.textBaseline = 'hanging';
            text.textAlign = 'center';
        });

        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.selectByTag<Rect>(BarSeriesNodeTag.Bar)
            .each((rect, datum) => {
                rect.x = datum.x;
                rect.y = datum.y;
                rect.width = datum.width;
                rect.height = datum.height;
                rect.fillStyle = datum.fillStyle;
                rect.strokeStyle = datum.strokeStyle;
                rect.lineWidth = datum.lineWidth;
                rect.shadow = this.shadow;
                rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
            });

        groupSelection.selectByTag<Text>(BarSeriesNodeTag.Label)
            .each((text, datum) => {
                const label = datum.label;
                if (label) {
                    text.font = label.font;
                    text.text = label.text;
                    text.x = label.x;
                    text.y = label.y;
                    text.fillStyle = label.fillStyle;
                    const textBBox = text.getBBox();
                    text.visible = datum.height > (textBBox.height + datum.lineWidth + labelPadding[0] * 2)
                        && datum.width > (textBBox.width + datum.lineWidth + labelPadding[1] * 2);
                } else {
                    text.visible = false;
                }
            });

        this.groupSelection = groupSelection;
    }
}
