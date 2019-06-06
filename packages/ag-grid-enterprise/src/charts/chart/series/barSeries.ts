import { Group } from "../../scene/group";
import { Selection } from "../../scene/selection";
import { CartesianChart } from "../cartesianChart";
import { Rect } from "../../scene/shape/rect";
import { Text } from "../../scene/shape/text";
import { BandScale } from "../../scale/bandScale";
import { DropShadow } from "../../scene/dropShadow";
import palette from "../palettes";
import { Color } from "../../util/color";
import { Series, SeriesNodeDatum } from "./series";
import { PointerEvents } from "../../scene/node";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";

interface GroupSelectionDatum extends SeriesNodeDatum {
    yField: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string,
    stroke?: string,
    strokeWidth: number,
    label?: {
        text: string,
        font: string,
        fill: string,
        x: number,
        y: number
    }
}

enum BarSeriesNodeTag {
    Bar,
    Label
}

export interface BarTooltipRendererParams {
    datum: any,
    xField: string,
    yField: string
}

export class BarSeries extends Series<CartesianChart> {

    static className = 'BarSeries';

    tooltipRenderer?: (params: BarTooltipRendererParams) => string;

    /**
     * The selection of Group elements, each containing a Rect (bar) and a Text (label) nodes.
     */
    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    protected readonly enabled = new Map<string, boolean>();

    private _fills: string[] = palette.fills;
    set fills(values: string[]) {
        this._fills = values;
        this.strokes = values.map(color => Color.fromString(color).darker().toHexString());
        this.scheduleData();
    }
    get fills(): string[] {
        return this._fills;
    }

    private _strokes: string[] = palette.strokes;
    set strokes(values: string[]) {
        this._strokes = values;
        this.scheduleData();
    }
    get strokes(): string[] {
        return this._strokes;
    }

    private xData: string[] = [];
    private yData: number[][] = [];
    private domainY: number[] = [];

    /**
     * Used to get the position of bars within each group.
     */
    private groupScale = new BandScale<string>();

    set chart(chart: CartesianChart | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | null {
        return this._chart as CartesianChart;
    }

    protected _xField: string = '';
    set xField(value: string) {
        if (this._xField !== value) {
            this._xField = value;
            this.xData = [];
            this.scheduleData();
        }
    }
    get xField(): string {
        return this._xField;
    }

    /**
     * With a single value in the `yFields` array we get the regular bar series.
     * With multiple values, we get the stacked bar series.
     * If the {@link grouped} set to `true`, we get the grouped bar series.
     * @param values
     */
    protected _yFields: string[] = [];
    set yFields(values: string[]) {
        this._yFields = values;

        const enabled = this.enabled;
        enabled.clear();
        values.forEach(field => enabled.set(field, true));

        const groupScale = this.groupScale;
        groupScale.domain = values;
        groupScale.padding = 0.1;
        groupScale.round = true;

        this.yData = [];
        this.scheduleData();
    }
    get yFields(): string[] {
        return this._yFields;
    }

    protected _yFieldNames: string[] = [];
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
            this.scheduleData();
        }
    }
    get grouped(): boolean {
        return this._grouped;
    }

    private _strokeWidth: number = 1;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _shadow: DropShadow | undefined = undefined;
    set shadow(value: DropShadow | undefined) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.update();
        }
    }
    get shadow(): DropShadow | undefined {
        return this._shadow;
    }

    private _labelEnabled: boolean = true;
    set labelEnabled(value: boolean) {
        if (this._labelEnabled !== value) {
            this._labelEnabled = value;
            this.update();
        }
    }
    get labelEnabled(): boolean {
        return this._labelEnabled;
    }

    private _labelFont: string = '12px Verdana, sans-serif';
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
    private _labelPadding: {x: number, y: number} = {x: 10, y: 10};
    set labelPadding(value: {x: number, y: number}) {
        if (this._labelPadding !== value) {
            this._labelPadding = value;
            this.update();
        }
    }
    get labelPadding(): {x: number, y: number} {
        return this._labelPadding;
    }

    highlightStyle: {
        fill?: string,
        stroke?: string
    } = {
        fill: 'yellow'
    };

    private highlightedNode?: Rect;

    highlight(node: Shape) {
        if (!(node instanceof Rect)) {
            return;
        }

        this.highlightedNode = node;
        this.scheduleLayout();
    }

    dehighlight() {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    }

    processData(): boolean {
        let data = this.data as any[];
        const xField = this.xField;
        const yFields = this.yFields;

        if (!(xField && yFields.length)) {
            this._data = data = [];
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
        const enabled = this.enabled;
        const xData: string[] = this.xData = data.map(datum => datum[xField]);
        const yData: number[][] = this.yData = data.map(datum => {
            const values: number[] = [];
            yFields.forEach(field => {
                let value = datum[field];
                if (isNaN(value) || !isFinite(value)) {
                    value = 0;
                }
                values.push(enabled.get(field) ? value : 0);
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

        this.domainY = [yMin, yMax];

        const chart = this.chart;
        if (chart) {
            chart.updateAxes();
        }

        return true;
    }

    getDomainX(): string[] {
        return this.xData;
    }

    getDomainY(): number[] {
        return this.domainY;
    }

    update(): void {
        const chart = this.chart;
        const visible = this.group.visible = this.visible;

        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }

        const n = this.data.length;
        const xAxis = chart.xAxis;
        const yAxis = chart.yAxis;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const groupScale = this.groupScale;
        const yFields = this.yFields;
        const fills = this.fills;
        const strokes = this.strokes;
        const grouped = this.grouped;
        const strokeWidth = this.strokeWidth;
        const labelFont = this.labelFont;
        const labelColor = this.labelColor;
        const labelPadding = this.labelPadding;
        const data = this.data;
        const xData = this.xData;
        const yData = this.yData;
        const labelEnabled = this.labelEnabled;

        groupScale.range = [0, xScale.bandwidth!];
        const barWidth = grouped ? groupScale.bandwidth! : xScale.bandwidth!;

        const groupSelectionData: GroupSelectionDatum[] = [];

        for (let i = 0; i < n; i++) {
            const category = xData[i];
            const values = yData[i];
            const x = xScale.convert(category);
            let yFieldIndex = 0;
            values.reduce((prev, curr) => {
                const yField = yFields[yFieldIndex];
                const barX = grouped ? x + groupScale.convert(yField) : x;
                const y = yScale.convert((grouped ? curr : prev + curr));
                const bottomY = yScale.convert((grouped ? 0 : prev));
                const labelText = this.yFieldNames[yFieldIndex];

                groupSelectionData.push({
                    seriesDatum: data[i],
                    yField,
                    x: barX,
                    y: Math.min(y, bottomY),
                    width: barWidth,
                    height: Math.abs(bottomY - y),
                    fill: fills[yFieldIndex % fills.length],
                    stroke: strokes[yFieldIndex % strokes.length],
                    strokeWidth,
                    label: labelText ? {
                        text: labelText,
                        font: labelFont,
                        fill: labelColor,
                        x: barX + barWidth / 2,
                        y: y + strokeWidth / 2 + labelPadding.x
                    } : undefined
                });

                yFieldIndex++;
                return grouped ? curr : curr + prev;
            }, 0);
        }

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Rect).each(rect => {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });
        enterGroups.append(Text).each(text => {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textBaseline = 'hanging';
            text.textAlign = 'center';
        });

        const highlightedNode = this.highlightedNode;
        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.selectByTag<Rect>(BarSeriesNodeTag.Bar)
            .each((rect, datum) => {
                rect.x = datum.x;
                rect.y = datum.y;
                rect.width = datum.width;
                rect.height = datum.height;
                rect.fill = rect === highlightedNode && this.highlightStyle.fill !== undefined
                    ? this.highlightStyle.fill
                    : datum.fill;
                rect.stroke = rect === highlightedNode && this.highlightStyle.stroke !== undefined
                    ? this.highlightStyle.stroke
                    : datum.stroke;
                rect.strokeWidth = datum.strokeWidth;
                rect.fillShadow = this.shadow;
                rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
            });

        groupSelection.selectByTag<Text>(BarSeriesNodeTag.Label)
            .each((text, datum) => {
                const label = datum.label;
                if (label && labelEnabled) {
                    text.font = label.font;
                    text.text = label.text;
                    text.x = label.x;
                    text.y = label.y;
                    text.fill = label.fill;
                    const textBBox = text.getBBox();
                    text.visible = datum.height > (textBBox.height + datum.strokeWidth + labelPadding.x * 2)
                        && datum.width > (textBBox.width + datum.strokeWidth + labelPadding.y * 2);
                } else {
                    text.visible = false;
                }
            });

        this.groupSelection = groupSelection;
    }

    getTooltipHtml(nodeDatum: GroupSelectionDatum): string {
        let html: string = '';
        if (this.tooltipEnabled) {
            const xField = this.xField;
            const yField = nodeDatum.yField;

            if (this.tooltipRenderer && xField) {
                html = this.tooltipRenderer({
                    datum: nodeDatum.seriesDatum,
                    xField,
                    yField,
                });
            } else {
                const title = nodeDatum.label ? `<div class="title">${nodeDatum.label.text}</div>` : '';
                const seriesDatum = nodeDatum.seriesDatum;
                const xValue = seriesDatum[xField];
                const yValue = seriesDatum[yField];
                const xString = typeof(xValue) === 'number' ? toFixed(xValue) : String(xValue);
                const yString = typeof(yValue) === 'number' ? toFixed(yValue) : String(yValue);

                html = `${title}${xString}: ${yString}`;
            }
        }
        return html;
    }

    listSeriesItems(data: LegendDatum[]): void {
        if (this.data.length && this.xField && this.yFields.length) {
            const fills = this.fills;
            const strokes = this.strokes;
            const id = this.id;

            this.yFields.forEach((yField, index) => {
                data.push({
                    id,
                    itemId: yField,
                    enabled: this.enabled.get(yField) || false,
                    label: {
                        text: this.yFieldNames[index] || this.yFields[index]
                    },
                    marker: {
                        fillStyle: fills[index % fills.length],
                        strokeStyle: strokes[index % strokes.length]
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        this.enabled.set(itemId, enabled);
        const enabledYFields: string[] = [];
        this.enabled.forEach((enabled, yField) => {
            if (enabled) {
                enabledYFields.push(yField);
            }
        });
        this.groupScale.domain = enabledYFields;
        this.scheduleData();
    }
}
