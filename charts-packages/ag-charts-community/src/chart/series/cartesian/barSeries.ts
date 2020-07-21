import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { Rect } from "../../../scene/shape/rect";
import { Text, FontStyle, FontWeight } from "../../../scene/shape/text";
import { BandScale } from "../../../scale/bandScale";
import { DropShadow } from "../../../scene/dropShadow";
import {
    HighlightStyle,
    SeriesNodeDatum,
    CartesianTooltipRendererParams as BarTooltipRendererParams
} from "../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection, flipChartAxisDirection } from "../../chartAxis";
import { Chart } from "../../chart";
import { findLargestMinMax, findMinMax } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { equal } from "../../../util/equal";
import { reactive, TypedEvent } from "../../../util/observable";

export interface BarSeriesNodeClickEvent extends TypedEvent {
    type: 'nodeClick';
    series: BarSeries;
    datum: any;
    xKey: string;
    yKey: string;
}

export { BarTooltipRendererParams };

interface BarNodeDatum extends SeriesNodeDatum {
    yKey: string;
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

enum BarSeriesNodeTag {
    Bar,
    Label
}

class BarSeriesLabel extends Label {
    @reactive('change') formatter?: (params: { value: number }) => string;
}

export class BarSeries extends CartesianSeries {

    static className = 'BarSeries';
    static type = 'bar';

    // Need to put bar and label nodes into separate groups, because even though label nodes are
    // created after the bar nodes, this only guarantees that labels will always be on top of bars
    // on the first run. If on the next run more bars are added, they might clip the labels
    // rendered during the previous run.
    private rectGroup = this.group.appendChild(new Group);
    private textGroup = this.group.appendChild(new Group);

    private rectSelection: Selection<Rect, Group, any, any> = Selection.select(this.rectGroup).selectAll<Rect>();
    private textSelection: Selection<Text, Group, any, any> = Selection.select(this.textGroup).selectAll<Text>();

    private xData: string[] = [];
    private yData: number[][] = [];
    private yDomain: number[] = [];

    readonly label = new BarSeriesLabel();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled = new Map<string, boolean>();

    tooltipRenderer?: (params: BarTooltipRendererParams) => string;

    @reactive('layoutChange') flipXY = false;

    @reactive('dataChange') fills: string[] = [];
    @reactive('dataChange') strokes: string[] = [];

    @reactive('layoutChange') fillOpacity = 1;
    @reactive('layoutChange') strokeOpacity = 1;

    constructor() {
        super();

        this.label.enabled = false;
        this.label.addEventListener('change', this.update, this);
    }

    /**
     * Used to get the position of bars within each group.
     */
    private groupScale = new BandScale<string>();

    directionKeys = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKeys']
    };

    getKeys(direction: ChartAxisDirection): string[] {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[this.flipXY ? flipChartAxisDirection(direction) : direction];
        const values: string[] = [];

        if (keys) {
            keys.forEach(key => {
                const value = (this as any)[key];

                if (value) {
                    if (Array.isArray(value)) {
                        values.push(...value);
                    } else {
                        values.push(value);
                    }
                }
            });
        }

        return values;
    }

    protected _xKey: string = '';
    set xKey(value: string) {
        if (this._xKey !== value) {
            this._xKey = value;
            this.xData = [];
            this.scheduleData();
        }
    }
    get xKey(): string {
        return this._xKey;
    }

    protected _xName: string = '';
    set xName(value: string) {
        if (this._xName !== value) {
            this._xName = value;
            this.update();
        }
    }
    get xName(): string {
        return this._xName;
    }

    /**
     * With a single value in the `yKeys` array we get the regular bar series.
     * With multiple values, we get the stacked bar series.
     * If the {@link grouped} set to `true`, we get the grouped bar series.
     * @param values
     */
    protected _yKeys: string[] = [];
    set yKeys(values: string[]) {
        if (!equal(this._yKeys, values)) {
            this._yKeys = values;
            this.yData = [];

            const { seriesItemEnabled } = this;
            seriesItemEnabled.clear();
            values.forEach(key => seriesItemEnabled.set(key, true));

            const groupScale = this.groupScale;
            groupScale.domain = values;
            groupScale.padding = 0.1;
            groupScale.round = true;

            this.scheduleData();
        }
    }
    get yKeys(): string[] {
        return this._yKeys;
    }

    protected _yNames: string[] = [];
    set yNames(values: string[]) {
        this._yNames = values;
        this.scheduleData();
    }
    get yNames(): string[] {
        return this._yNames;
    }

    get colorCount(): number {
        return this.yKeys.length;
    }

    setColors(fills: string[], strokes: string[]) {
        this.fills = fills;
        this.strokes = strokes;
    }

    @reactive('dataChange') grouped = false;

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

    highlightStyle: HighlightStyle = { fill: 'yellow' };

    onHighlightChange() {
        this.updateRectNodes();
    }

    processData(): boolean {
        const { xKey, yKeys, seriesItemEnabled } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        // If the data is an array of rows like so:
        //
        // [{
        //   xKey: 'Jan',
        //   yKey1: 5,
        //   yKey2: 7,
        //   yKey3: -9,
        // }, {
        //   xKey: 'Feb',
        //   yKey1: 10,
        //   yKey2: -15,
        //   yKey3: 20
        // }]
        //

        let keysFound = true; // only warn once
        this.xData = data.map(datum => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }
            return datum[xKey];
        });

        this.yData = data.map(datum => yKeys.map(yKey => {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn(`The key '${yKey}' was not found in the data: `, datum);
            }
            const value = datum[yKey];

            return isFinite(value) && seriesItemEnabled.get(yKey) ? value : 0;
        }));

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        const yMinMax = this.yData.map(values => findMinMax(values)); // used for normalization of stacked bars
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
            const yLargestMinMax = findLargestMinMax(yMinMax);

            if (normalizedTo && isFinite(normalizedTo)) {
                yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
                yMax = normalizedTo;
                yData.forEach((stackValues, i) => stackValues.forEach((y, j) => {
                    if (y < 0) {
                        stackValues[j] = -y / yMinMax[i].min * normalizedTo;
                    } else {
                        stackValues[j] = y / yMinMax[i].max * normalizedTo;
                    }
                }));
            } else {
                yMin = yLargestMinMax.min;
                yMax = yLargestMinMax.max;
            }
        }

        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');

        this.fireEvent({ type: 'dataProcessed' });

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (this.flipXY) {
            direction = flipChartAxisDirection(direction);
        }
        if (direction === ChartAxisDirection.X) {
            return this.xData;
        } else {
            return this.yDomain;
        }
    }

    fireNodeClickEvent(datum: BarNodeDatum): void {
        this.fireEvent<BarSeriesNodeClickEvent>({
            type: 'nodeClick',
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    }

    private generateNodeData(): BarNodeDatum[] {
        const { xAxis, yAxis, flipXY } = this;
        const xScale = (flipXY ? yAxis : xAxis).scale;
        const yScale = (flipXY ? xAxis : yAxis).scale;

        const {
            groupScale,
            yKeys,
            fills,
            strokes,
            grouped,
            strokeWidth,
            seriesItemEnabled,
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
        const nodeData: BarNodeDatum[] = [];

        xData.forEach((category, i) => {
            const yDatum = yData[i];
            const seriesDatum = data[i];
            const x = xScale.convert(category);

            let prevMin = 0;
            let prevMax = 0;

            yDatum.forEach((curr, j) => {
                const yKey = yKeys[j];
                const barX = grouped ? x + groupScale.convert(yKey) : x;
                const prev = curr < 0 ? prevMin : prevMax;
                const y = yScale.convert(grouped ? curr : prev + curr);
                const bottomY = yScale.convert(grouped ? 0 : prev);
                const yValue = seriesDatum[yKey]; // unprocessed y-value
                const yValueIsNumber = typeof yValue === 'number';

                let labelText: string;

                if (labelFormatter) {
                    labelText = labelFormatter({ value: yValueIsNumber ? yValue : undefined });
                } else {
                    labelText = yValueIsNumber && isFinite(yValue) ? yValue.toFixed(2) : '';
                }

                nodeData.push({
                    series: this,
                    seriesDatum,
                    yValue,
                    yKey,
                    x: flipXY ? Math.min(y, bottomY) : barX,
                    y: flipXY ? barX : Math.min(y, bottomY),
                    width: flipXY ? Math.abs(bottomY - y) : barWidth,
                    height: flipXY ? barWidth : Math.abs(bottomY - y),
                    fill: fills[j % fills.length],
                    stroke: strokes[j % strokes.length],
                    strokeWidth,
                    label: seriesItemEnabled.get(yKey) && labelText ? {
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

                if (!grouped) {
                    if (curr < 0) {
                        prevMin += curr;
                    } else {
                        prevMax += curr;
                    }
                }
            });
        });

        return nodeData;
    }

    update(): void {
        const { visible, chart, xAxis, yAxis, xData, yData } = this;

        this.group.visible = visible;

        if (!chart || chart.layoutPending || chart.dataPending ||
            !xAxis || !yAxis || !visible || !xData.length || !yData.length) {
            return;
        }

        const nodeData = this.generateNodeData();

        this.updateRectSelection(nodeData);
        this.updateRectNodes();

        this.updateTextSelection(nodeData);
        this.updateTextNodes();
    }

    private updateRectSelection(selectionData: BarNodeDatum[]): void {
        const updateRects = this.rectSelection.setData(selectionData);
        updateRects.exit.remove();
        const enterRects = updateRects.enter.append(Rect).each(rect => {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });
        this.rectSelection = updateRects.merge(enterRects);
    }

    private updateRectNodes(): void {
        const { fillOpacity, strokeOpacity, shadow, highlightStyle: { fill, stroke } } = this;
        const { highlightedDatum } = this.chart;

        this.rectSelection.each((rect, datum) => {
            const highlighted = datum === highlightedDatum;

            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = highlighted && fill !== undefined ? fill : datum.fill;
            rect.stroke = highlighted && stroke !== undefined ? stroke : datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = datum.strokeWidth;
            rect.fillShadow = shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height bars
        });
    }

    private updateTextSelection(selectionData: BarNodeDatum[]): void {
        const updateTexts = this.textSelection.setData(selectionData);

        updateTexts.exit.remove();

        const enterTexts = updateTexts.enter.append(Text).each(text => {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });

        this.textSelection = updateTexts.merge(enterTexts);
    }

    private updateTextNodes(): void {
        const labelEnabled = this.label.enabled;

        this.textSelection.each((text, datum) => {
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
    }

    getTooltipHtml(nodeDatum: BarNodeDatum): string {
        const { xKey } = this;
        const { yKey } = nodeDatum;

        if (!xKey || !yKey) {
            return '';
        }

        const { xName, yKeys, yNames, fills, tooltipRenderer } = this;
        const { seriesDatum: datum } = nodeDatum;
        const yKeyIndex = yKeys.indexOf(yKey);
        const yName = yNames[yKeyIndex];
        const color = fills[yKeyIndex % fills.length];

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum,
                xKey,
                xName,
                yKey,
                yName,
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleString = yName ? `<div class="${Chart.defaultTooltipClass}-title" ${titleStyle}>${yName}</div>` : '';
            const xValue = datum[xKey];
            const yValue = datum[yKey];
            const xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);

            return `${titleString}<div class="${Chart.defaultTooltipClass}-content">${xString}: ${yString}</div>`;
        }
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            id, data, xKey, yKeys, yNames, seriesItemEnabled,
            fills, strokes, fillOpacity, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKeys.length) {
            yKeys.forEach((yKey, index) => {
                legendData.push({
                    id,
                    itemId: yKey,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[index] || yKeys[index]
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length],
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        const { seriesItemEnabled } = this;
        const enabledSeriesItems: string[] = [];

        seriesItemEnabled.set(itemId, enabled);
        seriesItemEnabled.forEach((enabled, yKey) => {
            if (enabled) {
                enabledSeriesItems.push(yKey);
            }
        });
        this.groupScale.domain = enabledSeriesItems;
        this.scheduleData();
    }
}
