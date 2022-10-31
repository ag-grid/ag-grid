"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const rect_1 = require("../../../scene/shape/rect");
const text_1 = require("../../../scene/shape/text");
const bandScale_1 = require("../../../scale/bandScale");
const series_1 = require("../series");
const label_1 = require("../../label");
const node_1 = require("../../../scene/node");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxis_1 = require("../../chartAxis");
const tooltip_1 = require("../../tooltip/tooltip");
const array_1 = require("../../../util/array");
const equal_1 = require("../../../util/equal");
const sanitize_1 = require("../../../util/sanitize");
const value_1 = require("../../../util/value");
const continuousScale_1 = require("../../../scale/continuousScale");
const validation_1 = require("../../../util/validation");
const categoryAxis_1 = require("../../axis/categoryAxis");
const groupedCategoryAxis_1 = require("../../axis/groupedCategoryAxis");
const BAR_LABEL_PLACEMENTS = ['inside', 'outside'];
const OPT_BAR_LABEL_PLACEMENT = (v, ctx) => validation_1.OPTIONAL(v, ctx, (v) => BAR_LABEL_PLACEMENTS.includes(v));
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
var BarLabelPlacement;
(function (BarLabelPlacement) {
    BarLabelPlacement["Inside"] = "inside";
    BarLabelPlacement["Outside"] = "outside";
})(BarLabelPlacement = exports.BarLabelPlacement || (exports.BarLabelPlacement = {}));
class BarSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
        this.placement = BarLabelPlacement.Inside;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], BarSeriesLabel.prototype, "formatter", void 0);
__decorate([
    validation_1.Validate(OPT_BAR_LABEL_PLACEMENT)
], BarSeriesLabel.prototype, "placement", void 0);
exports.BarSeriesLabel = BarSeriesLabel;
class BarSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], BarSeriesTooltip.prototype, "renderer", void 0);
exports.BarSeriesTooltip = BarSeriesTooltip;
function flat(arr, target = []) {
    arr.forEach((v) => {
        if (Array.isArray(v)) {
            flat(v, target);
        }
        else {
            target.push(v);
        }
    });
    return target;
}
function is2dArray(array) {
    return array.length > 0 && Array.isArray(array[0]);
}
class BarSeries extends cartesianSeries_1.CartesianSeries {
    constructor() {
        super({
            pickGroupIncludes: ['datumNodes'],
            pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
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
        this.groupScale = new bandScale_1.BandScale();
        this.directionKeys = {
            [chartAxis_1.ChartAxisDirection.X]: ['xKey'],
            [chartAxis_1.ChartAxisDirection.Y]: ['yKeys'],
        };
        this._xKey = '';
        this.xName = '';
        this.cumYKeyCount = [];
        this.flatYKeys = undefined; // only set when a user used a flat array for yKeys
        this.hideInLegend = [];
        /**
         * yKeys: [['coffee']] - regular bars, each category has a single bar that shows a value for coffee
         * yKeys: [['coffee'], ['tea'], ['milk']] - each category has three bars that show values for coffee, tea and milk
         * yKeys: [['coffee', 'tea', 'milk']] - each category has a single bar with three stacks that show values for coffee, tea and milk
         * yKeys: [['coffee', 'tea', 'milk'], ['paper', 'ink']] - each category has 2 stacked bars,
         *     first showing values for coffee, tea and milk and second values for paper and ink
         */
        this._yKeys = [];
        this._visibles = [];
        this._grouped = false;
        /**
         * A map of `yKeys` to their names (used in legends and tooltips).
         * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
         */
        this._yNames = {};
        this.strokeWidth = 1;
        this.shadow = undefined;
        this.smallestDataInterval = undefined;
        this.label.enabled = false;
    }
    getKeys(direction) {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[this.flipXY ? chartAxis_1.flipChartAxisDirection(direction) : direction];
        let values = [];
        if (keys) {
            keys.forEach((key) => {
                const value = this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values = values.concat(flat(value));
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
    }
    set xKey(value) {
        this._xKey = value;
        this.xData = [];
    }
    get xKey() {
        return this._xKey;
    }
    set yKeys(yKeys) {
        let flatYKeys = undefined;
        // Convert from flat y-keys to grouped y-keys.
        if (!is2dArray(yKeys)) {
            flatYKeys = yKeys;
            yKeys = this.grouped ? flatYKeys.map((k) => [k]) : [flatYKeys];
        }
        if (!equal_1.equal(this._yKeys, yKeys)) {
            this.flatYKeys = flatYKeys ? flatYKeys : undefined;
            this._yKeys = yKeys;
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
            this.yData = [];
            this.processSeriesItemEnabled();
            const { groupScale } = this;
            groupScale.domain = visibleStacks;
        }
    }
    get yKeys() {
        return this._yKeys;
    }
    set visibles(visibles) {
        const flattenFn = (r, n) => r.concat(...(Array.isArray(n) ? n : [n]));
        this._visibles = visibles.reduce(flattenFn, []);
        this.processSeriesItemEnabled();
    }
    get visibles() {
        return this._visibles;
    }
    processSeriesItemEnabled() {
        const { seriesItemEnabled, _visibles: visibles = [] } = this;
        seriesItemEnabled.clear();
        let visiblesIdx = 0;
        this._yKeys.forEach((stack) => {
            stack.forEach((yKey) => { var _a, _b; return seriesItemEnabled.set(yKey, (_b = (_a = visibles) === null || _a === void 0 ? void 0 : _a[visiblesIdx++], (_b !== null && _b !== void 0 ? _b : true))); });
        });
    }
    set grouped(value) {
        if (this._grouped !== value) {
            this._grouped = value;
            if (this.flatYKeys) {
                this.yKeys = this.flatYKeys;
            }
        }
    }
    get grouped() {
        return this._grouped;
    }
    set yNames(values) {
        if (Array.isArray(values) && this.flatYKeys) {
            const map = {};
            this.flatYKeys.forEach((k, i) => {
                map[k] = values[i];
            });
            values = map;
        }
        this._yNames = values;
    }
    get yNames() {
        return this._yNames;
    }
    setColors(fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
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
            const isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
            const isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
            let keysFound = true; // only warn once
            let prevX = Infinity;
            this.xData = data.map((datum) => {
                if (keysFound && !(xKey in datum)) {
                    keysFound = false;
                    console.warn(`The key '${xKey}' was not found in the data: `, datum);
                }
                const x = value_1.checkDatum(datum[xKey], isContinuousX);
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
                        console.warn(`The key '${yKey}' was not found in the data: `, datum);
                    }
                    const yDatum = value_1.checkDatum(datum[yKey], isContinuousY);
                    if (!seriesItemEnabled.get(yKey) || yDatum === undefined) {
                        return NaN;
                    }
                    return yDatum;
                });
            }));
            // Contains min/max values for each stack in each group,
            // where min is zero and max is a positive total of all values in the stack
            // or min is a negative total of all values in the stack and max is zero.
            const yMinMax = this.yData.map((group) => group.map((stack) => array_1.findMinMax(stack)));
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
        });
    }
    findLargestMinMax(groups) {
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
    getDomain(direction) {
        var _a, _b, _c, _d, _e;
        const { flipXY } = this;
        if (this.flipXY) {
            direction = chartAxis_1.flipChartAxisDirection(direction);
        }
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            if (!(((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof continuousScale_1.ContinuousScale)) {
                return this.xData;
            }
            // The last node will be clipped if the scale is not a band scale
            // Extend the domain by the smallest data interval so that the last band is not clipped
            const xDomain = array_1.extent(this.xData, value_1.isContinuous, Number) || [NaN, NaN];
            if (flipXY) {
                xDomain[0] = xDomain[0] - (_c = (_b = this.smallestDataInterval) === null || _b === void 0 ? void 0 : _b.x, (_c !== null && _c !== void 0 ? _c : 0));
            }
            else {
                xDomain[1] = xDomain[1] + (_e = (_d = this.smallestDataInterval) === null || _d === void 0 ? void 0 : _d.x, (_e !== null && _e !== void 0 ? _e : 0));
            }
            return xDomain;
        }
        else {
            return this.yDomain;
        }
    }
    getNodeClickEvent(event, datum) {
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    }
    getCategoryAxis() {
        return this.flipXY ? this.yAxis : this.xAxis;
    }
    getValueAxis() {
        return this.flipXY ? this.xAxis : this.yAxis;
    }
    calculateStep(range) {
        var _a, _b;
        const { smallestDataInterval: smallestInterval } = this;
        const xAxis = this.getCategoryAxis();
        if (!xAxis) {
            return;
        }
        // calculate step
        let domainLength = xAxis.dataDomain[1] - xAxis.dataDomain[0];
        let intervals = domainLength / (_b = (_a = smallestInterval) === null || _a === void 0 ? void 0 : _a.x, (_b !== null && _b !== void 0 ? _b : 1)) + 1;
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
            const { chart, data, visible } = this;
            const xAxis = this.getCategoryAxis();
            const yAxis = this.getValueAxis();
            if (!(chart && data && visible && xAxis && yAxis)) {
                return [];
            }
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const { groupScale, yKeys, cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, xData, yData, label, flipXY, id: seriesId, } = this;
            const { fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor, formatter: labelFormatter, placement: labelPlacement, } = label;
            let xBandWidth = xScale.bandwidth;
            if (xScale instanceof continuousScale_1.ContinuousScale) {
                const availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
                const step = this.calculateStep(availableRange);
                xBandWidth = step;
            }
            groupScale.range = [0, xBandWidth];
            if (xAxis instanceof categoryAxis_1.CategoryAxis) {
                groupScale.padding = xAxis.groupPaddingInner;
            }
            else if (xAxis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
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
                    contexts[stackIndex] = (_a = contexts[stackIndex], (_a !== null && _a !== void 0 ? _a : []));
                    let prevMinY = 0;
                    let prevMaxY = 0;
                    for (let levelIndex = 0; levelIndex < stackYs.length; levelIndex++) {
                        const currY = +stackYs[levelIndex];
                        const yKey = yKeys[stackIndex][levelIndex];
                        const barX = x + groupScale.convert(String(stackIndex));
                        contexts[stackIndex][levelIndex] = (_b = contexts[stackIndex][levelIndex], (_b !== null && _b !== void 0 ? _b : {
                            itemId: yKey,
                            nodeData: [],
                            labelData: [],
                        }));
                        // Bars outside of visible range are not rendered, so we create node data
                        // only for the visible subset of user data.
                        if (!xAxis.inRange(barX, barWidth)) {
                            continue;
                        }
                        if (isNaN(currY)) {
                            continue;
                        }
                        const prevY = currY < 0 ? prevMinY : prevMaxY;
                        const continuousY = yScale instanceof continuousScale_1.ContinuousScale;
                        const y = yScale.convert(prevY + currY, continuousY ? continuousScale_1.clamper : undefined);
                        const bottomY = yScale.convert(prevY, continuousY ? continuousScale_1.clamper : undefined);
                        const yValue = seriesDatum[yKey]; // unprocessed y-value
                        let labelText;
                        if (labelFormatter) {
                            labelText = labelFormatter({
                                value: value_1.isNumber(yValue) ? yValue : undefined,
                                seriesId,
                            });
                        }
                        else {
                            labelText = value_1.isNumber(yValue) ? yValue.toFixed(2) : '';
                        }
                        let labelX;
                        let labelY;
                        if (flipXY) {
                            labelY = barX + barWidth / 2;
                            if (labelPlacement === BarLabelPlacement.Inside) {
                                labelX = y + ((yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y)) / 2;
                            }
                            else {
                                labelX = y + (yValue >= 0 ? 1 : -1) * 4;
                            }
                        }
                        else {
                            labelX = barX + barWidth / 2;
                            if (labelPlacement === BarLabelPlacement.Inside) {
                                labelY = y + ((yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y)) / 2;
                            }
                            else {
                                labelY = y + (yValue >= 0 ? -3 : 4);
                            }
                        }
                        let labelTextAlign;
                        let labelTextBaseline;
                        if (labelPlacement === BarLabelPlacement.Inside) {
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
    updateDatumSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nodeData, datumSelection } = opts;
            const updateRects = datumSelection.setData(nodeData);
            updateRects.exit.remove();
            const enterRects = updateRects.enter.append(rect_1.Rect).each((rect) => {
                rect.tag = BarSeriesNodeTag.Bar;
            });
            return updateRects.merge(enterRects);
        });
    }
    updateDatumNodes(opts) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { datumSelection, isHighlight: isDatumHighlighted } = opts;
            const { fills, strokes, fillOpacity: seriesFillOpacity, strokeOpacity, shadow, formatter, xKey, flipXY, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, fillOpacity: highlightFillOpacity = seriesFillOpacity, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, }, }, id: seriesId, } = this;
            const [visibleMin, visibleMax] = (_b = (_a = this.xAxis) === null || _a === void 0 ? void 0 : _a.visibleRange, (_b !== null && _b !== void 0 ? _b : []));
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
            const updateLabels = labelSelection.setData(data);
            updateLabels.exit.remove();
            const enterLabels = updateLabels.enter.append(text_1.Text).each((text) => {
                text.tag = BarSeriesNodeTag.Label;
                text.pointerEvents = node_1.PointerEvents.None;
            });
            return updateLabels.merge(enterLabels);
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
        const xString = sanitize_1.sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitize_1.sanitizeHtml(yAxis.formatDatum(yValue));
        const title = sanitize_1.sanitizeHtml(yName);
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
            });
        }
        const color = (format && format.fill) || fill;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
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
            }), defaults);
        }
        return tooltip_1.toTooltipHtml(defaults);
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
    validation_1.Validate(validation_1.BOOLEAN)
], BarSeries.prototype, "flipXY", void 0);
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], BarSeries.prototype, "fills", void 0);
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], BarSeries.prototype, "strokes", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], BarSeries.prototype, "fillOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], BarSeries.prototype, "strokeOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_LINE_DASH)
], BarSeries.prototype, "lineDash", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], BarSeries.prototype, "lineDashOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], BarSeries.prototype, "formatter", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], BarSeries.prototype, "_xKey", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], BarSeries.prototype, "xName", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING_ARRAY)
], BarSeries.prototype, "hideInLegend", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN_ARRAY)
], BarSeries.prototype, "_visibles", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], BarSeries.prototype, "_grouped", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER())
], BarSeries.prototype, "_normalizedTo", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], BarSeries.prototype, "strokeWidth", void 0);
exports.BarSeries = BarSeries;
