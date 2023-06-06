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
import { SeriesTooltip, Series, SeriesNodePickMode, valueProperty, keyProperty, } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import ticks, { tickStep } from '../../../util/ticks';
import { sanitizeHtml } from '../../../util/sanitize';
import { BOOLEAN, NUMBER, OPT_ARRAY, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, OPT_COLOR_STRING, Validate, predicateWithMessage, OPT_STRING, } from '../../../util/validation';
import { DataModel, fixNumericExtent, } from '../../data/dataModel';
import { area, groupAverage, groupCount, groupSum } from '../../data/aggregateFunctions';
import { SORT_DOMAIN_GROUPS } from '../../data/processors';
import * as easing from '../../../motion/easing';
var HISTOGRAM_AGGREGATIONS = ['count', 'sum', 'mean'];
var HISTOGRAM_AGGREGATION = predicateWithMessage(function (v) { return HISTOGRAM_AGGREGATIONS.includes(v); }, "expecting a histogram aggregation keyword such as 'count', 'sum' or 'mean");
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
        Validate(OPT_FUNCTION)
    ], HistogramSeriesLabel.prototype, "formatter", void 0);
    return HistogramSeriesLabel;
}(Label));
var defaultBinCount = 10;
var HistogramSeriesTooltip = /** @class */ (function (_super) {
    __extends(HistogramSeriesTooltip, _super);
    function HistogramSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], HistogramSeriesTooltip.prototype, "renderer", void 0);
    return HistogramSeriesTooltip;
}(SeriesTooltip));
var HistogramSeries = /** @class */ (function (_super) {
    __extends(HistogramSeries, _super);
    function HistogramSeries(moduleCtx) {
        var _this = _super.call(this, { moduleCtx: moduleCtx, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
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
        _this.label.enabled = false;
        return _this;
    }
    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    HistogramSeries.prototype.deriveBins = function (xDomain) {
        if (this.binCount === undefined) {
            var binStarts = ticks(xDomain[0], xDomain[1], defaultBinCount);
            var binSize_1 = tickStep(xDomain[0], xDomain[1], defaultBinCount);
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
    HistogramSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xKey, yKey, data, areaPlot, aggregation, props, aggProp, aggProp, groupByFn;
            var _this = this;
            return __generator(this, function (_b) {
                _a = this, xKey = _a.xKey, yKey = _a.yKey, data = _a.data, areaPlot = _a.areaPlot, aggregation = _a.aggregation;
                props = [keyProperty(xKey, true), SORT_DOMAIN_GROUPS];
                if (yKey) {
                    aggProp = groupCount();
                    if (aggregation === 'count') {
                        // Nothing to do.
                    }
                    else if (aggregation === 'sum') {
                        aggProp = groupSum([yKey]);
                    }
                    else if (aggregation === 'mean') {
                        aggProp = groupAverage([yKey]);
                    }
                    if (areaPlot) {
                        aggProp = area([yKey], aggProp);
                    }
                    props.push(valueProperty(yKey, true, { invalidValue: undefined }), aggProp);
                }
                else {
                    aggProp = groupCount();
                    if (areaPlot) {
                        aggProp = area([], aggProp);
                    }
                    props.push(aggProp);
                }
                groupByFn = function (dataSet) {
                    var _a;
                    var xExtent = fixNumericExtent(dataSet.domain.keys[0]);
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
                this.dataModel = new DataModel({
                    props: props,
                    dataVisible: this.visible,
                    groupByFn: groupByFn,
                });
                this.processedData = this.dataModel.processData(data !== null && data !== void 0 ? data : []);
                return [2 /*return*/];
            });
        });
    };
    HistogramSeries.prototype.getDomain = function (direction) {
        var _a, _b, _c, _d;
        var processedData = this.processedData;
        if (!processedData)
            return [];
        var _e = processedData.domain.aggValues, _f = _e === void 0 ? [] : _e, _g = __read(_f, 1), yDomain = _g[0];
        var xDomainMin = (_a = this.calculatedBins) === null || _a === void 0 ? void 0 : _a[0][0];
        var xDomainMax = (_b = this.calculatedBins) === null || _b === void 0 ? void 0 : _b[((_d = (_c = this.calculatedBins) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) - 1][1];
        if (direction === ChartAxisDirection.X) {
            return fixNumericExtent([xDomainMin, xDomainMax]);
        }
        return fixNumericExtent(yDomain);
    };
    HistogramSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a, _b;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    HistogramSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a, _b;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    HistogramSeries.prototype.createNodeData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, xAxis, yAxis, processedData, callbackCache, xScale, yScale, _c, fill, stroke, strokeWidth, seriesId, _d, yKey, _e, xKey, nodeData, defaultLabelFormatter, _f, _g, labelFormatter, labelFontStyle, labelFontWeight, labelFontSize, labelFontFamily, labelColor;
            var _this = this;
            return __generator(this, function (_h) {
                _b = this, xAxis = _b.xAxis, yAxis = _b.yAxis, processedData = _b.processedData, callbackCache = _b.ctx.callbackCache;
                if (!this.seriesItemEnabled || !xAxis || !yAxis || !processedData || processedData.type !== 'grouped') {
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
        return new Rect();
    };
    HistogramSeries.prototype.updateDatumSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, datumSelection;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, datumSelection = opts.datumSelection;
                return [2 /*return*/, datumSelection.update(nodeData, function (rect) {
                        rect.tag = HistogramSeriesNodeTag.Bin;
                        rect.crisp = true;
                    })];
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
                    rect.x = datum.x;
                    rect.width = datum.width;
                    rect.fill = (_a = (isDatumHighlighted ? highlightedFill : undefined)) !== null && _a !== void 0 ? _a : datum.fill;
                    rect.stroke = (_b = (isDatumHighlighted ? highlightedStroke : undefined)) !== null && _b !== void 0 ? _b : datum.stroke;
                    rect.fillOpacity = fillOpacity;
                    rect.strokeOpacity = strokeOpacity;
                    rect.strokeWidth = strokeWidth;
                    rect.lineDash = _this.lineDash;
                    rect.lineDashOffset = _this.lineDashOffset;
                    rect.fillShadow = shadow;
                    rect.zIndex = isDatumHighlighted ? Series.highlightedZIndex : index;
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
                        text.pointerEvents = PointerEvents.None;
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
        var _a = this, xKey = _a.xKey, _b = _a.yKey, yKey = _b === void 0 ? '' : _b, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !xAxis || !yAxis) {
            return '';
        }
        var _c = this, xName = _c.xName, yName = _c.yName, color = _c.fill, tooltip = _c.tooltip, aggregation = _c.aggregation, seriesId = _c.id;
        var tooltipRenderer = tooltip.renderer;
        var aggregatedValue = nodeDatum.aggregatedValue, frequency = nodeDatum.frequency, domain = nodeDatum.domain, _d = __read(nodeDatum.domain, 2), rangeMin = _d[0], rangeMax = _d[1];
        var title = sanitizeHtml(xName !== null && xName !== void 0 ? xName : xKey) + ": " + xAxis.formatDatum(rangeMin) + " - " + xAxis.formatDatum(rangeMax);
        var content = yKey
            ? "<b>" + sanitizeHtml(yName !== null && yName !== void 0 ? yName : yKey) + " (" + aggregation + ")</b>: " + yAxis.formatDatum(aggregatedValue) + "<br>"
            : '';
        content += "<b>Frequency</b>: " + frequency;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
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
        return toTooltipHtml(defaults);
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
        var datumSelections = _a.datumSelections, labelSelections = _a.labelSelections;
        var duration = 1000;
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
        (_b = this.animationManager) === null || _b === void 0 ? void 0 : _b.stop();
        datumSelections.forEach(function (datumSelection) {
            _this.resetSelectionRects(datumSelection);
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
        Validate(OPT_COLOR_STRING)
    ], HistogramSeries.prototype, "fill", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], HistogramSeries.prototype, "stroke", void 0);
    __decorate([
        Validate(NUMBER(0, 1))
    ], HistogramSeries.prototype, "fillOpacity", void 0);
    __decorate([
        Validate(NUMBER(0, 1))
    ], HistogramSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        Validate(OPT_LINE_DASH)
    ], HistogramSeries.prototype, "lineDash", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], HistogramSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], HistogramSeries.prototype, "xKey", void 0);
    __decorate([
        Validate(BOOLEAN)
    ], HistogramSeries.prototype, "areaPlot", void 0);
    __decorate([
        Validate(OPT_ARRAY())
    ], HistogramSeries.prototype, "bins", void 0);
    __decorate([
        Validate(HISTOGRAM_AGGREGATION)
    ], HistogramSeries.prototype, "aggregation", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], HistogramSeries.prototype, "binCount", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], HistogramSeries.prototype, "xName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], HistogramSeries.prototype, "yKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], HistogramSeries.prototype, "yName", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], HistogramSeries.prototype, "strokeWidth", void 0);
    return HistogramSeries;
}(CartesianSeries));
export { HistogramSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9jYXJ0ZXNpYW4vaGlzdG9ncmFtU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUdqRCxPQUFPLEVBQ0gsYUFBYSxFQUNiLE1BQU0sRUFFTixrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLFdBQVcsR0FDZCxNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVwRCxPQUFPLEVBQ0gsZUFBZSxFQUNmLDZCQUE2QixFQUU3QixtQ0FBbUMsR0FDdEMsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sU0FBUyxFQUNULFlBQVksRUFDWixhQUFhLEVBQ2IsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixRQUFRLEVBQ1Isb0JBQW9CLEVBQ3BCLFVBQVUsR0FDYixNQUFNLDBCQUEwQixDQUFDO0FBU2xDLE9BQU8sRUFFSCxTQUFTLEVBQ1QsZ0JBQWdCLEdBR25CLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIs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