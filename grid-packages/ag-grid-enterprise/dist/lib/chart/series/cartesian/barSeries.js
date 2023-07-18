"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnSeries = exports.BarSeries = void 0;
var rect_1 = require("../../../scene/shape/rect");
var bandScale_1 = require("../../../scale/bandScale");
var series_1 = require("../series");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var tooltip_1 = require("../../tooltip/tooltip");
var array_1 = require("../../../util/array");
var sanitize_1 = require("../../../util/sanitize");
var continuousScale_1 = require("../../../scale/continuousScale");
var validation_1 = require("../../../util/validation");
var categoryAxis_1 = require("../../axis/categoryAxis");
var groupedCategoryAxis_1 = require("../../axis/groupedCategoryAxis");
var logAxis_1 = require("../../axis/logAxis");
var processors_1 = require("../../data/processors");
var easing = require("../../../motion/easing");
var barUtil_1 = require("./barUtil");
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
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries(moduleCtx) {
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            hasHighlightedLabels: true,
        }) || this;
        _this.label = new BarSeriesLabel();
        _this.tooltip = new BarSeriesTooltip();
        _this.fill = '#c16068';
        _this.stroke = '#874349';
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.formatter = undefined;
        _this.xKey = undefined;
        _this.xName = undefined;
        _this.yKey = undefined;
        _this.yName = undefined;
        /**
         * Used to get the position of bars within each group.
         */
        _this.groupScale = new bandScale_1.BandScale();
        _this.stackGroup = undefined;
        _this.strokeWidth = 1;
        _this.shadow = undefined;
        _this.smallestDataInterval = undefined;
        _this.datumSelectionGarbageCollection = false;
        _this.label.enabled = false;
        return _this;
    }
    BarSeries.prototype.resolveKeyDirection = function (direction) {
        if (this.getBarDirection() === chartAxisDirection_1.ChartAxisDirection.X) {
            if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
                return chartAxisDirection_1.ChartAxisDirection.Y;
            }
            return chartAxisDirection_1.ChartAxisDirection.X;
        }
        return direction;
    };
    BarSeries.prototype.processData = function (dataController) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var _f, xKey, yKey, normalizedTo, _g, _h, _j, groupIndex, _k, data, normalizedToAbs, isContinuousX, isContinuousY, stackGroupName, stackGroupTrailingName, normaliseTo, extraProps, _l, dataModel, processedData;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        _f = this, xKey = _f.xKey, yKey = _f.yKey, normalizedTo = _f.normalizedTo, _g = _f.seriesGrouping, _h = _g === void 0 ? {} : _g, _j = _h.groupIndex, groupIndex = _j === void 0 ? this.id : _j, _k = _f.data, data = _k === void 0 ? [] : _k;
                        normalizedToAbs = Math.abs(normalizedTo !== null && normalizedTo !== void 0 ? normalizedTo : NaN);
                        isContinuousX = ((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof continuousScale_1.ContinuousScale;
                        isContinuousY = ((_b = this.getValueAxis()) === null || _b === void 0 ? void 0 : _b.scale) instanceof continuousScale_1.ContinuousScale;
                        stackGroupName = "bar-stack-" + groupIndex + "-yValues";
                        stackGroupTrailingName = stackGroupName + "-trailing";
                        normaliseTo = normalizedToAbs && isFinite(normalizedToAbs) ? normalizedToAbs : undefined;
                        extraProps = [];
                        if (normaliseTo) {
                            extraProps.push(processors_1.normaliseGroupTo(this, [stackGroupName, stackGroupTrailingName], normaliseTo, 'range'));
                        }
                        if (!((_c = this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.skipAnimations) && this.processedData) {
                            extraProps.push(processors_1.diff(this.processedData));
                        }
                        return [4 /*yield*/, dataController.request(this.id, data, {
                                props: __spreadArray(__spreadArray(__spreadArray(__spreadArray([
                                    series_1.keyProperty(this, xKey, isContinuousX, { id: 'xValue' }),
                                    series_1.valueProperty(this, yKey, isContinuousY, { id: "yValue-raw", invalidValue: null })
                                ], __read(series_1.groupAccumulativeValueProperty(this, yKey, isContinuousY, 'normal', 'current', {
                                    id: "yValue-end",
                                    invalidValue: null,
                                    groupId: stackGroupName,
                                }))), __read(series_1.groupAccumulativeValueProperty(this, yKey, isContinuousY, 'trailing', 'current', {
                                    id: "yValue-start",
                                    invalidValue: null,
                                    groupId: stackGroupTrailingName,
                                }))), __read((isContinuousX ? [processors_1.SMALLEST_KEY_INTERVAL] : []))), __read(extraProps)),
                                groupByKeys: true,
                                dataVisible: this.visible,
                            })];
                    case 1:
                        _l = _m.sent(), dataModel = _l.dataModel, processedData = _l.processedData;
                        this.dataModel = dataModel;
                        this.processedData = processedData;
                        this.smallestDataInterval = {
                            x: (_e = (_d = processedData.reduced) === null || _d === void 0 ? void 0 : _d[processors_1.SMALLEST_KEY_INTERVAL.property]) !== null && _e !== void 0 ? _e : Infinity,
                            y: Infinity,
                        };
                        this.animationState.transition('updateData');
                        return [2 /*return*/];
                }
            });
        });
    };
    BarSeries.prototype.getDomain = function (direction) {
        var _a;
        var _b = this, processedData = _b.processedData, dataModel = _b.dataModel;
        if (!processedData || !dataModel)
            return [];
        var _c = processedData, _d = _c.reduced, _e = _d === void 0 ? {} : _d, _f = processors_1.SMALLEST_KEY_INTERVAL.property, smallestX = _e[_f];
        var categoryAxis = this.getCategoryAxis();
        var valueAxis = this.getValueAxis();
        var keyDef = dataModel.resolveProcessedDataDefById(this, "xValue");
        var keys = dataModel.getDomain(this, "xValue", 'key', processedData);
        var yExtent = dataModel.getDomain(this, "yValue-end", 'value', processedData);
        if (direction === this.getCategoryDirection()) {
            if ((keyDef === null || keyDef === void 0 ? void 0 : keyDef.def.type) === 'key' && (keyDef === null || keyDef === void 0 ? void 0 : keyDef.def.valueType) === 'category') {
                return keys;
            }
            var scalePadding = isFinite(smallestX) ? smallestX : 0;
            var keysExtent = (_a = array_1.extent(keys)) !== null && _a !== void 0 ? _a : [NaN, NaN];
            if (direction === chartAxisDirection_1.ChartAxisDirection.Y) {
                return this.fixNumericExtent([keysExtent[0] + -scalePadding, keysExtent[1]], categoryAxis);
            }
            return this.fixNumericExtent([keysExtent[0], keysExtent[1] + scalePadding], categoryAxis);
        }
        else if (this.getValueAxis() instanceof logAxis_1.LogAxis) {
            return this.fixNumericExtent(yExtent, valueAxis);
        }
        else {
            var fixedYExtent = [yExtent[0] > 0 ? 0 : yExtent[0], yExtent[1] < 0 ? 0 : yExtent[1]];
            return this.fixNumericExtent(fixedYExtent, valueAxis);
        }
    };
    BarSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a;
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    BarSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a;
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    BarSeries.prototype.getCategoryAxis = function () {
        var direction = this.getCategoryDirection();
        return this.axes[direction];
    };
    BarSeries.prototype.getValueAxis = function () {
        var direction = this.getBarDirection();
        return this.axes[direction];
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
            var _a, visible, dataModel, xAxis, yAxis, xScale, yScale, _b, groupScale, _c, yKey, _d, xKey, fill, stroke, strokeWidth, label, seriesId, processedData, ctx, seriesStateManager, xBandWidth, availableRange, step, domain, _e, groupIndex, visibleGroupCount, groupIdx, barWidth, xIndex, yRawIndex, yStartIndex, yEndIndex, context;
            var _this = this;
            return __generator(this, function (_f) {
                _a = this, visible = _a.visible, dataModel = _a.dataModel;
                xAxis = this.getCategoryAxis();
                yAxis = this.getValueAxis();
                if (!(dataModel && visible && xAxis && yAxis)) {
                    return [2 /*return*/, []];
                }
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                _b = this, groupScale = _b.groupScale, _c = _b.yKey, yKey = _c === void 0 ? '' : _c, _d = _b.xKey, xKey = _d === void 0 ? '' : _d, fill = _b.fill, stroke = _b.stroke, strokeWidth = _b.strokeWidth, label = _b.label, seriesId = _b.id, processedData = _b.processedData, ctx = _b.ctx, seriesStateManager = _b.ctx.seriesStateManager;
                xBandWidth = xScale.bandwidth;
                if (xScale instanceof continuousScale_1.ContinuousScale) {
                    availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
                    step = this.calculateStep(availableRange);
                    xBandWidth = step;
                }
                domain = [];
                _e = seriesStateManager.getVisiblePeerGroupIndex(this), groupIndex = _e.index, visibleGroupCount = _e.visibleGroupCount;
                for (groupIdx = 0; groupIdx < visibleGroupCount; groupIdx++) {
                    domain.push(String(groupIdx));
                }
                groupScale.domain = domain;
                groupScale.range = [0, xBandWidth !== null && xBandWidth !== void 0 ? xBandWidth : 0];
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
                xIndex = dataModel.resolveProcessedDataIndexById(this, "xValue", 'key').index;
                yRawIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-raw").index;
                yStartIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-start").index;
                yEndIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-end").index;
                context = {
                    itemId: yKey,
                    nodeData: [],
                    labelData: [],
                };
                processedData === null || processedData === void 0 ? void 0 : processedData.data.forEach(function (_a, dataIndex) {
                    var keys = _a.keys, seriesDatum = _a.datum, values = _a.values;
                    var xValue = keys[xIndex];
                    var x = xScale.convert(xValue);
                    var currY = +values[0][yEndIndex];
                    var prevY = +values[0][yStartIndex];
                    var yRawValue = values[0][yRawIndex];
                    var barX = x + groupScale.convert(String(groupIndex));
                    // Bars outside of visible range are not rendered, so we create node data
                    // only for the visible subset of user data.
                    if (!xAxis.inRange(barX, barWidth)) {
                        return;
                    }
                    if (isNaN(currY)) {
                        return;
                    }
                    var y = yScale.convert(currY, { strict: false });
                    var bottomY = yScale.convert(prevY, { strict: false });
                    var barAlongX = _this.getBarDirection() === chartAxisDirection_1.ChartAxisDirection.X;
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
                    var _b = barUtil_1.createLabelData({ value: yRawValue, rect: rect, formatter: formatter, placement: placement, seriesId: seriesId, barAlongX: barAlongX, ctx: ctx }), labelText = _b.text, labelTextAlign = _b.textAlign, labelTextBaseline = _b.textBaseline, labelX = _b.x, labelY = _b.y;
                    var nodeData = {
                        index: dataIndex,
                        series: _this,
                        itemId: yKey,
                        datum: seriesDatum[0],
                        cumulativeValue: prevY + currY,
                        xValue: xValue,
                        yValue: yRawValue,
                        yKey: yKey,
                        xKey: xKey,
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                        nodeMidPoint: nodeMidPoint,
                        fill: fill,
                        stroke: stroke,
                        strokeWidth: strokeWidth,
                        label: labelText
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
                    context.nodeData.push(nodeData);
                    context.labelData.push(nodeData);
                });
                return [2 /*return*/, [context]];
            });
        });
    };
    BarSeries.prototype.nodeFactory = function () {
        return new rect_1.Rect();
    };
    BarSeries.prototype.updateDatumSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, datumSelection, getDatumId;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, datumSelection = opts.datumSelection;
                getDatumId = function (datum) { return datum.xValue; };
                return [2 /*return*/, datumSelection.update(nodeData, function (rect) { return (rect.tag = BarSeriesNodeTag.Bar); }, getDatumId)];
            });
        });
    };
    BarSeries.prototype.updateDatumNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, isHighlight, _a, fill, stroke, fillOpacity, strokeOpacity, lineDash, lineDashOffset, shadow, formatter, seriesId, itemHighlightStyle, ctx, stackGroup, xAxis, crisp, categoryAlongX;
            var _this = this;
            return __generator(this, function (_b) {
                datumSelection = opts.datumSelection, isHighlight = opts.isHighlight;
                _a = this, fill = _a.fill, stroke = _a.stroke, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, lineDash = _a.lineDash, lineDashOffset = _a.lineDashOffset, shadow = _a.shadow, formatter = _a.formatter, seriesId = _a.id, itemHighlightStyle = _a.highlightStyle.item, ctx = _a.ctx, stackGroup = _a.stackGroup;
                xAxis = this.axes[chartAxisDirection_1.ChartAxisDirection.X];
                crisp = barUtil_1.checkCrisp(xAxis === null || xAxis === void 0 ? void 0 : xAxis.visibleRange);
                categoryAlongX = this.getCategoryDirection() === chartAxisDirection_1.ChartAxisDirection.X;
                datumSelection.each(function (rect, datum) {
                    var style = {
                        fill: fill,
                        stroke: stroke,
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity,
                        lineDash: lineDash,
                        lineDashOffset: lineDashOffset,
                        fillShadow: shadow,
                        strokeWidth: _this.getStrokeWidth(_this.strokeWidth, datum),
                    };
                    var visible = categoryAlongX ? datum.width > 0 : datum.height > 0;
                    var config = barUtil_1.getRectConfig({
                        datum: datum,
                        isHighlighted: isHighlight,
                        style: style,
                        highlightStyle: itemHighlightStyle,
                        formatter: formatter,
                        seriesId: seriesId,
                        stackGroup: stackGroup,
                        ctx: ctx,
                    });
                    config.crisp = crisp;
                    config.visible = visible;
                    barUtil_1.updateRect({ rect: rect, config: config });
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
            var labelSelection;
            var _this = this;
            return __generator(this, function (_a) {
                labelSelection = opts.labelSelection;
                labelSelection.each(function (text, datum) {
                    var labelDatum = datum.label;
                    barUtil_1.updateLabel({ labelNode: text, labelDatum: labelDatum, config: _this.label, visible: true });
                });
                return [2 /*return*/];
            });
        });
    };
    BarSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a;
        var _b = this, xKey = _b.xKey, yKey = _b.yKey, processedData = _b.processedData, callbackCache = _b.ctx.callbackCache;
        var xAxis = this.getCategoryAxis();
        var yAxis = this.getValueAxis();
        var xValue = nodeDatum.xValue, yValue = nodeDatum.yValue, datum = nodeDatum.datum;
        if (!processedData || !xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _c = this, xName = _c.xName, yName = _c.yName, fill = _c.fill, stroke = _c.stroke, tooltip = _c.tooltip, formatter = _c.formatter, seriesId = _c.id, stackGroup = _c.stackGroup;
        var tooltipRenderer = tooltip.renderer;
        var strokeWidth = this.getStrokeWidth(this.strokeWidth);
        var xString = sanitize_1.sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitize_1.sanitizeHtml(yAxis.formatDatum(yValue));
        var title = sanitize_1.sanitizeHtml(yName);
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
        var _a;
        var _b = this, id = _b.id, data = _b.data, xKey = _b.xKey, yKey = _b.yKey, yName = _b.yName, legendItemName = _b.legendItemName, fill = _b.fill, stroke = _b.stroke, fillOpacity = _b.fillOpacity, strokeOpacity = _b.strokeOpacity, visible = _b.visible, showInLegend = _b.showInLegend;
        if (!showInLegend || !(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKey) {
            return [];
        }
        var legendData = [];
        legendData.push({
            legendType: 'category',
            id: id,
            itemId: yKey,
            seriesId: id,
            enabled: visible,
            label: {
                text: (_a = legendItemName !== null && legendItemName !== void 0 ? legendItemName : yName) !== null && _a !== void 0 ? _a : yKey,
            },
            legendItemName: legendItemName,
            marker: {
                fill: fill,
                stroke: stroke,
                fillOpacity: fillOpacity,
                strokeOpacity: strokeOpacity,
            },
        });
        return legendData;
    };
    BarSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var _b, _c;
        var datumSelections = _a.datumSelections, labelSelections = _a.labelSelections;
        var duration = (_c = (_b = this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.defaultOptions.duration) !== null && _c !== void 0 ? _c : 1000;
        var labelDuration = 200;
        var _d = this.getDirectionStartingValues(datumSelections), startingX = _d.startingX, startingY = _d.startingY;
        datumSelections.forEach(function (datumSelection) {
            datumSelection.each(function (rect, datum) {
                var _a;
                var contextX = startingX;
                var contextWidth = 0;
                var contextY = datum.y;
                var contextHeight = datum.height;
                if (_this.getBarDirection() === chartAxisDirection_1.ChartAxisDirection.Y) {
                    contextX = datum.x;
                    contextWidth = datum.width;
                    contextY = startingY;
                    contextHeight = 0;
                }
                var props = [
                    { from: contextX, to: datum.x },
                    { from: contextWidth, to: datum.width },
                    { from: contextY, to: datum.y },
                    { from: contextHeight, to: datum.height },
                ];
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(_this.id + "_empty-update-ready_" + rect.id, props, {
                    duration: duration,
                    ease: easing.easeOut,
                    onUpdate: function (_a) {
                        var _b = __read(_a, 4), x = _b[0], width = _b[1], y = _b[2], height = _b[3];
                        rect.x = x;
                        rect.width = width;
                        rect.y = y;
                        rect.height = height;
                    },
                });
            });
        });
        labelSelections.forEach(function (labelSelection) {
            labelSelection.each(function (label) {
                var _a;
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: duration,
                    duration: labelDuration,
                    onUpdate: function (opacity) {
                        label.opacity = opacity;
                    },
                });
            });
        });
    };
    BarSeries.prototype.animateReadyHighlight = function (highlightSelection) {
        this.resetSelectionRects(highlightSelection);
    };
    BarSeries.prototype.animateReadyResize = function (_a) {
        var _this = this;
        var _b;
        var datumSelections = _a.datumSelections;
        (_b = this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.reset();
        datumSelections.forEach(function (datumSelection) {
            _this.resetSelectionRects(datumSelection);
        });
    };
    BarSeries.prototype.animateWaitingUpdateReady = function (_a) {
        var _this = this;
        var _b, _c, _d, _e, _f;
        var datumSelections = _a.datumSelections, labelSelections = _a.labelSelections;
        var processedData = this.processedData;
        var diff = (_b = processedData === null || processedData === void 0 ? void 0 : processedData.reduced) === null || _b === void 0 ? void 0 : _b.diff;
        if (!(diff === null || diff === void 0 ? void 0 : diff.changed)) {
            datumSelections.forEach(function (datumSelection) {
                _this.resetSelectionRects(datumSelection);
            });
            return;
        }
        var totalDuration = (_d = (_c = this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.defaultOptions.duration) !== null && _d !== void 0 ? _d : 1000;
        var labelDuration = 200;
        var sectionDuration = totalDuration;
        if (diff.added.length > 0 || diff.removed.length > 0) {
            sectionDuration = Math.floor(totalDuration / 2);
        }
        var _g = this.getDirectionStartingValues(datumSelections), startingX = _g.startingX, startingY = _g.startingY;
        var datumIdKey = (_f = (_e = this.processedData) === null || _e === void 0 ? void 0 : _e.defs.keys) === null || _f === void 0 ? void 0 : _f[0];
        var addedIds = {};
        diff.added.forEach(function (d) {
            addedIds[d[0]] = true;
        });
        var removedIds = {};
        diff.removed.forEach(function (d) {
            removedIds[d[0]] = true;
        });
        var rectThrottleGroup = this.id + "_" + Math.random();
        var labelThrottleGroup = this.id + "_" + Math.random();
        datumSelections.forEach(function (datumSelection) {
            datumSelection.each(function (rect, datum) {
                var _a;
                var props = [
                    { from: rect.x, to: datum.x },
                    { from: rect.width, to: datum.width },
                    { from: rect.y, to: datum.y },
                    { from: rect.height, to: datum.height },
                ];
                var delay = diff.removed.length > 0 ? sectionDuration : 0;
                var duration = sectionDuration;
                var cleanup = false;
                var datumId = datumIdKey ? datum.xValue : '';
                var contextX = startingX;
                var contextWidth = 0;
                var contextY = datum.y;
                var contextHeight = datum.height;
                if (_this.getBarDirection() === chartAxisDirection_1.ChartAxisDirection.Y) {
                    contextX = datum.x;
                    contextWidth = datum.width;
                    contextY = startingY;
                    contextHeight = 0;
                }
                var isAdded = datumId !== undefined && addedIds[datumId] !== undefined;
                var isRemoved = datumId !== undefined && removedIds[datumId] !== undefined;
                if (isAdded) {
                    props = [
                        { from: contextX, to: datum.x },
                        { from: contextWidth, to: datum.width },
                        { from: contextY, to: datum.y },
                        { from: contextHeight, to: datum.height },
                    ];
                    duration = sectionDuration;
                }
                else if (isRemoved) {
                    props = [
                        { from: datum.x, to: contextX },
                        { from: datum.width, to: contextWidth },
                        { from: datum.y, to: contextY },
                        { from: datum.height, to: contextHeight },
                    ];
                    delay = 0;
                    duration = sectionDuration;
                    cleanup = true;
                }
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateManyWithThrottle(_this.id + "_waiting-update-ready_" + rect.id, props, {
                    delay: delay,
                    duration: duration,
                    ease: easing.easeOut,
                    throttleId: _this.id + "_rects",
                    throttleGroup: rectThrottleGroup,
                    onUpdate: function (_a) {
                        var _b = __read(_a, 4), x = _b[0], width = _b[1], y = _b[2], height = _b[3];
                        rect.x = x;
                        rect.width = width;
                        rect.y = y;
                        rect.height = height;
                    },
                    onComplete: function () {
                        if (cleanup)
                            datumSelection.cleanup();
                    },
                });
            });
        });
        labelSelections.forEach(function (labelSelection) {
            labelSelection.each(function (label) {
                var _a;
                label.opacity = 0;
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateWithThrottle(_this.id + "_waiting-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: totalDuration,
                    duration: labelDuration,
                    throttleId: _this.id + "_labels",
                    throttleGroup: labelThrottleGroup,
                    onUpdate: function (opacity) {
                        label.opacity = opacity;
                    },
                });
            });
        });
    };
    BarSeries.prototype.resetSelectionRects = function (selection) {
        selection.each(function (rect, datum) {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
        selection.cleanup();
    };
    BarSeries.prototype.getDirectionStartingValues = function (datumSelections) {
        var isColumnSeries = this.getBarDirection() === chartAxisDirection_1.ChartAxisDirection.Y;
        var xAxis = this.axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = this.axes[chartAxisDirection_1.ChartAxisDirection.Y];
        var isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof continuousScale_1.ContinuousScale;
        var isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof continuousScale_1.ContinuousScale;
        var startingX = Infinity;
        var startingY = 0;
        if (yAxis && isColumnSeries) {
            if (isContinuousY) {
                startingY = yAxis.scale.convert(0);
            }
            else {
                datumSelections.forEach(function (datumSelection) {
                    return datumSelection.each(function (_, datum) {
                        if (datum.yValue >= 0) {
                            startingY = Math.max(startingY, datum.height + datum.y);
                        }
                    });
                });
            }
        }
        if (xAxis && !isColumnSeries) {
            if (isContinuousX) {
                startingX = xAxis.scale.convert(0);
            }
            else {
                datumSelections.forEach(function (datumSelection) {
                    return datumSelection.each(function (_, datum) {
                        if (datum.yValue >= 0) {
                            startingX = Math.min(startingX, datum.x);
                        }
                    });
                });
            }
        }
        return { startingX: startingX, startingY: startingY };
    };
    BarSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    BarSeries.prototype.getBandScalePadding = function () {
        return { inner: 0.2, outer: 0.3 };
    };
    BarSeries.prototype.getBarDirection = function () {
        return chartAxisDirection_1.ChartAxisDirection.X;
    };
    BarSeries.prototype.getCategoryDirection = function () {
        return chartAxisDirection_1.ChartAxisDirection.Y;
    };
    BarSeries.className = 'BarSeries';
    BarSeries.type = 'bar';
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], BarSeries.prototype, "fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], BarSeries.prototype, "stroke", void 0);
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
        validation_1.Validate(validation_1.OPT_STRING)
    ], BarSeries.prototype, "xKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], BarSeries.prototype, "xName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], BarSeries.prototype, "yKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], BarSeries.prototype, "yName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], BarSeries.prototype, "stackGroup", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER())
    ], BarSeries.prototype, "normalizedTo", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], BarSeries.prototype, "strokeWidth", void 0);
    return BarSeries;
}(cartesianSeries_1.CartesianSeries));
exports.BarSeries = BarSeries;
var ColumnSeries = /** @class */ (function (_super) {
    __extends(ColumnSeries, _super);
    function ColumnSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnSeries.prototype.getBarDirection = function () {
        return chartAxisDirection_1.ChartAxisDirection.Y;
    };
    ColumnSeries.prototype.getCategoryDirection = function () {
        return chartAxisDirection_1.ChartAxisDirection.X;
    };
    ColumnSeries.type = 'column';
    ColumnSeries.className = 'ColumnSeries';
    return ColumnSeries;
}(BarSeries));
exports.ColumnSeries = ColumnSeries;
//# sourceMappingURL=barSeries.js.map