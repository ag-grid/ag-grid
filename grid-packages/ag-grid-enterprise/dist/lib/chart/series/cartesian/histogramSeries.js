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
exports.HistogramSeries = void 0;
var rect_1 = require("../../../scene/shape/rect");
var series_1 = require("../series");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var tooltip_1 = require("../../tooltip/tooltip");
var ticks_1 = require("../../../util/ticks");
var sanitize_1 = require("../../../util/sanitize");
var validation_1 = require("../../../util/validation");
var dataModel_1 = require("../../data/dataModel");
var aggregateFunctions_1 = require("../../data/aggregateFunctions");
var processors_1 = require("../../data/processors");
var easing = require("../../../motion/easing");
var HISTOGRAM_AGGREGATIONS = ['count', 'sum', 'mean'];
var HISTOGRAM_AGGREGATION = validation_1.predicateWithMessage(function (v) { return HISTOGRAM_AGGREGATIONS.includes(v); }, "expecting a histogram aggregation keyword such as 'count', 'sum' or 'mean");
var HistogramSeriesNodeTag;
(function (HistogramSeriesNodeTag) {
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Bin"] = 0] = "Bin";
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Label"] = 1] = "Label";
})(HistogramSeriesNodeTag || (HistogramSeriesNodeTag = {}));
var HistogramSeriesLabel = /** @class */ (function (_super) {
    __extends(HistogramSeriesLabel, _super);
    function HistogramSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], HistogramSeriesLabel.prototype, "formatter", void 0);
    return HistogramSeriesLabel;
}(label_1.Label));
var defaultBinCount = 10;
var HistogramSeriesTooltip = /** @class */ (function (_super) {
    __extends(HistogramSeriesTooltip, _super);
    function HistogramSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], HistogramSeriesTooltip.prototype, "renderer", void 0);
    return HistogramSeriesTooltip;
}(series_1.SeriesTooltip));
var HistogramSeries = /** @class */ (function (_super) {
    __extends(HistogramSeries, _super);
    function HistogramSeries(moduleCtx) {
        var _this = _super.call(this, { moduleCtx: moduleCtx, pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
        _this.label = new HistogramSeriesLabel();
        _this.tooltip = new HistogramSeriesTooltip();
        _this.fill = undefined;
        _this.stroke = undefined;
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.xKey = undefined;
        _this.areaPlot = false;
        _this.bins = undefined;
        _this.aggregation = 'count';
        _this.binCount = undefined;
        _this.xName = undefined;
        _this.yKey = undefined;
        _this.yName = undefined;
        _this.strokeWidth = 1;
        _this.shadow = undefined;
        _this.calculatedBins = [];
        _this.datumSelectionGarbageCollection = false;
        _this.label.enabled = false;
        return _this;
    }
    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    HistogramSeries.prototype.deriveBins = function (xDomain) {
        if (this.binCount === undefined) {
            var binStarts = ticks_1.default(xDomain[0], xDomain[1], defaultBinCount);
            var binSize_1 = ticks_1.tickStep(xDomain[0], xDomain[1], defaultBinCount);
            var firstBinEnd = binStarts[0];
            var expandStartToBin = function (n) { return [n, n + binSize_1]; };
            return __spreadArray([[firstBinEnd - binSize_1, firstBinEnd]], __read(binStarts.map(expandStartToBin)));
        }
        else {
            return this.calculateNiceBins(xDomain, this.binCount);
        }
    };
    HistogramSeries.prototype.calculateNiceBins = function (domain, binCount) {
        var startGuess = Math.floor(domain[0]);
        var stop = domain[1];
        var segments = binCount || 1;
        var _a = this.calculateNiceStart(startGuess, stop, segments), start = _a.start, binSize = _a.binSize;
        return this.getBins(start, stop, binSize, segments);
    };
    HistogramSeries.prototype.getBins = function (start, stop, step, count) {
        var bins = [];
        for (var i = 0; i < count; i++) {
            var a = Math.round((start + i * step) * 10) / 10;
            var b = Math.round((start + (i + 1) * step) * 10) / 10;
            if (i === count - 1) {
                b = Math.max(b, stop);
            }
            bins[i] = [a, b];
        }
        return bins;
    };
    HistogramSeries.prototype.calculateNiceStart = function (a, b, segments) {
        var binSize = Math.abs(b - a) / segments;
        var order = Math.floor(Math.log10(binSize));
        var magnitude = Math.pow(10, order);
        var start = Math.floor(a / magnitude) * magnitude;
        return {
            start: start,
            binSize: binSize,
        };
    };
    HistogramSeries.prototype.processData = function (dataController) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, xKey, yKey, data, areaPlot, aggregation, props, aggProp, aggProp, groupByFn, _c, dataModel, processedData;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, xKey = _b.xKey, yKey = _b.yKey, data = _b.data, areaPlot = _b.areaPlot, aggregation = _b.aggregation;
                        props = [series_1.keyProperty(this, xKey, true), processors_1.SORT_DOMAIN_GROUPS];
                        if (yKey) {
                            aggProp = aggregateFunctions_1.groupCount(this, 'groupCount');
                            if (aggregation === 'count') {
                                // Nothing to do.
                            }
                            else if (aggregation === 'sum') {
                                aggProp = aggregateFunctions_1.groupSum(this, 'groupAgg');
                            }
                            else if (aggregation === 'mean') {
                                aggProp = aggregateFunctions_1.groupAverage(this, 'groupAgg');
                            }
                            if (areaPlot) {
                                aggProp = aggregateFunctions_1.area(this, 'groupAgg', aggProp);
                            }
                            props.push(series_1.valueProperty(this, yKey, true, { invalidValue: undefined }), aggProp);
                        }
                        else {
                            aggProp = aggregateFunctions_1.groupCount(this, 'groupAgg');
                            if (areaPlot) {
                                aggProp = aggregateFunctions_1.area(this, 'groupAgg', aggProp);
                            }
                            props.push(aggProp);
                        }
                        groupByFn = function (dataSet) {
                            var _a;
                            var xExtent = dataModel_1.fixNumericExtent(dataSet.domain.keys[0]);
                            if (xExtent.length === 0) {
                                // No buckets can be calculated.
                                dataSet.domain.groups = [];
                                return function () { return []; };
                            }
                            var bins = (_a = _this.bins) !== null && _a !== void 0 ? _a : _this.deriveBins(xExtent);
                            var binCount = bins.length;
                            _this.calculatedBins = __spreadArray([], __read(bins));
                            return function (item) {
                                var xValue = item.keys[0];
                                for (var i = 0; i < binCount; i++) {
                                    var nextBin = bins[i];
                                    if (xValue >= nextBin[0] && xValue < nextBin[1]) {
                                        return nextBin;
                                    }
                                    if (i === binCount - 1 && xValue <= nextBin[1]) {
                                        // Handle edge case of a value being at the maximum extent, and the
                                        // final bin aligning with it.
                                        return nextBin;
                                    }
                                }
                                return [];
                            };
                        };
                        if (!((_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.skipAnimations) && this.processedData) {
                            props.push(processors_1.diff(this.processedData, false));
                        }
                        return [4 /*yield*/, dataController.request(this.id, data !== null && data !== void 0 ? data : [], {
                                props: props,
                                dataVisible: this.visible,
                                groupByFn: groupByFn,
                            })];
                    case 1:
                        _c = _d.sent(), dataModel = _c.dataModel, processedData = _c.processedData;
                        this.dataModel = dataModel;
                        this.processedData = processedData;
                        this.animationState.transition('updateData');
                        return [2 /*return*/];
                }
            });
        });
    };
    HistogramSeries.prototype.getDomain = function (direction) {
        var _a, _b, _c, _d;
        var _e = this, processedData = _e.processedData, dataModel = _e.dataModel;
        if (!processedData || !dataModel)
            return [];
        var yDomain = dataModel.getDomain(this, "groupAgg", 'aggregate', processedData);
        var xDomainMin = (_a = this.calculatedBins) === null || _a === void 0 ? void 0 : _a[0][0];
        var xDomainMax = (_b = this.calculatedBins) === null || _b === void 0 ? void 0 : _b[((_d = (_c = this.calculatedBins) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) - 1][1];
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            return dataModel_1.fixNumericExtent([xDomainMin, xDomainMax]);
        }
        return dataModel_1.fixNumericExtent(yDomain);
    };
    HistogramSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a, _b;
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    HistogramSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a, _b;
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    HistogramSeries.prototype.createNodeData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, axes, processedData, callbackCache, xAxis, yAxis, xScale, yScale, _c, fill, stroke, strokeWidth, seriesId, _d, yKey, _e, xKey, nodeData, defaultLabelFormatter, _f, _g, labelFormatter, labelFontStyle, labelFontWeight, labelFontSize, labelFontFamily, labelColor;
            var _this = this;
            return __generator(this, function (_h) {
                _b = this, axes = _b.axes, processedData = _b.processedData, callbackCache = _b.ctx.callbackCache;
                xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
                yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
                if (!this.visible || !xAxis || !yAxis || !processedData || processedData.type !== 'grouped') {
                    return [2 /*return*/, []];
                }
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                _c = this, fill = _c.fill, stroke = _c.stroke, strokeWidth = _c.strokeWidth, seriesId = _c.id, _d = _c.yKey, yKey = _d === void 0 ? '' : _d, _e = _c.xKey, xKey = _e === void 0 ? '' : _e;
                nodeData = [];
                defaultLabelFormatter = function (params) { return String(params.value); };
                _f = this.label, _g = _f.formatter, labelFormatter = _g === void 0 ? defaultLabelFormatter : _g, labelFontStyle = _f.fontStyle, labelFontWeight = _f.fontWeight, labelFontSize = _f.fontSize, labelFontFamily = _f.fontFamily, labelColor = _f.color;
                processedData.data.forEach(function (group) {
                    var _a;
                    var _b = group.aggValues, _c = _b === void 0 ? [[0, 0]] : _b, _d = __read(_c, 1), _e = __read(_d[0], 2), negativeAgg = _e[0], positiveAgg = _e[1], datum = group.datum, frequency = group.datum.length, domain = group.keys, _f = __read(group.keys, 2), xDomainMin = _f[0], xDomainMax = _f[1];
                    var xMinPx = xScale.convert(xDomainMin);
                    var xMaxPx = xScale.convert(xDomainMax);
                    var total = negativeAgg + positiveAgg;
                    var yZeroPx = yScale.convert(0);
                    var yMaxPx = yScale.convert(total);
                    var w = xMaxPx - xMinPx;
                    var h = Math.abs(yMaxPx - yZeroPx);
                    var selectionDatumLabel = total !== 0
                        ? {
                            text: (_a = callbackCache.call(labelFormatter, { value: total, seriesId: seriesId })) !== null && _a !== void 0 ? _a : String(total),
                            fontStyle: labelFontStyle,
                            fontWeight: labelFontWeight,
                            fontSize: labelFontSize,
                            fontFamily: labelFontFamily,
                            fill: labelColor,
                            x: xMinPx + w / 2,
                            y: yMaxPx + h / 2,
                        }
                        : undefined;
                    var nodeMidPoint = {
                        x: xMinPx + w / 2,
                        y: yMaxPx + h / 2,
                    };
                    nodeData.push({
                        series: _this,
                        datum: datum,
                        // since each selection is an aggregation of multiple data.
                        aggregatedValue: total,
                        frequency: frequency,
                        domain: domain,
                        yKey: yKey,
                        xKey: xKey,
                        x: xMinPx,
                        y: yMaxPx,
                        xValue: xMinPx,
                        yValue: yMaxPx,
                        width: w,
                        height: h,
                        nodeMidPoint: nodeMidPoint,
                        fill: fill,
                        stroke: stroke,
                        strokeWidth: strokeWidth,
                        label: selectionDatumLabel,
                    });
                });
                return [2 /*return*/, [{ itemId: (_a = this.yKey) !== null && _a !== void 0 ? _a : this.id, nodeData: nodeData, labelData: nodeData }]];
            });
        });
    };
    HistogramSeries.prototype.nodeFactory = function () {
        return new rect_1.Rect();
    };
    HistogramSeries.prototype.updateDatumSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, datumSelection;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, datumSelection = opts.datumSelection;
                return [2 /*return*/, datumSelection.update(nodeData, function (rect) {
                        rect.tag = HistogramSeriesNodeTag.Bin;
                        rect.crisp = true;
                    }, function (datum) { return datum.domain.join('_'); })];
            });
        });
    };
    HistogramSeries.prototype.updateDatumNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, isDatumHighlighted, _a, seriesFillOpacity, strokeOpacity, shadow, _b, highlightedFill, _c, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth;
            var _this = this;
            return __generator(this, function (_d) {
                datumSelection = opts.datumSelection, isDatumHighlighted = opts.isHighlight;
                _a = this, seriesFillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, shadow = _a.shadow, _b = _a.highlightStyle.item, highlightedFill = _b.fill, _c = _b.fillOpacity, highlightFillOpacity = _c === void 0 ? seriesFillOpacity : _c, highlightedStroke = _b.stroke, highlightedDatumStrokeWidth = _b.strokeWidth;
                datumSelection.each(function (rect, datum, index) {
                    var _a, _b;
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : datum.strokeWidth;
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
                    rect.fill = (_a = (isDatumHighlighted ? highlightedFill : undefined)) !== null && _a !== void 0 ? _a : datum.fill;
                    rect.stroke = (_b = (isDatumHighlighted ? highlightedStroke : undefined)) !== null && _b !== void 0 ? _b : datum.stroke;
                    rect.fillOpacity = fillOpacity;
                    rect.strokeOpacity = strokeOpacity;
                    rect.strokeWidth = strokeWidth;
                    rect.lineDash = _this.lineDash;
                    rect.lineDashOffset = _this.lineDashOffset;
                    rect.fillShadow = shadow;
                    rect.zIndex = isDatumHighlighted ? series_1.Series.highlightedZIndex : index;
                    rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
                });
                return [2 /*return*/];
            });
        });
    };
    HistogramSeries.prototype.updateLabelSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelData, labelSelection;
            return __generator(this, function (_a) {
                labelData = opts.labelData, labelSelection = opts.labelSelection;
                return [2 /*return*/, labelSelection.update(labelData, function (text) {
                        text.tag = HistogramSeriesNodeTag.Label;
                        text.pointerEvents = node_1.PointerEvents.None;
                        text.textAlign = 'center';
                        text.textBaseline = 'middle';
                    })];
            });
        });
    };
    HistogramSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, labelEnabled;
            return __generator(this, function (_a) {
                labelSelection = opts.labelSelection;
                labelEnabled = this.label.enabled;
                labelSelection.each(function (text, datum) {
                    var label = datum.label;
                    if (label && labelEnabled) {
                        text.text = label.text;
                        text.x = label.x;
                        text.y = label.y;
                        text.fontStyle = label.fontStyle;
                        text.fontWeight = label.fontWeight;
                        text.fontSize = label.fontSize;
                        text.fontFamily = label.fontFamily;
                        text.fill = label.fill;
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
    HistogramSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, _b = _a.yKey, yKey = _b === void 0 ? '' : _b, axes = _a.axes;
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        if (!xKey || !xAxis || !yAxis) {
            return '';
        }
        var _c = this, xName = _c.xName, yName = _c.yName, color = _c.fill, tooltip = _c.tooltip, aggregation = _c.aggregation, seriesId = _c.id;
        var tooltipRenderer = tooltip.renderer;
        var aggregatedValue = nodeDatum.aggregatedValue, frequency = nodeDatum.frequency, domain = nodeDatum.domain, _d = __read(nodeDatum.domain, 2), rangeMin = _d[0], rangeMax = _d[1];
        var title = sanitize_1.sanitizeHtml(xName !== null && xName !== void 0 ? xName : xKey) + ": " + xAxis.formatDatum(rangeMin) + " - " + xAxis.formatDatum(rangeMax);
        var content = yKey
            ? "<b>" + sanitize_1.sanitizeHtml(yName !== null && yName !== void 0 ? yName : yKey) + " (" + aggregation + ")</b>: " + yAxis.formatDatum(aggregatedValue) + "<br>"
            : '';
        content += "<b>Frequency</b>: " + frequency;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
                datum: {
                    data: nodeDatum.datum,
                    aggregatedValue: nodeDatum.aggregatedValue,
                    domain: nodeDatum.domain,
                    frequency: nodeDatum.frequency,
                },
                xKey: xKey,
                xValue: domain,
                xName: xName,
                yKey: yKey,
                yValue: aggregatedValue,
                yName: yName,
                color: color,
                title: title,
                seriesId: seriesId,
            }), defaults);
        }
        return tooltip_1.toTooltipHtml(defaults);
    };
    HistogramSeries.prototype.getLegendData = function () {
        var _a;
        var _b = this, id = _b.id, data = _b.data, xKey = _b.xKey, yName = _b.yName, visible = _b.visible, fill = _b.fill, stroke = _b.stroke, fillOpacity = _b.fillOpacity, strokeOpacity = _b.strokeOpacity;
        if (!data || data.length === 0) {
            return [];
        }
        var legendData = [
            {
                legendType: 'category',
                id: id,
                itemId: xKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: (_a = yName !== null && yName !== void 0 ? yName : xKey) !== null && _a !== void 0 ? _a : 'Frequency',
                },
                marker: {
                    fill: fill !== null && fill !== void 0 ? fill : 'rgba(0, 0, 0, 0)',
                    stroke: stroke !== null && stroke !== void 0 ? stroke : 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity,
                },
            },
        ];
        return legendData;
    };
    HistogramSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var _b, _c;
        var datumSelections = _a.datumSelections, labelSelections = _a.labelSelections;
        var duration = (_c = (_b = this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.defaultOptions.duration) !== null && _c !== void 0 ? _c : 1000;
        var labelDuration = 200;
        var startingY = 0;
        datumSelections.forEach(function (datumSelection) {
            return datumSelection.each(function (_, datum) {
                startingY = Math.max(startingY, datum.height + datum.y);
            });
        });
        datumSelections.forEach(function (datumSelection) {
            datumSelection.each(function (rect, datum) {
                var _a;
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(_this.id + "_empty-update-ready_" + rect.id, [
                    { from: startingY, to: datum.y },
                    { from: 0, to: datum.height },
                ], {
                    duration: duration,
                    ease: easing.easeOut,
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
    HistogramSeries.prototype.animateReadyUpdate = function (_a) {
        var _this = this;
        var datumSelections = _a.datumSelections;
        datumSelections.forEach(function (datumSelection) {
            _this.resetSelectionRects(datumSelection);
        });
    };
    HistogramSeries.prototype.animateReadyHighlight = function (highlightSelection) {
        this.resetSelectionRects(highlightSelection);
    };
    HistogramSeries.prototype.animateReadyResize = function (_a) {
        var _this = this;
        var _b;
        var datumSelections = _a.datumSelections;
        (_b = this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.reset();
        datumSelections.forEach(function (datumSelection) {
            _this.resetSelectionRects(datumSelection);
        });
    };
    HistogramSeries.prototype.animateWaitingUpdateReady = function (_a) {
        var _this = this;
        var _b, _c, _d;
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
        if (diff.added.length > 0 && diff.removed.length > 0) {
            sectionDuration = Math.floor(totalDuration / 3);
        }
        else if (diff.added.length > 0 || diff.removed.length > 0) {
            sectionDuration = Math.floor(totalDuration / 2);
        }
        var startingY = 0;
        datumSelections.forEach(function (datumSelection) {
            return datumSelection.each(function (_, datum) {
                startingY = Math.max(startingY, datum.height + datum.y);
            });
        });
        var addedIds = {};
        diff.added.forEach(function (d) {
            addedIds[d.join('_')] = true;
        });
        var removedIds = {};
        diff.removed.forEach(function (d) {
            removedIds[d.join('_')] = true;
        });
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
                var cleanup = false;
                var datumId = datum.domain.join('_');
                var contextY = startingY;
                var contextHeight = 0;
                if (datumId !== undefined && addedIds[datumId] !== undefined) {
                    props = [
                        { from: datum.x, to: datum.x },
                        { from: datum.width, to: datum.width },
                        { from: contextY, to: datum.y },
                        { from: contextHeight, to: datum.height },
                    ];
                    delay += sectionDuration;
                }
                else if (datumId !== undefined && removedIds[datumId] !== undefined) {
                    props = [
                        { from: rect.x, to: datum.x },
                        { from: rect.width, to: datum.width },
                        { from: datum.y, to: contextY },
                        { from: datum.height, to: contextHeight },
                    ];
                    delay = 0;
                    cleanup = true;
                }
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(_this.id + "_waiting-update-ready_" + rect.id, props, {
                    disableInteractions: true,
                    delay: delay,
                    duration: sectionDuration,
                    ease: easing.easeOut,
                    repeat: 0,
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
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_waiting-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: totalDuration,
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
    HistogramSeries.prototype.resetSelectionRects = function (selection) {
        selection.each(function (rect, datum) {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
    };
    HistogramSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    HistogramSeries.className = 'HistogramSeries';
    HistogramSeries.type = 'histogram';
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], HistogramSeries.prototype, "fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], HistogramSeries.prototype, "stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], HistogramSeries.prototype, "fillOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], HistogramSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_LINE_DASH)
    ], HistogramSeries.prototype, "lineDash", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], HistogramSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], HistogramSeries.prototype, "xKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], HistogramSeries.prototype, "areaPlot", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_ARRAY())
    ], HistogramSeries.prototype, "bins", void 0);
    __decorate([
        validation_1.Validate(HISTOGRAM_AGGREGATION)
    ], HistogramSeries.prototype, "aggregation", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], HistogramSeries.prototype, "binCount", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], HistogramSeries.prototype, "xName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], HistogramSeries.prototype, "yKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], HistogramSeries.prototype, "yName", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], HistogramSeries.prototype, "strokeWidth", void 0);
    return HistogramSeries;
}(cartesianSeries_1.CartesianSeries));
exports.HistogramSeries = HistogramSeries;
//# sourceMappingURL=histogramSeries.js.map