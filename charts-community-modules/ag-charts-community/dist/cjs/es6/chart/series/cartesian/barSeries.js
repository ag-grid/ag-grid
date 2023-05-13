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
exports.BarSeries = void 0;
const rect_1 = require("../../../scene/shape/rect");
const bandScale_1 = require("../../../scale/bandScale");
const series_1 = require("../series");
const label_1 = require("../../label");
const node_1 = require("../../../scene/node");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxis_1 = require("../../chartAxis");
const chartAxisDirection_1 = require("../../chartAxisDirection");
const tooltip_1 = require("../../tooltip/tooltip");
const array_1 = require("../../../util/array");
const equal_1 = require("../../../util/equal");
const sanitize_1 = require("../../../util/sanitize");
const value_1 = require("../../../util/value");
const continuousScale_1 = require("../../../scale/continuousScale");
const validation_1 = require("../../../util/validation");
const categoryAxis_1 = require("../../axis/categoryAxis");
const groupedCategoryAxis_1 = require("../../axis/groupedCategoryAxis");
const logAxis_1 = require("../../axis/logAxis");
const dataModel_1 = require("../../data/dataModel");
const BAR_LABEL_PLACEMENTS = ['inside', 'outside'];
const OPT_BAR_LABEL_PLACEMENT = (v, ctx) => validation_1.OPTIONAL(v, ctx, (v) => BAR_LABEL_PLACEMENTS.includes(v));
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
class BarSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
        this.placement = 'inside';
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], BarSeriesLabel.prototype, "formatter", void 0);
__decorate([
    validation_1.Validate(OPT_BAR_LABEL_PLACEMENT)
], BarSeriesLabel.prototype, "placement", void 0);
class BarSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], BarSeriesTooltip.prototype, "renderer", void 0);
function is2dArray(array) {
    return array.length > 0 && Array.isArray(array[0]);
}
class BarSeries extends cartesianSeries_1.CartesianSeries {
    constructor() {
        super({
            pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            directionKeys: {
                [chartAxisDirection_1.ChartAxisDirection.X]: ['xKey'],
                [chartAxisDirection_1.ChartAxisDirection.Y]: ['yKeys'],
            },
        });
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
        return this.flipXY ? chartAxis_1.flipChartAxisDirection(direction) : direction;
    }
    set xKey(value) {
        this._xKey = value;
        this.processedData = undefined;
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
        if (!equal_1.areArrayItemsStrictlyEqual(this.yKeysCache, yKeys)) {
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
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            this.processYKeys();
            this.processYNames();
            const { xKey, seriesItemEnabled, normalizedTo, data = [] } = this;
            const isContinuousX = ((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof continuousScale_1.ContinuousScale;
            const isContinuousY = ((_b = this.getValueAxis()) === null || _b === void 0 ? void 0 : _b.scale) instanceof continuousScale_1.ContinuousScale;
            const activeSeriesItems = [...seriesItemEnabled.entries()]
                .filter(([, enabled]) => enabled)
                .map(([yKey]) => yKey);
            const activeStacks = this.yKeys
                .map((stack) => stack.filter((key) => seriesItemEnabled.get(key)))
                .filter((stack) => stack.length > 0);
            const normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
            this.dataModel = new dataModel_1.DataModel({
                props: [
                    series_1.keyProperty(xKey, isContinuousX),
                    ...activeSeriesItems.map((yKey) => series_1.valueProperty(yKey, isContinuousY, { invalidValue: null })),
                    ...activeStacks.map((stack) => series_1.sumProperties(stack)),
                    ...(isContinuousX ? [dataModel_1.SMALLEST_KEY_INTERVAL] : []),
                    dataModel_1.SUM_VALUE_EXTENT,
                ],
                groupByKeys: true,
                dataVisible: this.visible && activeSeriesItems.length > 0,
                normaliseTo,
            });
            this.processedData = this.dataModel.processData(data);
            this.smallestDataInterval = {
                x: (_e = (_d = (_c = this.processedData) === null || _c === void 0 ? void 0 : _c.reduced) === null || _d === void 0 ? void 0 : _d[dataModel_1.SMALLEST_KEY_INTERVAL.property]) !== null && _e !== void 0 ? _e : Infinity,
                y: Infinity,
            };
        });
    }
    getDomain(direction) {
        const { flipXY, processedData } = this;
        if (!processedData)
            return [];
        if (flipXY) {
            direction = chartAxis_1.flipChartAxisDirection(direction);
        }
        const { defs: { keys: [keyDef], }, domain: { keys: [keys], values: [yExtent], }, reduced: { [dataModel_1.SMALLEST_KEY_INTERVAL.property]: smallestX, [dataModel_1.SUM_VALUE_EXTENT.property]: ySumExtent } = {}, } = processedData;
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            if (keyDef.valueType === 'category') {
                return keys;
            }
            const keysExtent = array_1.extent(keys) || [NaN, NaN];
            if (flipXY) {
                return [keysExtent[0] + -smallestX, keysExtent[1]];
            }
            return [keysExtent[0], keysExtent[1] + smallestX];
        }
        else if (this.getValueAxis() instanceof logAxis_1.LogAxis) {
            return this.fixNumericExtent(yExtent);
        }
        else {
            return this.fixNumericExtent(ySumExtent);
        }
    }
    getNodeClickEvent(event, datum) {
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent(this.xKey, datum.yKey, event, datum, this);
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
            const { groupScale, yKeys, xKey, cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, label, flipXY, id: seriesId, processedData, } = this;
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
        return new rect_1.Rect();
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
                text.pointerEvents = node_1.PointerEvents.None;
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
            return tooltip_1.toTooltipHtml(tooltipRenderer({
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
    getBandScalePadding() {
        return { inner: 0.2, outer: 0.3 };
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
], BarSeries.prototype, "visibles", void 0);
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
