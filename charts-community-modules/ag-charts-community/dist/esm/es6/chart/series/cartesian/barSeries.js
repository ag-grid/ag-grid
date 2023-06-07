var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Rect } from '../../../scene/shape/rect';
import { BandScale } from '../../../scale/bandScale';
import { SeriesTooltip, SeriesNodePickMode, keyProperty, valueProperty } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import { areArrayItemsStrictlyEqual } from '../../../util/equal';
import { Logger } from '../../../util/logger';
import { sanitizeHtml } from '../../../util/sanitize';
import { ContinuousScale } from '../../../scale/continuousScale';
import { BOOLEAN, BOOLEAN_ARRAY, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, STRING_ARRAY, COLOR_STRING_ARRAY, Validate, OPTIONAL, OPT_STRING, } from '../../../util/validation';
import { CategoryAxis } from '../../axis/categoryAxis';
import { GroupedCategoryAxis } from '../../axis/groupedCategoryAxis';
import { LogAxis } from '../../axis/logAxis';
import { DataModel } from '../../data/dataModel';
import { sum } from '../../data/aggregateFunctions';
import { AGG_VALUES_EXTENT, normaliseGroupTo, SMALLEST_KEY_INTERVAL } from '../../data/processors';
import * as easing from '../../../motion/easing';
import { createLabelData, getRectConfig, updateRect, checkCrisp, updateLabel } from './barUtil';
const BAR_LABEL_PLACEMENTS = ['inside', 'outside'];
const OPT_BAR_LABEL_PLACEMENT = (v, ctx) => OPTIONAL(v, ctx, (v) => BAR_LABEL_PLACEMENTS.includes(v));
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
class BarSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
        this.placement = 'inside';
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], BarSeriesLabel.prototype, "formatter", void 0);
__decorate([
    Validate(OPT_BAR_LABEL_PLACEMENT)
], BarSeriesLabel.prototype, "placement", void 0);
class BarSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], BarSeriesTooltip.prototype, "renderer", void 0);
function is2dArray(array) {
    return array.length > 0 && Array.isArray(array[0]);
}
export class BarSeries extends CartesianSeries {
    constructor(moduleCtx) {
        super({
            moduleCtx,
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            directionKeys: {
                [ChartAxisDirection.X]: ['xKey'],
                [ChartAxisDirection.Y]: ['yKeys'],
            },
            directionNames: {
                [ChartAxisDirection.X]: ['xName'],
                [ChartAxisDirection.Y]: ['yNames'],
            },
        });
        this.label = new BarSeriesLabel();
        this.tooltip = new BarSeriesTooltip();
        this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.formatter = undefined;
        /**
         * Used to get the position of bars within each group.
         */
        this.groupScale = new BandScale();
        this.xKey = undefined;
        this.xName = undefined;
        this.cumYKeyCount = [];
        this.flatYKeys = undefined; // only set when a user used a flat array for yKeys
        this.hideInLegend = [];
        this.yKeys = [];
        this.yKeysCache = [];
        this.visibles = [];
        this.grouped = false;
        this.stackGroups = {};
        /**
         * A map of `yKeys` to their names (used in legends and tooltips).
         * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
         */
        this.yNames = {};
        this.legendItemNames = {};
        this.strokeWidth = 1;
        this.shadow = undefined;
        this.smallestDataInterval = undefined;
        this.label.enabled = false;
    }
    resolveKeyDirection(direction) {
        if (this.getBarDirection() === ChartAxisDirection.X) {
            if (direction === ChartAxisDirection.X) {
                return ChartAxisDirection.Y;
            }
            return ChartAxisDirection.X;
        }
        return direction;
    }
    processYKeys() {
        let { yKeys } = this;
        let flatYKeys = undefined;
        // Convert from flat y-keys to grouped y-keys.
        if (!is2dArray(yKeys)) {
            flatYKeys = yKeys;
            yKeys = this.grouped ? flatYKeys.map((k) => [k]) : [flatYKeys];
        }
        const stackGroups = Object.values(this.stackGroups);
        if (stackGroups.length > 0) {
            const flattenKeys = (keys) => keys.reduce((res, k) => res.concat(k), []);
            // Create a stack for items without a group
            const flatKeys = flattenKeys(yKeys);
            const keysInStacks = new Set(flattenKeys(stackGroups));
            const ungroupedKeys = flatKeys.filter((k) => !keysInStacks.has(k));
            yKeys = stackGroups.map((keys) => keys);
            if (ungroupedKeys.length > 0) {
                yKeys.push(ungroupedKeys);
            }
            // Preserve the order of colours and other properties
            const indexMap = (items) => items.reduce((map, key, index) => map.set(key, index), new Map());
            const newKeys = flattenKeys(yKeys);
            const newKeysIndices = indexMap(newKeys);
            const sort = (items) => {
                const result = Array.from({ length: items.length });
                items.forEach((item, index) => {
                    const key = flatKeys[index];
                    const newIndex = newKeysIndices.get(key);
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
            const visibleStacks = [];
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
    processSeriesItemEnabled() {
        const { seriesItemEnabled } = this;
        const flattenFn = (r, n) => r.concat(...(Array.isArray(n) ? n : [n]));
        const visibles = this.visibles.reduce(flattenFn, []);
        seriesItemEnabled.clear();
        let visiblesIdx = 0;
        this.yKeys.forEach((stack) => {
            stack.forEach((yKey) => { var _a; return seriesItemEnabled.set(yKey, (_a = visibles[visiblesIdx++]) !== null && _a !== void 0 ? _a : true); });
        });
    }
    getStackGroup(yKey) {
        var _a;
        const { stackGroups } = this;
        return (_a = Object.entries(stackGroups).find(([_, keys]) => keys.includes(yKey))) === null || _a === void 0 ? void 0 : _a[0];
    }
    processYNames() {
        const values = this.yNames;
        if (Array.isArray(values) && this.flatYKeys) {
            const map = {};
            this.flatYKeys.forEach((k, i) => {
                map[k] = values[i];
            });
            this.yNames = map;
        }
    }
    processData() {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            this.processYKeys();
            this.processYNames();
            const { xKey, seriesItemEnabled, normalizedTo, data = [] } = this;
            const normalizedToAbs = Math.abs(normalizedTo !== null && normalizedTo !== void 0 ? normalizedTo : NaN);
            const isContinuousX = ((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof ContinuousScale;
            const isContinuousY = ((_b = this.getValueAxis()) === null || _b === void 0 ? void 0 : _b.scale) instanceof ContinuousScale;
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
            this.dataModel = new DataModel({
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
                x: (_e = (_d = (_c = this.processedData) === null || _c === void 0 ? void 0 : _c.reduced) === null || _d === void 0 ? void 0 : _d[SMALLEST_KEY_INTERVAL.property]) !== null && _e !== void 0 ? _e : Infinity,
                y: Infinity,
            };
        });
    }
    getDomain(direction) {
        var _a;
        const { processedData } = this;
        if (!processedData)
            return [];
        const { defs: { keys: [keyDef], }, domain: { keys: [keys], values: [yExtent], }, reduced: { [SMALLEST_KEY_INTERVAL.property]: smallestX, [AGG_VALUES_EXTENT.property]: ySumExtent } = {}, } = processedData;
        if (direction === this.getCategoryDirection()) {
            if (keyDef.valueType === 'category') {
                return keys;
            }
            const keysExtent = (_a = extent(keys)) !== null && _a !== void 0 ? _a : [NaN, NaN];
            if (direction === ChartAxisDirection.Y) {
                return [keysExtent[0] + -smallestX, keysExtent[1]];
            }
            return [keysExtent[0], keysExtent[1] + smallestX];
        }
        else if (this.getValueAxis() instanceof LogAxis) {
            return this.fixNumericExtent(yExtent);
        }
        else {
            return this.fixNumericExtent(ySumExtent);
        }
    }
    getNodeClickEvent(event, datum) {
        var _a;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getCategoryAxis() {
        return this.getCategoryDirection() === ChartAxisDirection.Y ? this.yAxis : this.xAxis;
    }
    getValueAxis() {
        return this.getBarDirection() === ChartAxisDirection.Y ? this.yAxis : this.xAxis;
    }
    calculateStep(range) {
        var _a;
        const { smallestDataInterval: smallestInterval } = this;
        const xAxis = this.getCategoryAxis();
        if (!xAxis) {
            return;
        }
        // calculate step
        const domainLength = xAxis.dataDomain[1] - xAxis.dataDomain[0];
        const intervals = domainLength / ((_a = smallestInterval === null || smallestInterval === void 0 ? void 0 : smallestInterval.x) !== null && _a !== void 0 ? _a : 1) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum number of bands to ensure the step does not fall below 1 pixel.
        // This means there could be some overlap of the bands in the chart.
        const maxBands = Math.floor(range); // A minimum of 1px per bar/column means the maximum number of bands will equal the available range
        const bands = Math.min(intervals, maxBands);
        const step = range / Math.max(1, bands);
        return step;
    }
    createNodeData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, visible } = this;
            const xAxis = this.getCategoryAxis();
            const yAxis = this.getValueAxis();
            if (!(data && visible && xAxis && yAxis)) {
                return [];
            }
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const { groupScale, yKeys, xKey = '', cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, label, id: seriesId, processedData, ctx, } = this;
            let xBandWidth = xScale.bandwidth;
            if (xScale instanceof ContinuousScale) {
                const availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
                const step = this.calculateStep(availableRange);
                xBandWidth = step;
            }
            groupScale.range = [0, xBandWidth];
            if (xAxis instanceof CategoryAxis) {
                groupScale.padding = xAxis.groupPaddingInner;
            }
            else if (xAxis instanceof GroupedCategoryAxis) {
                groupScale.padding = 0.1;
            }
            else {
                // Number or Time axis
                groupScale.padding = 0;
            }
            // To get exactly `0` padding we need to turn off rounding
            if (groupScale.padding === 0) {
                groupScale.round = false;
            }
            else {
                groupScale.round = true;
            }
            const barWidth = groupScale.bandwidth >= 1
                ? // Pixel-rounded value for low-volume bar charts.
                    groupScale.bandwidth
                : // Handle high-volume bar charts gracefully.
                    groupScale.rawBandwidth;
            const contexts = [];
            processedData === null || processedData === void 0 ? void 0 : processedData.data.forEach(({ keys, datum: seriesDatum, values }, dataIndex) => {
                var _a, _b, _c, _d, _e;
                var _f;
                const x = xScale.convert(keys[0]);
                for (let stackIndex = 0; stackIndex < ((_a = yKeys === null || yKeys === void 0 ? void 0 : yKeys.length) !== null && _a !== void 0 ? _a : 0); stackIndex++) {
                    const stackYKeys = (_b = yKeys === null || yKeys === void 0 ? void 0 : yKeys[stackIndex]) !== null && _b !== void 0 ? _b : []; // y-data for a stack within a group
                    (_c = contexts[stackIndex]) !== null && _c !== void 0 ? _c : (contexts[stackIndex] = []);
                    let prevMinY = 0;
                    let prevMaxY = 0;
                    for (let levelIndex = 0; levelIndex < stackYKeys.length; levelIndex++) {
                        const yKey = stackYKeys[levelIndex];
                        const yIndex = (_d = processedData === null || processedData === void 0 ? void 0 : processedData.indices.values[yKey]) !== null && _d !== void 0 ? _d : -1;
                        (_e = (_f = contexts[stackIndex])[levelIndex]) !== null && _e !== void 0 ? _e : (_f[levelIndex] = {
                            itemId: yKey,
                            nodeData: [],
                            labelData: [],
                        });
                        if (yIndex === undefined)
                            continue;
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
                        const { fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor, formatter, placement, } = label;
                        const { text: labelText, textAlign: labelTextAlign, textBaseline: labelTextBaseline, x: labelX, y: labelY, } = createLabelData({ value: yValue, rect, formatter, placement, seriesId, barAlongX, ctx });
                        const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                        const nodeData = {
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
                            label: seriesItemEnabled.get(yKey) && labelText
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
                        }
                        else {
                            prevMaxY += currY;
                        }
                    }
                }
            });
            return contexts.reduce((r, n) => r.concat(...n), []);
        });
    }
    nodeFactory() {
        return new Rect();
    }
    updateDatumSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nodeData, datumSelection } = opts;
            return datumSelection.update(nodeData, (rect) => (rect.tag = BarSeriesNodeTag.Bar));
        });
    }
    updateDatumNodes(opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { datumSelection, isHighlight } = opts;
            const { fills, strokes, fillOpacity, strokeOpacity, lineDash, lineDashOffset, shadow, formatter, id: seriesId, highlightStyle: { item: itemHighlightStyle }, ctx, } = this;
            const crisp = checkCrisp((_a = this.xAxis) === null || _a === void 0 ? void 0 : _a.visibleRange);
            const categoryAlongX = this.getCategoryDirection() === ChartAxisDirection.X;
            datumSelection.each((rect, datum) => {
                const { colorIndex } = datum;
                const style = {
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
                    ctx,
                });
                config.crisp = crisp;
                config.visible = visible;
                updateRect({ rect, config });
            });
        });
    }
    updateLabelSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelData, labelSelection } = opts;
            const { enabled } = this.label;
            const data = enabled ? labelData : [];
            return labelSelection.update(data, (text) => {
                text.tag = BarSeriesNodeTag.Label;
                text.pointerEvents = PointerEvents.None;
            });
        });
    }
    updateLabelNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelSelection } = opts;
            labelSelection.each((text, datum) => {
                const labelDatum = datum.label;
                updateLabel({ labelNode: text, labelDatum, config: this.label, visible: true });
            });
        });
    }
    getTooltipHtml(nodeDatum) {
        var _a;
        const { xKey, yKeys, processedData, ctx: { callbackCache }, } = this;
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
        let format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
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
        const color = (_a = format === null || format === void 0 ? void 0 : format.fill) !== null && _a !== void 0 ? _a : fill;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
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
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    getLegendData() {
        const { id, data, xKey, yKeys, yNames, legendItemNames, cumYKeyCount, seriesItemEnabled, hideInLegend, fills, strokes, fillOpacity, strokeOpacity, } = this;
        if (!(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKeys.length) {
            return [];
        }
        const legendData = [];
        this.validateLegendData();
        this.yKeys.forEach((stack, stackIndex) => {
            var _a, _b, _c;
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
                    enabled: (_a = seriesItemEnabled.get(yKey)) !== null && _a !== void 0 ? _a : false,
                    label: {
                        text: (_c = (_b = legendItemNames[yKey]) !== null && _b !== void 0 ? _b : yNames[yKey]) !== null && _c !== void 0 ? _c : yKey,
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
    onLegendItemClick(event) {
        const { itemId, enabled, series } = event;
        if (series.id !== this.id)
            return;
        super.toggleSeriesItem(itemId, enabled);
        // Toggle items where the legendItemName matches the legendItemName of the clicked item
        Object.keys(this.legendItemNames)
            .filter((id) => this.legendItemNames[id] !== undefined && this.legendItemNames[id] === this.legendItemNames[itemId])
            .forEach((yKey) => {
            if (yKey !== itemId) {
                super.toggleSeriesItem(yKey, enabled);
            }
        });
        this.calculateVisibleDomain();
    }
    onLegendItemDoubleClick(event) {
        const { enabled, itemId, numVisibleItems } = event;
        const totalVisibleItems = Object.values(numVisibleItems).reduce((p, v) => p + v, 0);
        const singleEnabledInEachSeries = Object.values(numVisibleItems).filter((v) => v === 1).length === Object.keys(numVisibleItems).length;
        const newEnableds = {};
        this.yKeys.forEach((stack) => {
            stack.forEach((yKey) => {
                var _a;
                const matches = yKey === itemId;
                const singleEnabledWasClicked = totalVisibleItems === 1 && enabled;
                const newEnabled = matches || singleEnabledWasClicked || (singleEnabledInEachSeries && enabled);
                newEnableds[yKey] = (_a = newEnableds[yKey]) !== null && _a !== void 0 ? _a : newEnabled;
                // Toggle other items that have matching legendItemNames which have not already been processed.
                Object.keys(this.legendItemNames)
                    .filter((id) => this.legendItemNames[id] !== undefined &&
                    this.legendItemNames[id] === this.legendItemNames[yKey])
                    .forEach((nameYKey) => {
                    var _a;
                    newEnableds[nameYKey] = (_a = newEnableds[nameYKey]) !== null && _a !== void 0 ? _a : newEnabled;
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
        const visibleStacks = [];
        yKeys.forEach((stack, index) => {
            if (stack.length > 0) {
                visibleStacks.push(String(index));
            }
        });
        this.groupScale.domain = visibleStacks;
        this.nodeDataRefresh = true;
    }
    animateEmptyUpdateReady({ datumSelections, labelSelections, }) {
        const duration = 1000;
        const labelDuration = 200;
        let startingX = Infinity;
        datumSelections.forEach((datumSelection) => datumSelection.each((_, datum) => {
            if (datum.yValue >= 0) {
                startingX = Math.min(startingX, datum.x);
            }
        }));
        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                var _a;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_empty-update-ready_${rect.id}`, [
                    { from: startingX, to: datum.x },
                    { from: 0, to: datum.width },
                ], {
                    disableInteractions: true,
                    duration,
                    ease: easing.easeOut,
                    repeat: 0,
                    onUpdate([x, width]) {
                        rect.x = x;
                        rect.width = width;
                        rect.y = datum.y;
                        rect.height = datum.height;
                    },
                });
            });
        });
        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                var _a;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: duration,
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
    animateReadyUpdate({ datumSelections }) {
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }
    animateReadyHighlight(highlightSelection) {
        this.resetSelectionRects(highlightSelection);
    }
    animateReadyResize({ datumSelections }) {
        var _a;
        (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.stop();
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }
    resetSelectionRects(selection) {
        selection.each((rect, datum) => {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
    }
    isLabelEnabled() {
        return this.label.enabled;
    }
    getBandScalePadding() {
        return { inner: 0.2, outer: 0.3 };
    }
    getBarDirection() {
        return ChartAxisDirection.X;
    }
    getCategoryDirection() {
        return ChartAxisDirection.Y;
    }
}
BarSeries.className = 'BarSeries';
BarSeries.type = 'bar';
__decorate([
    Validate(COLOR_STRING_ARRAY)
], BarSeries.prototype, "fills", void 0);
__decorate([
    Validate(COLOR_STRING_ARRAY)
], BarSeries.prototype, "strokes", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], BarSeries.prototype, "fillOpacity", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], BarSeries.prototype, "strokeOpacity", void 0);
__decorate([
    Validate(OPT_LINE_DASH)
], BarSeries.prototype, "lineDash", void 0);
__decorate([
    Validate(NUMBER(0))
], BarSeries.prototype, "lineDashOffset", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], BarSeries.prototype, "formatter", void 0);
__decorate([
    Validate(OPT_STRING)
], BarSeries.prototype, "xKey", void 0);
__decorate([
    Validate(OPT_STRING)
], BarSeries.prototype, "xName", void 0);
__decorate([
    Validate(STRING_ARRAY)
], BarSeries.prototype, "hideInLegend", void 0);
__decorate([
    Validate(BOOLEAN_ARRAY)
], BarSeries.prototype, "visibles", void 0);
__decorate([
    Validate(BOOLEAN)
], BarSeries.prototype, "grouped", void 0);
__decorate([
    Validate(OPT_NUMBER())
], BarSeries.prototype, "normalizedTo", void 0);
__decorate([
    Validate(NUMBER(0))
], BarSeries.prototype, "strokeWidth", void 0);
export class ColumnSeries extends BarSeries {
    getBarDirection() {
        return ChartAxisDirection.Y;
    }
    getCategoryDirection() {
        return ChartAxisDirection.X;
    }
    animateEmptyUpdateReady({ datumSelections, labelSelections, }) {
        const duration = 1000;
        const labelDuration = 200;
        let startingY = 0;
        datumSelections.forEach((datumSelection) => datumSelection.each((_, datum) => {
            if (datum.yValue >= 0) {
                startingY = Math.max(startingY, datum.height + datum.y);
            }
        }));
        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                var _a;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_empty-update-ready_${rect.id}`, [
                    { from: startingY, to: datum.y },
                    { from: 0, to: datum.height },
                ], {
                    disableInteractions: true,
                    duration,
                    ease: easing.easeOut,
                    repeat: 0,
                    onUpdate([y, height]) {
                        rect.y = y;
                        rect.height = height;
                        rect.x = datum.x;
                        rect.width = datum.width;
                    },
                });
            });
        });
        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                var _a;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: duration,
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
ColumnSeries.type = 'column';
ColumnSeries.className = 'ColumnSeries';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9jYXJ0ZXNpYW4vYmFyU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVqRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFckQsT0FBTyxFQUF5QixhQUFhLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqSCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVwRCxPQUFPLEVBQ0gsZUFBZSxFQUNmLDZCQUE2QixFQUU3QixtQ0FBbUMsR0FDdEMsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUU5QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE9BQU8sRUFDSCxPQUFPLEVBQ1AsYUFBYSxFQUNiLE1BQU0sRUFDTixZQUFZLEVBQ1osYUFBYSxFQUNiLFVBQVUsRUFDVixZQUFZLEVBQ1osa0JBQWtCLEVBQ2xCLFFBQVEsRUFDUixRQUFRLEVBRVIsVUFB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