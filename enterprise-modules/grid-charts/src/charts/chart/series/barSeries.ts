import { Group } from "../../scene/group";
import { Selection } from "../../scene/selection";
import { CartesianChart } from "../cartesianChart";
import { Rect } from "../../scene/shape/rect";
import { Text, FontStyle, FontWeight } from "../../scene/shape/text";
import { BandScale } from "../../scale/bandScale";
import { DropShadow } from "../../scene/dropShadow";
import palette from "../palettes";
import { HighlightStyle, Series, SeriesLabel, SeriesNodeDatum } from "./series";
import { PointerEvents } from "../../scene/node";
import { sumPositiveValues } from "../../util/array";
import { Color } from "../../util/color";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { NumberAxis } from "../axis/numberAxis";
import { BarTooltipRendererParams } from "../../chartOptions";

interface SelectionDatum extends SeriesNodeDatum {
    yField: string;
    yValue: number;
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    label?: {
        text: string,
        fontStyle?: FontStyle,
        fontWeight?: FontWeight,
        fontSize: number,
        fontFamily: string,
        fill: string,
        x: number,
        y: number
    };
}

export interface BarLabelFormatterParams {
    value: number;
}

export type BarLabelFormatter = (params: BarLabelFormatterParams) => string;

enum BarSeriesNodeTag {
    Bar,
    Label
}

class BarSeriesLabel extends SeriesLabel {
    private _formatter?: BarLabelFormatter;
    set formatter(value: BarLabelFormatter | undefined) {
        if (this._formatter !== value) {
            this._formatter = value;
            this.update();
        }
    }
    get formatter(): BarLabelFormatter | undefined {
        return this._formatter;
    }
}

export class BarSeries extends Series<CartesianChart> {

    static className = 'BarSeries';

    tooltipRenderer?: (params: BarTooltipRendererParams) => string;

    // Need to put bar and label nodes into separate groups, because even though label nodes are
    // created after the bar nodes, this only guarantees that labels will always be on top of bars
    // on the first run. If on the next run more bars are added, they might clip the labels
    // rendered during the previous run.
    private rectGroup = this.group.appendChild(new Group);
    private textGroup = this.group.appendChild(new Group);

    private rectSelection: Selection<Rect, Group, any, any> = Selection.select(this.rectGroup).selectAll<Rect>();
    private textSelection: Selection<Text, Group, any, any> = Selection.select(this.textGroup).selectAll<Text>();

    readonly label: BarSeriesLabel = (() => {
        const label = new BarSeriesLabel();
        label.enabled = false;
        label.onChange = this.update.bind(this);
        return label;
    })();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    private readonly yFieldEnabled = new Map<string, boolean>();

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

    private _fillOpacity: number = 1;
    set fillOpacity(value: number) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.scheduleLayout();
        }
    }
    get fillOpacity(): number {
        return this._fillOpacity;
    }

    private _strokeOpacity: number = 1;
    set strokeOpacity(value: number) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.scheduleLayout();
        }
    }
    get strokeOpacity(): number {
        return this._strokeOpacity;
    }

    private xData: string[] = [];
    private yData: number[][] = [];
    private domainY: number[] = [];

    /**
     * Used to get the position of bars within each group.
     */
    private groupScale = new BandScale<string>();

    set chart(chart: CartesianChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | undefined {
        return this._chart;
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

    protected _xFieldName: string = '';
    set xFieldName(value: string) {
        if (this._xFieldName !== value) {
            this._xFieldName = value;
            this.update();
        }
    }
    get xFieldName(): string {
        return this._xFieldName;
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
        this.yData = [];

        const { yFieldEnabled } = this;
        yFieldEnabled.clear();
        values.forEach(field => yFieldEnabled.set(field, true));

        const groupScale = this.groupScale;
        groupScale.domain = values;
        groupScale.padding = 0.1;
        groupScale.round = true;

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

    /**
     * The value to normalize the stacks to, when {@link grouped} is `false`.
     * Should be a finite positive value or `undefined`.
     * Defaults to `undefined` - stacks are not normalized.
     */
    private _normalizedTo?: number;
    set normalizedTo(value: number | undefined) {
        const absValue = value ? Math.abs(value) : undefined;

        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
            this.scheduleData();
        }
    }
    get normalizedTo(): number | undefined {
        return this._normalizedTo;
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

    private _shadow?: DropShadow;
    set shadow(value: DropShadow | undefined) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.update();
        }
    }
    get shadow(): DropShadow | undefined {
        return this._shadow;
    }

    highlightStyle: HighlightStyle = {
        fill: 'yellow'
    };

    private highlightedNode?: Rect;

    highlightNode(node: Shape) {
        if (!(node instanceof Rect)) {
            return;
        }

        this.highlightedNode = node;
        this.scheduleLayout();
    }

    dehighlightNode() {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    }

    processData(): boolean {
        const { xField, yFields } = this;

        if (!(xField && yFields.length)) {
            this._data = [];
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

        const { yFieldEnabled, data } = this;

        this.xData = data.map(datum => datum[xField]);

        this.yData = data.map(datum => yFields.map(field => {
            const value = datum[field];

            return isFinite(value) && yFieldEnabled.get(field) ? value : 0;
        }));

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        const ySums = this.yData.map(values => sumPositiveValues(values)); // used for normalization of stacked bars
        const { yData, normalizedTo } = this;

        let yMin: number = Infinity;
        let yMax: number = -Infinity;

        if (this.grouped) {
            // Find the tallest positive/negative bar in each group,
            // then find the tallest positive/negative bar overall.
            // The `yMin` should always be <= 0,
            // otherwise with the `yData` like [300, 200, 100] the last bar
            // will have zero height, because the y-axis range is [100, 300].
            yMin = Math.min(0, ...yData.map(values => Math.min(...values)));
            yMax = Math.max(...yData.map(values => Math.max(...values)));
        } else { // stacked or regular
            if (normalizedTo && isFinite(normalizedTo)) {
                yMin = 0;
                yMax = normalizedTo;
                yData.forEach((stackValues, i) => stackValues.forEach((y, j) => stackValues[j] = y / ySums[i] * normalizedTo));
            } else {
                // Find the height of each stack in the positive and negative directions,
                // then find the tallest stacks in both directions.
                yMin = Math.min(0, ...yData.map(values => values.reduce((min, value) => value < 0 ? min - value : min, 0)));
                yMax = Math.max(...yData.map(values => values.reduce((max, value) => value > 0 ? max + value : max, 0)));
            }
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

        const selectionData = this.generateSelectionData();

        this.updateRectSelection(selectionData);
        this.updateTextSelection(selectionData);
    }

    private generateSelectionData() {
        const { xAxis, yAxis } = this.chart!;
        const flipXY = xAxis instanceof NumberAxis;
        const xScale = (flipXY ? yAxis : xAxis).scale;
        const yScale = (flipXY ? xAxis : yAxis).scale;

        const {
            groupScale,
            yFields,
            fills,
            strokes,
            grouped,
            strokeWidth,
            yFieldEnabled,
            data,
            xData,
            yData,
        } = this;

        const label = this.label;
        const labelFontStyle = label.fontStyle;
        const labelFontWeight = label.fontWeight;
        const labelFontSize = label.fontSize;
        const labelFontFamily = label.fontFamily;
        const labelColor = label.color;
        const labelFormatter = label.formatter;

        groupScale.range = [0, xScale.bandwidth!];

        const barWidth = grouped ? groupScale.bandwidth! : xScale.bandwidth!;
        const selectionData: SelectionDatum[] = [];

        xData.forEach((category, i) => {
            const values = yData[i];
            const seriesDatum = data[i];
            const x = xScale.convert(category);

            let prev = 0;

            values.forEach((curr, j) => {
                const yField = yFields[j];
                const barX = grouped ? x + groupScale.convert(yField) : x;
                const y = yScale.convert(grouped ? curr : prev + curr);
                const bottomY = yScale.convert(grouped ? 0 : prev);
                const yValue = seriesDatum[yField]; // unprocessed y-value
                const yValueIsNumber = typeof yValue === 'number';

                let labelText: string;

                if (labelFormatter) {
                    labelText = labelFormatter({ value: yValueIsNumber ? yValue : undefined });
                } else {
                    labelText = yValueIsNumber && isFinite(yValue) ? yValue.toFixed(2) : '';
                }

                selectionData.push({
                    seriesDatum,
                    yValue,
                    yField,
                    x: flipXY ? Math.min(y, bottomY) : barX,
                    y: flipXY ? barX : Math.min(y, bottomY),
                    width: flipXY ? Math.abs(bottomY - y) : barWidth,
                    height: flipXY ? barWidth : Math.abs(bottomY - y),
                    fill: fills[j % fills.length],
                    stroke: strokes[j % strokes.length],
                    strokeWidth,
                    label: yFieldEnabled.get(yField) && labelText ? {
                        text: labelText,
                        fontStyle: labelFontStyle,
                        fontWeight: labelFontWeight,
                        fontSize: labelFontSize,
                        fontFamily: labelFontFamily,
                        fill: labelColor,
                        x: flipXY ? y + (yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y) / 2 : barX + barWidth / 2,
                        y: flipXY ? barX + barWidth / 2 : y + (yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y) / 2
                    } : undefined
                });

                if (grouped) {
                    prev = curr;
                } else {
                    prev += curr;
                }
            });
        });

        return selectionData;
    }

    private updateRectSelection(selectionData: SelectionDatum[]): void {
        const { fillOpacity, strokeOpacity, shadow, highlightedNode, highlightStyle: { fill, stroke } } = this;
        const updateRects = this.rectSelection.setData(selectionData);

        updateRects.exit.remove();

        const enterRects = updateRects.enter.append(Rect).each(rect => {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });

        const rectSelection = updateRects.merge(enterRects);

        rectSelection.each((rect, datum) => {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = rect === highlightedNode && fill !== undefined ? fill : datum.fill;
            rect.stroke = rect === highlightedNode && stroke !== undefined ? stroke : datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = datum.strokeWidth;
            rect.fillShadow = shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });

        this.rectSelection = rectSelection;
    }

    private updateTextSelection(selectionData: SelectionDatum[]): void {
        const labelEnabled = this.label.enabled;
        const updateTexts = this.textSelection.setData(selectionData);

        updateTexts.exit.remove();

        const enterTexts = updateTexts.enter.append(Text).each(text => {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });

        const textSelection = updateTexts.merge(enterTexts);

        textSelection.each((text, datum) => {
            const label = datum.label;

            if (label && labelEnabled) {
                text.fontStyle = label.fontStyle;
                text.fontWeight = label.fontWeight;
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = label.fill;
                text.visible = true;
            } else {
                text.visible = false;
            }
        });

        this.textSelection = textSelection;
    }

    getTooltipHtml(nodeDatum: SelectionDatum): string {
        const { xField: xKey } = this;
        const { yField: yKey } = nodeDatum;

        if (!xKey || !yKey) {
            return "";
        }

        const { xFieldName: xName, yFields, yFieldNames, fills, tooltipRenderer } = this;
        const { seriesDatum: datum } = nodeDatum;
        const yFieldIndex = yFields.indexOf(yKey);
        const yName = yFieldNames[yFieldIndex];
        const color = fills[yFieldIndex % fills.length];
        const title = yName;

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum,
                xKey,
                xName,
                yKey,
                yName,
                title,
                color,
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleString = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
            const xValue = datum[xKey];
            const yValue = datum[yKey];
            const xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);

            return `${titleString}<div class="content">${xString}: ${yString}</div>`;
        }
    }

    listSeriesItems(data: LegendDatum[]): void {
        if (this.data.length && this.xField && this.yFields.length) {
            const { fills, strokes, id } = this;

            this.yFields.forEach((yField, index) => {
                data.push({
                    id,
                    itemId: yField,
                    enabled: this.yFieldEnabled.get(yField) || false,
                    label: {
                        text: this.yFieldNames[index] || this.yFields[index]
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length]
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        this.yFieldEnabled.set(itemId, enabled);
        const enabledYFields: string[] = [];
        this.yFieldEnabled.forEach((enabled, yField) => {
            if (enabled) {
                enabledYFields.push(yField);
            }
        });
        this.groupScale.domain = enabledYFields;
        this.scheduleData();
    }
}
