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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineSeries = void 0;
var continuousScale_1 = require("../../../scale/continuousScale");
var series_1 = require("../series");
var array_1 = require("../../../util/array");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var util_1 = require("../../marker/util");
var tooltip_1 = require("../../tooltip/tooltip");
var string_1 = require("../../../util/string");
var label_1 = require("../../label");
var sanitize_1 = require("../../../util/sanitize");
var validation_1 = require("../../../util/validation");
var LineSeriesLabel = /** @class */ (function (_super) {
    __extends(LineSeriesLabel, _super);
    function LineSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], LineSeriesLabel.prototype, "formatter", void 0);
    return LineSeriesLabel;
}(label_1.Label));
var LineSeriesTooltip = /** @class */ (function (_super) {
    __extends(LineSeriesTooltip, _super);
    function LineSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        _this.format = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], LineSeriesTooltip.prototype, "renderer", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], LineSeriesTooltip.prototype, "format", void 0);
    return LineSeriesTooltip;
}(series_1.SeriesTooltip));
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries(moduleCtx) {
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            hasMarkers: true,
            pickModes: [
                series_1.SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                series_1.SeriesNodePickMode.NEAREST_NODE,
                series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        }) || this;
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.label = new LineSeriesLabel();
        _this.title = undefined;
        _this.stroke = '#874349';
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.strokeWidth = 2;
        _this.strokeOpacity = 1;
        _this.tooltip = new LineSeriesTooltip();
        _this.xKey = undefined;
        _this.xName = undefined;
        _this.yKey = undefined;
        _this.yName = undefined;
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        label.enabled = false;
        return _this;
    }
    LineSeries.prototype.processData = function (dataController) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, axes, _b, xKey, _c, yKey, data, xAxis, yAxis, isContinuousX, isContinuousY, _d, dataModel, processedData;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = this, axes = _a.axes, _b = _a.xKey, xKey = _b === void 0 ? '' : _b, _c = _a.yKey, yKey = _c === void 0 ? '' : _c;
                        data = xKey && yKey && this.data ? this.data : [];
                        xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
                        yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
                        isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof continuousScale_1.ContinuousScale;
                        isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof continuousScale_1.ContinuousScale;
                        return [4 /*yield*/, dataController.request(this.id, data !== null && data !== void 0 ? data : [], {
                                props: [
                                    series_1.valueProperty(this, xKey, isContinuousX, { id: 'xValue' }),
                                    series_1.valueProperty(this, yKey, isContinuousY, { id: 'yValue', invalidValue: undefined }),
                                ],
                                dataVisible: this.visible,
                            })];
                    case 1:
                        _d = _e.sent(), dataModel = _d.dataModel, processedData = _d.processedData;
                        this.dataModel = dataModel;
                        this.processedData = processedData;
                        return [2 /*return*/];
                }
            });
        });
    };
    LineSeries.prototype.getDomain = function (direction) {
        var _a = this, axes = _a.axes, dataModel = _a.dataModel, processedData = _a.processedData;
        if (!processedData || !dataModel)
            return [];
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        var xDef = dataModel.resolveProcessedDataDefById(this, "xValue");
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            var domain = dataModel.getDomain(this, "xValue", 'value', processedData);
            if ((xDef === null || xDef === void 0 ? void 0 : xDef.def.type) === 'value' && xDef.def.valueType === 'category') {
                return domain;
            }
            return this.fixNumericExtent(array_1.extent(domain), xAxis);
        }
        else {
            var domain = dataModel.getDomain(this, "yValue", 'value', processedData);
            return this.fixNumericExtent(domain, yAxis);
        }
    };
    LineSeries.prototype.createNodeData = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var _f, processedData, dataModel, axes, _g, markerEnabled, markerSize, strokeWidth, callbackCache, xAxis, yAxis, _h, label, _j, yKey, _k, xKey, seriesId, xScale, yScale, xOffset, yOffset, nodeData, size, xIdx, yIdx, moveTo, prevXInRange, nextPoint, actualLength, i, _l, datum, values, xDatum, yDatum, x, tolerance, nextXDatum, xInRange, nextXInRange, y, labelText;
            return __generator(this, function (_m) {
                _f = this, processedData = _f.processedData, dataModel = _f.dataModel, axes = _f.axes, _g = _f.marker, markerEnabled = _g.enabled, markerSize = _g.size, strokeWidth = _g.strokeWidth, callbackCache = _f.ctx.callbackCache;
                xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
                yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
                if (!processedData || !dataModel || !xAxis || !yAxis) {
                    return [2 /*return*/, []];
                }
                _h = this, label = _h.label, _j = _h.yKey, yKey = _j === void 0 ? '' : _j, _k = _h.xKey, xKey = _k === void 0 ? '' : _k, seriesId = _h.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
                yOffset = ((_b = yScale.bandwidth) !== null && _b !== void 0 ? _b : 0) / 2;
                nodeData = new Array(processedData.data.length);
                size = markerEnabled ? markerSize : 0;
                xIdx = dataModel.resolveProcessedDataIndexById(this, "xValue").index;
                yIdx = dataModel.resolveProcessedDataIndexById(this, "yValue").index;
                moveTo = true;
                prevXInRange = undefined;
                nextPoint = undefined;
                actualLength = 0;
                for (i = 0; i < processedData.data.length; i++) {
                    _l = nextPoint !== null && nextPoint !== void 0 ? nextPoint : processedData.data[i], datum = _l.datum, values = _l.values;
                    xDatum = values[xIdx];
                    yDatum = values[yIdx];
                    if (yDatum === undefined) {
                        prevXInRange = undefined;
                        moveTo = true;
                    }
                    else {
                        x = xScale.convert(xDatum) + xOffset;
                        if (isNaN(x)) {
                            prevXInRange = undefined;
                            moveTo = true;
                            nextPoint = undefined;
                            continue;
                        }
                        tolerance = ((_c = xScale.bandwidth) !== null && _c !== void 0 ? _c : markerSize * 0.5 + (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 0)) + 1;
                        nextPoint =
                            ((_d = processedData.data[i + 1]) === null || _d === void 0 ? void 0 : _d.values[yIdx]) === undefined ? undefined : processedData.data[i + 1];
                        nextXDatum = (_e = processedData.data[i + 1]) === null || _e === void 0 ? void 0 : _e.values[xIdx];
                        xInRange = xAxis.inRangeEx(x, 0, tolerance);
                        nextXInRange = nextPoint && xAxis.inRangeEx(xScale.convert(nextXDatum) + xOffset, 0, tolerance);
                        if (xInRange === -1 && nextXInRange === -1) {
                            moveTo = true;
                            continue;
                        }
                        if (xInRange === 1 && prevXInRange === 1) {
                            moveTo = true;
                            continue;
                        }
                        prevXInRange = xInRange;
                        y = yScale.convert(yDatum) + yOffset;
                        labelText = void 0;
                        if (label.formatter) {
                            labelText = callbackCache.call(label.formatter, { value: yDatum, seriesId: seriesId });
                        }
                        if (labelText !== undefined) {
                            // Label retrieved from formatter successfully.
                        }
                        else if (typeof yDatum === 'number' && isFinite(yDatum)) {
                            labelText = yDatum.toFixed(2);
                        }
                        else if (yDatum) {
                            labelText = String(yDatum);
                        }
                        nodeData[actualLength++] = {
                            series: this,
                            datum: datum,
                            yKey: yKey,
                            xKey: xKey,
                            point: { x: x, y: y, moveTo: moveTo, size: size },
                            nodeMidPoint: { x: x, y: y },
                            yValue: yDatum,
                            xValue: xDatum,
                            label: labelText
                                ? {
                                    text: labelText,
                                    fontStyle: label.fontStyle,
                                    fontWeight: label.fontWeight,
                                    fontSize: label.fontSize,
                                    fontFamily: label.fontFamily,
                                    textAlign: 'center',
                                    textBaseline: 'bottom',
                                    fill: label.color,
                                }
                                : undefined,
                        };
                        moveTo = false;
                    }
                }
                nodeData.length = actualLength;
                return [2 /*return*/, [{ itemId: yKey, nodeData: nodeData, labelData: nodeData }]];
            });
        });
    };
    LineSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    LineSeries.prototype.markerFactory = function () {
        var shape = this.marker.shape;
        var MarkerShape = util_1.getMarker(shape);
        return new MarkerShape();
    };
    LineSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, markerSelection, _a, shape, enabled;
            return __generator(this, function (_b) {
                nodeData = opts.nodeData;
                markerSelection = opts.markerSelection;
                _a = this.marker, shape = _a.shape, enabled = _a.enabled;
                nodeData = shape && enabled ? nodeData : [];
                if (this.marker.isDirty()) {
                    markerSelection.clear();
                }
                return [2 /*return*/, markerSelection.update(nodeData)];
            });
        });
    };
    LineSeries.prototype.updateMarkerNodes = function (opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var markerSelection, isDatumHighlighted, _b, marker, markerFillOpacity, _c, xKey, _d, yKey, lineStroke, strokeOpacity, _e, highlightedFill, _f, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, seriesId, callbackCache, size, formatter, markerStrokeWidth, customMarker;
            return __generator(this, function (_g) {
                markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
                _b = this, marker = _b.marker, markerFillOpacity = _b.marker.fillOpacity, _c = _b.xKey, xKey = _c === void 0 ? '' : _c, _d = _b.yKey, yKey = _d === void 0 ? '' : _d, lineStroke = _b.stroke, strokeOpacity = _b.strokeOpacity, _e = _b.highlightStyle.item, highlightedFill = _e.fill, _f = _e.fillOpacity, highlightFillOpacity = _f === void 0 ? markerFillOpacity : _f, highlightedStroke = _e.stroke, highlightedDatumStrokeWidth = _e.strokeWidth, seriesId = _b.id, callbackCache = _b.ctx.callbackCache;
                size = marker.size, formatter = marker.formatter;
                markerStrokeWidth = (_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : this.strokeWidth;
                customMarker = typeof marker.shape === 'function';
                markerSelection.each(function (node, datum) {
                    var _a, _b, _c, _d, _e, _f, _g;
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : (_a = marker.stroke) !== null && _a !== void 0 ? _a : lineStroke;
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : markerStrokeWidth;
                    var format = undefined;
                    if (formatter) {
                        format = callbackCache.call(formatter, {
                            datum: datum.datum,
                            xKey: xKey,
                            yKey: yKey,
                            fill: fill,
                            stroke: stroke,
                            strokeWidth: strokeWidth,
                            size: size,
                            highlighted: isDatumHighlighted,
                            seriesId: seriesId,
                        });
                    }
                    node.fill = (_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill;
                    node.stroke = (_c = format === null || format === void 0 ? void 0 : format.stroke) !== null && _c !== void 0 ? _c : stroke;
                    node.strokeWidth = (_d = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _d !== void 0 ? _d : strokeWidth;
                    node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                    node.strokeOpacity = (_f = (_e = marker.strokeOpacity) !== null && _e !== void 0 ? _e : strokeOpacity) !== null && _f !== void 0 ? _f : 1;
                    node.size = (_g = format === null || format === void 0 ? void 0 : format.size) !== null && _g !== void 0 ? _g : size;
                    node.translationX = datum.point.x;
                    node.translationY = datum.point.y;
                    node.visible = node.size > 0 && !isNaN(datum.point.x) && !isNaN(datum.point.y);
                    if (!customMarker || node.dirtyPath) {
                        return;
                    }
                    // Only for cutom marker shapes
                    node.path.clear({ trackChanges: true });
                    node.updatePath();
                    node.checkPathDirty();
                });
                if (!isDatumHighlighted) {
                    this.marker.markClean();
                }
                return [2 /*return*/];
            });
        });
    };
    LineSeries.prototype.updateLabelSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelData, labelSelection, _a, shape, enabled;
            return __generator(this, function (_b) {
                labelData = opts.labelData;
                labelSelection = opts.labelSelection;
                _a = this.marker, shape = _a.shape, enabled = _a.enabled;
                labelData = shape && enabled ? labelData : [];
                return [2 /*return*/, labelSelection.update(labelData)];
            });
        });
    };
    LineSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, _a, labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color;
            return __generator(this, function (_b) {
                labelSelection = opts.labelSelection;
                _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
                labelSelection.each(function (text, datum) {
                    var point = datum.point, label = datum.label;
                    if (datum && label && labelEnabled) {
                        text.fontStyle = fontStyle;
                        text.fontWeight = fontWeight;
                        text.fontSize = fontSize;
                        text.fontFamily = fontFamily;
                        text.textAlign = label.textAlign;
                        text.textBaseline = label.textBaseline;
                        text.text = label.text;
                        text.x = point.x;
                        text.y = point.y - 10;
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
    LineSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a, _b;
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    LineSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a, _b;
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b;
        var _c = this, xKey = _c.xKey, yKey = _c.yKey, axes = _c.axes;
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _d = this, xName = _d.xName, yName = _d.yName, tooltip = _d.tooltip, marker = _d.marker, seriesId = _d.id;
        var tooltipRenderer = tooltip.renderer, tooltipFormat = tooltip.format;
        var datum = nodeDatum.datum, xValue = nodeDatum.xValue, yValue = nodeDatum.yValue;
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var title = sanitize_1.sanitizeHtml((_a = this.title) !== null && _a !== void 0 ? _a : yName);
        var content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
        var markerFormatter = marker.formatter, fill = marker.fill, stroke = marker.stroke, markerStrokeWidth = marker.strokeWidth, size = marker.size;
        var strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : this.strokeWidth;
        var format = undefined;
        if (markerFormatter) {
            format = markerFormatter({
                datum: datum,
                xKey: xKey,
                yKey: yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: size,
                highlighted: false,
                seriesId: seriesId,
            });
        }
        var color = (_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipFormat || tooltipRenderer) {
            var params = {
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                title: title,
                color: color,
                seriesId: seriesId,
            };
            if (tooltipFormat) {
                return tooltip_1.toTooltipHtml({
                    content: string_1.interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return tooltip_1.toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return tooltip_1.toTooltipHtml(defaults);
    };
    LineSeries.prototype.getLegendData = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var _h = this, id = _h.id, data = _h.data, xKey = _h.xKey, yKey = _h.yKey, yName = _h.yName, visible = _h.visible, title = _h.title, marker = _h.marker, stroke = _h.stroke, strokeOpacity = _h.strokeOpacity;
        if (!((data === null || data === void 0 ? void 0 : data.length) && xKey && yKey)) {
            return [];
        }
        var legendData = [
            {
                legendType: 'category',
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: (_a = title !== null && title !== void 0 ? title : yName) !== null && _a !== void 0 ? _a : yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: (_b = marker.fill) !== null && _b !== void 0 ? _b : 'rgba(0, 0, 0, 0)',
                    stroke: (_d = (_c = marker.stroke) !== null && _c !== void 0 ? _c : stroke) !== null && _d !== void 0 ? _d : 'rgba(0, 0, 0, 0)',
                    fillOpacity: (_e = marker.fillOpacity) !== null && _e !== void 0 ? _e : 1,
                    strokeOpacity: (_g = (_f = marker.strokeOpacity) !== null && _f !== void 0 ? _f : strokeOpacity) !== null && _g !== void 0 ? _g : 1,
                },
            },
        ];
        return legendData;
    };
    LineSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var markerSelections = _a.markerSelections, labelSelections = _a.labelSelections, contextData = _a.contextData, paths = _a.paths;
        contextData.forEach(function (_a, contextDataIndex) {
            var _b, _c, _d;
            var nodeData = _a.nodeData;
            var _e = __read(paths[contextDataIndex], 1), lineNode = _e[0];
            var linePath = lineNode.path;
            var nodeLengths = [0];
            var lineLength = nodeData.reduce(function (sum, datum, index) {
                if (index === 0)
                    return sum;
                var prev = nodeData[index - 1];
                if (isNaN(datum.point.x) || isNaN(datum.point.y) || isNaN(prev.point.x) || isNaN(prev.point.y)) {
                    nodeLengths.push(sum);
                    return sum;
                }
                var length = Math.sqrt(Math.pow(datum.point.x - prev.point.x, 2) + Math.pow(datum.point.y - prev.point.y, 2));
                nodeLengths.push(sum + length);
                return sum + length;
            }, 0);
            lineNode.fill = undefined;
            lineNode.lineJoin = 'round';
            lineNode.pointerEvents = node_1.PointerEvents.None;
            lineNode.stroke = _this.stroke;
            lineNode.strokeWidth = _this.getStrokeWidth(_this.strokeWidth);
            lineNode.strokeOpacity = _this.strokeOpacity;
            lineNode.lineDash = _this.lineDash;
            lineNode.lineDashOffset = _this.lineDashOffset;
            var duration = (_c = (_b = _this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.defaultOptions.duration) !== null && _c !== void 0 ? _c : 1000;
            var markerDuration = 200;
            var animationOptions = {
                from: 0,
                to: lineLength,
            };
            (_d = _this.ctx.animationManager) === null || _d === void 0 ? void 0 : _d.animate(_this.id + "_empty-update-ready", __assign(__assign({}, animationOptions), { duration: duration, onUpdate: function (length) {
                    linePath.clear({ trackChanges: true });
                    nodeData.forEach(function (datum, index) {
                        if (nodeLengths[index] <= length) {
                            // Draw/move the full segment if past the end of this segment
                            if (datum.point.moveTo) {
                                linePath.moveTo(datum.point.x, datum.point.y);
                            }
                            else {
                                linePath.lineTo(datum.point.x, datum.point.y);
                            }
                        }
                        else if (index > 0 && nodeLengths[index - 1] < length) {
                            // Draw/move partial line if in between the start and end of this segment
                            var start = nodeData[index - 1].point;
                            var end = datum.point;
                            var segmentLength = nodeLengths[index] - nodeLengths[index - 1];
                            var remainingLength = nodeLengths[index] - length;
                            var ratio = (segmentLength - remainingLength) / segmentLength;
                            var x = (1 - ratio) * start.x + ratio * end.x;
                            var y = (1 - ratio) * start.y + ratio * end.y;
                            if (datum.point.moveTo) {
                                linePath.moveTo(x, y);
                            }
                            else {
                                linePath.lineTo(x, y);
                            }
                        }
                    });
                    lineNode.checkPathDirty();
                } }));
            markerSelections[contextDataIndex].each(function (marker, datum, index) {
                var _a, _b, _c, _d;
                var delay = lineLength > 0 ? (nodeLengths[index] / lineLength) * duration : 0;
                var format = _this.animateFormatter(datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                (_c = _this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.animate(_this.id + "_empty-update-ready_" + marker.id, __assign(__assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay: delay, duration: markerDuration, onUpdate: function (size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[contextDataIndex].each(function (label, _, index) {
                var _a;
                var delay = (nodeLengths[index] / lineLength) * duration;
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: delay,
                    duration: markerDuration,
                    onUpdate: function (opacity) {
                        label.opacity = opacity;
                    },
                });
            });
        });
    };
    LineSeries.prototype.animateReadyUpdate = function (data) {
        this.resetMarkersAndPaths(data);
    };
    LineSeries.prototype.animateReadyResize = function (data) {
        var _a;
        (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.reset();
        this.resetMarkersAndPaths(data);
    };
    LineSeries.prototype.resetMarkersAndPaths = function (_a) {
        var _this = this;
        var markerSelections = _a.markerSelections, contextData = _a.contextData, paths = _a.paths;
        contextData.forEach(function (_a, contextDataIndex) {
            var nodeData = _a.nodeData;
            var _b = __read(paths[contextDataIndex], 1), lineNode = _b[0];
            var linePath = lineNode.path;
            lineNode.stroke = _this.stroke;
            lineNode.strokeWidth = _this.getStrokeWidth(_this.strokeWidth);
            lineNode.strokeOpacity = _this.strokeOpacity;
            lineNode.lineDash = _this.lineDash;
            lineNode.lineDashOffset = _this.lineDashOffset;
            linePath.clear({ trackChanges: true });
            nodeData.forEach(function (datum) {
                if (datum.point.moveTo) {
                    linePath.moveTo(datum.point.x, datum.point.y);
                }
                else {
                    linePath.lineTo(datum.point.x, datum.point.y);
                }
            });
            lineNode.checkPathDirty();
            markerSelections[contextDataIndex].each(function (marker, datum) {
                var _a, _b, _c;
                var format = _this.animateFormatter(datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                marker.size = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
            });
        });
    };
    LineSeries.prototype.animateFormatter = function (datum) {
        var _a, _b;
        var _c = this, marker = _c.marker, _d = _c.xKey, xKey = _d === void 0 ? '' : _d, _e = _c.yKey, yKey = _e === void 0 ? '' : _e, lineStroke = _c.stroke, seriesId = _c.id, callbackCache = _c.ctx.callbackCache;
        var size = marker.size, formatter = marker.formatter;
        var fill = marker.fill;
        var stroke = (_a = marker.stroke) !== null && _a !== void 0 ? _a : lineStroke;
        var strokeWidth = (_b = marker.strokeWidth) !== null && _b !== void 0 ? _b : this.strokeWidth;
        var format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum.datum,
                xKey: xKey,
                yKey: yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: size,
                highlighted: false,
                seriesId: seriesId,
            });
        }
        return format;
    };
    LineSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    LineSeries.className = 'LineSeries';
    LineSeries.type = 'line';
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], LineSeries.prototype, "title", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], LineSeries.prototype, "stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_LINE_DASH)
    ], LineSeries.prototype, "lineDash", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], LineSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], LineSeries.prototype, "strokeWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], LineSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], LineSeries.prototype, "xKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], LineSeries.prototype, "xName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], LineSeries.prototype, "yKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], LineSeries.prototype, "yName", void 0);
    return LineSeries;
}(cartesianSeries_1.CartesianSeries));
exports.LineSeries = LineSeries;
//# sourceMappingURL=lineSeries.js.map