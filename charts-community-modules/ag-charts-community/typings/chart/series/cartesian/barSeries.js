"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarSeries = void 0;
var rect_1 = require("../../../scene/shape/rect");
var bandScale_1 = require("../../../scale/bandScale");
var series_1 = require("../series");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var tooltip_1 = require("../../tooltip/tooltip");
var array_1 = require("../../../util/array");
var equal_1 = require("../../../util/equal");
var sanitize_1 = require("../../../util/sanitize");
var value_1 = require("../../../util/value");
var continuousScale_1 = require("../../../scale/continuousScale");
var validation_1 = require("../../../util/validation");
var categoryAxis_1 = require("../../axis/categoryAxis");
var groupedCategoryAxis_1 = require("../../axis/groupedCategoryAxis");
var logAxis_1 = require("../../axis/logAxis");
var dataModel_1 = require("../../data/dataModel");
var BAR_LABEL_PLACEMENTS = ['inside', 'outside'];
var OPT_BAR_LABEL_PLACEMENT = function (v, ctx) {
    return validation_1.OPTIONAL(v, ctx, function (v) { return BAR_LABEL_PLACEMENTS.includes(v); });
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
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], BarSeriesLabel.prototype, "formatter", void 0);
    __decorate([
        validation_1.Validate(OPT_BAR_LABEL_PLACEMENT)
    ], BarSeriesLabel.prototype, "placement", void 0);
    return BarSeriesLabel;
}(label_1.Label));
var BarSeriesTooltip = /** @class */ (function (_super) {
    __extends(BarSeriesTooltip, _super);
    function BarSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], BarSeriesTooltip.prototype, "renderer", void 0);
    return BarSeriesTooltip;
}(series_1.SeriesTooltip));
function is2dArray(array) {
    return array.length > 0 && Array.isArray(array[0]);
}
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries() {
        var _a;
        var _this = _super.call(this, {
            pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            directionKeys: (_a = {},
                _a[chartAxisDirection_1.ChartAxisDirection.X] = ['xKey'],
                _a[chartAxisDirection_1.ChartAxisDirection.Y] = ['yKeys'],
                _a),
        }) || this;
        _this.label = new BarSeriesLabel();
        _this.tooltip = new BarSeriesTooltip();
        _this.flipXY = false;
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
        _this.groupScale = new bandScale_1.BandScale();
        _this._xKey = '';
        _this.xName = '';
        _this.cumYKeyCount = [];
        _this.flatYKeys = undefined; // only set when a user used a flat array for yKeys
        _this.hideInLegend = [];
        _this.yKeys = [];
        _this.yKeysCache = [];
        _this.visibles = [];
        _this._grouped = false;
        _this.stackGroups = {};
        /**
         * A map of `yKeys` to their names (used in legends and tooltips).
         * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
         */
        _this.yNames = {};
        _this.strokeWidth = 1;
        _this.shadow = undefined;
        _this.smallestDataInterval = undefined;
        _this.label.enabled = false;
        return _this;
    }
    BarSeries.prototype.resolveKeyDirection = function (direction) {
        return this.flipXY ? chartAxis_1.flipChartAxisDirection(direction) : direction;
    };
    Object.defineProperty(BarSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            this._xKey = value;
            this.processedData = undefined;
        },
        enumerable: false,
        configurable: true
    });
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
        if (!equal_1.areArrayItemsStrictlyEqual(this.yKeysCache, yKeys)) {
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
        var flattenFn = function (r, n) { return r.concat.apply(r, __spread((Array.isArray(n) ? n : [n]))); };
        var visibles = this.visibles.reduce(flattenFn, []);
        seriesItemEnabled.clear();
        var visiblesIdx = 0;
        this.yKeys.forEach(function (stack) {
            stack.forEach(function (yKey) { var _a; return seriesItemEnabled.set(yKey, (_a = visibles[visiblesIdx++]) !== null && _a !== void 0 ? _a : true); });
        });
    };
    Object.defineProperty(BarSeries.prototype, "grouped", {
        get: function () {
            return this._grouped;
        },
        set: function (value) {
            this._grouped = value;
        },
        enumerable: false,
        configurable: true
    });
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
    Object.defineProperty(BarSeries.prototype, "normalizedTo", {
        get: function () {
            return this._normalizedTo;
        },
        set: function (value) {
            var absValue = value ? Math.abs(value) : undefined;
            this._normalizedTo = absValue;
        },
        enumerable: false,
        configurable: true
    });
    BarSeries.prototype.processData = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var _f, xKey, seriesItemEnabled, normalizedTo, _g, data, isContinuousX, isContinuousY, activeSeriesItems, activeStacks, normaliseTo;
            return __generator(this, function (_h) {
                this.processYKeys();
                this.processYNames();
                _f = this, xKey = _f.xKey, seriesItemEnabled = _f.seriesItemEnabled, normalizedTo = _f.normalizedTo, _g = _f.data, data = _g === void 0 ? [] : _g;
                isContinuousX = ((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof continuousScale_1.ContinuousScale;
                isContinuousY = ((_b = this.getValueAxis()) === null || _b === void 0 ? void 0 : _b.scale) instanceof continuousScale_1.ContinuousScale;
                activeSeriesItems = __spread(seriesItemEnabled.entries()).filter(function (_a) {
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
                normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
                this.dataModel = new dataModel_1.DataModel({
                    props: __spread([
                        series_1.keyProperty(xKey, isContinuousX)
                    ], activeSeriesItems.map(function (yKey) { return series_1.valueProperty(yKey, isContinuousY, { invalidValue: null }); }), activeStacks.map(function (stack) { return series_1.sumProperties(stack); }), (isContinuousX ? [dataModel_1.SMALLEST_KEY_INTERVAL] : []), [
                        dataModel_1.SUM_VALUE_EXTENT,
                    ]),
                    groupByKeys: true,
                    dataVisible: this.visible && activeSeriesItems.length > 0,
                    normaliseTo: normaliseTo,
                });
                this.processedData = this.dataModel.processData(data);
                this.smallestDataInterval = {
                    x: (_e = (_d = (_c = this.processedData) === null || _c === void 0 ? void 0 : _c.reduced) === null || _d === void 0 ? void 0 : _d[dataModel_1.SMALLEST_KEY_INTERVAL.property]) !== null && _e !== void 0 ? _e : Infinity,
                    y: Infinity,
                };
                return [2 /*return*/];
            });
        });
    };
    BarSeries.prototype.getDomain = function (direction) {
        var _a = this, flipXY = _a.flipXY, processedData = _a.processedData;
        if (!processedData)
            return [];
        if (flipXY) {
            direction = chartAxis_1.flipChartAxisDirection(direction);
        }
        var _b = processedData, _c = __read(_b.defs.keys, 1), keyDef = _c[0], _d = _b.domain, _e = __read(_d.keys, 1), keys = _e[0], _f = __read(_d.values, 1), yExtent = _f[0], _g = _b.reduced, _h = _g === void 0 ? {} : _g, _j = dataModel_1.SMALLEST_KEY_INTERVAL.property, smallestX = _h[_j], _k = dataModel_1.SUM_VALUE_EXTENT.property, ySumExtent = _h[_k];
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            if (keyDef.valueType === 'category') {
                return keys;
            }
            var keysExtent = array_1.extent(keys) || [NaN, NaN];
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
    };
    BarSeries.prototype.getNodeClickEvent = function (event, datum) {
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    };
    BarSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent(this.xKey, datum.yKey, event, datum, this);
    };
    BarSeries.prototype.getCategoryAxis = function () {
        return this.flipXY ? this.yAxis : this.xAxis;
    };
    BarSeries.prototype.getValueAxis = function () {
        return this.flipXY ? this.xAxis : this.yAxis;
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
            var _a, data, visible, xAxis, yAxis, xScale, yScale, _b, groupScale, yKeys, xKey, cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, label, flipXY, seriesId, processedData, labelFontStyle, labelFontWeight, labelFontSize, labelFontFamily, labelColor, labelFormatter, labelPlacement, xBandWidth, availableRange, step, barWidth, contexts;
            var _this = this;
            return __generator(this, function (_c) {
                _a = this, data = _a.data, visible = _a.visible;
                xAxis = this.getCategoryAxis();
                yAxis = this.getValueAxis();
                if (!(data && visible && xAxis && yAxis)) {
                    return [2 /*return*/, []];
                }
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                _b = this, groupScale = _b.groupScale, yKeys = _b.yKeys, xKey = _b.xKey, cumYKeyCount = _b.cumYKeyCount, fills = _b.fills, strokes = _b.strokes, strokeWidth = _b.strokeWidth, seriesItemEnabled = _b.seriesItemEnabled, label = _b.label, flipXY = _b.flipXY, seriesId = _b.id, processedData = _b.processedData;
                labelFontStyle = label.fontStyle, labelFontWeight = label.fontWeight, labelFontSize = label.fontSize, labelFontFamily = label.fontFamily, labelColor = label.color, labelFormatter = label.formatter, labelPlacement = label.placement;
                xBandWidth = xScale.bandwidth;
                if (xScale instanceof continuousScale_1.ContinuousScale) {
                    availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
                    step = this.calculateStep(availableRange);
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
                            var labelText = void 0;
                            if (labelFormatter) {
                                labelText = labelFormatter({
                                    value: value_1.isNumber(yValue) ? yValue : undefined,
                                    seriesId: seriesId,
                                });
                            }
                            else {
                                labelText = value_1.isNumber(yValue) ? yValue.toFixed(2) : '';
                            }
                            var labelX = void 0;
                            var labelY = void 0;
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
                            var labelTextAlign = void 0;
                            var labelTextBaseline = void 0;
                            if (labelPlacement === 'inside') {
                                labelTextAlign = 'center';
                                labelTextBaseline = 'middle';
                            }
                            else {
                                labelTextAlign = flipXY ? (yValue >= 0 ? 'start' : 'end') : 'center';
                                labelTextBaseline = flipXY ? 'middle' : yValue >= 0 ? 'bottom' : 'top';
                            }
                            var colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                            var rect = {
                                x: flipXY ? Math.min(y, bottomY) : barX,
                                y: flipXY ? barX : Math.min(y, bottomY),
                                width: flipXY ? Math.abs(bottomY - y) : barWidth,
                                height: flipXY ? barWidth : Math.abs(bottomY - y),
                            };
                            var nodeMidPoint = {
                                x: rect.x + rect.width / 2,
                                y: rect.y + rect.height / 2,
                            };
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
                return [2 /*return*/, contexts.reduce(function (r, n) { return r.concat.apply(r, __spread(n)); }, [])];
            });
        });
    };
    BarSeries.prototype.nodeFactory = function () {
        return new rect_1.Rect();
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, isDatumHighlighted, _c, fills, strokes, seriesFillOpacity, strokeOpacity, shadow, formatter, xKey, flipXY, _d, highlightedFill, _e, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, seriesId, _f, visibleMin, visibleMax, isZoomed, crisp;
            var _this = this;
            return __generator(this, function (_g) {
                datumSelection = opts.datumSelection, isDatumHighlighted = opts.isHighlight;
                _c = this, fills = _c.fills, strokes = _c.strokes, seriesFillOpacity = _c.fillOpacity, strokeOpacity = _c.strokeOpacity, shadow = _c.shadow, formatter = _c.formatter, xKey = _c.xKey, flipXY = _c.flipXY, _d = _c.highlightStyle.item, highlightedFill = _d.fill, _e = _d.fillOpacity, highlightFillOpacity = _e === void 0 ? seriesFillOpacity : _e, highlightedStroke = _d.stroke, highlightedDatumStrokeWidth = _d.strokeWidth, seriesId = _c.id;
                _f = __read((_b = (_a = this.xAxis) === null || _a === void 0 ? void 0 : _a.visibleRange) !== null && _b !== void 0 ? _b : [], 2), visibleMin = _f[0], visibleMax = _f[1];
                isZoomed = visibleMin !== 0 || visibleMax !== 1;
                crisp = !isZoomed;
                datumSelection.each(function (rect, datum) {
                    var colorIndex = datum.colorIndex;
                    var fill = isDatumHighlighted && highlightedFill !== undefined
                        ? highlightedFill
                        : fills[colorIndex % fills.length];
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined
                        ? highlightedStroke
                        : strokes[colorIndex % fills.length];
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : _this.getStrokeWidth(_this.strokeWidth, datum);
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
                    var stackGroup = _this.getStackGroup(datum.yKey);
                    var format = undefined;
                    if (formatter) {
                        format = formatter({
                            datum: datum.datum,
                            fill: fill,
                            stroke: stroke,
                            strokeWidth: strokeWidth,
                            highlighted: isDatumHighlighted,
                            xKey: xKey,
                            yKey: datum.yKey,
                            seriesId: seriesId,
                            stackGroup: stackGroup,
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
                    rect.lineDash = _this.lineDash;
                    rect.lineDashOffset = _this.lineDashOffset;
                    rect.fillShadow = shadow;
                    // Prevent stroke from rendering for zero height columns and zero width bars.
                    rect.visible = flipXY ? datum.width > 0 : datum.height > 0;
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
                        text.pointerEvents = node_1.PointerEvents.None;
                    })];
            });
        });
    };
    BarSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, _a, labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color;
            return __generator(this, function (_b) {
                labelSelection = opts.labelSelection;
                _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
                labelSelection.each(function (text, datum) {
                    var label = datum.label;
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
                return [2 /*return*/];
            });
        });
    };
    BarSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKeys = _a.yKeys, processedData = _a.processedData;
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
        var _b = this, xName = _b.xName, yNames = _b.yNames, fills = _b.fills, strokes = _b.strokes, tooltip = _b.tooltip, formatter = _b.formatter, seriesId = _b.id;
        var tooltipRenderer = tooltip.renderer;
        var datum = nodeDatum.datum;
        var yName = yNames[yKey];
        var stackGroup = this.getStackGroup(yKey);
        var fill = fills[fillIndex % fills.length];
        var stroke = strokes[fillIndex % fills.length];
        var strokeWidth = this.getStrokeWidth(this.strokeWidth);
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = sanitize_1.sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitize_1.sanitizeHtml(yAxis.formatDatum(yValue));
        var title = sanitize_1.sanitizeHtml(yName);
        var content = xString + ': ' + yString;
        var format = undefined;
        if (formatter) {
            format = formatter({
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
        var color = (format && format.fill) || fill;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
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
        return tooltip_1.toTooltipHtml(defaults);
    };
    BarSeries.prototype.getLegendData = function () {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKeys = _a.yKeys, yNames = _a.yNames, cumYKeyCount = _a.cumYKeyCount, seriesItemEnabled = _a.seriesItemEnabled, hideInLegend = _a.hideInLegend, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, flipXY = _a.flipXY;
        if (!data || !data.length || !xKey || !yKeys.length) {
            return [];
        }
        var legendData = [];
        this.yKeys.forEach(function (stack, stackIndex) {
            // Column stacks should be listed in the legend in reverse order, for symmetry with the
            // vertical stack display order. Bar stacks are already consistent left-to-right with
            // the legend.
            var startLevel = flipXY ? 0 : stack.length - 1;
            var direction = flipXY ? 1 : -1;
            for (var levelIndex = startLevel, step = 0; step < stack.length; levelIndex += direction, step++) {
                var yKey = stack[levelIndex];
                if (hideInLegend.indexOf(yKey) >= 0) {
                    return;
                }
                var colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                legendData.push({
                    id: id,
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
    };
    BarSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        _super.prototype.toggleSeriesItem.call(this, itemId, enabled);
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
    BarSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    BarSeries.prototype.getBandScalePadding = function () {
        return { inner: 0.2, outer: 0.3 };
    };
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
    return BarSeries;
}(cartesianSeries_1.CartesianSeries));
exports.BarSeries = BarSeries;
//# sourceMappingURL=barSeries.js.map