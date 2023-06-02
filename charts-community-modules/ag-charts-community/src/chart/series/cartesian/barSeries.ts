import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { BandScale } from '../../../scale/bandScale';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDataContext, SeriesTooltip, SeriesNodePickMode, keyProperty, valueProperty } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { ChartLegendDatum, CategoryLegendDatum } from '../../legendDatum';
import {
    CartesianSeries,
    CartesianSeriesNodeClickEvent,
    CartesianSeriesNodeDatum,
    CartesianSeriesNodeDoubleClickEvent,
} from './cartesianSeries';
import { ChartAxis } from '../../chartAxis';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import { areArrayItemsStrictlyEqual } from '../../../util/equal';
import { Logger } from '../../../util/logger';
import { Scale } from '../../../scale/scale';
import { sanitizeHtml } from '../../../util/sanitize';
import { ContinuousScale } from '../../../scale/continuousScale';
import { Point } from '../../../scene/point';
import {
    BOOLEAN,
    BOOLEAN_ARRAY,
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_NUMBER,
    STRING_ARRAY,
    COLOR_STRING_ARRAY,
    Validate,
    OPTIONAL,
    ValidatePredicate,
    OPT_STRING,
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
import { DataModel } from '../../data/dataModel';
import { sum } from '../../data/aggregateFunctions';
import { LegendItemClickChartEvent, LegendItemDoubleClickChartEvent } from '../../interaction/chartEventManager';
import { AGG_VALUES_EXTENT, normaliseGroupTo, SMALLEST_KEY_INTERVAL } from '../../data/processors';
import * as easing from '../../../motion/easing';
import { createLabelData, getRectConfig, updateRect, RectConfig, checkCrisp, updateLabel } from './barUtil';

const BAR_LABEL_PLACEMENTS: AgBarSeriesLabelPlacement[] = ['inside', 'outside'];
const OPT_BAR_LABEL_PLACEMENT: ValidatePredicate = (v: any, ctx) =>
    OPTIONAL(v, ctx, (v: any) => BAR_LABEL_PLACEMENTS.includes(v));

interface BarNodeLabelDatum extends Readonly<Point> {
    readonly text: string;
    readonly fontStyle?: FontStyle;
    readonly fontWeight?: FontWeight;
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly textAlign: CanvasTextAlign;
    readonly textBaseline: CanvasTextBaseline;
    readonly fill: string;
}

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
    readonly label?: BarNodeLabelDatum;
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
    static type: 'bar' | 'column' = 'bar' as const;

    readonly label = new BarSeriesLabel();

    tooltip: BarSeriesTooltip = new BarSeriesTooltip();

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
        if (this.getBarDirection() === ChartAxisDirection.X) {
            if (direction === ChartAxisDirection.X) {
                return ChartAxisDirection.Y;
            }
            return ChartAxisDirection.X;
        }
        return direction;
    }

    @Validate(OPT_STRING)
    xKey?: string = undefined;

    @Validate(OPT_STRING)
    xName?: string = undefined;

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
    grouped: boolean = false;

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

    legendItemNames: { [key in string]: string } = {};

    @Validate(OPT_NUMBER())
    normalizedTo?: number;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;

    shadow?: DropShadow = undefined;

    protected smallestDataInterval?: { x: number; y: number } = undefined;
    async processData() {
        this.processYKeys();
        this.processYNames();

        const { xKey, seriesItemEnabled, normalizedTo, data = [] } = this;
        const normalizedToAbs = Math.abs(normalizedTo ?? NaN);

        const isContinuousX = this.getCategoryAxis()?.scale instanceof ContinuousScale;
        const isContinuousY = this.getValueAxis()?.scale instanceof ContinuousScale;

        const activeSeriesItems = [...seriesItemEnabled.entries()]
            .filter(([, enabled]) => enabled)
            .map(([yKey]) => yKey);
        const activeStacks = this.yKeys
            .map((stack) => stack.filter((key) => seriesItemEnabled.get(key)))
            .filter((stack) => stack.length > 0);

        const normaliseTo = normalizedToAbs && isFinite(normalizedToAbs) ? normalizedToAbs : undefined;
        const extraProps = [];
        if (normaliseTo) {
            extraProps.push(normaliseGroupTo(activeSeriesItems, normaliseTo, 'sum'));
        }

        this.dataModel = new DataModel<any, any, true>({
            props: [
                keyProperty(xKey, isContinuousX),
                ...activeSeriesItems.map((yKey) => valueProperty(yKey, isContinuousY, { invalidValue: null })),
                ...activeStacks.map((stack) => sum(stack)),
                ...(isContinuousX ? [SMALLEST_KEY_INTERVAL] : []),
                AGG_VALUES_EXTENT,
                ...extraProps,
            ],
            groupByKeys: true,
            dataVisible: this.visible && activeSeriesItems.length > 0,
        });

        this.processedData = this.dataModel.processData(data);

        this.smallestDataInterval = {
            x: this.processedData?.reduced?.[SMALLEST_KEY_INTERVAL.property] ?? Infinity,
            y: Infinity,
        };
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { processedData } = this;
        if (!processedData) return [];

        const {
            defs: {
                keys: [keyDef],
            },
            domain: {
                keys: [keys],
                values: [yExtent],
            },
            reduced: { [SMALLEST_KEY_INTERVAL.property]: smallestX, [AGG_VALUES_EXTENT.property]: ySumExtent } = {},
        } = processedData;

        if (direction === this.getCategoryDirection()) {
            if (keyDef.valueType === 'category') {
                return keys;
            }

            const keysExtent = extent(keys) ?? [NaN, NaN];
            if (direction === ChartAxisDirection.Y) {
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
        return new CartesianSeriesNodeClickEvent(this.xKey ?? '', datum.yKey, event, datum, this);
    }

    protected getNodeDoubleClickEvent(
        event: MouseEvent,
        datum: BarNodeDatum
    ): CartesianSeriesNodeDoubleClickEvent<any> {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey ?? '', datum.yKey, event, datum, this);
    }

    private getCategoryAxis(): ChartAxis<Scale<any, number>> | undefined {
        return this.getCategoryDirection() === ChartAxisDirection.Y ? this.yAxis : this.xAxis;
    }

    private getValueAxis(): ChartAxis<Scale<any, number>> | undefined {
        return this.getBarDirection() === ChartAxisDirection.Y ? this.yAxis : this.xAxis;
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
            xKey = '',
            cumYKeyCount,
            fills,
            strokes,
            strokeWidth,
            seriesItemEnabled,
            label,
            id: seriesId,
            processedData,
        } = this;

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

                    const barAlongX = this.getBarDirection() === ChartAxisDirection.X;
                    const rect = {
                        x: barAlongX ? Math.min(y, bottomY) : barX,
                        y: barAlongX ? barX : Math.min(y, bottomY),
                        width: barAlongX ? Math.abs(bottomY - y) : barWidth,
                        height: barAlongX ? barWidth : Math.abs(bottomY - y),
                    };
                    const nodeMidPoint = {
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2,
                    };

                    const {
                        fontStyle: labelFontStyle,
                        fontWeight: labelFontWeight,
                        fontSize: labelFontSize,
                        fontFamily: labelFontFamily,
                        color: labelColor,
                        formatter,
                        placement,
                    } = label;

                    const {
                        text: labelText,
                        textAlign: labelTextAlign,
                        textBaseline: labelTextBaseline,
                        x: labelX,
                        y: labelY,
                    } = createLabelData({ value: yValue, rect, formatter, placement, seriesId, barAlongX });

                    const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
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
        const { datumSelection, isHighlight } = opts;
        const {
            fills,
            strokes,
            fillOpacity,
            strokeOpacity,
            lineDash,
            lineDashOffset,
            shadow,
            formatter,
            id: seriesId,
            highlightStyle: { item: itemHighlightStyle },
        } = this;

        const crisp = checkCrisp(this.xAxis?.visibleRange);
        const categoryAlongX = this.getCategoryDirection() === ChartAxisDirection.X;

        datumSelection.each((rect, datum) => {
            const { colorIndex } = datum;
            const style: RectConfig = {
                fill: fills[colorIndex % fills.length],
                stroke: strokes[colorIndex % fills.length],
                fillOpacity,
                strokeOpacity,
                lineDash,
                lineDashOffset,
                fillShadow: shadow,
                strokeWidth: this.getStrokeWidth(this.strokeWidth, datum),
            };
            const visible = categoryAlongX ? datum.width > 0 : datum.height > 0;

            const config = getRectConfig({
                datum,
                isHighlighted: isHighlight,
                style,
                highlightStyle: itemHighlightStyle,
                formatter,
                seriesId,
                stackGroup: this.getStackGroup(datum.yKey),
            });
            config.crisp = crisp;
            config.visible = visible;
            updateRect({ rect, config });
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

        labelSelection.each((text, datum) => {
            const labelDatum = datum.label;

            updateLabel({ labelNode: text, labelDatum, config: this.label, visible: true });
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

        const color = format?.fill ?? fill;

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

    getLegendData(): ChartLegendDatum[] {
        const {
            id,
            data,
            xKey,
            yKeys,
            yNames,
            legendItemNames,
            cumYKeyCount,
            seriesItemEnabled,
            hideInLegend,
            fills,
            strokes,
            fillOpacity,
            strokeOpacity,
        } = this;

        if (!data?.length || !xKey || !yKeys.length) {
            return [];
        }

        const legendData: CategoryLegendDatum[] = [];

        this.validateLegendData();

        this.yKeys.forEach((stack, stackIndex) => {
            for (let levelIndex = 0; levelIndex < stack.length; levelIndex++) {
                const yKey = stack[levelIndex];
                if (hideInLegend.indexOf(yKey) >= 0) {
                    return;
                }
                const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                legendData.push({
                    legendType: 'category',
                    id,
                    itemId: yKey,
                    seriesId: id,
                    enabled: seriesItemEnabled.get(yKey) ?? false,
                    label: {
                        text: legendItemNames[yKey] ?? yNames[yKey] ?? yKey,
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

    validateLegendData() {
        const { hideInLegend, legendItemNames } = this;

        let hasAnyLegendItemName = false;

        this.yKeys.forEach((stack) => {
            stack.forEach((yKey) => {
                if (hideInLegend.indexOf(yKey) >= 0) {
                    return;
                }

                const hasLegendItemName = legendItemNames[yKey] !== undefined;
                if (hasAnyLegendItemName && !hasLegendItemName) {
                    Logger.warnOnce(`a series is missing the legendItemName property, unexpected behaviour may occur.`);
                }

                hasAnyLegendItemName = hasLegendItemName;
            });
        });
    }

    onLegendItemClick(event: LegendItemClickChartEvent) {
        const { itemId, enabled, series } = event;

        if (series.id !== this.id) return;
        super.toggleSeriesItem(itemId, enabled);

        // Toggle items where the legendItemName matches the legendItemName of the clicked item
        Object.keys(this.legendItemNames)
            .filter(
                (id) =>
                    this.legendItemNames[id] !== undefined && this.legendItemNames[id] === this.legendItemNames[itemId]
            )
            .forEach((yKey) => {
                if (yKey !== itemId) {
                    super.toggleSeriesItem(yKey, enabled);
                }
            });

        this.calculateVisibleDomain();
    }

    onLegendItemDoubleClick(event: LegendItemDoubleClickChartEvent) {
        const { enabled, itemId, numVisibleItems, series } = event;

        if (series.id !== this.id) return;
        const totalVisibleItems = Object.values(numVisibleItems).reduce((p, v) => p + v, 0);
        const singleEnabledInEachSeries =
            Object.values(numVisibleItems).filter((v) => v === 1).length === Object.keys(numVisibleItems).length;

        const newEnableds: { [key: string]: boolean } = {};

        this.yKeys.forEach((stack) => {
            stack.forEach((yKey) => {
                const matches = yKey === itemId;
                const singleEnabledWasClicked = totalVisibleItems === 1 && enabled;

                const newEnabled = matches || singleEnabledWasClicked || (singleEnabledInEachSeries && enabled);

                newEnableds[yKey] = newEnableds[yKey] ?? newEnabled;

                // Toggle other items that have matching legendItemNames which have not already been processed.
                Object.keys(this.legendItemNames)
                    .filter(
                        (id) =>
                            this.legendItemNames[id] !== undefined &&
                            this.legendItemNames[id] === this.legendItemNames[yKey]
                    )
                    .forEach((nameYKey) => {
                        newEnableds[nameYKey] = newEnableds[nameYKey] ?? newEnabled;
                    });
            });
        });

        Object.keys(newEnableds).forEach((yKey) => {
            super.toggleSeriesItem(yKey, newEnableds[yKey]);
        });

        this.calculateVisibleDomain();
    }

    calculateVisibleDomain() {
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

    animateEmptyUpdateReady({
        datumSelections,
        labelSelections,
    }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
        labelSelections: Array<Selection<Text, BarNodeDatum>>;
    }) {
        const duration = 1000;

        const barDuration = duration * 0.8;
        const labelDuration = duration - barDuration;

        let startingX = Infinity;
        datumSelections.forEach((datumSelection) =>
            datumSelection.each((_, datum) => {
                if (datum.yValue >= 0) {
                    startingX = Math.min(startingX, datum.x);
                }
            })
        );

        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                this.animationManager?.animateMany(
                    `${this.id}_empty-update-ready_${rect.id}`,
                    [
                        { from: startingX, to: datum.x },
                        { from: 0, to: datum.width },
                    ],
                    {
                        disableInteractions: true,
                        duration: barDuration,
                        ease: easing.easeOut,
                        repeat: 0,
                        onUpdate([x, width]) {
                            rect.x = x;
                            rect.width = width;

                            rect.y = datum.y;
                            rect.height = datum.height;
                        },
                    }
                );
            });
        });

        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                this.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: barDuration,
                    duration: labelDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }

    animateReadyUpdate({ datumSelections }: { datumSelections: Array<Selection<Rect, BarNodeDatum>> }) {
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }

    animateReadyHighlight(highlightSelection: Selection<Rect, BarNodeDatum>) {
        this.resetSelectionRects(highlightSelection);
    }

    animateReadyResize({ datumSelections }: { datumSelections: Array<Selection<Rect, BarNodeDatum>> }) {
        this.animationManager?.stop();
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }

    resetSelectionRects(selection: Selection<Rect, BarNodeDatum>) {
        selection.each((rect, datum) => {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }

    getBandScalePadding() {
        return { inner: 0.2, outer: 0.3 };
    }

    protected getBarDirection() {
        return ChartAxisDirection.X;
    }

    protected getCategoryDirection() {
        return ChartAxisDirection.Y;
    }
}

export class ColumnSeries extends BarSeries {
    static type = 'column' as const;
    static className = 'ColumnSeries';

    protected getBarDirection() {
        return ChartAxisDirection.Y;
    }

    protected getCategoryDirection() {
        return ChartAxisDirection.X;
    }

    animateEmptyUpdateReady({
        datumSelections,
        labelSelections,
    }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
        labelSelections: Array<Selection<Text, BarNodeDatum>>;
    }) {
        const duration = 1000;

        const barDuration = duration * 0.8;
        const labelDuration = duration - barDuration;

        let startingY = 0;
        datumSelections.forEach((datumSelection) =>
            datumSelection.each((_, datum) => {
                if (datum.yValue >= 0) {
                    startingY = Math.max(startingY, datum.height + datum.y);
                }
            })
        );

        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                this.animationManager?.animateMany(
                    `${this.id}_empty-update-ready_${rect.id}`,
                    [
                        { from: startingY, to: datum.y },
                        { from: 0, to: datum.height },
                    ],
                    {
                        disableInteractions: true,
                        duration: barDuration,
                        ease: easing.easeOut,
                        repeat: 0,
                        onUpdate([y, height]) {
                            rect.y = y;
                            rect.height = height;

                            rect.x = datum.x;
                            rect.width = datum.width;
                        },
                    }
                );
            });
        });

        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                this.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: barDuration,
                    duration: labelDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }
}
