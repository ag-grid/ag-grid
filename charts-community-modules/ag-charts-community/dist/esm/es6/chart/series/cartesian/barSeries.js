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
import { SeriesTooltip, SeriesNodePickMode } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { flipChartAxisDirection } from '../../chartAxis';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent, findMinMax } from '../../../util/array';
import { areArrayItemsStrictlyEqual } from '../../../util/equal';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isNumber } from '../../../util/value';
import { ContinuousScale } from '../../../scale/continuousScale';
import { BOOLEAN, BOOLEAN_ARRAY, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, STRING, STRING_ARRAY, COLOR_STRING_ARRAY, Validate, OPTIONAL, } from '../../../util/validation';
import { CategoryAxis } from '../../axis/categoryAxis';
import { GroupedCategoryAxis } from '../../axis/groupedCategoryAxis';
import { LogAxis } from '../../axis/logAxis';
import { Logger } from '../../../util/logger';
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
    constructor() {
        super({
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            directionKeys: {
                [ChartAxisDirection.X]: ['xKey'],
                [ChartAxisDirection.Y]: ['yKeys'],
            },
        });
        this.xData = [];
        this.yData = [];
        this.yDomain = [];
        this.label = new BarSeriesLabel();
        this.tooltip = new BarSeriesTooltip();
        this.flipXY = false;
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
        this._xKey = '';
        this.xName = '';
        this.cumYKeyCount = [];
        this.flatYKeys = undefined; // only set when a user used a flat array for yKeys
        this.hideInLegend = [];
        this.yKeys = [];
        this.yKeysCache = [];
        this.visibles = [];
        this._grouped = false;
        this.stackGroups = {};
        /**
         * A map of `yKeys` to their names (used in legends and tooltips).
         * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
         */
        this.yNames = {};
        this.strokeWidth = 1;
        this.shadow = undefined;
        this.smallestDataInterval = undefined;
        this.label.enabled = false;
    }
    resolveKeyDirection(direction) {
        return this.flipXY ? flipChartAxisDirection(direction) : direction;
    }
    set xKey(value) {
        this._xKey = value;
        this.xData = [];
    }
    get xKey() {
        return this._xKey;
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
    set grouped(value) {
        this._grouped = value;
    }
    get grouped() {
        return this._grouped;
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
    set normalizedTo(value) {
        const absValue = value ? Math.abs(value) : undefined;
        this._normalizedTo = absValue;
    }
    get normalizedTo() {
        return this._normalizedTo;
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.processYKeys();
            this.processYNames();
            const { xKey, yKeys, seriesItemEnabled } = this;
            const data = xKey && yKeys.length && this.data ? this.data : [];
            const xAxis = this.getCategoryAxis();
            const yAxis = this.getValueAxis();
            if (!(xAxis && yAxis)) {
                return;
            }
            const setSmallestXInterval = (curr, prev) => {
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
                    Logger.warn(`the key '${xKey}' was not found in the data: `, datum);
                }
                const x = checkDatum(datum[xKey], isContinuousX);
                if (isContinuousX) {
                    setSmallestXInterval(x, prevX);
                }
                prevX = x;
                return x;
            });
            this.yData = data.map((datum) => yKeys.map((stack) => {
                return stack.map((yKey) => {
                    if (keysFound && !(yKey in datum)) {
                        keysFound = false;
                        Logger.warn(`the key '${yKey}' was not found in the data: `, datum);
                    }
                    const yDatum = checkDatum(datum[yKey], isContinuousY);
                    if (!seriesItemEnabled.get(yKey) || yDatum === undefined) {
                        return NaN;
                    }
                    return yDatum;
                });
            }));
            const xyValid = this.validateXYData(this.xKey, this.yKeys.join(', '), data, xAxis, yAxis, this.xData, this.yData, 3);
            if (!xyValid) {
                this.xData = [];
                this.yData = [];
                this.yDomain = [];
                return;
            }
            // Contains min/max values for each stack in each group,
            // where min is zero and max is a positive total of all values in the stack
            // or min is a negative total of all values in the stack and max is zero.
            const isLogAxis = yAxis instanceof LogAxis;
            let yMinMax;
            if (!isLogAxis) {
                yMinMax = this.yData.map((group) => group.map((stack) => findMinMax(stack)));
            }
            else {
                yMinMax = this.yData.map((group) => group.map((stack) => {
                    var _a;
                    const stackExtent = (_a = extent(stack)) !== null && _a !== void 0 ? _a : [];
                    return {
                        min: stackExtent[0],
                        max: stackExtent[1],
                    };
                }));
            }
            const { yData, normalizedTo } = this;
            // Calculate the sum of the absolute values of all items in each stack in each group. Used for normalization of stacked bars.
            const yAbsTotal = this.yData.map((group) => group.map((stack) => stack.reduce((acc, stack) => {
                acc += isNaN(stack) ? 0 : Math.abs(stack);
                return acc;
            }, 0)));
            let { min: yMin, max: yMax } = this.findLargestMinMax(yMinMax);
            if (yMin === Infinity && yMax === -Infinity) {
                // There's no data in the domain.
                this.yDomain = [];
                return;
            }
            if (normalizedTo && isFinite(normalizedTo)) {
                yMin = yMin < 0 ? -normalizedTo : isLogAxis ? 1 : 0;
                yMax = yMax > 0 ? normalizedTo : isLogAxis ? -1 : 0;
                yData.forEach((group, i) => {
                    group.forEach((stack, j) => {
                        stack.forEach((y, k) => {
                            stack[k] = (y / yAbsTotal[i][j]) * normalizedTo;
                        });
                    });
                });
            }
            this.yDomain = this.fixNumericExtent([yMin, yMax], this.yAxis);
        });
    }
    findLargestMinMax(groups) {
        let tallestStackMin = Infinity;
        let tallestStackMax = -Infinity;
        for (const group of groups) {
            for (const stack of group) {
                const { min = Infinity, max = -Infinity } = stack;
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
    getDomain(direction) {
        var _a, _b, _c, _d, _e;
        const { flipXY } = this;
        if (this.flipXY) {
            direction = flipChartAxisDirection(direction);
        }
        if (direction === ChartAxisDirection.X) {
            if (!(((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof ContinuousScale)) {
                return this.xData;
            }
            // The last node will be clipped if the scale is not a band scale
            // Extend the domain by the smallest data interval so that the last band is not clipped
            const xDomain = extent(this.xData) || [NaN, NaN];
            if (flipXY) {
                xDomain[0] = xDomain[0] - ((_c = (_b = this.smallestDataInterval) === null || _b === void 0 ? void 0 : _b.x) !== null && _c !== void 0 ? _c : 0);
            }
            else {
                xDomain[1] = xDomain[1] + ((_e = (_d = this.smallestDataInterval) === null || _d === void 0 ? void 0 : _d.x) !== null && _e !== void 0 ? _e : 0);
            }
            return xDomain;
        }
        else {
            return this.yDomain;
        }
    }
    getNodeClickEvent(event, datum) {
        return new CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey, datum.yKey, event, datum, this);
    }
    getCategoryAxis() {
        return this.flipXY ? this.yAxis : this.xAxis;
    }
    getValueAxis() {
        return this.flipXY ? this.xAxis : this.yAxis;
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
            const { groupScale, yKeys, cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, xData, yData, label, flipXY, id: seriesId, } = this;
            const { fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor, formatter: labelFormatter, placement: labelPlacement, } = label;
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
            xData.forEach((group, groupIndex) => {
                var _a, _b;
                const seriesDatum = data[groupIndex];
                const x = xScale.convert(group);
                const groupYs = yData[groupIndex]; // y-data for groups of stacks
                for (let stackIndex = 0; stackIndex < groupYs.length; stackIndex++) {
                    const stackYs = groupYs[stackIndex]; // y-data for a stack within a group
                    contexts[stackIndex] = (_a = contexts[stackIndex]) !== null && _a !== void 0 ? _a : [];
                    let prevMinY = 0;
                    let prevMaxY = 0;
                    for (let levelIndex = 0; levelIndex < stackYs.length; levelIndex++) {
                        const currY = +stackYs[levelIndex];
                        const yKey = yKeys[stackIndex][levelIndex];
                        const barX = x + groupScale.convert(String(stackIndex));
                        contexts[stackIndex][levelIndex] = (_b = contexts[stackIndex][levelIndex]) !== null && _b !== void 0 ? _b : {
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
                        const y = yScale.convert(prevY + currY, { strict: false });
                        const bottomY = yScale.convert(prevY, { strict: false });
                        const yValue = seriesDatum[yKey]; // unprocessed y-value
                        let labelText;
                        if (labelFormatter) {
                            labelText = labelFormatter({
                                value: isNumber(yValue) ? yValue : undefined,
                                seriesId,
                            });
                        }
                        else {
                            labelText = isNumber(yValue) ? yValue.toFixed(2) : '';
                        }
                        let labelX;
                        let labelY;
                        if (flipXY) {
                            labelY = barX + barWidth / 2;
                            if (labelPlacement === 'inside') {
                                labelX = y + ((yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y)) / 2;
                            }
                            else {
                                labelX = y + (yValue >= 0 ? 1 : -1) * 4;
                            }
                        }
                        else {
                            labelX = barX + barWidth / 2;
                            if (labelPlacement === 'inside') {
                                labelY = y + ((yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y)) / 2;
                            }
                            else {
                                labelY = y + (yValue >= 0 ? -3 : 4);
                            }
                        }
                        let labelTextAlign;
                        let labelTextBaseline;
                        if (labelPlacement === 'inside') {
                            labelTextAlign = 'center';
                            labelTextBaseline = 'middle';
                        }
                        else {
                            labelTextAlign = flipXY ? (yValue >= 0 ? 'start' : 'end') : 'center';
                            labelTextBaseline = flipXY ? 'middle' : yValue >= 0 ? 'bottom' : 'top';
                        }
                        const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                        const nodeData = {
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { datumSelection, isHighlight: isDatumHighlighted } = opts;
            const { fills, strokes, fillOpacity: seriesFillOpacity, strokeOpacity, shadow, formatter, xKey, flipXY, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = seriesFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, id: seriesId, } = this;
            const [visibleMin, visibleMax] = (_b = (_a = this.xAxis) === null || _a === void 0 ? void 0 : _a.visibleRange) !== null && _b !== void 0 ? _b : [];
            const isZoomed = visibleMin !== 0 || visibleMax !== 1;
            const crisp = !isZoomed;
            datumSelection.each((rect, datum) => {
                const { colorIndex } = datum;
                const fill = isDatumHighlighted && highlightedFill !== undefined
                    ? highlightedFill
                    : fills[colorIndex % fills.length];
                const stroke = isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : strokes[colorIndex % fills.length];
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : this.getStrokeWidth(this.strokeWidth, datum);
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
                const stackGroup = this.getStackGroup(datum.yKey);
                let format = undefined;
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
            const { label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color }, } = this;
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
                }
                else {
                    text.visible = false;
                }
            });
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey, yKeys, yData } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();
        const { yKey } = nodeDatum;
        if (!yData.length || !xKey || !yKey || !xAxis || !yAxis) {
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
        const { id, data, xKey, yKeys, yNames, cumYKeyCount, seriesItemEnabled, hideInLegend, fills, strokes, fillOpacity, strokeOpacity, flipXY, } = this;
        if (!data || !data.length || !xKey || !yKeys.length) {
            return [];
        }
        const legendData = [];
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
    toggleSeriesItem(itemId, enabled) {
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
        const visibleStacks = [];
        yKeys.forEach((stack, index) => {
            if (stack.length > 0) {
                visibleStacks.push(String(index));
            }
        });
        this.groupScale.domain = visibleStacks;
        this.nodeDataRefresh = true;
    }
    isLabelEnabled() {
        return this.label.enabled;
    }
}
BarSeries.className = 'BarSeries';
BarSeries.type = 'bar';
__decorate([
    Validate(BOOLEAN)
], BarSeries.prototype, "flipXY", void 0);
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
    Validate(STRING)
], BarSeries.prototype, "_xKey", void 0);
__decorate([
    Validate(STRING)
], BarSeries.prototype, "xName", void 0);
__decorate([
    Validate(STRING_ARRAY)
], BarSeries.prototype, "hideInLegend", void 0);
__decorate([
    Validate(BOOLEAN_ARRAY)
], BarSeries.prototype, "visibles", void 0);
__decorate([
    Validate(BOOLEAN)
], BarSeries.prototype, "_grouped", void 0);
__decorate([
    Validate(OPT_NUMBER())
], BarSeries.prototype, "_normalizedTo", void 0);
__decorate([
    Validate(NUMBER(0))
], BarSeries.prototype, "strokeWidth", void 0);
