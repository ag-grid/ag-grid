import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { Rect } from "../../../scene/shape/rect";
import { Text, FontStyle, FontWeight } from "../../../scene/shape/text";
import { BandScale } from "../../../scale/bandScale";
import { DropShadow } from "../../../scene/dropShadow";
import palette from "../../palettes";
import { HighlightStyle, SeriesNodeDatum, CartesianTooltipRendererParams as ColumnTooltipRendererParams } from "../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { sumPositiveValues } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { LegendDatum } from "../../legend";
import { Shape } from "../../../scene/shape/shape";
import { reactive } from "../../../util/observable";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection, flipChartAxisDirection } from "../../chartAxis";

interface SelectionDatum extends SeriesNodeDatum {
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

export { ColumnTooltipRendererParams };

export interface ColumnLabelFormatterParams {
    value: number;
}

export type ColumnLabelFormatter = (params: ColumnLabelFormatterParams) => string;

enum ColumnSeriesNodeTag {
    Column,
    Label
}

class ColumnSeriesLabel extends Label {
    @reactive(['change']) formatter?: ColumnLabelFormatter;
}

export class ColumnSeries extends CartesianSeries {

    static className = 'ColumnSeries';

    // Need to put column and label nodes into separate groups, because even though label nodes are
    // created after the column nodes, this only guarantees that labels will always be on top of columns
    // on the first run. If on the next run more columns are added, they might clip the labels
    // rendered during the previous run.
    private rectGroup = this.group.appendChild(new Group);
    private textGroup = this.group.appendChild(new Group);

    private rectSelection: Selection<Rect, Group, any, any> = Selection.select(this.rectGroup).selectAll<Rect>();
    private textSelection: Selection<Text, Group, any, any> = Selection.select(this.textGroup).selectAll<Text>();

    private xData: string[] = [];
    private yData: number[][] = [];
    private yDomain: number[] = [];

    readonly label = new ColumnSeriesLabel();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled = new Map<string, boolean>();

    tooltipRenderer?: (params: ColumnTooltipRendererParams) => string;

    @reactive(['dataChange']) fills: string[] = palette.fills;
    @reactive(['dataChange']) strokes: string[] = palette.strokes;

    @reactive(['layoutChange']) fillOpacity = 1;
    @reactive(['layoutChange']) strokeOpacity = 1;

    constructor() {
        super();

        this.label.enabled = false;
        this.label.addEventListener('change', () => this.update());
    }

    /**
     * Used to get the position of columns within each group.
     */
    private groupScale = new BandScale<string>();

    directionKeys = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKeys']
    };

    @reactive(['layoutChange']) flipXY = false;

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
     * With a single value in the `yKeys` array we get the regular column series.
     * With multiple values, we get the stacked column series.
     * If the {@link grouped} set to `true`, we get the grouped column series.
     * @param values
     */
    protected _yKeys: string[] = [];
    set yKeys(values: string[]) {
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
    get yKeys(): string[] {
        return this._yKeys;
    }

    protected _yNames: string[] = [];
    set yNames(values: string[]) {
        this._yNames = values;
        this.update();
    }
    get yNames(): string[] {
        return this._yNames;
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

        const ySums = this.yData.map(values => sumPositiveValues(values)); // used for normalization of stacked columns
        const { yData, normalizedTo } = this;

        let yMin: number = Infinity;
        let yMax: number = -Infinity;

        if (this.grouped) {
            // Find the tallest positive/negative column in each group,
            // then find the tallest positive/negative column overall.
            // The `yMin` should always be <= 0,
            // otherwise with the `yData` like [300, 200, 100] the last column
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

        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');

        this.fireEvent({type: 'dataProcessed'});

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

    update(): void {
        const { visible, chart, xAxis, yAxis, xData, yData } = this;

        this.group.visible = visible;

        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending || !xData.length || !yData.length) {
            return;
        }

        const selectionData = this.generateSelectionData();

        this.updateRectSelection(selectionData);
        this.updateTextSelection(selectionData);
    }

    private generateSelectionData(): SelectionDatum[] {
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

        const columnWidth = grouped ? groupScale.bandwidth! : xScale.bandwidth!;
        const selectionData: SelectionDatum[] = [];

        xData.forEach((category, i) => {
            const values = yData[i];
            const seriesDatum = data[i];
            const x = xScale.convert(category);

            let prev = 0;

            values.forEach((curr, j) => {
                const yKey = yKeys[j];
                const columnX = grouped ? x + groupScale.convert(yKey) : x;
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

                selectionData.push({
                    seriesDatum,
                    yValue,
                    yKey,
                    x: flipXY ? Math.min(y, bottomY) : columnX,
                    y: flipXY ? columnX : Math.min(y, bottomY),
                    width: flipXY ? Math.abs(bottomY - y) : columnWidth,
                    height: flipXY ? columnWidth : Math.abs(bottomY - y),
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
                        x: flipXY ? y + (yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y) / 2 : columnX + columnWidth / 2,
                        y: flipXY ? columnX + columnWidth / 2 : y + (yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y) / 2
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
            rect.tag = ColumnSeriesNodeTag.Column;
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
            text.tag = ColumnSeriesNodeTag.Label;
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
