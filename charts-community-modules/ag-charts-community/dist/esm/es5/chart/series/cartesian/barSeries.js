var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
var BAR_LABEL_PLACEMENTS = ['inside', 'outside'];
var OPT_BAR_LABEL_PLACEMENT = function (v, ctx) {
    return OPTIONAL(v, ctx, function (v) { return BAR_LABEL_PLACEMENTS.includes(v); });
};
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
var BarSeriesLabel = /** @class */ (function (_super) {
    __extends(BarSeriesLabel, _super);
    function BarSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        _this.placement = 'inside';
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], BarSeriesLabel.prototype, "formatter", void 0);
    __decorate([
        Validate(OPT_BAR_LABEL_PLACEMENT)
    ], BarSeriesLabel.prototype, "placement", void 0);
    return BarSeriesLabel;
}(Label));
var BarSeriesTooltip = /** @class */ (function (_super) {
    __extends(BarSeriesTooltip, _super);
    function BarSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], BarSeriesTooltip.prototype, "renderer", void 0);
    return BarSeriesTooltip;
}(SeriesTooltip));
function is2dArray(array) {
    return array.length > 0 && Array.isArray(array[0]);
}
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries(moduleCtx) {
        var _a, _b;
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            directionKeys: (_a = {},
                _a[ChartAxisDirection.X] = ['xKey'],
                _a[ChartAxisDirection.Y] = ['yKeys'],
                _a),
            directionNames: (_b = {},
                _b[ChartAxisDirection.X] = ['xName'],
                _b[ChartAxisDirection.Y] = ['yNames'],
                _b),
        }) || this;
        _this.label = new BarSeriesLabel();
        _this.tooltip = new BarSeriesTooltip();
        _this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        _this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.formatter = undefined;
        /**
         * Used to get the position of bars within each group.
         */
        _this.groupScale = new BandScale();
        _this.xKey = undefined;
        _this.xName = undefined;
        _this.cumYKeyCount = [];
        _this.flatYKeys = undefined; // only set when a user used a flat array for yKeys
        _this.hideInLegend = [];
        _this.yKeys = [];
        _this.yKeysCache = [];
        _this.visibles = [];
        _this.grouped = false;
        _this.stackGroups = {};
        /**
         * A map of `yKeys` to their names (used in legends and tooltips).
         * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
         */
        _this.yNames = {};
        _this.legendItemNames = {};
        _this.strokeWidth = 1;
        _this.shadow = undefined;
        _this.smallestDataInterval = undefined;
        _this.label.enabled = false;
        return _this;
    }
    BarSeries.prototype.resolveKeyDirection = function (direction) {
        if (this.getBarDirection() === ChartAxisDirection.X) {
            if (direction === ChartAxisDirection.X) {
                return ChartAxisDirection.Y;
            }
            return ChartAxisDirection.X;
        }
        return direction;
    };
    BarSeries.prototype.processYKeys = function () {
        var _this = this;
        var yKeys = this.yKeys;
        var flatYKeys = undefined;
        // Convert from flat y-keys to grouped y-keys.
        if (!is2dArray(yKeys)) {
            flatYKeys = yKeys;
            yKeys = this.grouped ? flatYKeys.map(function (k) { return [k]; }) : [flatYKeys];
        }
        var stackGroups = Object.values(this.stackGroups);
        if (stackGroups.length > 0) {
            var flattenKeys = function (keys) { return keys.reduce(function (res, k) { return res.concat(k); }, []); };
            // Create a stack for items without a group
            var flatKeys_1 = flattenKeys(yKeys);
            var keysInStacks_1 = new Set(flattenKeys(stackGroups));
            var ungroupedKeys = flatKeys_1.filter(function (k) { return !keysInStacks_1.has(k); });
            yKeys = stackGroups.map(function (keys) { return keys; });
            if (ungroupedKeys.length > 0) {
                yKeys.push(ungroupedKeys);
            }
            // Preserve the order of colours and other properties
            var indexMap = function (items) {
                return items.reduce(function (map, key, index) { return map.set(key, index); }, new Map());
            };
            var newKeys = flattenKeys(yKeys);
            var newKeysIndices_1 = indexMap(newKeys);
            var sort = function (items) {
                var result = Array.from({ length: items.length });
                items.forEach(function (item, index) {
                    var key = flatKeys_1[index];
                    var newIndex = newKeysIndices_1.get(key);
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
            var prevYKeyCount_1 = 0;
            this.cumYKeyCount = [];
            var visibleStacks_1 = [];
            yKeys.forEach(function (stack, index) {
                if (stack.length > 0) {
                    visibleStacks_1.push(String(index));
                }
                _this.cumYKeyCount.push(prevYKeyCount_1);
                prevYKeyCount_1 += stack.length;
            });
            this.processSeriesItemEnabled();
            var groupScale = this.groupScale;
            groupScale.domain = visibleStacks_1;
        }
        this.yKeysCache = yKeys;
    };
    BarSeries.prototype.processSeriesItemEnabled = function () {
        var seriesItemEnabled = this.seriesItemEnabled;
        var flattenFn = function (r, n) { return r.concat.apply(r, __spreadArray([], __read((Array.isArray(n) ? n : [n])))); };
        var visibles = this.visibles.reduce(flattenFn, []);
        seriesItemEnabled.clear();
        var visiblesIdx = 0;
        this.yKeys.forEach(function (stack) {
            stack.forEach(function (yKey) { var _a; return seriesItemEnabled.set(yKey, (_a = visibles[visiblesIdx++]) !== null && _a !== void 0 ? _a : true); });
        });
    };
    BarSeries.prototype.getStackGroup = function (yKey) {
        var _a;
        var stackGroups = this.stackGroups;
        return (_a = Object.entries(stackGroups).find(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], keys = _b[1];
            return keys.includes(yKey);
        })) === null || _a === void 0 ? void 0 : _a[0];
    };
    BarSeries.prototype.processYNames = function () {
        var values = this.yNames;
        if (Array.isArray(values) && this.flatYKeys) {
            var map_1 = {};
            this.flatYKeys.forEach(function (k, i) {
                map_1[k] = values[i];
            });
            this.yNames = map_1;
        }
    };
    BarSeries.prototype.processData = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var _f, xKey, seriesItemEnabled, normalizedTo, _g, data, normalizedToAbs, isContinuousX, isContinuousY, activeSeriesItems, activeStacks, normaliseTo, extraProps;
            return __generator(this, function (_h) {
                this.processYKeys();
                this.processYNames();
                _f = this, xKey = _f.xKey, seriesItemEnabled = _f.seriesItemEnabled, normalizedTo = _f.normalizedTo, _g = _f.data, data = _g === void 0 ? [] : _g;
                normalizedToAbs = Math.abs(normalizedTo !== null && normalizedTo !== void 0 ? normalizedTo : NaN);
                isContinuousX = ((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof ContinuousScale;
                isContinuousY = ((_b = this.getValueAxis()) === null || _b === void 0 ? void 0 : _b.scale) instanceof ContinuousScale;
                activeSeriesItems = __spreadArray([], __read(seriesItemEnabled.entries())).filter(function (_a) {
                    var _b = __read(_a, 2), enabled = _b[1];
                    return enabled;
                })
                    .map(function (_a) {
                    var _b = __read(_a, 1), yKey = _b[0];
                    return yKey;
                });
                activeStacks = this.yKeys
                    .map(function (stack) { return stack.filter(function (key) { return seriesItemEnabled.get(key); }); })
                    .filter(function (stack) { return stack.length > 0; });
                normaliseTo = normalizedToAbs && isFinite(normalizedToAbs) ? normalizedToAbs : undefined;
                extraProps = [];
                if (normaliseTo) {
                    extraProps.push(normaliseGroupTo(activeSeriesItems, normaliseTo, 'sum'));
                }
                this.dataModel = new DataModel({
                    props: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                        keyProperty(xKey, isContinuousX)
                    ], __read(activeSeriesItems.map(function (yKey) { return valueProperty(yKey, isContinuousY, { invalidValue: null }); }))), __read(activeStacks.map(function (stack) { return sum(stack); }))), __read((isContinuousX ? [SMALLEST_KEY_INTERVAL] : []))), [
                        AGG_VALUES_EXTENT
                    ]), __read(extraProps)),
                    groupByKeys: true,
                    dataVisible: this.visible && activeSeriesItems.length > 0,
                });
                this.processedData = this.dataModel.processData(data);
                this.smallestDataInterval = {
                    x: (_e = (_d = (_c = this.processedData) === null || _c === void 0 ? void 0 : _c.reduced) === null || _d === void 0 ? void 0 : _d[SMALLEST_KEY_INTERVAL.property]) !== null && _e !== void 0 ? _e : Infinity,
                    y: Infinity,
                };
                return [2 /*return*/];
            });
        });
    };
    BarSeries.prototype.getDomain = function (direction) {
        var _a;
        var processedData = this.processedData;
        if (!processedData)
            return [];
        var _b = processedData, _c = __read(_b.defs.keys, 1), keyDef = _c[0], _d = _b.domain, _e = __read(_d.keys, 1), keys = _e[0], _f = __read(_d.values, 1), yExtent = _f[0], _g = _b.reduced, _h = _g === void 0 ? {} : _g, _j = SMALLEST_KEY_INTERVAL.property, smallestX = _h[_j], _k = AGG_VALUES_EXTENT.property, ySumExtent = _h[_k];
        if (direction === this.getCategoryDirection()) {
            if (keyDef.valueType === 'category') {
                return keys;
            }
            var keysExtent = (_a = extent(keys)) !== null && _a !== void 0 ? _a : [NaN, NaN];
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
    };
    BarSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    BarSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    BarSeries.prototype.getCategoryAxis = function () {
        return this.getCategoryDirection() === ChartAxisDirection.Y ? this.yAxis : this.xAxis;
    };
    BarSeries.prototype.getValueAxis = function () {
        return this.getBarDirection() === ChartAxisDirection.Y ? this.yAxis : this.xAxis;
    };
    BarSeries.prototype.calculateStep = function (range) {
        var _a;
        var smallestInterval = this.smallestDataInterval;
        var xAxis = this.getCategoryAxis();
        if (!xAxis) {
            return;
        }
        // calculate step
        var domainLength = xAxis.dataDomain[1] - xAxis.dataDomain[0];
        var intervals = domainLength / ((_a = smallestInterval === null || smallestInterval === void 0 ? void 0 : smallestInterval.x) !== null && _a !== void 0 ? _a : 1) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum number of bands to ensure the step does not fall below 1 pixel.
        // This means there could be some overlap of the bands in the chart.
        var maxBands = Math.floor(range); // A minimum of 1px per bar/column means the maximum number of bands will equal the available range
        var bands = Math.min(intervals, maxBands);
        var step = range / Math.max(1, bands);
        return step;
    };
    BarSeries.prototype.createNodeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, visible, xAxis, yAxis, xScale, yScale, _b, groupScale, yKeys, _c, xKey, cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, label, seriesId, processedData, ctx, xBandWidth, availableRange, step, barWidth, contexts;
            var _this = this;
            return __generator(this, function (_d) {
                _a = this, data = _a.data, visible = _a.visible;
                xAxis = this.getCategoryAxis();
                yAxis = this.getValueAxis();
                if (!(data && visible && xAxis && yAxis)) {
                    return [2 /*return*/, []];
                }
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                _b = this, groupScale = _b.groupScale, yKeys = _b.yKeys, _c = _b.xKey, xKey = _c === void 0 ? '' : _c, cumYKeyCount = _b.cumYKeyCount, fills = _b.fills, strokes = _b.strokes, strokeWidth = _b.strokeWidth, seriesItemEnabled = _b.seriesItemEnabled, label = _b.label, seriesId = _b.id, processedData = _b.processedData, ctx = _b.ctx;
                xBandWidth = xScale.bandwidth;
                if (xScale instanceof ContinuousScale) {
                    availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
                    step = this.calculateStep(availableRange);
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
                barWidth = groupScale.bandwidth >= 1
                    ? // Pixel-rounded value for low-volume bar charts.
                        groupScale.bandwidth
                    : // Handle high-volume bar charts gracefully.
                        groupScale.rawBandwidth;
                contexts = [];
                processedData === null || processedData === void 0 ? void 0 : processedData.data.forEach(function (_a, dataIndex) {
                    var _b, _c, _d, _e, _f;
                    var _g;
                    var keys = _a.keys, seriesDatum = _a.datum, values = _a.values;
                    var x = xScale.convert(keys[0]);
                    for (var stackIndex = 0; stackIndex < ((_b = yKeys === null || yKeys === void 0 ? void 0 : yKeys.length) !== null && _b !== void 0 ? _b : 0); stackIndex++) {
                        var stackYKeys = (_c = yKeys === null || yKeys === void 0 ? void 0 : yKeys[stackIndex]) !== null && _c !== void 0 ? _c : []; // y-data for a stack within a group
                        (_d = contexts[stackIndex]) !== null && _d !== void 0 ? _d : (contexts[stackIndex] = []);
                        var prevMinY = 0;
                        var prevMaxY = 0;
                        for (var levelIndex = 0; levelIndex < stackYKeys.length; levelIndex++) {
                            var yKey = stackYKeys[levelIndex];
                            var yIndex = (_e = processedData === null || processedData === void 0 ? void 0 : processedData.indices.values[yKey]) !== null && _e !== void 0 ? _e : -1;
                            (_f = (_g = contexts[stackIndex])[levelIndex]) !== null && _f !== void 0 ? _f : (_g[levelIndex] = {
                                itemId: yKey,
                                nodeData: [],
                                labelData: [],
                            });
                            if (yIndex === undefined)
                                continue;
                            var yValue = values[0][yIndex];
                            var currY = +yValue;
                            var barX = x + groupScale.convert(String(stackIndex));
                            // Bars outside of visible range are not rendered, so we create node data
                            // only for the visible subset of user data.
                            if (!xAxis.inRange(barX, barWidth)) {
                                continue;
                            }
                            if (isNaN(currY)) {
                                continue;
                            }
                            var prevY = currY < 0 ? prevMinY : prevMaxY;
                            var y = yScale.convert(prevY + currY, { strict: false });
                            var bottomY = yScale.convert(prevY, { strict: false });
                            var barAlongX = _this.getBarDirection() === ChartAxisDirection.X;
                            var rect = {
                                x: barAlongX ? Math.min(y, bottomY) : barX,
                                y: barAlongX ? barX : Math.min(y, bottomY),
                                width: barAlongX ? Math.abs(bottomY - y) : barWidth,
                                height: barAlongX ? barWidth : Math.abs(bottomY - y),
                            };
                            var nodeMidPoint = {
                                x: rect.x + rect.width / 2,
                                y: rect.y + rect.height / 2,
                            };
                            var labelFontStyle = label.fontStyle, labelFontWeight = label.fontWeight, labelFontSize = label.fontSize, labelFontFamily = label.fontFamily, labelColor = label.color, formatter = label.formatter, placement = label.placement;
                            var _h = createLabelData({ value: yValue, rect: rect, formatter: formatter, placement: placement, seriesId: seriesId, barAlongX: barAlongX, ctx: ctx }), labelText = _h.text, labelTextAlign = _h.textAlign, labelTextBaseline = _h.textBaseline, labelX = _h.x, labelY = _h.y;
                            var colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                            var nodeData = {
                                index: dataIndex,
                                series: _this,
                                itemId: yKey,
                                datum: seriesDatum[0],
                                cumulativeValue: prevY + currY,
                                yValue: yValue,
                                yKey: yKey,
                                xKey: xKey,
                                x: rect.x,
                                y: rect.y,
                                width: rect.width,
                                height: rect.height,
                                nodeMidPoint: nodeMidPoint,
                                colorIndex: colorIndex,
                                fill: fills[colorIndex % fills.length],
                                stroke: strokes[colorIndex % strokes.length],
                                strokeWidth: strokeWidth,
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
                return [2 /*return*/, contexts.reduce(function (r, n) { return r.concat.apply(r, __spreadArray([], __read(n))); }, [])];
            });
        });
    };
    BarSeries.prototype.nodeFactory = function () {
        return new Rect();
    };
    BarSeries.prototype.updateDatumSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, datumSelection;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, datumSelection = opts.datumSelection;
                return [2 /*return*/, datumSelection.update(nodeData, function (rect) { return (rect.tag = BarSeriesNodeTag.Bar); })];
            });
        });
    };
    BarSeries.prototype.updateDatumNodes = function (opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, isHighlight, _b, fills, strokes, fillOpacity, strokeOpacity, lineDash, lineDashOffset, shadow, formatter, seriesId, itemHighlightStyle, ctx, crisp, categoryAlongX;
            var _this = this;
            return __generator(this, function (_c) {
                datumSelection = opts.datumSelection, isHighlight = opts.isHighlight;
                _b = this, fills = _b.fills, strokes = _b.strokes, fillOpacity = _b.fillOpacity, strokeOpacity = _b.strokeOpacity, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, shadow = _b.shadow, formatter = _b.formatter, seriesId = _b.id, itemHighlightStyle = _b.highlightStyle.item, ctx = _b.ctx;
                crisp = checkCrisp((_a = this.xAxis) === null || _a === void 0 ? void 0 : _a.visibleRange);
                categoryAlongX = this.getCategoryDirection() === ChartAxisDirection.X;
                datumSelection.each(function (rect, datum) {
                    var colorIndex = datum.colorIndex;
                    var style = {
                        fill: fills[colorIndex % fills.length],
                        stroke: strokes[colorIndex % fills.length],
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity,
                        lineDash: lineDash,
                        lineDashOffset: lineDashOffset,
                        fillShadow: shadow,
                        strokeWidth: _this.getStrokeWidth(_this.strokeWidth, datum),
                    };
                    var visible = categoryAlongX ? datum.width > 0 : datum.height > 0;
                    var config = getRectConfig({
                        datum: datum,
                        isHighlighted: isHighlight,
                        style: style,
                        highlightStyle: itemHighlightStyle,
                        formatter: formatter,
                        seriesId: seriesId,
                        stackGroup: _this.getStackGroup(datum.yKey),
                        ctx: ctx,
                    });
                    config.crisp = crisp;
                    config.visible = visible;
                    updateRect({ rect: rect, config: config });
                });
                return [2 /*return*/];
            });
        });
    };
    BarSeries.prototype.updateLabelSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelData, labelSelection, enabled, data;
            return __generator(this, function (_a) {
                labelData = opts.labelData, labelSelection = opts.labelSelection;
                enabled = this.label.enabled;
                data = enabled ? labelData : [];
                return [2 /*return*/, labelSelection.update(data, function (text) {
                        text.tag = BarSeriesNodeTag.Label;
                        text.pointerEvents = PointerEvents.None;
                    })];
            });
        });
    };
    BarSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection;
            var _this = this;
            return __generator(this, function (_a) {
                labelSelection = opts.labelSelection;
                labelSelection.each(function (text, datum) {
                    var labelDatum = datum.label;
                    updateLabel({ labelNode: text, labelDatum: labelDatum, config: _this.label, visible: true });
                });
                return [2 /*return*/];
            });
        });
    };
    BarSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a;
        var _b = this, xKey = _b.xKey, yKeys = _b.yKeys, processedData = _b.processedData, callbackCache = _b.ctx.callbackCache;
        var xAxis = this.getCategoryAxis();
        var yAxis = this.getValueAxis();
        var yKey = nodeDatum.yKey;
        if (!processedData || !xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var fillIndex = 0;
        var i = 0;
        var j = 0;
        for (; j < yKeys.length; j++) {
            var stack = yKeys[j];
            i = stack.indexOf(yKey);
            if (i >= 0) {
                fillIndex += i;
                break;
            }
            fillIndex += stack.length;
        }
        var _c = this, xName = _c.xName, yNames = _c.yNames, fills = _c.fills, strokes = _c.strokes, tooltip = _c.tooltip, formatter = _c.formatter, seriesId = _c.id;
        var tooltipRenderer = tooltip.renderer;
        var datum = nodeDatum.datum;
        var yName = yNames[yKey];
        var stackGroup = this.getStackGroup(yKey);
        var fill = fills[fillIndex % fills.length];
        var stroke = strokes[fillIndex % fills.length];
        var strokeWidth = this.getStrokeWidth(this.strokeWidth);
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitizeHtml(yAxis.formatDatum(yValue));
        var title = sanitizeHtml(yName);
        var content = xString + ': ' + yString;
        var format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                highlighted: false,
                xKey: xKey,
                yKey: yKey,
                seriesId: seriesId,
                stackGroup: stackGroup,
            });
        }
        var color = (_a = format === null || format === void 0 ? void 0 : format.fill) !== null && _a !== void 0 ? _a : fill;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                color: color,
                title: title,
                seriesId: seriesId,
                stackGroup: stackGroup,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    BarSeries.prototype.getLegendData = function () {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKeys = _a.yKeys, yNames = _a.yNames, legendItemNames = _a.legendItemNames, cumYKeyCount = _a.cumYKeyCount, seriesItemEnabled = _a.seriesItemEnabled, hideInLegend = _a.hideInLegend, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (!(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKeys.length) {
            return [];
        }
        var legendData = [];
        this.validateLegendData();
        this.yKeys.forEach(function (stack, stackIndex) {
            var _a, _b, _c;
            for (var levelIndex = 0; levelIndex < stack.length; levelIndex++) {
                var yKey = stack[levelIndex];
                if (hideInLegend.indexOf(yKey) >= 0) {
                    return;
                }
                var colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                legendData.push({
                    legendType: 'category',
                    id: id,
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
    };
    BarSeries.prototype.validateLegendData = function () {
        var _a = this, hideInLegend = _a.hideInLegend, legendItemNames = _a.legendItemNames;
        var hasAnyLegendItemName = false;
        this.yKeys.forEach(function (stack) {
            stack.forEach(function (yKey) {
                if (hideInLegend.indexOf(yKey) >= 0) {
                    return;
                }
                var hasLegendItemName = legendItemNames[yKey] !== undefined;
                if (hasAnyLegendItemName && !hasLegendItemName) {
                    Logger.warnOnce("a series is missing the legendItemName property, unexpected behaviour may occur.");
                }
                hasAnyLegendItemName = hasLegendItemName;
            });
        });
    };
    BarSeries.prototype.onLegendItemClick = function (event) {
        var _this = this;
        var itemId = event.itemId, enabled = event.enabled, series = event.series;
        if (series.id !== this.id)
            return;
        _super.prototype.toggleSeriesItem.call(this, itemId, enabled);
        // Toggle items where the legendItemName matches the legendItemName of the clicked item
        Object.keys(this.legendItemNames)
            .filter(function (id) {
            return _this.legendItemNames[id] !== undefined && _this.legendItemNames[id] === _this.legendItemNames[itemId];
        })
            .forEach(function (yKey) {
            if (yKey !== itemId) {
                _super.prototype.toggleSeriesItem.call(_this, yKey, enabled);
            }
        });
        this.calculateVisibleDomain();
    };
    BarSeries.prototype.onLegendItemDoubleClick = function (event) {
        var _this = this;
        var enabled = event.enabled, itemId = event.itemId, numVisibleItems = event.numVisibleItems;
        var totalVisibleItems = Object.values(numVisibleItems).reduce(function (p, v) { return p + v; }, 0);
        var singleEnabledInEachSeries = Object.values(numVisibleItems).filter(function (v) { return v === 1; }).length === Object.keys(numVisibleItems).length;
        var newEnableds = {};
        this.yKeys.forEach(function (stack) {
            stack.forEach(function (yKey) {
                var _a;
                var matches = yKey === itemId;
                var singleEnabledWasClicked = totalVisibleItems === 1 && enabled;
                var newEnabled = matches || singleEnabledWasClicked || (singleEnabledInEachSeries && enabled);
                newEnableds[yKey] = (_a = newEnableds[yKey]) !== null && _a !== void 0 ? _a : newEnabled;
                // Toggle other items that have matching legendItemNames which have not already been processed.
                Object.keys(_this.legendItemNames)
                    .filter(function (id) {
                    return _this.legendItemNames[id] !== undefined &&
                        _this.legendItemNames[id] === _this.legendItemNames[yKey];
                })
                    .forEach(function (nameYKey) {
                    var _a;
                    newEnableds[nameYKey] = (_a = newEnableds[nameYKey]) !== null && _a !== void 0 ? _a : newEnabled;
                });
            });
        });
        Object.keys(newEnableds).forEach(function (yKey) {
            _super.prototype.toggleSeriesItem.call(_this, yKey, newEnableds[yKey]);
        });
        this.calculateVisibleDomain();
    };
    BarSeries.prototype.calculateVisibleDomain = function () {
        var yKeys = this.yKeys.map(function (stack) { return stack.slice(); }); // deep clone
        this.seriesItemEnabled.forEach(function (enabled, yKey) {
            if (!enabled) {
                yKeys.forEach(function (stack) {
                    var index = stack.indexOf(yKey);
                    if (index >= 0) {
                        stack.splice(index, 1);
                    }
                });
            }
        });
        var visibleStacks = [];
        yKeys.forEach(function (stack, index) {
            if (stack.length > 0) {
                visibleStacks.push(String(index));
            }
        });
        this.groupScale.domain = visibleStacks;
        this.nodeDataRefresh = true;
    };
    BarSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var datumSelections = _a.datumSelections, labelSelections = _a.labelSelections;
        var duration = 1000;
        var labelDuration = 200;
        var startingX = Infinity;
        datumSelections.forEach(function (datumSelection) {
            return datumSelection.each(function (_, datum) {
                if (datum.yValue >= 0) {
                    startingX = Math.min(startingX, datum.x);
                }
            });
        });
        datumSelections.forEach(function (datumSelection) {
            datumSelection.each(function (rect, datum) {
                var _a;
                (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(_this.id + "_empty-update-ready_" + rect.id, [
                    { from: startingX, to: datum.x },
                    { from: 0, to: datum.width },
                ], {
                    disableInteractions: true,
                    duration: duration,
                    ease: easing.easeOut,
                    repeat: 0,
                    onUpdate: function (_a) {
                        var _b = __read(_a, 2), x = _b[0], width = _b[1];
                        rect.x = x;
                        rect.width = width;
                        rect.y = datum.y;
                        rect.height = datum.height;
                    },
                });
            });
        });
        labelSelections.forEach(function (labelSelection) {
            labelSelection.each(function (label) {
                var _a;
                (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: duration,
                    duration: labelDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: function (opacity) {
                        label.opacity = opacity;
                    },
                });
            });
        });
    };
    BarSeries.prototype.animateReadyUpdate = function (_a) {
        var _this = this;
        var datumSelections = _a.datumSelections;
        datumSelections.forEach(function (datumSelection) {
            _this.resetSelectionRects(datumSelection);
        });
    };
    BarSeries.prototype.animateReadyHighlight = function (highlightSelection) {
        this.resetSelectionRects(highlightSelection);
    };
    BarSeries.prototype.animateReadyResize = function (_a) {
        var _this = this;
        var _b;
        var datumSelections = _a.datumSelections;
        (_b = this.animationManager) === null || _b === void 0 ? void 0 : _b.stop();
        datumSelections.forEach(function (datumSelection) {
            _this.resetSelectionRects(datumSelection);
        });
    };
    BarSeries.prototype.resetSelectionRects = function (selection) {
        selection.each(function (rect, datum) {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
    };
    BarSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    BarSeries.prototype.getBandScalePadding = function () {
        return { inner: 0.2, outer: 0.3 };
    };
    BarSeries.prototype.getBarDirection = function () {
        return ChartAxisDirection.X;
    };
    BarSeries.prototype.getCategoryDirection = function () {
        return ChartAxisDirection.Y;
    };
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
    return BarSeries;
}(CartesianSeries));
export { BarSeries };
var ColumnSeries = /** @class */ (function (_super) {
    __extends(ColumnSeries, _super);
    function ColumnSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnSeries.prototype.getBarDirection = function () {
        return ChartAxisDirection.Y;
    };
    ColumnSeries.prototype.getCategoryDirection = function () {
        return ChartAxisDirection.X;
    };
    ColumnSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var datumSelections = _a.datumSelections, labelSelections = _a.labelSelections;
        var duration = 1000;
        var labelDuration = 200;
        var startingY = 0;
        datumSelections.forEach(function (datumSelection) {
            return datumSelection.each(function (_, datum) {
                if (datum.yValue >= 0) {
                    startingY = Math.max(startingY, datum.height + datum.y);
                }
            });
        });
        datumSelections.forEach(function (datumSelection) {
            datumSelection.each(function (rect, datum) {
                var _a;
                (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(_this.id + "_empty-update-ready_" + rect.id, [
                    { from: startingY, to: datum.y },
                    { from: 0, to: datum.height },
                ], {
                    disableInteractions: true,
                    duration: duration,
                    ease: easing.easeOut,
                    repeat: 0,
                    onUpdate: function (_a) {
                        var _b = __read(_a, 2), y = _b[0], height = _b[1];
                        rect.y = y;
                        rect.height = height;
                        rect.x = datum.x;
                        rect.width = datum.width;
                    },
                });
            });
        });
        labelSelections.forEach(function (labelSelection) {
            labelSelection.each(function (label) {
                var _a;
                (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: duration,
                    duration: labelDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: function (opacity) {
                        label.opacity = opacity;
                    },
                });
            });
        });
    };
    ColumnSeries.type = 'column';
    ColumnSeries.className = 'ColumnSeries';
    return ColumnSeries;
}(BarSeries));
export { ColumnSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9jYXJ0ZXNpYW4vYmFyU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVqRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFckQsT0FBTyxFQUF5QixhQUFhLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqSCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVwRCxPQUFPLEVBQ0gsZUFBZSxFQUNmLDZCQUE2QixFQUU3QixtQ0FBbUMsR0FDdEMsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUU5QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE9BQU8sRUFDSCxPQUFPLEVBQ1AsYUFBYSxFQUNiLE1BQU0sRUFDTixZQUFZLEVBQ1osYUFB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