import { Group } from '../../../scene/group';
import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text, FontStyle, FontWeight } from '../../../scene/shape/text';
import { BandScale } from '../../../scale/bandScale';
import { DropShadow } from '../../../scene/dropShadow';
import {
    SeriesNodeDatum,
    SeriesNodeDataContext,
    CartesianTooltipRendererParams,
    SeriesTooltip,
    SeriesNodePickMode,
} from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { LegendDatum } from '../../legend';
import { CartesianSeries, CartesianSeriesNodeClickEvent } from './cartesianSeries';
import { ChartAxis, ChartAxisDirection, flipChartAxisDirection } from '../../chartAxis';
import { TooltipRendererResult, toTooltipHtml } from '../../tooltip/tooltip';
import { extent, findMinMax } from '../../../util/array';
import { equal } from '../../../util/equal';
import { Scale } from '../../../scale/scale';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isContinuous, isNumber } from '../../../util/value';
import { clamper, ContinuousScale } from '../../../scale/continuousScale';
import { Point } from '../../../scene/point';
import {
    BOOLEAN,
    BOOLEAN_ARRAY,
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_NUMBER,
    STRING,
    STRING_ARRAY,
    COLOR_STRING_ARRAY,
    Validate,
    OPTIONAL,
    ValidatePredicate,
} from '../../../util/validation';
import { CategoryAxis } from '../../axis/categoryAxis';
import { GroupedCategoryAxis } from '../../axis/groupedCategoryAxis';

const BAR_LABEL_PLACEMENTS = ['inside', 'outside'];
const OPT_BAR_LABEL_PLACEMENT: ValidatePredicate = (v: any, ctx) =>
    OPTIONAL(v, ctx, (v: any) => BAR_LABEL_PLACEMENTS.includes(v));

export interface BarTooltipRendererParams extends CartesianTooltipRendererParams {
    readonly processedYValue: any;
}

interface BarNodeDatum extends SeriesNodeDatum, Readonly<Point> {
    readonly index: number;
    readonly yKey: string;
    readonly yValue: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly colorIndex: number;
    readonly strokeWidth: number;
    readonly label?: Readonly<Point> & {
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
    Label,
}

export enum BarLabelPlacement {
    Inside = 'inside',
    Outside = 'outside',
}

export class BarSeriesLabel extends Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: { value: number; seriesId: string }) => string = undefined;

    @Validate(OPT_BAR_LABEL_PLACEMENT)
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
    readonly seriesId: string;
}

export interface BarSeriesFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export class BarSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: BarTooltipRendererParams) => string | TooltipRendererResult = undefined;
}

function flat(arr: any[], target: any[] = []): any[] {
    arr.forEach((v) => {
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

export class BarSeries extends CartesianSeries<SeriesNodeDataContext<BarNodeDatum>, Rect> {
    static className = 'BarSeries';
    static type = 'bar' as const;

    private xData: any[] = [];
    private yData: number[][][] = [];
    private yDomain: number[] = [];

    readonly label = new BarSeriesLabel();

    tooltip: BarSeriesTooltip = new BarSeriesTooltip();

    @Validate(BOOLEAN)
    flipXY = false;

    @Validate(COLOR_STRING_ARRAY)
    fills: string[] = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];

    @Validate(COLOR_STRING_ARRAY)
    strokes: string[] = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];

    @Validate(NUMBER(0, 1))
    fillOpacity = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity = 1;

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    @Validate(OPT_FUNCTION)
    formatter?: (params: BarSeriesFormatterParams) => BarSeriesFormat = undefined;

    constructor() {
        super({
            pickGroupIncludes: ['datumNodes'],
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
        });

        this.label.enabled = false;
    }

    /**
     * Used to get the position of bars within each group.
     */
    private groupScale = new BandScale<string>();

    directionKeys = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKeys'],
    };

    getKeys(direction: ChartAxisDirection): string[] {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[this.flipXY ? flipChartAxisDirection(direction) : direction];
        let values: string[] = [];

        if (keys) {
            keys.forEach((key) => {
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

    @Validate(STRING)
    protected _xKey: string = '';
    set xKey(value: string) {
        this._xKey = value;
        this.xData = [];
    }
    get xKey(): string {
        return this._xKey;
    }

    @Validate(STRING)
    xName: string = '';

    private cumYKeyCount: number[] = [];
    private flatYKeys: string[] | undefined = undefined; // only set when a user used a flat array for yKeys

    @Validate(STRING_ARRAY)
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
            yKeys = this.grouped ? flatYKeys.map((k) => [k]) : [flatYKeys];
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

            this.processSeriesItemEnabled();

            const { groupScale } = this;
            groupScale.domain = visibleStacks;
        }
    }
    get yKeys(): string[][] {
        return this._yKeys;
    }

    @Validate(BOOLEAN_ARRAY)
    protected _visibles: boolean[] = [];
    set visibles(visibles: boolean[] | boolean[][]) {
        const flattenFn = (r: boolean[], n: boolean | boolean[]) => r.concat(...(Array.isArray(n) ? n : [n]));
        this._visibles = (visibles as any).reduce(flattenFn, []);

        this.processSeriesItemEnabled();
    }
    get visibles() {
        return this._visibles;
    }

    private processSeriesItemEnabled() {
        const { seriesItemEnabled, _visibles: visibles = [] } = this;
        seriesItemEnabled.clear();
        let visiblesIdx = 0;
        this._yKeys.forEach((stack) => {
            stack.forEach((yKey) => seriesItemEnabled.set(yKey, visibles?.[visiblesIdx++] ?? true));
        });
    }

    @Validate(BOOLEAN)
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
    @Validate(OPT_NUMBER())
    private _normalizedTo?: number;
    set normalizedTo(value: number | undefined) {
        const absValue = value ? Math.abs(value) : undefined;

        this._normalizedTo = absValue;
    }
    get normalizedTo(): number | undefined {
        return this._normalizedTo;
    }

    @Validate(NUMBER(0))
    strokeWidth: number = 1;

    shadow?: DropShadow = undefined;

    protected smallestDataInterval?: { x: number; y: number } = undefined;
    async processData() {
        const { xKey, yKeys, seriesItemEnabled } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();

        if (!(xAxis && yAxis)) {
            return;
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
        };

        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;
        let keysFound = true; // only warn once
        let prevX = Infinity;
        this.xData = data.map((datum) => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }

            const x = checkDatum(datum[xKey], isContinuousX);

            if (isContinuousX) {
                setSmallestXInterval(x, prevX);
            }

            prevX = x;

            return x;
        });

        this.yData = data.map((datum) =>
            yKeys.map((stack) => {
                return stack.map((yKey) => {
                    if (keysFound && !(yKey in datum)) {
                        keysFound = false;
                        console.warn(`The key '${yKey}' was not found in the data: `, datum);
                    }

                    const yDatum = checkDatum(datum[yKey], isContinuousY);

                    if (!seriesItemEnabled.get(yKey) || yDatum === undefined) {
                        return NaN;
                    }

                    return yDatum;
                });
            })
        );

        // Contains min/max values for each stack in each group,
        // where min is zero and max is a positive total of all values in the stack
        // or min is a negative total of all values in the stack and max is zero.
        const yMinMax = this.yData.map((group) => group.map((stack) => findMinMax(stack)));
        const { yData, normalizedTo } = this;

        // Calculate the sum of the absolute values of all items in each stack in each group. Used for normalization of stacked bars.
        const yAbsTotal = this.yData.map((group) =>
            group.map((stack) =>
                stack.reduce((acc, stack) => {
                    acc += isNaN(stack) ? 0 : Math.abs(stack);
                    return acc;
                }, 0)
            )
        );

        let { min: yMin, max: yMax } = this.findLargestMinMax(yMinMax);
        if (yMin === Infinity && yMax === -Infinity) {
            // There's no data in the domain.
            this.yDomain = [];
            return;
        }

        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yMin < 0 ? -normalizedTo : 0;
            yMax = yMax > 0 ? normalizedTo : 0;
            yData.forEach((group, i) => {
                group.forEach((stack, j) => {
                    stack.forEach((y, k) => {
                        stack[k] = (y / yAbsTotal[i][j]) * normalizedTo;
                    });
                });
            });
        }

        this.yDomain = this.fixNumericExtent([yMin, yMax], this.yAxis);
    }

    findLargestMinMax(groups: { min?: number; max?: number }[][]): { min: number; max: number } {
        let tallestStackMin = Infinity;
        let tallestStackMax = -Infinity;

        for (const group of groups) {
            for (const stack of group) {
                let { min = Infinity, max = -Infinity } = stack;
                if (min < tallestStackMin) {
                    tallestStackMin = min;
                }
                if (max > tallestStackMax) {
                    tallestStackMax = max;
                }
            }
        }

        return { min: tallestStackMin, max: tallestStackMax };
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { flipXY } = this;
        if (this.flipXY) {
            direction = flipChartAxisDirection(direction);
        }
        if (direction === ChartAxisDirection.X) {
            if (!(this.getCategoryAxis()?.scale instanceof ContinuousScale)) {
                return this.xData;
            }
            // The last node will be clipped if the scale is not a band scale
            // Extend the domain by the smallest data interval so that the last band is not clipped
            const xDomain = extent(this.xData, isContinuous, Number) || [NaN, NaN];
            if (flipXY) {
                xDomain[0] = xDomain[0] - (this.smallestDataInterval?.x ?? 0);
            } else {
                xDomain[1] = xDomain[1] + (this.smallestDataInterval?.x ?? 0);
            }
            return xDomain;
        } else {
            return this.yDomain;
        }
    }

    protected getNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeClickEvent<any> {
        return new CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
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

        if (!xAxis) {
            return;
        }

        // calculate step
        let domainLength = xAxis.dataDomain[1] - xAxis.dataDomain[0];
        let intervals = domainLength / (smallestInterval?.x ?? 1) + 1;

        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum number of bands to ensure the step does not fall below 1 pixel.
        // This means there could be some overlap of the bands in the chart.
        const maxBands = Math.floor(range); // A minimum of 1px per bar/column means the maximum number of bands will equal the available range
        const bands = Math.min(intervals, maxBands);

        const step = range / Math.max(1, bands);

        return step;
    }

    async createNodeData() {
        const { chart, data, visible } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();

        if (!(chart && data && visible && xAxis && yAxis)) {
            return [];
        }

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
            label,
            flipXY,
            id: seriesId,
        } = this;

        const {
            fontStyle: labelFontStyle,
            fontWeight: labelFontWeight,
            fontSize: labelFontSize,
            fontFamily: labelFontFamily,
            color: labelColor,
            formatter: labelFormatter,
            placement: labelPlacement,
        } = label;

        let xBandWidth = xScale.bandwidth;

        if (xScale instanceof ContinuousScale) {
            const availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
            const step = this.calculateStep(availableRange);

            xBandWidth = step;
        }

        groupScale.range = [0, xBandWidth!];

        if (xAxis instanceof CategoryAxis) {
            groupScale.padding = xAxis.groupPaddingInner;
        } else if (xAxis instanceof GroupedCategoryAxis) {
            groupScale.padding = 0.1;
        } else {
            // Number or Time axis
            groupScale.padding = 0;
        }

        // To get exactly `0` padding we need to turn off rounding
        if (groupScale.padding === 0) {
            groupScale.round = false;
        } else {
            groupScale.round = true;
        }

        const barWidth =
            groupScale.bandwidth >= 1
                ? // Pixel-rounded value for low-volume bar charts.
                  groupScale.bandwidth
                : // Handle high-volume bar charts gracefully.
                  groupScale.rawBandwidth;
        const contexts: SeriesNodeDataContext<BarNodeDatum>[][] = [];

        xData.forEach((group, groupIndex) => {
            const seriesDatum = data[groupIndex];
            const x = xScale.convert(group);

            const groupYs = yData[groupIndex]; // y-data for groups of stacks
            for (let stackIndex = 0; stackIndex < groupYs.length; stackIndex++) {
                const stackYs = groupYs[stackIndex]; // y-data for a stack within a group
                contexts[stackIndex] = contexts[stackIndex] ?? [];

                let prevMinY = 0;
                let prevMaxY = 0;

                for (let levelIndex = 0; levelIndex < stackYs.length; levelIndex++) {
                    const currY = +stackYs[levelIndex];
                    const yKey = yKeys[stackIndex][levelIndex];
                    const barX = x + groupScale.convert(String(stackIndex));
                    contexts[stackIndex][levelIndex] = contexts[stackIndex][levelIndex] ?? {
                        itemId: yKey,
                        nodeData: [],
                        labelData: [],
                    };

                    // Bars outside of visible range are not rendered, so we create node data
                    // only for the visible subset of user data.
                    if (!xAxis.inRange(barX, barWidth)) {
                        continue;
                    }
                    if (isNaN(currY)) {
                        continue;
                    }

                    const prevY = currY < 0 ? prevMinY : prevMaxY;
                    const continuousY = yScale instanceof ContinuousScale;
                    const y = yScale.convert(prevY + currY, continuousY ? clamper : undefined);
                    const bottomY = yScale.convert(prevY, continuousY ? clamper : undefined);
                    const yValue = seriesDatum[yKey]; // unprocessed y-value

                    let labelText: string;
                    if (labelFormatter) {
                        labelText = labelFormatter({
                            value: isNumber(yValue) ? yValue : undefined,
                            seriesId,
                        });
                    } else {
                        labelText = isNumber(yValue) ? yValue.toFixed(2) : '';
                    }

                    let labelX: number;
                    let labelY: number;

                    if (flipXY) {
                        labelY = barX + barWidth / 2;
                        if (labelPlacement === BarLabelPlacement.Inside) {
                            labelX = y + ((yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y)) / 2;
                        } else {
                            labelX = y + (yValue >= 0 ? 1 : -1) * 4;
                        }
                    } else {
                        labelX = barX + barWidth / 2;
                        if (labelPlacement === BarLabelPlacement.Inside) {
                            labelY = y + ((yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y)) / 2;
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
                        labelTextBaseline = flipXY ? 'middle' : yValue >= 0 ? 'bottom' : 'top';
                    }

                    const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                    const nodeData: BarNodeDatum = {
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
                        label:
                            seriesItemEnabled.get(yKey) && labelText
                                ? {
                                      text: labelText,
                                      fontStyle: labelFontStyle,
                                      fontWeight: labelFontWeight,
                                      fontSize: labelFontSize,
                                      fontFamily: labelFontFamily,
                                      textAlign: labelTextAlign,
                                      textBaseline: labelTextBaseline,
                                      fill: labelColor,
                                      x: labelX,
                                      y: labelY,
                                  }
                                : undefined,
                    };
                    contexts[stackIndex][levelIndex].nodeData.push(nodeData);
                    contexts[stackIndex][levelIndex].labelData.push(nodeData);

                    if (currY < 0) {
                        prevMinY += currY;
                    } else {
                        prevMaxY += currY;
                    }
                }
            }
        });

        return contexts.reduce((r, n) => r.concat(...n), []);
    }

    protected async updateDatumSelection(opts: {
        nodeData: BarNodeDatum[];
        datumSelection: Selection<Rect, Group, BarNodeDatum, any>;
    }) {
        const { nodeData, datumSelection } = opts;

        const updateRects = datumSelection.setData(nodeData);
        updateRects.exit.remove();
        const enterRects = updateRects.enter.append(Rect).each((rect) => {
            rect.tag = BarSeriesNodeTag.Bar;
        });
        return updateRects.merge(enterRects);
    }

    protected async updateDatumNodes(opts: {
        datumSelection: Selection<Rect, Group, BarNodeDatum, any>;
        isHighlight: boolean;
    }) {
        const { datumSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            fills,
            strokes,
            fillOpacity: seriesFillOpacity,
            strokeOpacity,
            shadow,
            formatter,
            xKey,
            flipXY,
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    fillOpacity: highlightFillOpacity = seriesFillOpacity,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                },
            },
            id: seriesId,
        } = this;

        const [visibleMin, visibleMax] = this.xAxis?.visibleRange ?? [];
        const isZoomed = visibleMin !== 0 || visibleMax !== 1;
        const crisp = !isZoomed;
        datumSelection.each((rect, datum) => {
            const { colorIndex } = datum;
            const fill =
                isDatumHighlighted && highlightedFill !== undefined
                    ? highlightedFill
                    : fills[colorIndex % fills.length];
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : strokes[colorIndex % fills.length];
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : this.getStrokeWidth(this.strokeWidth, datum);
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;

            let format: BarSeriesFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    fill,
                    stroke,
                    strokeWidth,
                    highlighted: isDatumHighlighted,
                    xKey,
                    yKey: datum.yKey,
                    seriesId,
                });
            }
            rect.crisp = crisp;
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = (format && format.fill) || fill;
            rect.stroke = (format && format.stroke) || stroke;
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

    protected async updateLabelSelection(opts: {
        labelData: BarNodeDatum[];
        labelSelection: Selection<Text, Group, BarNodeDatum, any>;
    }) {
        const { labelData, labelSelection } = opts;
        const { enabled } = this.label;
        const data = enabled ? labelData : [];

        const updateLabels = labelSelection.setData(data);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text).each((text) => {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
        });

        return updateLabels.merge(enterLabels);
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, Group, BarNodeDatum, any> }) {
        const { labelSelection } = opts;
        const {
            label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color },
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

        const { xName, yNames, fills, strokes, tooltip, formatter, id: seriesId } = this;
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
                yKey,
                seriesId,
            });
        }

        const color = (format && format.fill) || fill;

        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };

        if (tooltipRenderer) {
            return toTooltipHtml(
                tooltipRenderer({
                    datum,
                    xKey,
                    xValue,
                    xName,
                    yKey,
                    yValue,
                    processedYValue,
                    yName,
                    color,
                    title,
                    seriesId,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    getLegendData(): LegendDatum[] {
        const {
            id,
            data,
            xKey,
            yKeys,
            yNames,
            cumYKeyCount,
            seriesItemEnabled,
            hideInLegend,
            fills,
            strokes,
            fillOpacity,
            strokeOpacity,
            flipXY,
        } = this;

        if (!data || !data.length || !xKey || !yKeys.length) {
            return [];
        }

        const legendData: LegendDatum[] = [];

        this.yKeys.forEach((stack, stackIndex) => {
            // Column stacks should be listed in the legend in reverse order, for symmetry with the
            // vertical stack display order. Bar stacks are already consistent left-to-right with
            // the legend.
            const startLevel = flipXY ? 0 : stack.length - 1;
            const direction = flipXY ? 1 : -1;

            for (let levelIndex = startLevel, step = 0; step < stack.length; levelIndex += direction, step++) {
                const yKey = stack[levelIndex];
                if (hideInLegend.indexOf(yKey) >= 0) {
                    return;
                }
                const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                legendData.push({
                    id,
                    itemId: yKey,
                    seriesId: id,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[yKey] || yKey,
                    },
                    marker: {
                        fill: fills[colorIndex % fills.length],
                        stroke: strokes[colorIndex % strokes.length],
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity,
                    },
                });
            }
        });

        return legendData;
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        super.toggleSeriesItem(itemId, enabled);

        const yKeys = this.yKeys.map((stack) => stack.slice()); // deep clone

        this.seriesItemEnabled.forEach((enabled, yKey) => {
            if (!enabled) {
                yKeys.forEach((stack) => {
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

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
