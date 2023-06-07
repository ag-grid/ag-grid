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
import { ContinuousScale } from '../../../scale/continuousScale';
import { SeriesTooltip, SeriesNodePickMode, valueProperty } from '../series';
import { extent } from '../../../util/array';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, OPT_COLOR_STRING, Validate } from '../../../util/validation';
import { DataModel } from '../../data/dataModel';
import * as easing from '../../../motion/easing';
var LineSeriesLabel = /** @class */ (function (_super) {
    __extends(LineSeriesLabel, _super);
    function LineSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], LineSeriesLabel.prototype, "formatter", void 0);
    return LineSeriesLabel;
}(Label));
var LineSeriesTooltip = /** @class */ (function (_super) {
    __extends(LineSeriesTooltip, _super);
    function LineSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        _this.format = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], LineSeriesTooltip.prototype, "renderer", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], LineSeriesTooltip.prototype, "format", void 0);
    return LineSeriesTooltip;
}(SeriesTooltip));
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries(moduleCtx) {
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            hasMarkers: true,
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        }) || this;
        _this.marker = new CartesianSeriesMarker();
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
    LineSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xAxis, yAxis, _b, xKey, _c, yKey, data, isContinuousX, isContinuousY;
            return __generator(this, function (_d) {
                _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis, _b = _a.xKey, xKey = _b === void 0 ? '' : _b, _c = _a.yKey, yKey = _c === void 0 ? '' : _c;
                data = xKey && yKey && this.data ? this.data : [];
                isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
                isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
                this.dataModel = new DataModel({
                    props: [
                        valueProperty(xKey, isContinuousX, { id: 'xValue' }),
                        valueProperty(yKey, isContinuousY, { id: 'yValue', invalidValue: undefined }),
                    ],
                    dataVisible: this.visible,
                });
                this.processedData = this.dataModel.processData(data !== null && data !== void 0 ? data : []);
                return [2 /*return*/];
            });
        });
    };
    LineSeries.prototype.getDomain = function (direction) {
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis, dataModel = _a.dataModel, processedData = _a.processedData;
        if (!processedData || !dataModel)
            return [];
        var xDef = dataModel.resolveProcessedDataDefById("xValue");
        if (direction === ChartAxisDirection.X) {
            var domain = dataModel.getDomain("xValue", processedData);
            if ((xDef === null || xDef === void 0 ? void 0 : xDef.valueType) === 'category') {
                return domain;
            }
            return this.fixNumericExtent(extent(domain), xAxis);
        }
        else {
            var domain = dataModel.getDomain("yValue", processedData);
            return this.fixNumericExtent(domain, yAxis);
        }
    };
    LineSeries.prototype.createNodeData = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var _m, processedData, dataModel, xAxis, yAxis, _o, markerEnabled, markerSize, strokeWidth, callbackCache, _p, label, _q, yKey, _r, xKey, seriesId, xScale, yScale, xOffset, yOffset, nodeData, size, xIdx, yIdx, moveTo, prevXInRange, nextPoint, actualLength, i, _s, datum, values, xDatum, yDatum, x, tolerance, nextXDatum, xInRange, nextXInRange, y, labelText;
            return __generator(this, function (_t) {
                _m = this, processedData = _m.processedData, dataModel = _m.dataModel, xAxis = _m.xAxis, yAxis = _m.yAxis, _o = _m.marker, markerEnabled = _o.enabled, markerSize = _o.size, strokeWidth = _o.strokeWidth, callbackCache = _m.ctx.callbackCache;
                if (!processedData || !dataModel || !xAxis || !yAxis) {
                    return [2 /*return*/, []];
                }
                _p = this, label = _p.label, _q = _p.yKey, yKey = _q === void 0 ? '' : _q, _r = _p.xKey, xKey = _r === void 0 ? '' : _r, seriesId = _p.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
                yOffset = ((_b = yScale.bandwidth) !== null && _b !== void 0 ? _b : 0) / 2;
                nodeData = new Array(processedData.data.length);
                size = markerEnabled ? markerSize : 0;
                xIdx = (_e = (_d = (_c = this.dataModel) === null || _c === void 0 ? void 0 : _c.resolveProcessedDataIndexById("xValue")) === null || _d === void 0 ? void 0 : _d.index) !== null && _e !== void 0 ? _e : -1;
                yIdx = (_h = (_g = (_f = this.dataModel) === null || _f === void 0 ? void 0 : _f.resolveProcessedDataIndexById("yValue")) === null || _g === void 0 ? void 0 : _g.index) !== null && _h !== void 0 ? _h : -1;
                moveTo = true;
                prevXInRange = undefined;
                nextPoint = undefined;
                actualLength = 0;
                for (i = 0; i < processedData.data.length; i++) {
                    _s = nextPoint !== null && nextPoint !== void 0 ? nextPoint : processedData.data[i], datum = _s.datum, values = _s.values;
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
                            continue;
                        }
                        tolerance = ((_j = xScale.bandwidth) !== null && _j !== void 0 ? _j : markerSize * 0.5 + (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 0)) + 1;
                        nextPoint =
                            ((_k = processedData.data[i + 1]) === null || _k === void 0 ? void 0 : _k.values[yIdx]) === undefined ? undefined : processedData.data[i + 1];
                        nextXDatum = (_l = processedData.data[i + 1]) === null || _l === void 0 ? void 0 : _l.values[xIdx];
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
        var MarkerShape = getMarker(shape);
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
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    LineSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a, _b;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b;
        var _c = this, xKey = _c.xKey, yKey = _c.yKey, xAxis = _c.xAxis, yAxis = _c.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _d = this, xName = _d.xName, yName = _d.yName, tooltip = _d.tooltip, marker = _d.marker, seriesId = _d.id;
        var tooltipRenderer = tooltip.renderer, tooltipFormat = tooltip.format;
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var title = sanitizeHtml((_a = this.title) !== null && _a !== void 0 ? _a : yName);
        var content = sanitizeHtml(xString + ': ' + yString);
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
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return toTooltipHtml(defaults);
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
        var markerSelections = _a.markerSelections, labelSelections = _a.labelSelections, contextData = _a.contextData, paths = _a.paths, seriesRect = _a.seriesRect;
        contextData.forEach(function (_a, contextDataIndex) {
            var _b, _c;
            var nodeData = _a.nodeData;
            var _d = __read(paths[contextDataIndex], 1), lineNode = _d[0];
            var linePath = lineNode.path;
            lineNode.fill = undefined;
            lineNode.lineJoin = 'round';
            lineNode.pointerEvents = PointerEvents.None;
            lineNode.stroke = _this.stroke;
            lineNode.strokeWidth = _this.getStrokeWidth(_this.strokeWidth);
            lineNode.strokeOpacity = _this.strokeOpacity;
            lineNode.lineDash = _this.lineDash;
            lineNode.lineDashOffset = _this.lineDashOffset;
            var duration = 1000;
            var markerDuration = 200;
            var animationOptions = {
                from: 0,
                to: (_b = seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) !== null && _b !== void 0 ? _b : 0,
                disableInteractions: true,
                ease: easing.linear,
                repeat: 0,
            };
            (_c = _this.animationManager) === null || _c === void 0 ? void 0 : _c.animate(_this.id + "_empty-update-ready", __assign(__assign({}, animationOptions), { duration: duration, onUpdate: function (xValue) {
                    linePath.clear({ trackChanges: true });
                    nodeData.forEach(function (datum, index) {
                        if (datum.point.x <= xValue) {
                            // Draw/move the full segment if past the end of this segment
                            if (datum.point.moveTo) {
                                linePath.moveTo(datum.point.x, datum.point.y);
                            }
                            else {
                                linePath.lineTo(datum.point.x, datum.point.y);
                            }
                        }
                        else if (index > 0 && nodeData[index - 1].point.x < xValue) {
                            // Draw/move partial line if in between the start and end of this segment
                            var start = nodeData[index - 1].point;
                            var end = datum.point;
                            var x = xValue;
                            var y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
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
            markerSelections[contextDataIndex].each(function (marker, datum) {
                var _a, _b, _c, _d;
                var delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                var format = _this.animateFormatter(datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                (_c = _this.animationManager) === null || _c === void 0 ? void 0 : _c.animate(_this.id + "_empty-update-ready_" + marker.id, __assign(__assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay: delay, duration: markerDuration, onUpdate: function (size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[contextDataIndex].each(function (label, datum) {
                var _a;
                var delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: delay,
                    duration: markerDuration,
                    ease: easing.linear,
                    repeat: 0,
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
        (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.stop();
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
        Validate(OPT_STRING)
    ], LineSeries.prototype, "title", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], LineSeries.prototype, "stroke", void 0);
    __decorate([
        Validate(OPT_LINE_DASH)
    ], LineSeries.prototype, "lineDash", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], LineSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], LineSeries.prototype, "strokeWidth", void 0);
    __decorate([
        Validate(NUMBER(0, 1))
    ], LineSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], LineSeries.prototype, "xKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], LineSeries.prototype, "xName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], LineSeries.prototype, "yKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], LineSeries.prototype, "yName", void 0);
    return LineSeries;
}(CartesianSeries));
export { LineSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL2xpbmVTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE9BQU8sRUFBbUIsYUFBYSxFQUF5QixrQkFBa0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDckgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUdwRCxPQUFPLEVBQ0gsZUFBZSxFQUNmLHFCQUFxQixFQUNyQiw2QkFBNkIsRUFFN0IsbUNBQW1DLEdBQ3RDLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQVN2SCxPQUFPLEVBQUUsU0FBUyxFQUFxQixNQUFNLHNCQUFzQixD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