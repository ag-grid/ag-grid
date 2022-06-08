import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { Rect } from "../../../scene/shape/rect";
import { Text, FontStyle, FontWeight } from "../../../scene/shape/text";
import { BandScale } from "../../../scale/bandScale";
import { DropShadow } from "../../../scene/dropShadow";
import {
    SeriesNodeDatum,
    CartesianTooltipRendererParams, SeriesTooltip, Series
} from "../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxis, ChartAxisDirection, flipChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult, toTooltipHtml } from "../../chart";
import { findMinMax } from "../../../util/array";
import { equal } from "../../../util/equal";
import { TypedEvent } from "../../../util/observable";
import { Scale } from "../../../scale/scale";
import { sanitizeHtml } from "../../../util/sanitize";
import { isNumber } from "../../../util/value";
import { clamper, ContinuousScale } from "../../../scale/continuousScale";
import { Node } from '../../../scene/node';

export interface BarSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: BarSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}

export interface BarTooltipRendererParams extends CartesianTooltipRendererParams {
    readonly processedYValue: any;
}

interface BarNodeDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly yKey: string;
    readonly yValue: number;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly colorIndex: number;
    readonly strokeWidth: number;
    readonly label?: {
        readonly x: number;
        readonly y: number;
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}

enum BarSeriesNodeTag {
    Bar,
    Label
}

export enum BarLabelPlacement {
    Inside = 'inside',
    Outside = 'outside'
}

export class BarSeriesLabel extends Label {
    formatter?: (params: { value: number }) => string = undefined;
    placement = BarLabelPlacement.Inside;
}

export interface BarSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly highlighted: boolean;
    readonly xKey: string;
    readonly yKey: string;
}

export interface BarSeriesFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export class BarSeriesTooltip extends SeriesTooltip {
    renderer?: (params: BarTooltipRendererParams) => string | TooltipRendererResult = undefined;
}

function flat(arr: any[], target: any[] = []): any[] {
    arr.forEach(v => {
        if (Array.isArray(v)) {
            flat(v, target);
        } else {
            target.push(v);
        }
    });
    return target;
}

function is2dArray<E>(array: E[] | E[][]): array is E[][] {
    return array.length > 0 && Array.isArray(array[0]);
}

type BarSeriesGroup = {
    group: Group;
    pickGroup: Group;
    rectSelection: Selection<Rect, Group, BarNodeDatum, any>;
    labelSelection: Selection<Text, Group, BarNodeDatum, any>;
}

export class BarSeries extends CartesianSeries {

    static className = 'BarSeries';
    static type = 'bar' as const;

    private seriesGroups: BarSeriesGroup[] = [];
    private seriesGroupId: number = 0;

    private highlightRectSelection: Selection<Rect, Group, BarNodeDatum, any> = Selection.select(this.highlightGroup).selectAll<Rect>();

    private nodeData: BarNodeDatum[][] = [];
    private allNodeData: BarNodeDatum[] = [];
    private xData: string[] = [];
    private yData: number[][][] = [];
    private yDomain: number[] = [];

    readonly label = new BarSeriesLabel();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled = new Map<string, boolean>();

    tooltip: BarSeriesTooltip = new BarSeriesTooltip();

    flipXY = false;

    fills: string[] = [
        '#c16068',
        '#a2bf8a',
        '#ebcc87',
        '#80a0c3',
        '#b58dae',
        '#85c0d1'
    ];

    strokes: string[] = [
        '#874349',
        '#718661',
        '#a48f5f',
        '#5a7088',
        '#7f637a',
        '#5d8692'
    ];

    fillOpacity = 1;
    strokeOpacity = 1;

    lineDash?: number[] = [0];
    lineDashOffset: number = 0;

    formatter?: (params: BarSeriesFormatterParams) => BarSeriesFormat = undefined;

    constructor() {
        super();

        this.label.enabled = false;
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
        let values: string[] = [];

        if (keys) {
            keys.forEach(key => {
                const value = (this as any)[key];

                if (value) {
                    if (Array.isArray(value)) {
                        values = values.concat(flat(value));
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
        this._xKey = value;
        this.xData = [];
    }
    get xKey(): string {
        return this._xKey;
    }

    xName: string = '';

    private cumYKeyCount: number[] = [];
    private flatYKeys: string[] | undefined = undefined; // only set when a user used a flat array for yKeys

    hideInLegend: string[] = [];

    /**
     * yKeys: [['coffee']] - regular bars, each category has a single bar that shows a value for coffee
     * yKeys: [['coffee'], ['tea'], ['milk']] - each category has three bars that show values for coffee, tea and milk
     * yKeys: [['coffee', 'tea', 'milk']] - each category has a single bar with three stacks that show values for coffee, tea and milk
     * yKeys: [['coffee', 'tea', 'milk'], ['paper', 'ink']] - each category has 2 stacked bars,
     *     first showing values for coffee, tea and milk and second values for paper and ink
     */
    protected _yKeys: string[][] = [];
    set yKeys(yKeys: string[][]) {
        let flatYKeys: string[] | undefined = undefined;
        // Convert from flat y-keys to grouped y-keys.
        if (!is2dArray(yKeys)) {
            flatYKeys = yKeys as any as string[];
            yKeys = this.grouped ? flatYKeys.map(k => [k]) : [flatYKeys];
        }

        if (!equal(this._yKeys, yKeys)) {
            this.flatYKeys = flatYKeys ? flatYKeys : undefined;
            this._yKeys = yKeys;

            let prevYKeyCount = 0;
            this.cumYKeyCount = [];
            const visibleStacks: string[] = [];
            yKeys.forEach((stack, index) => {
                if (stack.length > 0) {
                    visibleStacks.push(String(index));
                }
                this.cumYKeyCount.push(prevYKeyCount);
                prevYKeyCount += stack.length;
            });
            this.yData = [];

            const { seriesItemEnabled } = this;
            seriesItemEnabled.clear();
            yKeys.forEach(stack => {
                stack.forEach(yKey => seriesItemEnabled.set(yKey, true));
            });

            const { groupScale } = this;
            groupScale.domain = visibleStacks;
            groupScale.padding = 0.1;
            groupScale.round = true;
        }
    }
    get yKeys(): string[][] {
        return this._yKeys;
    }

    protected _grouped: boolean = false;
    set grouped(value: boolean) {
        if (this._grouped !== value) {
            this._grouped = value;
            if (this.flatYKeys) {
                this.yKeys = this.flatYKeys as any;
            }
        }
    }
    get grouped(): boolean {
        return this._grouped;
    }

    /**
     * A map of `yKeys` to their names (used in legends and tooltips).
     * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
     */
    protected _yNames: { [key in string]: string } = {};
    set yNames(values: { [key in string]: string }) {
        if (Array.isArray(values) && this.flatYKeys) {
            const map: { [key in string]: string } = {};
            this.flatYKeys.forEach((k, i) => {
                map[k] = values[i];
            });
            values = map;
        }
        this._yNames = values;
    }
    get yNames(): { [key in string]: string } {
        return this._yNames;
    }

    setColors(fills: string[], strokes: string[]) {
        this.fills = fills;
        this.strokes = strokes;
    }

    /**
     * The value to normalize the bars to.
     * Should be a finite positive value or `undefined`.
     * Defaults to `undefined` - bars are not normalized.
     */
    private _normalizedTo?: number;
    set normalizedTo(value: number | undefined) {
        const absValue = value ? Math.abs(value) : undefined;

        this._normalizedTo = absValue;
    }
    get normalizedTo(): number | undefined {
        return this._normalizedTo;
    }

    strokeWidth: number = 1;

    shadow?: DropShadow = undefined;

    protected smallestDataInterval?: { x: number, y: number } = undefined;
    processData(): boolean {
        const { xKey, yKeys, seriesItemEnabled } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();

        if (!(xAxis && yAxis)) {
            return false;
        }

        const setSmallestXInterval = (curr: number, prev: number) => {
            if (this.smallestDataInterval === undefined) {
                this.smallestDataInterval = { x: Infinity, y: Infinity };
            }
            const { x } = this.smallestDataInterval;

            const interval = Math.abs(curr - prev);
            if (interval > 0 && interval < x) {
                this.smallestDataInterval.x = interval;
            }
        }

        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;
        let keysFound = true; // only warn once
        let prevX = Infinity;
        this.xData = data.map(datum => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }

            const x = this.checkDatum(datum[xKey], isContinuousX);

            if (isContinuousX) {
                setSmallestXInterval(x, prevX);
            }

            prevX = x;

            return x;
        });

        this.yData = data.map(datum => yKeys.map(stack => {
            return stack.map(yKey => {
                if (keysFound && !(yKey in datum)) {
                    keysFound = false;
                    console.warn(`The key '${yKey}' was not found in the data: `, datum);
                }

                const yDatum = this.checkDatum(datum[yKey], isContinuousY);

                if (!seriesItemEnabled.get(yKey) || yDatum === undefined) {
                    return 0;
                }

                return yDatum;
            });
        }));

        // Contains min/max values for each stack in each group,
        // where min is zero and max is a positive total of all values in the stack
        // or min is a negative total of all values in the stack and max is zero.
        const yMinMax = this.yData.map(group => group.map(stack => findMinMax(stack)));
        const { yData, normalizedTo } = this;

        // Calculate the sum of the absolute values of all items in each stack in each group. Used for normalization of stacked bars.
        const yAbsTotal = this.yData.map(group => group.map(stack => stack.reduce((acc, stack) => {
            acc += Math.abs(stack);
            return acc;
        }, 0)));

        const yLargestMinMax = this.findLargestMinMax(yMinMax);

        let yMin: number;
        let yMax: number;
        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
            yMax = yLargestMinMax.max > 0 ? normalizedTo : 0;
            yData.forEach((group, i) => {
                group.forEach((stack, j) => {
                    stack.forEach((y, k) => {
                        stack[k] = y / yAbsTotal[i][j] * normalizedTo;
                    });
                });
            });
        } else {
            yMin = yLargestMinMax.min;
            yMax = yLargestMinMax.max;
        }

        this.yDomain = this.fixNumericExtent([yMin, yMax], this.yAxis);

        return true;
    }

    findLargestMinMax(groups: { min: number, max: number }[][]): { min: number, max: number } {
        let tallestStackMin = 0;
        let tallestStackMax = 0;

        for (const group of groups) {
            for (const stack of group) {
                if (stack.min < tallestStackMin) {
                    tallestStackMin = stack.min;
                }
                if (stack.max > tallestStackMax) {
                    tallestStackMax = stack.max;
                }
            }
        }

        return { min: tallestStackMin, max: tallestStackMax };
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

    fireNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): void {
        this.fireEvent<BarSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    }

    private getCategoryAxis(): ChartAxis<Scale<any, number>> | undefined {
        return this.flipXY ? this.yAxis : this.xAxis;
    }

    private getValueAxis(): ChartAxis<Scale<any, number>> | undefined {
        return this.flipXY ? this.xAxis : this.yAxis;
    }

    private calculateStep(range: number): number | undefined {
        const { smallestDataInterval: smallestInterval } = this;

        const xAxis = this.getCategoryAxis();

        if (!xAxis) { return; }

        // calculate step
        let domainLength = xAxis.domain[1] - xAxis.domain[0];
        let intervals = (domainLength / (smallestInterval?.x ?? 1)) + 1;

        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum number of bands to ensure the step does not fall below 1 pixel.
        // This means there could be some overlap of the bands in the chart.
        const maxBands = Math.floor(range); // A minimum of 1px per bar/column means the maximum number of bands will equal the available range
        const bands = Math.min(intervals, maxBands);

        const step = range / Math.max(1, bands);

        return step;
    }

    createNodeData(): BarNodeDatum[] {
        const { chart, data, visible } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();

        if (!(chart && data && visible && xAxis && yAxis)) {
            return [];
        }

        const { flipXY } = this;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;

        const {
            groupScale,
            yKeys,
            cumYKeyCount,
            fills,
            strokes,
            strokeWidth,
            seriesItemEnabled,
            xData,
            yData,
            label
        } = this;

        const {
            fontStyle: labelFontStyle,
            fontWeight: labelFontWeight,
            fontSize: labelFontSize,
            fontFamily: labelFontFamily,
            color: labelColor,
            formatter: labelFormatter,
            placement: labelPlacement
        } = label;

        let xBandWidth = xScale.bandwidth;

        if (xScale instanceof ContinuousScale) {
            const availableRange = Math.max(xAxis!.range[0], xAxis!.range[1]);
            const step = this.calculateStep(availableRange);

            xBandWidth = step;

            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            xScale.range = this.flipXY ? [availableRange - (step ?? 0), 0] : [0, availableRange - (step ?? 0)];
        }

        groupScale.range = [0, xBandWidth!];

        const grouped = true;
        const barWidth = grouped ? groupScale.bandwidth : xBandWidth!;
        const nodeData: BarNodeDatum[][] = [];

        xData.forEach((group, groupIndex) => {
            const seriesDatum = data[groupIndex];
            const x = xScale.convert(group);

            const groupYs = yData[groupIndex]; // y-data for groups of stacks
            for (let stackIndex = 0; stackIndex < groupYs.length; stackIndex++) {
                const stackYs = groupYs[stackIndex]; // y-data for a stack within a group

                let prevMinY = 0;
                let prevMaxY = 0;

                for (let levelIndex = 0; levelIndex < stackYs.length; levelIndex++) {
                    const currY = +stackYs[levelIndex];
                    const yKey = yKeys[stackIndex][levelIndex];
                    const barX = grouped ? x + groupScale.convert(String(stackIndex)) : x;

                    // Bars outside of visible range are not rendered, so we create node data
                    // only for the visible subset of user data.
                    if (!xAxis.inRange(barX, barWidth)) {
                        continue;
                    }

                    const prevY = currY < 0 ? prevMinY : prevMaxY;
                    const continuousY = yScale instanceof ContinuousScale;
                    const y = yScale.convert(prevY + currY, continuousY ? clamper : undefined);
                    const bottomY = yScale.convert(prevY, continuousY ? clamper : undefined);
                    const yValue = seriesDatum[yKey]; // unprocessed y-value

                    let labelText: string;
                    if (labelFormatter) {
                        labelText = labelFormatter({ value: isNumber(yValue) ? yValue : undefined });
                    } else {
                        labelText = isNumber(yValue) ? yValue.toFixed(2) : '';
                    }

                    let labelX: number;
                    let labelY: number;

                    if (flipXY) {
                        labelY = barX + barWidth / 2;
                        if (labelPlacement === BarLabelPlacement.Inside) {
                            labelX = y + (yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y) / 2;
                        } else {
                            labelX = y + (yValue >= 0 ? 1 : -1) * 4;
                        }
                    } else {
                        labelX = barX + barWidth / 2;
                        if (labelPlacement === BarLabelPlacement.Inside) {
                            labelY = y + (yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y) / 2;
                        } else {
                            labelY = y + (yValue >= 0 ? -3 : 4);
                        }
                    }

                    let labelTextAlign: CanvasTextAlign;
                    let labelTextBaseline: CanvasTextBaseline;

                    if (labelPlacement === BarLabelPlacement.Inside) {
                        labelTextAlign = 'center';
                        labelTextBaseline = 'middle';
                    } else {
                        labelTextAlign = flipXY ? (yValue >= 0 ? 'start' : 'end') : 'center';
                        labelTextBaseline = flipXY ? 'middle' : (yValue >= 0 ? 'bottom' : 'top');
                    }

                    const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                    nodeData[levelIndex] = nodeData[levelIndex] ?? [];
                    nodeData[levelIndex].push({
                        index: groupIndex,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        yValue,
                        yKey,
                        x: flipXY ? Math.min(y, bottomY) : barX,
                        y: flipXY ? barX : Math.min(y, bottomY),
                        width: flipXY ? Math.abs(bottomY - y) : barWidth,
                        height: flipXY ? barWidth : Math.abs(bottomY - y),
                        colorIndex,
                        fill: fills[colorIndex % fills.length],
                        stroke: strokes[colorIndex % strokes.length],
                        strokeWidth,
                        label: seriesItemEnabled.get(yKey) && labelText ? {
                            text: labelText,
                            fontStyle: labelFontStyle,
                            fontWeight: labelFontWeight,
                            fontSize: labelFontSize,
                            fontFamily: labelFontFamily,
                            textAlign: labelTextAlign,
                            textBaseline: labelTextBaseline,
                            fill: labelColor,
                            x: labelX,
                            y: labelY
                        } : undefined
                    });

                    if (currY < 0) {
                        prevMinY += currY;
                    } else {
                        prevMaxY += currY;
                    }
                }
            }
        });

        this.nodeData = nodeData;
        this.allNodeData = this.nodeData.reduce((r, n) => r.concat(n), []);

        return this.allNodeData;
    }

    pickNode(x: number, y: number): Node | undefined {
        let result = super.pickNode(x, y);

        if (!result) {
            for (const { pickGroup } of this.seriesGroups ) {
                result = pickGroup.pickNode(x, y);

                if (result) {
                    break;
                }
            }
        }

        return result;
    }

    update(): void {
        this.updateSelections();
        this.updateHighlightSelection();
        this.updateNodes();
    }

    private updateSelections() {
        if (!this.nodeDataRefresh) {
            return;
        }
        this.nodeDataRefresh = false;

        this.createNodeData();
        this.updateSeriesGroups();

        this.seriesGroups.forEach((groupSeries, idx) => {
            const { labelSelection, rectSelection } = groupSeries;
            groupSeries.rectSelection = this.updateRectSelection(rectSelection, this.nodeData[idx]);
            groupSeries.labelSelection = this.updateLabelSelection(labelSelection, this.nodeData[idx]);
        });
    }

    updateHighlightSelection() {
        const {
            chart: {
                highlightedDatum: { datum = undefined, series = undefined } = {},
                highlightedDatum = undefined,
            } = {},
        } = this;

        const highlightData = series === this && highlightedDatum && datum ? [highlightedDatum as BarNodeDatum] : [];
        this.highlightRectSelection = this.updateRectSelection(this.highlightRectSelection, highlightData);
    }

    private updateSeriesGroups() {
        const { nodeData, seriesGroups } = this;
        if (nodeData.length === seriesGroups.length) {
            return;
        }

        if (nodeData.length < seriesGroups.length) {
            seriesGroups.splice(nodeData.length)
                .forEach((group) => this.seriesGroup.removeChild(group.group));
        }

        while (nodeData.length > seriesGroups.length) {
            const group = new Group({
                name: `${this.id}-series-sub${this.seriesGroupId++}`,
                layer: true,
                zIndex: Series.SERIES_LAYER_ZINDEX,
            });
            const pickGroup = new Group();
            group.appendChild(pickGroup);
            this.seriesGroup.appendChild(group);

            seriesGroups.push({
                group,
                pickGroup,
                labelSelection: Selection.select(group).selectAllByTag<Text>(BarSeriesNodeTag.Label),
                rectSelection: Selection.select(pickGroup).selectAllByTag<Rect>(BarSeriesNodeTag.Bar),
            });
        }
    }

    private updateNodes() {
        const visible = this.visible;
        this.group.visible = visible;
        this.seriesGroup.visible = visible;
        this.highlightGroup.visible = visible && this.chart?.highlightedDatum?.series === this;

        this.updateRectNodes(this.highlightRectSelection, true);
        this.seriesGroups.forEach(({ group, labelSelection, rectSelection }, idx) => {
            group.opacity = this.getOpacity(rectSelection.data[0]);
            group.visible = visible;

            this.updateRectNodes(rectSelection, false);
            this.updateLabelNodes(labelSelection);
        });
    }

    private updateRectSelection(
        rectSelection: Selection<Rect, Group, BarNodeDatum, any>,
        nodeData: BarNodeDatum[],
    ): Selection<Rect, Group, BarNodeDatum, any> {
        const updateRects = rectSelection.setData(nodeData);
        updateRects.exit.remove();
        const enterRects = updateRects.enter.append(Rect)
            .each(rect => {
                rect.tag = BarSeriesNodeTag.Bar;
                rect.crisp = true;
            });
        return updateRects.merge(enterRects);
    }

    private updateRectNodes(
        rectSelection: Selection<Rect, Group, BarNodeDatum, any>,
        highlightSelection: boolean,
    ): void {
        if (!this.chart) {
            return;
        }

        const {
            fills, strokes, fillOpacity, strokeOpacity, shadow, formatter,
            xKey, flipXY,
            chart: { highlightedDatum },
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                }
            }
        } = this;

        rectSelection.each((rect, datum) => {
            const isDatumHighlighted = highlightSelection && datum === highlightedDatum;
            rect.visible = !highlightSelection || isDatumHighlighted;
            if (!rect.visible) {
                return;
            }

            const { colorIndex } = datum;
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : fills[colorIndex % fills.length];
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : strokes[colorIndex % fills.length];
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : this.getStrokeWidth(this.strokeWidth, datum);

            let format: BarSeriesFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    fill,
                    stroke,
                    strokeWidth,
                    highlighted: isDatumHighlighted,
                    xKey,
                    yKey: datum.yKey
                });
            }
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = format && format.fill || fill;
            rect.stroke = format && format.stroke || stroke;
            rect.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.lineDash = this.lineDash;
            rect.lineDashOffset = this.lineDashOffset;
            rect.fillShadow = shadow;
            // Prevent stroke from rendering for zero height columns and zero width bars.
            rect.visible = flipXY ? datum.width > 0 : datum.height > 0;
        });
    }

    private updateLabelSelection(
        labelSelection: Selection<Text, Group, BarNodeDatum, any>,
        nodeData: BarNodeDatum[],
    ): Selection<Text, Group, BarNodeDatum, any> {
        const { enabled } = this.label;
        const data = enabled ? nodeData : [];
        const updateLabels = labelSelection.setData(data);

        updateLabels.exit.remove();

        const enterLabels = updateLabels.enter.append(Text).each(text => {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
        });

        return updateLabels.merge(enterLabels);
    }

    private updateLabelNodes(
        labelSelection: Selection<Text, Group, BarNodeDatum, any>,
    ): void {
        if (!this.chart) {
            return;
        }

        const {
            label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color }
        } = this;

        labelSelection.each((text, datum) => {
            const label = datum.label;

            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            } else {
                text.visible = false;
            }
        });
    }

    getTooltipHtml(nodeDatum: BarNodeDatum): string {
        const { xKey, yKeys, yData } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();
        const { yKey } = nodeDatum;

        if (!yData.length || !xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }

        const yGroup = yData[nodeDatum.index];
        let fillIndex = 0;
        let i = 0;
        let j = 0;
        for (; j < yKeys.length; j++) {
            const stack = yKeys[j];
            i = stack.indexOf(yKey);
            if (i >= 0) {
                fillIndex += i;
                break;
            }
            fillIndex += stack.length;
        }

        const { xName, yNames, fills, strokes, tooltip, formatter } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const datum = nodeDatum.datum;
        const yName = yNames[yKey];
        const fill = fills[fillIndex % fills.length];
        const stroke = strokes[fillIndex % fills.length];
        const strokeWidth = this.getStrokeWidth(this.strokeWidth);
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const processedYValue = yGroup[j][i];
        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));
        const title = sanitizeHtml(yName);
        const content = xString + ': ' + yString;

        let format: BarSeriesFormat | undefined = undefined;

        if (formatter) {
            format = formatter({
                datum,
                fill,
                stroke,
                strokeWidth,
                highlighted: false,
                xKey,
                yKey
            });
        }

        const color = format && format.fill || fill;

        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content
        };

        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum,
                xKey,
                xValue,
                xName,
                yKey,
                yValue,
                processedYValue,
                yName,
                color
            }), defaults);
        }

        return toTooltipHtml(defaults);
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            id, data, xKey, yKeys, yNames, cumYKeyCount, seriesItemEnabled, hideInLegend,
            fills, strokes, fillOpacity, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKeys.length) {
            this.yKeys.forEach((stack, stackIndex) => {
                stack.forEach((yKey, levelIndex) => {
                    if (hideInLegend.indexOf(yKey) < 0) {
                        const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                        legendData.push({
                            id,
                            itemId: yKey,
                            enabled: seriesItemEnabled.get(yKey) || false,
                            label: {
                                text: yNames[yKey] || yKey
                            },
                            marker: {
                                fill: fills[colorIndex % fills.length],
                                stroke: strokes[colorIndex % strokes.length],
                                fillOpacity: fillOpacity,
                                strokeOpacity: strokeOpacity
                            }
                        });
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        const { seriesItemEnabled } = this;
        seriesItemEnabled.set(itemId, enabled);

        const yKeys = this.yKeys.map(stack => stack.slice()); // deep clone

        seriesItemEnabled.forEach((enabled, yKey) => {
            if (!enabled) {
                yKeys.forEach(stack => {
                    const index = stack.indexOf(yKey);
                    if (index >= 0) {
                        stack.splice(index, 1);
                    }
                });
            }
        });

        const visibleStacks: string[] = [];
        yKeys.forEach((stack, index) => {
            if (stack.length > 0) {
                visibleStacks.push(String(index));
            }
        });
        this.groupScale.domain = visibleStacks;

        this.nodeDataRefresh = true;
    }
}
