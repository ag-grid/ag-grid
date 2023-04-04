import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { BandScale } from '../../../scale/bandScale';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDataContext, SeriesTooltip, SeriesNodePickMode } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { LegendDatum } from '../../legendDatum';
import {
    CartesianSeries,
    CartesianSeriesNodeClickEvent,
    CartesianSeriesNodeDatum,
    CartesianSeriesNodeDoubleClickEvent,
} from './cartesianSeries';
import { ChartAxis, flipChartAxisDirection } from '../../chartAxis';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import { areArrayItemsStrictlyEqual } from '../../../util/equal';
import { Scale } from '../../../scale/scale';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isNumber } from '../../../util/value';
import { ContinuousScale } from '../../../scale/continuousScale';
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
import {
    AgCartesianSeriesLabelFormatterParams,
    AgTooltipRendererResult,
    AgBarSeriesFormatterParams,
    AgBarSeriesTooltipRendererParams,
    AgBarSeriesFormat,
    AgBarSeriesLabelPlacement,
    FontStyle,
    FontWeight,
} from '../../agChartOptions';
import { LogAxis } from '../../axis/logAxis';
import { DataModel, SMALLEST_KEY_INTERVAL, SUM_VALUE_EXTENT } from '../../data/dataModel';

const BAR_LABEL_PLACEMENTS: AgBarSeriesLabelPlacement[] = ['inside', 'outside'];
const OPT_BAR_LABEL_PLACEMENT: ValidatePredicate = (v: any, ctx) =>
    OPTIONAL(v, ctx, (v: any) => BAR_LABEL_PLACEMENTS.includes(v));

interface BarNodeDatum extends CartesianSeriesNodeDatum, Readonly<Point> {
    readonly index: number;
    readonly yValue: number;
    readonly cumulativeValue: number;
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

class BarSeriesLabel extends Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string = undefined;

    @Validate(OPT_BAR_LABEL_PLACEMENT)
    placement: AgBarSeriesLabelPlacement = 'inside';
}

class BarSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgBarSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
}

function is2dArray<E>(array: E[] | E[][]): array is E[][] {
    return array.length > 0 && Array.isArray(array[0]);
}

export class BarSeries extends CartesianSeries<SeriesNodeDataContext<BarNodeDatum>, Rect> {
    static className = 'BarSeries';
    static type = 'bar' as const;

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
    formatter?: (params: AgBarSeriesFormatterParams<any>) => AgBarSeriesFormat = undefined;

    constructor() {
        super({
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            directionKeys: {
                [ChartAxisDirection.X]: ['xKey'],
                [ChartAxisDirection.Y]: ['yKeys'],
            },
        });

        this.label.enabled = false;
    }

    /**
     * Used to get the position of bars within each group.
     */
    private groupScale = new BandScale<string>();

    protected resolveKeyDirection(direction: ChartAxisDirection) {
        return this.flipXY ? flipChartAxisDirection(direction) : direction;
    }

    @Validate(STRING)
    protected _xKey: string = '';
    set xKey(value: string) {
        this._xKey = value;
        this.processedData = undefined;
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

    yKeys: string[][] = [];

    protected yKeysCache: string[][] = [];

    protected processYKeys() {
        let { yKeys } = this;

        let flatYKeys: string[] | undefined = undefined;
        // Convert from flat y-keys to grouped y-keys.
        if (!is2dArray(yKeys)) {
            flatYKeys = yKeys as any as string[];
            yKeys = this.grouped ? flatYKeys.map((k) => [k]) : [flatYKeys];
        }

        const stackGroups = Object.values(this.stackGroups);
        if (stackGroups.length > 0) {
            const flattenKeys = (keys: string[][]) => keys.reduce((res, k) => res.concat(k), []);

            // Create a stack for items without a group
            const flatKeys = flattenKeys(yKeys);
            const keysInStacks = new Set(flattenKeys(stackGroups));
            const ungroupedKeys = flatKeys.filter((k) => !keysInStacks.has(k));
            yKeys = stackGroups.map((keys) => keys);
            if (ungroupedKeys.length > 0) {
                yKeys.push(ungroupedKeys);
            }

            // Preserve the order of colours and other properties
            const indexMap = <T>(items: T[]) =>
                items.reduce((map, key, index) => map.set(key, index), new Map<T, number>());
            const newKeys = flattenKeys(yKeys);
            const newKeysIndices = indexMap(newKeys);
            const sort = <T>(items: T[]) => {
                const result = Array.from<T>({ length: items.length });
                items.forEach((item, index) => {
                    const key = flatKeys[index];
                    const newIndex = newKeysIndices.get(key)!;
                    result[newIndex] = item;
                });
                return result;
            };
            this.fills = sort(this.fills);
            this.strokes = sort(this.strokes);
            this.visibles = sort(this.visibles);
        }

        if (!areArrayItemsStrictlyEqual(this.yKeysCache, yKeys)) {
            this.flatYKeys = flatYKeys ? flatYKeys : undefined;
            this.yKeys = yKeys;

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
            this.processSeriesItemEnabled();

            const { groupScale } = this;
            groupScale.domain = visibleStacks;
        }
        this.yKeysCache = yKeys;
    }

    @Validate(BOOLEAN_ARRAY)
    visibles: boolean[] = [];

    private processSeriesItemEnabled() {
        const { seriesItemEnabled } = this;

        const flattenFn = (r: boolean[], n: boolean | boolean[]) => r.concat(...(Array.isArray(n) ? n : [n]));
        const visibles = this.visibles.reduce(flattenFn, []);

        seriesItemEnabled.clear();
        let visiblesIdx = 0;
        this.yKeys.forEach((stack) => {
            stack.forEach((yKey) => seriesItemEnabled.set(yKey, visibles[visiblesIdx++] ?? true));
        });
    }

    @Validate(BOOLEAN)
    protected _grouped: boolean = false;
    set grouped(value: boolean) {
        this._grouped = value;
    }
    get grouped(): boolean {
        return this._grouped;
    }

    stackGroups: Record<string, string[]> = {};

    protected getStackGroup(yKey: string) {
        const { stackGroups } = this;
        return Object.entries(stackGroups).find(([_, keys]) => keys.includes(yKey))?.[0];
    }

    /**
     * A map of `yKeys` to their names (used in legends and tooltips).
     * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
     */
    yNames: { [key in string]: string } = {};

    protected processYNames() {
        const values = this.yNames;
        if (Array.isArray(values) && this.flatYKeys) {
            const map: { [key in string]: string } = {};
            this.flatYKeys.forEach((k, i) => {
                map[k] = values[i];
            });
            this.yNames = map;
        }
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
        this.processYKeys();
        this.processYNames();

        const { xKey, seriesItemEnabled, normalizedTo, data = [] } = this;

        const isContinuousX = this.getCategoryAxis()?.scale instanceof ContinuousScale;
        const isContinuousY = this.getValueAxis()?.scale instanceof ContinuousScale;

        this.dataModel = new DataModel<any, any, true>({
            props: [
                {
                    property: xKey,
                    type: 'key',
                    valueType: isContinuousX ? 'range' : 'category',
                    validation: (v) => checkDatum(v, isContinuousX) != null,
                },
                ...[...seriesItemEnabled.entries()]
                    .filter(([, enabled]) => enabled)
                    .map(([yKey]) => ({
                        property: yKey,
                        type: 'value' as const,
                        valueType: isContinuousY ? ('range' as const) : ('category' as const),
                        validation: (v: any) => checkDatum(v, isContinuousY) != null,
                    })),
                ...this.yKeys
                    .map((stack) => ({
                        type: 'sum' as const,
                        properties: stack.filter((key) => seriesItemEnabled.get(key) === true),
                    }))
                    .filter((def) => def.properties.length > 0),
                ...(isContinuousX ? [SMALLEST_KEY_INTERVAL] : []),
                SUM_VALUE_EXTENT,
            ],
            groupByKeys: true,
            normaliseTo: normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined,
        });

        this.processedData = this.dataModel.processData(data);

        this.smallestDataInterval = {
            x: this.processedData.reduced?.[SMALLEST_KEY_INTERVAL.property] ?? Infinity,
            y: Infinity,
        };
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { flipXY, processedData } = this;
        if (!processedData) return [];

        if (flipXY) {
            direction = flipChartAxisDirection(direction);
        }

        const {
            defs: {
                keys: [keyDef],
            },
            domain: {
                keys: [keys],
                values: [yExtent],
            },
            reduced: { [SMALLEST_KEY_INTERVAL.property]: smallestX, [SUM_VALUE_EXTENT.property]: ySumExtent } = {},
        } = processedData;

        if (direction === ChartAxisDirection.X) {
            if (keyDef.valueType === 'category') {
                return keys;
            }

            const keysExtent = extent(keys) || [NaN, NaN];
            if (flipXY) {
                return [keysExtent[0] + -smallestX, keysExtent[1]];
            }
            return [keysExtent[0], keysExtent[1] + smallestX];
        } else if (this.getValueAxis() instanceof LogAxis) {
            return this.fixNumericExtent(yExtent as any);
        } else {
            return this.fixNumericExtent(ySumExtent);
        }
    }

    protected getNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeClickEvent<any> {
        return new CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    }

    protected getNodeDoubleClickEvent(
        event: MouseEvent,
        datum: BarNodeDatum
    ): CartesianSeriesNodeDoubleClickEvent<any> {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey, datum.yKey, event, datum, this);
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
        const domainLength = xAxis.dataDomain[1] - xAxis.dataDomain[0];
        const intervals = domainLength / (smallestInterval?.x ?? 1) + 1;

        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum number of bands to ensure the step does not fall below 1 pixel.
        // This means there could be some overlap of the bands in the chart.
        const maxBands = Math.floor(range); // A minimum of 1px per bar/column means the maximum number of bands will equal the available range
        const bands = Math.min(intervals, maxBands);

        const step = range / Math.max(1, bands);

        return step;
    }

    async createNodeData() {
        const { data, visible } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();

        if (!(data && visible && xAxis && yAxis)) {
            return [];
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;

        const {
            groupScale,
            yKeys,
            xKey,
            cumYKeyCount,
            fills,
            strokes,
            strokeWidth,
            seriesItemEnabled,
            label,
            flipXY,
            id: seriesId,
            processedData,
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

        processedData?.data.forEach(({ keys, datum: seriesDatum, values }, dataIndex) => {
            const x = xScale.convert(keys[0]);

            for (let stackIndex = 0; stackIndex < (yKeys?.length ?? 0); stackIndex++) {
                const stackYKeys = yKeys?.[stackIndex] ?? []; // y-data for a stack within a group
                contexts[stackIndex] ??= [];

                let prevMinY = 0;
                let prevMaxY = 0;

                for (let levelIndex = 0; levelIndex < stackYKeys.length; levelIndex++) {
                    const yKey = stackYKeys[levelIndex];
                    const yIndex = processedData?.indices.values[yKey] ?? -1;
                    contexts[stackIndex][levelIndex] ??= {
                        itemId: yKey,
                        nodeData: [],
                        labelData: [],
                    };

                    if (yIndex === undefined) continue;

                    const yValue = values[0][yIndex];
                    const currY = +yValue;
                    const barX = x + groupScale.convert(String(stackIndex));

                    // Bars outside of visible range are not rendered, so we create node data
                    // only for the visible subset of user data.
                    if (!xAxis.inRange(barX, barWidth)) {
                        continue;
                    }
                    if (isNaN(currY)) {
                        continue;
                    }

                    const prevY = currY < 0 ? prevMinY : prevMaxY;
                    const y = yScale.convert(prevY + currY, { strict: false });
                    const bottomY = yScale.convert(prevY, { strict: false });

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
                        if (labelPlacement === 'inside') {
                            labelX = y + ((yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y)) / 2;
                        } else {
                            labelX = y + (yValue >= 0 ? 1 : -1) * 4;
                        }
                    } else {
                        labelX = barX + barWidth / 2;
                        if (labelPlacement === 'inside') {
                            labelY = y + ((yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y)) / 2;
                        } else {
                            labelY = y + (yValue >= 0 ? -3 : 4);
                        }
                    }

                    let labelTextAlign: CanvasTextAlign;
                    let labelTextBaseline: CanvasTextBaseline;

                    if (labelPlacement === 'inside') {
                        labelTextAlign = 'center';
                        labelTextBaseline = 'middle';
                    } else {
                        labelTextAlign = flipXY ? (yValue >= 0 ? 'start' : 'end') : 'center';
                        labelTextBaseline = flipXY ? 'middle' : yValue >= 0 ? 'bottom' : 'top';
                    }

                    const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                    const rect = {
                        x: flipXY ? Math.min(y, bottomY) : barX,
                        y: flipXY ? barX : Math.min(y, bottomY),
                        width: flipXY ? Math.abs(bottomY - y) : barWidth,
                        height: flipXY ? barWidth : Math.abs(bottomY - y),
                    };
                    const nodeMidPoint = {
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2,
                    };
                    const nodeData: BarNodeDatum = {
                        index: dataIndex,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum[0],
                        cumulativeValue: prevY + currY,
                        yValue,
                        yKey,
                        xKey,
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                        nodeMidPoint,
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

    protected nodeFactory() {
        return new Rect();
    }

    protected async updateDatumSelection(opts: {
        nodeData: BarNodeDatum[];
        datumSelection: Selection<Rect, BarNodeDatum>;
    }) {
        const { nodeData, datumSelection } = opts;
        return datumSelection.update(nodeData, (rect) => (rect.tag = BarSeriesNodeTag.Bar));
    }

    protected async updateDatumNodes(opts: { datumSelection: Selection<Rect, BarNodeDatum>; isHighlight: boolean }) {
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
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightFillOpacity = seriesFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
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
            const stackGroup = this.getStackGroup(datum.yKey);

            let format: AgBarSeriesFormat | undefined = undefined;
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
                    stackGroup,
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
        labelSelection: Selection<Text, BarNodeDatum>;
    }) {
        const { labelData, labelSelection } = opts;
        const { enabled } = this.label;
        const data = enabled ? labelData : [];

        return labelSelection.update(data, (text) => {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
        });
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, BarNodeDatum> }) {
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
        const { xKey, yKeys, processedData } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();
        const { yKey } = nodeDatum;

        if (!processedData || !xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }

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
        const stackGroup = this.getStackGroup(yKey);
        const fill = fills[fillIndex % fills.length];
        const stroke = strokes[fillIndex % fills.length];
        const strokeWidth = this.getStrokeWidth(this.strokeWidth);
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));
        const title = sanitizeHtml(yName);
        const content = xString + ': ' + yString;

        let format: AgBarSeriesFormat | undefined = undefined;

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
                stackGroup,
            });
        }

        const color = (format && format.fill) || fill;

        const defaults: AgTooltipRendererResult = {
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
                    yName,
                    color,
                    title,
                    seriesId,
                    stackGroup,
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
