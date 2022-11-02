var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
import { SeriesTooltip, SeriesNodePickMode, } from '../series';
import { extent } from '../../../util/array';
import { PointerEvents } from '../../../scene/node';
import { Text } from '../../../scene/shape/text';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isContinuous } from '../../../util/value';
import { NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, OPT_COLOR_STRING, STRING, Validate, } from '../../../util/validation';
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
export { LineSeriesTooltip };
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries() {
        var _this = _super.call(this, {
            pickGroupIncludes: ['markers'],
            features: ['markers'],
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        }) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.pointsData = [];
        _this.marker = new CartesianSeriesMarker();
        _this.label = new LineSeriesLabel();
        _this.title = undefined;
        _this.stroke = '#874349';
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.strokeWidth = 2;
        _this.strokeOpacity = 1;
        _this.tooltip = new LineSeriesTooltip();
        _this._xKey = '';
        _this.xName = '';
        _this._yKey = '';
        _this.yName = '';
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        label.enabled = false;
        return _this;
    }
    LineSeries.prototype.setColors = function (fills, strokes) {
        this.stroke = fills[0];
        this.marker.stroke = strokes[0];
        this.marker.fill = fills[0];
    };
    Object.defineProperty(LineSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            this._xKey = value;
            this.pointsData.splice(0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "yKey", {
        get: function () {
            return this._yKey;
        },
        set: function (value) {
            this._yKey = value;
            this.pointsData.splice(0);
        },
        enumerable: true,
        configurable: true
    });
    LineSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    };
    LineSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xAxis, yAxis, xKey, yKey, pointsData, data, isContinuousX, isContinuousY, xData, yData, data_1, data_1_1, datum, x, y, xDatum, yDatum;
            var e_1, _b;
            return __generator(this, function (_c) {
                _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis, xKey = _a.xKey, yKey = _a.yKey, pointsData = _a.pointsData;
                data = xKey && yKey && this.data ? this.data : [];
                if (!xAxis || !yAxis) {
                    return [2 /*return*/];
                }
                isContinuousX = xAxis.scale instanceof ContinuousScale;
                isContinuousY = yAxis.scale instanceof ContinuousScale;
                xData = [];
                yData = [];
                pointsData.splice(0);
                try {
                    for (data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                        datum = data_1_1.value;
                        x = datum[xKey];
                        y = datum[yKey];
                        xDatum = checkDatum(x, isContinuousX);
                        if (isContinuousX && xDatum === undefined) {
                            continue;
                        }
                        yDatum = checkDatum(y, isContinuousY);
                        xData.push(xDatum);
                        yData.push(yDatum);
                        pointsData.push({
                            xDatum: xDatum,
                            yDatum: yDatum,
                            datum: datum,
                        });
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (data_1_1 && !data_1_1.done && (_b = data_1.return)) _b.call(data_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                this.xDomain = isContinuousX ? this.fixNumericExtent(extent(xData, isContinuous), xAxis) : xData;
                this.yDomain = isContinuousY ? this.fixNumericExtent(extent(yData, isContinuous), yAxis) : yData;
                return [2 /*return*/];
            });
        });
    };
    LineSeries.prototype.createNodeData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, data, xAxis, yAxis, _c, markerEnabled, markerSize, strokeWidth, _d, pointsData, label, yKey, seriesId, xScale, yScale, xOffset, yOffset, nodeData, size, moveTo, prevXInRange, nextPoint, actualLength, i, point, xDatum, yDatum, datum, x, tolerance, xInRange, nextXInRange, y, labelText;
            return __generator(this, function (_e) {
                _b = this, data = _b.data, xAxis = _b.xAxis, yAxis = _b.yAxis, _c = _b.marker, markerEnabled = _c.enabled, markerSize = _c.size, strokeWidth = _c.strokeWidth;
                if (!data || !xAxis || !yAxis) {
                    return [2 /*return*/, []];
                }
                _d = this, pointsData = _d.pointsData, label = _d.label, yKey = _d.yKey, seriesId = _d.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                xOffset = (xScale.bandwidth || 0) / 2;
                yOffset = (yScale.bandwidth || 0) / 2;
                nodeData = new Array(data.length);
                size = markerEnabled ? markerSize : 0;
                moveTo = true;
                prevXInRange = undefined;
                nextPoint = undefined;
                actualLength = 0;
                for (i = 0; i < pointsData.length; i++) {
                    point = nextPoint || pointsData[i];
                    if (point.yDatum === undefined) {
                        prevXInRange = undefined;
                        moveTo = true;
                    }
                    else {
                        xDatum = point.xDatum, yDatum = point.yDatum, datum = point.datum;
                        x = xScale.convert(xDatum) + xOffset;
                        if (isNaN(x)) {
                            prevXInRange = undefined;
                            moveTo = true;
                            continue;
                        }
                        tolerance = (xScale.bandwidth || markerSize * 0.5 + (strokeWidth || 0)) + 1;
                        nextPoint = ((_a = pointsData[i + 1]) === null || _a === void 0 ? void 0 : _a.yDatum) === undefined ? undefined : pointsData[i + 1];
                        xInRange = xAxis.inRangeEx(x, 0, tolerance);
                        nextXInRange = nextPoint && xAxis.inRangeEx(xScale.convert(nextPoint.xDatum) + xOffset, 0, tolerance);
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
                            labelText = label.formatter({ value: yDatum, seriesId: seriesId });
                        }
                        else {
                            labelText =
                                typeof yDatum === 'number' && isFinite(yDatum)
                                    ? yDatum.toFixed(2)
                                    : yDatum
                                        ? String(yDatum)
                                        : '';
                        }
                        nodeData[actualLength++] = {
                            series: this,
                            datum: datum,
                            point: { x: x, y: y, moveTo: moveTo, size: size },
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
    LineSeries.prototype.updatePaths = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, _a, lineNode, linePath, nodeData_1, nodeData_1_1, data;
            var e_2, _b;
            return __generator(this, function (_c) {
                nodeData = opts.contextData.nodeData, _a = __read(opts.paths, 1), lineNode = _a[0];
                linePath = lineNode.path;
                lineNode.fill = undefined;
                lineNode.lineJoin = 'round';
                lineNode.pointerEvents = PointerEvents.None;
                linePath.clear({ trackChanges: true });
                try {
                    for (nodeData_1 = __values(nodeData), nodeData_1_1 = nodeData_1.next(); !nodeData_1_1.done; nodeData_1_1 = nodeData_1.next()) {
                        data = nodeData_1_1.value;
                        if (data.point.moveTo) {
                            linePath.moveTo(data.point.x, data.point.y);
                        }
                        else {
                            linePath.lineTo(data.point.x, data.point.y);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (nodeData_1_1 && !nodeData_1_1.done && (_b = nodeData_1.return)) _b.call(nodeData_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                lineNode.checkPathDirty();
                return [2 /*return*/];
            });
        });
    };
    LineSeries.prototype.updatePathNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, lineNode;
            return __generator(this, function (_b) {
                _a = __read(opts.paths, 1), lineNode = _a[0];
                lineNode.stroke = this.stroke;
                lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
                lineNode.strokeOpacity = this.strokeOpacity;
                lineNode.lineDash = this.lineDash;
                lineNode.lineDashOffset = this.lineDashOffset;
                return [2 /*return*/];
            });
        });
    };
    LineSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, markerSelection, _a, shape, enabled, MarkerShape, updateMarkerSelection, enterDatumSelection;
            return __generator(this, function (_b) {
                nodeData = opts.nodeData, markerSelection = opts.markerSelection;
                _a = this.marker, shape = _a.shape, enabled = _a.enabled;
                nodeData = shape && enabled ? nodeData : [];
                MarkerShape = getMarker(shape);
                if (this.marker.isDirty()) {
                    markerSelection = markerSelection.setData([]);
                    markerSelection.exit.remove();
                }
                updateMarkerSelection = markerSelection.setData(nodeData);
                updateMarkerSelection.exit.remove();
                enterDatumSelection = updateMarkerSelection.enter.append(MarkerShape);
                return [2 /*return*/, updateMarkerSelection.merge(enterDatumSelection)];
            });
        });
    };
    LineSeries.prototype.updateMarkerNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var markerSelection, isDatumHighlighted, _a, marker, markerFillOpacity, xKey, yKey, lineStroke, strokeOpacity, _b, deprecatedFill, deprecatedStroke, deprecatedStrokeWidth, _c, _d, highlightedFill, _e, highlightFillOpacity, _f, highlightedStroke, _g, highlightedDatumStrokeWidth, seriesId, size, formatter, markerStrokeWidth;
            return __generator(this, function (_h) {
                markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
                _a = this, marker = _a.marker, markerFillOpacity = _a.marker.fillOpacity, xKey = _a.xKey, yKey = _a.yKey, lineStroke = _a.stroke, strokeOpacity = _a.strokeOpacity, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.fillOpacity, highlightFillOpacity = _e === void 0 ? markerFillOpacity : _e, _f = _c.stroke, highlightedStroke = _f === void 0 ? deprecatedStroke : _f, _g = _c.strokeWidth, highlightedDatumStrokeWidth = _g === void 0 ? deprecatedStrokeWidth : _g, seriesId = _a.id;
                size = marker.size, formatter = marker.formatter;
                markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
                markerSelection.each(function (node, datum) {
                    var _a, _b;
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || lineStroke;
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : markerStrokeWidth;
                    var format = undefined;
                    if (formatter) {
                        format = formatter({
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
                    node.fill = (format && format.fill) || fill;
                    node.stroke = (format && format.stroke) || stroke;
                    node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
                    node.fillOpacity = (fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1);
                    node.strokeOpacity = (_b = (_a = marker.strokeOpacity, (_a !== null && _a !== void 0 ? _a : strokeOpacity)), (_b !== null && _b !== void 0 ? _b : 1));
                    node.size = format && format.size !== undefined ? format.size : size;
                    node.translationX = datum.point.x;
                    node.translationY = datum.point.y;
                    node.visible = node.size > 0 && !isNaN(datum.point.x) && !isNaN(datum.point.y);
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
            var labelData, labelSelection, _a, shape, enabled, updateTextSelection, enterTextSelection;
            return __generator(this, function (_b) {
                labelData = opts.labelData, labelSelection = opts.labelSelection;
                _a = this.marker, shape = _a.shape, enabled = _a.enabled;
                labelData = shape && enabled ? labelData : [];
                updateTextSelection = labelSelection.setData(labelData);
                updateTextSelection.exit.remove();
                enterTextSelection = updateTextSelection.enter.append(Text);
                return [2 /*return*/, updateTextSelection.merge(enterTextSelection)];
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
        return new CartesianSeriesNodeClickEvent(this.xKey, this.yKey, event, datum, this);
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, tooltip = _b.tooltip, marker = _b.marker, seriesId = _b.id;
        var tooltipRenderer = tooltip.renderer, tooltipFormat = tooltip.format;
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var title = sanitizeHtml(this.title || yName);
        var content = sanitizeHtml(xString + ': ' + yString);
        var markerFormatter = marker.formatter, fill = marker.fill, stroke = marker.stroke, markerStrokeWidth = marker.strokeWidth, size = marker.size;
        var strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
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
        var color = (format && format.fill) || fill;
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
        var _a, _b, _c;
        var _d = this, id = _d.id, data = _d.data, xKey = _d.xKey, yKey = _d.yKey, yName = _d.yName, visible = _d.visible, title = _d.title, marker = _d.marker, stroke = _d.stroke, strokeOpacity = _d.strokeOpacity;
        if (!(data && data.length && xKey && yKey)) {
            return [];
        }
        return [
            {
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: title || yName || yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: (_a = marker.fillOpacity, (_a !== null && _a !== void 0 ? _a : 1)),
                    strokeOpacity: (_c = (_b = marker.strokeOpacity, (_b !== null && _b !== void 0 ? _b : strokeOpacity)), (_c !== null && _c !== void 0 ? _c : 1)),
                },
            },
        ];
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
        Validate(STRING)
    ], LineSeries.prototype, "_xKey", void 0);
    __decorate([
        Validate(STRING)
    ], LineSeries.prototype, "xName", void 0);
    __decorate([
        Validate(STRING)
    ], LineSeries.prototype, "_yKey", void 0);
    __decorate([
        Validate(STRING)
    ], LineSeries.prototype, "yName", void 0);
    return LineSeries;
}(CartesianSeries));
export { LineSeries };
