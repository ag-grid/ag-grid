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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScatterSeries = void 0;
var series_1 = require("../series");
var array_1 = require("../../../util/array");
var linearScale_1 = require("../../../scale/linearScale");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var util_1 = require("../../marker/util");
var tooltip_1 = require("../../tooltip/tooltip");
var continuousScale_1 = require("../../../scale/continuousScale");
var sanitize_1 = require("../../../util/sanitize");
var label_1 = require("../../label");
var text_1 = require("../../../scene/shape/text");
var hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
var value_1 = require("../../../util/value");
var validation_1 = require("../../../util/validation");
var ScatterSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(ScatterSeriesNodeClickEvent, _super);
    function ScatterSeriesNodeClickEvent(sizeKey, xKey, yKey, nativeEvent, datum, series) {
        var _this = _super.call(this, xKey, yKey, nativeEvent, datum, series) || this;
        _this.sizeKey = sizeKey;
        return _this;
    }
    return ScatterSeriesNodeClickEvent;
}(cartesianSeries_1.CartesianSeriesNodeClickEvent));
var ScatterSeriesTooltip = /** @class */ (function (_super) {
    __extends(ScatterSeriesTooltip, _super);
    function ScatterSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], ScatterSeriesTooltip.prototype, "renderer", void 0);
    return ScatterSeriesTooltip;
}(series_1.SeriesTooltip));
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries() {
        var _this = _super.call(this, {
            pickModes: [
                series_1.SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                series_1.SeriesNodePickMode.NEAREST_NODE,
                series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            hasMarkers: true,
        }) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.validData = [];
        _this.sizeData = [];
        _this.sizeScale = new linearScale_1.LinearScale();
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.label = new label_1.Label();
        _this.title = undefined;
        _this.labelKey = undefined;
        _this.xName = '';
        _this.yName = '';
        _this.sizeName = 'Size';
        _this.labelName = 'Label';
        _this._xKey = '';
        _this._yKey = '';
        _this._sizeKey = undefined;
        _this.tooltip = new ScatterSeriesTooltip();
        var label = _this.label;
        label.enabled = false;
        return _this;
    }
    Object.defineProperty(ScatterSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            this._xKey = value;
            this.xData = [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScatterSeries.prototype, "yKey", {
        get: function () {
            return this._yKey;
        },
        set: function (value) {
            this._yKey = value;
            this.yData = [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScatterSeries.prototype, "sizeKey", {
        get: function () {
            return this._sizeKey;
        },
        set: function (value) {
            this._sizeKey = value;
            this.sizeData = [];
        },
        enumerable: false,
        configurable: true
    });
    ScatterSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xKey, yKey, sizeKey, xAxis, yAxis, marker, data, xScale, yScale, isContinuousX, isContinuousY;
            return __generator(this, function (_b) {
                _a = this, xKey = _a.xKey, yKey = _a.yKey, sizeKey = _a.sizeKey, xAxis = _a.xAxis, yAxis = _a.yAxis, marker = _a.marker;
                if (!xAxis || !yAxis) {
                    return [2 /*return*/];
                }
                data = xKey && yKey && this.data ? this.data : [];
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                isContinuousX = xScale instanceof continuousScale_1.ContinuousScale;
                isContinuousY = yScale instanceof continuousScale_1.ContinuousScale;
                this.validData = data.filter(function (d) { return value_1.checkDatum(d[xKey], isContinuousX) !== undefined && value_1.checkDatum(d[yKey], isContinuousY) !== undefined; });
                this.xData = this.validData.map(function (d) { return d[xKey]; });
                this.yData = this.validData.map(function (d) { return d[yKey]; });
                this.validateXYData(this.xKey, this.yKey, data, xAxis, yAxis, this.xData, this.yData, 1);
                this.sizeData = sizeKey ? this.validData.map(function (d) { return d[sizeKey]; }) : [];
                this.sizeScale.domain = marker.domain ? marker.domain : array_1.extent(this.sizeData) || [1, 1];
                if (xAxis.scale instanceof continuousScale_1.ContinuousScale) {
                    this.xDomain = this.fixNumericExtent(array_1.extent(this.xData), xAxis);
                }
                else {
                    this.xDomain = this.xData;
                }
                if (yAxis.scale instanceof continuousScale_1.ContinuousScale) {
                    this.yDomain = this.fixNumericExtent(array_1.extent(this.yData), yAxis);
                }
                else {
                    this.yDomain = this.yData;
                }
                return [2 /*return*/];
            });
        });
    };
    ScatterSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    ScatterSeries.prototype.getNodeClickEvent = function (event, datum) {
        return new ScatterSeriesNodeClickEvent(this.sizeKey, this.xKey, this.yKey, event, datum, this);
    };
    ScatterSeries.prototype.createNodeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, visible, xAxis, yAxis, yKey, label, labelKey, xScale, yScale, isContinuousX, isContinuousY, xOffset, yOffset, _b, xData, yData, validData, sizeData, sizeScale, marker, nodeData, font, actualLength, i, xy, x, y, text, size, markerSize;
            return __generator(this, function (_c) {
                _a = this, data = _a.data, visible = _a.visible, xAxis = _a.xAxis, yAxis = _a.yAxis, yKey = _a.yKey, label = _a.label, labelKey = _a.labelKey;
                if (!(data && visible && xAxis && yAxis)) {
                    return [2 /*return*/, []];
                }
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                isContinuousX = xScale instanceof continuousScale_1.ContinuousScale;
                isContinuousY = yScale instanceof continuousScale_1.ContinuousScale;
                xOffset = (xScale.bandwidth || 0) / 2;
                yOffset = (yScale.bandwidth || 0) / 2;
                _b = this, xData = _b.xData, yData = _b.yData, validData = _b.validData, sizeData = _b.sizeData, sizeScale = _b.sizeScale, marker = _b.marker;
                nodeData = new Array(xData.length);
                sizeScale.range = [marker.size, marker.maxSize];
                font = label.getFont();
                actualLength = 0;
                for (i = 0; i < xData.length; i++) {
                    xy = this.checkDomainXY(xData[i], yData[i], isContinuousX, isContinuousY);
                    if (!xy) {
                        continue;
                    }
                    x = xScale.convert(xy[0]) + xOffset;
                    y = yScale.convert(xy[1]) + yOffset;
                    if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
                        continue;
                    }
                    text = labelKey ? String(validData[i][labelKey]) : '';
                    size = hdpiCanvas_1.HdpiCanvas.getTextSize(text, font);
                    markerSize = sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size;
                    nodeData[actualLength++] = {
                        series: this,
                        itemId: yKey,
                        datum: validData[i],
                        point: { x: x, y: y, size: markerSize },
                        label: __assign({ text: text }, size),
                    };
                }
                nodeData.length = actualLength;
                return [2 /*return*/, [{ itemId: this.yKey, nodeData: nodeData, labelData: nodeData }]];
            });
        });
    };
    ScatterSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    ScatterSeries.prototype.getLabelData = function () {
        var _a;
        return (_a = this.contextNodeData) === null || _a === void 0 ? void 0 : _a.reduce(function (r, n) { return r.concat(n.labelData); }, []);
    };
    ScatterSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, markerSelection, _a, enabled, shape, MarkerShape, data, updateMarkers, enterMarkers;
            return __generator(this, function (_b) {
                nodeData = opts.nodeData, markerSelection = opts.markerSelection;
                _a = this.marker, enabled = _a.enabled, shape = _a.shape;
                MarkerShape = util_1.getMarker(shape);
                if (this.marker.isDirty()) {
                    markerSelection = markerSelection.setData([]);
                    markerSelection.exit.remove();
                }
                data = enabled ? nodeData : [];
                updateMarkers = markerSelection.setData(data);
                updateMarkers.exit.remove();
                enterMarkers = updateMarkers.enter.append(MarkerShape);
                return [2 /*return*/, updateMarkers.merge(enterMarkers)];
            });
        });
    };
    ScatterSeries.prototype.updateMarkerNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var markerSelection, isDatumHighlighted, _a, marker, xKey, yKey, sizeScale, _b, markerFillOpacity, markerStrokeOpacity, markerStrokeWidth, _c, highlightedFill, _d, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, seriesId, formatter, customMarker;
            return __generator(this, function (_e) {
                markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
                _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, sizeScale = _a.sizeScale, _b = _a.marker, markerFillOpacity = _b.fillOpacity, markerStrokeOpacity = _b.strokeOpacity, markerStrokeWidth = _b.strokeWidth, _c = _a.highlightStyle.item, highlightedFill = _c.fill, _d = _c.fillOpacity, highlightFillOpacity = _d === void 0 ? markerFillOpacity : _d, highlightedStroke = _c.stroke, highlightedDatumStrokeWidth = _c.strokeWidth, seriesId = _a.id;
                formatter = marker.formatter;
                sizeScale.range = [marker.size, marker.maxSize];
                customMarker = typeof marker.shape === 'function';
                markerSelection.each(function (node, datum) {
                    var _a, _b, _c, _d, _e, _f, _g;
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke;
                    var strokeOpacity = markerStrokeOpacity;
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : 1;
                    var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
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
                    node.strokeWidth = (_c = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _c !== void 0 ? _c : strokeWidth;
                    node.size = format && format.size !== undefined ? format.size : size;
                    node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                    node.strokeOpacity = strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1;
                    node.translationX = (_e = (_d = datum.point) === null || _d === void 0 ? void 0 : _d.x) !== null && _e !== void 0 ? _e : 0;
                    node.translationY = (_g = (_f = datum.point) === null || _f === void 0 ? void 0 : _f.y) !== null && _g !== void 0 ? _g : 0;
                    node.visible = node.size > 0;
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
    ScatterSeries.prototype.updateLabelSelection = function (opts) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, enabled, placedLabels, placedNodeDatum, updateLabels, enterLabels;
            return __generator(this, function (_c) {
                labelSelection = opts.labelSelection;
                enabled = this.label.enabled;
                placedLabels = enabled ? (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.placeLabels().get(this)) !== null && _b !== void 0 ? _b : [] : [];
                placedNodeDatum = placedLabels.map(function (v) { return (__assign(__assign({}, v.datum), { point: {
                        x: v.x,
                        y: v.y,
                        size: v.datum.point.size,
                    } })); });
                updateLabels = labelSelection.setData(placedNodeDatum);
                updateLabels.exit.remove();
                enterLabels = updateLabels.enter.append(text_1.Text);
                return [2 /*return*/, updateLabels.merge(enterLabels)];
            });
        });
    };
    ScatterSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, label;
            return __generator(this, function (_a) {
                labelSelection = opts.labelSelection;
                label = this.label;
                labelSelection.each(function (text, datum) {
                    var _a, _b, _c, _d;
                    text.text = datum.label.text;
                    text.fill = label.color;
                    text.x = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0;
                    text.y = (_d = (_c = datum.point) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0;
                    text.fontStyle = label.fontStyle;
                    text.fontWeight = label.fontWeight;
                    text.fontSize = label.fontSize;
                    text.fontFamily = label.fontFamily;
                    text.textAlign = 'left';
                    text.textBaseline = 'top';
                });
                return [2 /*return*/];
            });
        });
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b, _c;
        var _d = this, xKey = _d.xKey, yKey = _d.yKey, xAxis = _d.xAxis, yAxis = _d.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _e = this, marker = _e.marker, tooltip = _e.tooltip, xName = _e.xName, yName = _e.yName, sizeKey = _e.sizeKey, sizeName = _e.sizeName, labelKey = _e.labelKey, labelName = _e.labelName, seriesId = _e.id;
        var fill = marker.fill, stroke = marker.stroke;
        var strokeWidth = this.getStrokeWidth((_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : 1);
        var formatter = this.marker.formatter;
        var format = undefined;
        if (formatter) {
            format = formatter({
                datum: nodeDatum,
                xKey: xKey,
                yKey: yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: (_c = (_b = nodeDatum.point) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0,
                highlighted: false,
                seriesId: seriesId,
            });
        }
        var color = (format && format.fill) || fill || 'gray';
        var title = this.title || yName;
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = sanitize_1.sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitize_1.sanitizeHtml(yAxis.formatDatum(yValue));
        var content = "<b>" + sanitize_1.sanitizeHtml(xName || xKey) + "</b>: " + xString + "<br>" +
            ("<b>" + sanitize_1.sanitizeHtml(yName || yKey) + "</b>: " + yString);
        if (sizeKey) {
            content += "<br><b>" + sanitize_1.sanitizeHtml(sizeName || sizeKey) + "</b>: " + sanitize_1.sanitizeHtml(datum[sizeKey]);
        }
        if (labelKey) {
            content = "<b>" + sanitize_1.sanitizeHtml(labelName || labelKey) + "</b>: " + sanitize_1.sanitizeHtml(datum[labelKey]) + "<br>" + content;
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        var tooltipRenderer = tooltip.renderer;
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                sizeKey: sizeKey,
                sizeName: sizeName,
                labelKey: labelKey,
                labelName: labelName,
                title: title,
                color: color,
                seriesId: seriesId,
            }), defaults);
        }
        return tooltip_1.toTooltipHtml(defaults);
    };
    ScatterSeries.prototype.getLegendData = function () {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKey = _a.yKey, yName = _a.yName, title = _a.title, visible = _a.visible, marker = _a.marker;
        var fill = marker.fill, stroke = marker.stroke, fillOpacity = marker.fillOpacity, strokeOpacity = marker.strokeOpacity;
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
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1,
                    strokeOpacity: strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1,
                },
            },
        ];
    };
    ScatterSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    ScatterSeries.className = 'ScatterSeries';
    ScatterSeries.type = 'scatter';
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "title", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "labelKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], ScatterSeries.prototype, "xName", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], ScatterSeries.prototype, "yName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "sizeName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "labelName", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], ScatterSeries.prototype, "_xKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], ScatterSeries.prototype, "_yKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "_sizeKey", void 0);
    return ScatterSeries;
}(cartesianSeries_1.CartesianSeries));
exports.ScatterSeries = ScatterSeries;
