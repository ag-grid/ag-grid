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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaSeries = void 0;
var node_1 = require("../../../scene/node");
var series_1 = require("../series");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var util_1 = require("../../marker/util");
var tooltip_1 = require("../../tooltip/tooltip");
var array_1 = require("../../../util/array");
var string_1 = require("../../../util/string");
var label_1 = require("../../label");
var sanitize_1 = require("../../../util/sanitize");
var value_1 = require("../../../util/value");
var continuousScale_1 = require("../../../scale/continuousScale");
var validation_1 = require("../../../util/validation");
var logAxis_1 = require("../../axis/logAxis");
var timeAxis_1 = require("../../axis/timeAxis");
var processors_1 = require("../../data/processors");
var AreaSeriesLabel = /** @class */ (function (_super) {
    __extends(AreaSeriesLabel, _super);
    function AreaSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], AreaSeriesLabel.prototype, "formatter", void 0);
    return AreaSeriesLabel;
}(label_1.Label));
var AreaSeriesTooltip = /** @class */ (function (_super) {
    __extends(AreaSeriesTooltip, _super);
    function AreaSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        _this.format = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], AreaSeriesTooltip.prototype, "renderer", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AreaSeriesTooltip.prototype, "format", void 0);
    return AreaSeriesTooltip;
}(series_1.SeriesTooltip));
var AreaSeriesTag;
(function (AreaSeriesTag) {
    AreaSeriesTag[AreaSeriesTag["Fill"] = 0] = "Fill";
    AreaSeriesTag[AreaSeriesTag["Stroke"] = 1] = "Stroke";
    AreaSeriesTag[AreaSeriesTag["Marker"] = 2] = "Marker";
    AreaSeriesTag[AreaSeriesTag["Label"] = 3] = "Label";
})(AreaSeriesTag || (AreaSeriesTag = {}));
var AreaSeries = /** @class */ (function (_super) {
    __extends(AreaSeries, _super);
    function AreaSeries(moduleCtx) {
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
        }) || this;
        _this.tooltip = new AreaSeriesTooltip();
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.label = new AreaSeriesLabel();
        _this.fill = '#c16068';
        _this.stroke = '#874349';
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.xKey = undefined;
        _this.xName = undefined;
        _this.strokeWidth = 2;
        _this.shadow = undefined;
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.enabled = false;
        label.enabled = false;
        return _this;
    }
    AreaSeries.prototype.processData = function (dataController) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xKey, yKey, axes, normalizedTo, data, visible, _b, _c, _d, groupIndex, xAxis, yAxis, isContinuousX, isContinuousY, ids, extraProps, normaliseTo, _e, dataModel, processedData;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = this, xKey = _a.xKey, yKey = _a.yKey, axes = _a.axes, normalizedTo = _a.normalizedTo, data = _a.data, visible = _a.visible, _b = _a.seriesGrouping, _c = _b === void 0 ? {} : _b, _d = _c.groupIndex, groupIndex = _d === void 0 ? this.id : _d;
                        if (!xKey || !yKey || !data)
                            return [2 /*return*/];
                        xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
                        yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
                        isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof continuousScale_1.ContinuousScale;
                        isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof continuousScale_1.ContinuousScale;
                        ids = [
                            "area-stack-" + groupIndex + "-yValues",
                            "area-stack-" + groupIndex + "-yValues-trailing",
                            "area-stack-" + groupIndex + "-yValues-prev",
                            "area-stack-" + groupIndex + "-yValues-trailing-prev",
                            "area-stack-" + groupIndex + "-yValues-marker",
                        ];
                        extraProps = [];
                        normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
                        if (normaliseTo) {
                            extraProps.push(processors_1.normaliseGroupTo(this, [ids[0], ids[1], ids[4]], normaliseTo, 'range'));
                            extraProps.push(processors_1.normaliseGroupTo(this, [ids[2], ids[3]], normaliseTo, 'range'));
                        }
                        return [4 /*yield*/, dataController.request(this.id, data, {
                                props: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                                    series_1.keyProperty(this, xKey, isContinuousX, { id: 'xValue' }),
                                    series_1.valueProperty(this, yKey, isContinuousY, { id: "yValue-raw", invalidValue: null })
                                ], __read(series_1.groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window', 'current', {
                                    id: "yValue-end",
                                    invalidValue: null,
                                    groupId: ids[0],
                                }))), __read(series_1.groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window-trailing', 'current', {
                                    id: "yValue-start",
                                    invalidValue: null,
                                    groupId: ids[1],
                                }))), __read(series_1.groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window', 'last', {
                                    id: "yValue-previous-end",
                                    invalidValue: null,
                                    groupId: ids[2],
                                }))), __read(series_1.groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window-trailing', 'last', {
                                    id: "yValue-previous-start",
                                    invalidValue: null,
                                    groupId: ids[3],
                                }))), __read(series_1.groupAccumulativeValueProperty(this, yKey, isContinuousY, 'normal', 'current', {
                                    id: "yValue-cumulative",
                                    invalidValue: null,
                                    groupId: ids[4],
                                }))), __read(extraProps)),
                                groupByKeys: true,
                                dataVisible: visible,
                            })];
                    case 1:
                        _e = _f.sent(), dataModel = _e.dataModel, processedData = _e.processedData;
                        this.dataModel = dataModel;
                        this.processedData = processedData;
                        return [2 /*return*/];
                }
            });
        });
    };
    AreaSeries.prototype.getDomain = function (direction) {
        var _a = this, processedData = _a.processedData, dataModel = _a.dataModel, axes = _a.axes;
        if (!processedData || !dataModel)
            return [];
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        var keyDef = dataModel.resolveProcessedDataDefById(this, "xValue");
        var keys = dataModel.getDomain(this, "xValue", 'key', processedData);
        var yExtent = dataModel.getDomain(this, /yValue-(previous-)?end/, 'value', processedData);
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            if ((keyDef === null || keyDef === void 0 ? void 0 : keyDef.def.type) === 'key' && keyDef.def.valueType === 'category') {
                return keys;
            }
            return this.fixNumericExtent(array_1.extent(keys), xAxis);
        }
        else if (yAxis instanceof logAxis_1.LogAxis || yAxis instanceof timeAxis_1.TimeAxis) {
            return this.fixNumericExtent(yExtent, yAxis);
        }
        else {
            var fixedYExtent = [yExtent[0] > 0 ? 0 : yExtent[0], yExtent[1] < 0 ? 0 : yExtent[1]];
            return this.fixNumericExtent(fixedYExtent, yAxis);
        }
    };
    AreaSeries.prototype.createNodeData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, axes, data, _c, _d, groupedData, dataModel, callbackCache, xAxis, yAxis, _e, _f, yKey, _g, xKey, marker, label, fill, stroke, seriesId, xScale, yScale, continuousY, xOffset, yStartIndex, yEndIndex, yRawIndex, yPreviousStartIndex, yPreviousEndIndex, yCumulativeIndex, createPathCoordinates, createMarkerCoordinate, labelSelectionData, markerSelectionData, strokeSelectionData, fillSelectionData, context, fillPoints, fillPhantomPoints, strokePoints, yValues, datumIdx, lastXDatum, i;
            var _this = this;
            return __generator(this, function (_h) {
                _b = this, axes = _b.axes, data = _b.data, _c = _b.processedData, _d = _c === void 0 ? {} : _c, groupedData = _d.data, dataModel = _b.dataModel, callbackCache = _b.ctx.callbackCache;
                xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
                yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
                if (!xAxis || !yAxis || !data || !dataModel) {
                    return [2 /*return*/, []];
                }
                _e = this, _f = _e.yKey, yKey = _f === void 0 ? '' : _f, _g = _e.xKey, xKey = _g === void 0 ? '' : _g, marker = _e.marker, label = _e.label, fill = _e.fill, stroke = _e.stroke, seriesId = _e.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                continuousY = yScale instanceof continuousScale_1.ContinuousScale;
                xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
                yStartIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-start").index;
                yEndIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-end").index;
                yRawIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-raw").index;
                yPreviousStartIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-previous-start").index;
                yPreviousEndIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-previous-end").index;
                yCumulativeIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-cumulative").index;
                createPathCoordinates = function (xDatum, lastYEnd, yEnd) {
                    var x = xScale.convert(xDatum) + xOffset;
                    var prevYCoordinate = yScale.convert(lastYEnd, { strict: false });
                    var currYCoordinate = yScale.convert(yEnd, { strict: false });
                    return [
                        { x: x, y: currYCoordinate, size: marker.size },
                        { x: x, y: prevYCoordinate, size: marker.size },
                    ];
                };
                createMarkerCoordinate = function (xDatum, yEnd, rawYDatum) {
                    var currY;
                    // if not normalized, the invalid data points will be processed as `undefined` in processData()
                    // if normalized, the invalid data points will be processed as 0 rather than `undefined`
                    // check if unprocessed datum is valid as we only want to show markers for valid points
                    var normalized = _this.normalizedTo && isFinite(_this.normalizedTo);
                    var normalizedAndValid = normalized && continuousY && value_1.isContinuous(rawYDatum);
                    var valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;
                    if (valid) {
                        currY = yEnd;
                    }
                    var x = xScale.convert(xDatum) + xOffset;
                    var y = yScale.convert(currY, { strict: false });
                    return { x: x, y: y, size: marker.size };
                };
                labelSelectionData = [];
                markerSelectionData = [];
                strokeSelectionData = { itemId: yKey, points: [], yValues: [] };
                fillSelectionData = { itemId: yKey, points: [] };
                context = {
                    itemId: yKey,
                    fillSelectionData: fillSelectionData,
                    labelData: labelSelectionData,
                    nodeData: markerSelectionData,
                    strokeSelectionData: strokeSelectionData,
                };
                fillPoints = fillSelectionData.points;
                fillPhantomPoints = [];
                strokePoints = strokeSelectionData.points;
                yValues = strokeSelectionData.yValues;
                datumIdx = -1;
                groupedData === null || groupedData === void 0 ? void 0 : groupedData.forEach(function (datumGroup) {
                    var _a = __read(datumGroup.keys, 1), xDatum = _a[0], datumArray = datumGroup.datum, valuesArray = datumGroup.values;
                    valuesArray.forEach(function (values, valueIdx) {
                        var _a;
                        datumIdx++;
                        var seriesDatum = datumArray[valueIdx];
                        var yRawDatum = values[yRawIndex];
                        var yStart = values[yStartIndex];
                        var yEnd = values[yEndIndex];
                        var yPreviousStart = values[yPreviousStartIndex];
                        var yPreviousEnd = values[yPreviousEndIndex];
                        var yCumulative = values[yCumulativeIndex];
                        var validPoint = yRawDatum != null;
                        // marker data
                        var point = createMarkerCoordinate(xDatum, +yCumulative, yRawDatum);
                        if (validPoint && marker) {
                            markerSelectionData.push({
                                index: datumIdx,
                                series: _this,
                                itemId: yKey,
                                datum: seriesDatum,
                                nodeMidPoint: { x: point.x, y: point.y },
                                cumulativeValue: yEnd,
                                yValue: yRawDatum,
                                xValue: xDatum,
                                yKey: yKey,
                                xKey: xKey,
                                point: point,
                                fill: fill,
                                stroke: stroke,
                            });
                        }
                        // label data
                        if (validPoint && label) {
                            var labelText = void 0;
                            if (label.formatter) {
                                labelText = (_a = callbackCache.call(label.formatter, { value: yRawDatum, seriesId: seriesId })) !== null && _a !== void 0 ? _a : '';
                            }
                            else {
                                labelText = value_1.isNumber(yRawDatum) ? Number(yRawDatum).toFixed(2) : String(yRawDatum);
                            }
                            labelSelectionData.push({
                                index: datumIdx,
                                itemId: yKey,
                                point: point,
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
                            });
                        }
                        // fill data
                        // Handle data in pairs of current and next x and y values
                        var windowX = [lastXDatum, xDatum];
                        var windowYStart = [yPreviousStart, yStart];
                        var windowYEnd = [yPreviousEnd, yEnd];
                        if (windowX.some(function (v) { return v == undefined; })) {
                            lastXDatum = xDatum;
                            return;
                        }
                        if (windowYStart.some(function (v) { return v == undefined; })) {
                            windowYStart[0] = 0;
                            windowYStart[1] = 0;
                        }
                        if (windowYEnd.some(function (v) { return v == undefined; })) {
                            windowYEnd[0] = 0;
                            windowYEnd[1] = 0;
                        }
                        var prevCoordinates = createPathCoordinates(lastXDatum, +windowYStart[0], +windowYEnd[0]);
                        fillPoints.push(prevCoordinates[0]);
                        fillPhantomPoints.push(prevCoordinates[1]);
                        var nextCoordinates = createPathCoordinates(xDatum, +windowYStart[1], +windowYEnd[1]);
                        fillPoints.push(nextCoordinates[0]);
                        fillPhantomPoints.push(nextCoordinates[1]);
                        // stroke data
                        strokePoints.push({ x: NaN, y: NaN }); // moveTo
                        yValues.push(undefined);
                        if (yPreviousEnd != null) {
                            strokePoints.push(prevCoordinates[0]);
                            yValues.push(yPreviousEnd);
                        }
                        if (yEnd != undefined) {
                            strokePoints.push(nextCoordinates[0]);
                            yValues.push(yEnd);
                        }
                        lastXDatum = xDatum;
                    });
                });
                for (i = fillPhantomPoints.length - 1; i >= 0; i--) {
                    fillPoints.push(fillPhantomPoints[i]);
                }
                return [2 /*return*/, [context]];
            });
        });
    };
    AreaSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    AreaSeries.prototype.markerFactory = function () {
        var shape = this.marker.shape;
        var MarkerShape = util_1.getMarker(shape);
        return new MarkerShape();
    };
    AreaSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, markerSelection, enabled, data;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, markerSelection = opts.markerSelection;
                enabled = this.marker.enabled;
                data = enabled && nodeData ? nodeData : [];
                if (this.marker.isDirty()) {
                    markerSelection.clear();
                }
                return [2 /*return*/, markerSelection.update(data, function (marker) {
                        marker.tag = AreaSeriesTag.Marker;
                    })];
            });
        });
    };
    AreaSeries.prototype.updateMarkerNodes = function (opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var markerSelection, isDatumHighlighted, _b, seriesId, _c, xKey, marker, seriesFill, seriesStroke, seriesFillOpacity, _d, markerFillOpacity, strokeOpacity, _e, highlightedFill, _f, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, visible, callbackCache, size, formatter, markerStrokeWidth, customMarker;
            return __generator(this, function (_g) {
                markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
                _b = this, seriesId = _b.id, _c = _b.xKey, xKey = _c === void 0 ? '' : _c, marker = _b.marker, seriesFill = _b.fill, seriesStroke = _b.stroke, seriesFillOpacity = _b.fillOpacity, _d = _b.marker.fillOpacity, markerFillOpacity = _d === void 0 ? seriesFillOpacity : _d, strokeOpacity = _b.strokeOpacity, _e = _b.highlightStyle.item, highlightedFill = _e.fill, _f = _e.fillOpacity, highlightFillOpacity = _f === void 0 ? markerFillOpacity : _f, highlightedStroke = _e.stroke, highlightedDatumStrokeWidth = _e.strokeWidth, visible = _b.visible, callbackCache = _b.ctx.callbackCache;
                size = marker.size, formatter = marker.formatter;
                markerStrokeWidth = (_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : this.strokeWidth;
                customMarker = typeof marker.shape === 'function';
                markerSelection.each(function (node, datum) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : (_a = marker.fill) !== null && _a !== void 0 ? _a : seriesFill;
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined
                        ? highlightedStroke
                        : (_b = marker.stroke) !== null && _b !== void 0 ? _b : seriesStroke;
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : markerStrokeWidth;
                    var format = undefined;
                    if (formatter) {
                        format = callbackCache.call(formatter, {
                            datum: datum.datum,
                            xKey: xKey,
                            yKey: datum.yKey,
                            fill: fill,
                            stroke: stroke,
                            strokeWidth: strokeWidth,
                            size: size,
                            highlighted: isDatumHighlighted,
                            seriesId: seriesId,
                        });
                    }
                    node.fill = (_c = format === null || format === void 0 ? void 0 : format.fill) !== null && _c !== void 0 ? _c : fill;
                    node.stroke = (_d = format === null || format === void 0 ? void 0 : format.stroke) !== null && _d !== void 0 ? _d : stroke;
                    node.strokeWidth = (_e = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _e !== void 0 ? _e : strokeWidth;
                    node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                    node.strokeOpacity = (_g = (_f = marker.strokeOpacity) !== null && _f !== void 0 ? _f : strokeOpacity) !== null && _g !== void 0 ? _g : 1;
                    node.size = (_h = format === null || format === void 0 ? void 0 : format.size) !== null && _h !== void 0 ? _h : size;
                    node.translationX = datum.point.x;
                    node.translationY = datum.point.y;
                    node.visible = node.size > 0 && visible && !isNaN(datum.point.x) && !isNaN(datum.point.y);
                    if (!customMarker || node.dirtyPath) {
                        return;
                    }
                    // Only for custom marker shapes
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
    AreaSeries.prototype.updateLabelSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelData, labelSelection;
            return __generator(this, function (_a) {
                labelData = opts.labelData, labelSelection = opts.labelSelection;
                return [2 /*return*/, labelSelection.update(labelData, function (text) {
                        text.tag = AreaSeriesTag.Label;
                    })];
            });
        });
    };
    AreaSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, _a, labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color;
            return __generator(this, function (_b) {
                labelSelection = opts.labelSelection;
                _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
                labelSelection.each(function (text, datum) {
                    var point = datum.point, label = datum.label;
                    if (label && labelEnabled) {
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
    AreaSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a;
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    AreaSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a;
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b, _c;
        var _d = this, xKey = _d.xKey, seriesId = _d.id, axes = _d.axes, xName = _d.xName, yName = _d.yName, seriesFill = _d.fill, seriesStroke = _d.stroke, tooltip = _d.tooltip, marker = _d.marker, dataModel = _d.dataModel;
        var yKey = nodeDatum.yKey, xValue = nodeDatum.xValue, yValue = nodeDatum.yValue, datum = nodeDatum.datum;
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        if (!(xKey && yKey) || !(xAxis && yAxis && value_1.isNumber(yValue)) || !dataModel) {
            return '';
        }
        var yRawIndex = dataModel.resolveProcessedDataIndexById(this, "yValue-raw").index;
        var size = marker.size, markerFormatter = marker.formatter, markerStrokeWidth = marker.strokeWidth, markerFill = marker.fill, markerStroke = marker.stroke;
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var processedYValue = (_b = (_a = this.processedData) === null || _a === void 0 ? void 0 : _a.data[nodeDatum.index]) === null || _b === void 0 ? void 0 : _b.values[0][yRawIndex];
        var title = sanitize_1.sanitizeHtml(yName);
        var content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
        var strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : this.strokeWidth;
        var fill = markerFill !== null && markerFill !== void 0 ? markerFill : seriesFill;
        var stroke = markerStroke !== null && markerStroke !== void 0 ? markerStroke : seriesStroke;
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
        var color = (_c = format === null || format === void 0 ? void 0 : format.fill) !== null && _c !== void 0 ? _c : fill;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        var tooltipRenderer = tooltip.renderer, tooltipFormat = tooltip.format;
        if (tooltipFormat || tooltipRenderer) {
            var params = {
                datum: datum,
                xKey: xKey,
                xName: xName,
                xValue: xValue,
                yKey: yKey,
                yValue: yValue,
                processedYValue: processedYValue,
                yName: yName,
                color: color,
                title: title,
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
    AreaSeries.prototype.getLegendData = function () {
        var _a, _b, _c, _d;
        var _e = this, data = _e.data, id = _e.id, xKey = _e.xKey, yKey = _e.yKey, yName = _e.yName, marker = _e.marker, fill = _e.fill, stroke = _e.stroke, fillOpacity = _e.fillOpacity, strokeOpacity = _e.strokeOpacity, visible = _e.visible;
        if (!(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKey) {
            return [];
        }
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        return [
            {
                legendType: 'category',
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: yName !== null && yName !== void 0 ? yName : yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: (_a = marker.fill) !== null && _a !== void 0 ? _a : fill,
                    stroke: (_b = marker.stroke) !== null && _b !== void 0 ? _b : stroke,
                    fillOpacity: (_c = marker.fillOpacity) !== null && _c !== void 0 ? _c : fillOpacity,
                    strokeOpacity: (_d = marker.strokeOpacity) !== null && _d !== void 0 ? _d : strokeOpacity,
                },
            },
        ];
    };
    AreaSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var markerSelections = _a.markerSelections, labelSelections = _a.labelSelections, contextData = _a.contextData, paths = _a.paths, seriesRect = _a.seriesRect;
        var _b = this, seriesStroke = _b.stroke, seriesFill = _b.fill, fillOpacity = _b.fillOpacity, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, strokeOpacity = _b.strokeOpacity, strokeWidth = _b.strokeWidth, shadow = _b.shadow;
        contextData.forEach(function (_a, seriesIdx) {
            var _b, _c, _d, _e, _f;
            var fillSelectionData = _a.fillSelectionData, strokeSelectionData = _a.strokeSelectionData, itemId = _a.itemId;
            var _g = __read(paths[seriesIdx], 2), fill = _g[0], stroke = _g[1];
            var duration = (_c = (_b = _this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.defaultOptions.duration) !== null && _c !== void 0 ? _c : 1000;
            var markerDuration = 200;
            var animationOptions = {
                from: 0,
                to: (_d = seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) !== null && _d !== void 0 ? _d : 0,
                duration: duration,
            };
            // Stroke
            {
                var points_1 = strokeSelectionData.points, yValues_1 = strokeSelectionData.yValues;
                stroke.tag = AreaSeriesTag.Stroke;
                stroke.fill = undefined;
                stroke.lineJoin = stroke.lineCap = 'round';
                stroke.pointerEvents = node_1.PointerEvents.None;
                stroke.stroke = seriesStroke;
                stroke.strokeWidth = _this.getStrokeWidth(_this.strokeWidth, { itemId: itemId });
                stroke.strokeOpacity = strokeOpacity;
                stroke.lineDash = lineDash;
                stroke.lineDashOffset = lineDashOffset;
                (_e = _this.ctx.animationManager) === null || _e === void 0 ? void 0 : _e.animate(_this.id + "_empty-update-ready_stroke_" + seriesIdx, __assign(__assign({}, animationOptions), { onUpdate: function (xValue) {
                        stroke.path.clear({ trackChanges: true });
                        var moveTo = true;
                        points_1.forEach(function (point, index) {
                            // Draw/move the full segment if past the end of this segment
                            if (yValues_1[index] === undefined || isNaN(point.x) || isNaN(point.y)) {
                                moveTo = true;
                            }
                            else if (point.x <= xValue) {
                                if (moveTo) {
                                    stroke.path.moveTo(point.x, point.y);
                                    moveTo = false;
                                }
                                else {
                                    stroke.path.lineTo(point.x, point.y);
                                }
                            }
                            else if (index > 0 &&
                                yValues_1[index] !== undefined &&
                                yValues_1[index - 1] !== undefined &&
                                points_1[index - 1].x <= xValue) {
                                // Draw/move partial line if in between the start and end of this segment
                                var start = points_1[index - 1];
                                var end = point;
                                var x = xValue;
                                var y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                stroke.path.lineTo(x, y);
                            }
                        });
                        stroke.checkPathDirty();
                    } }));
            }
            // Fill
            {
                var allPoints = fillSelectionData.points;
                var points_2 = allPoints.slice(0, allPoints.length / 2);
                var bottomPoints_1 = allPoints.slice(allPoints.length / 2);
                fill.tag = AreaSeriesTag.Fill;
                fill.stroke = undefined;
                fill.lineJoin = 'round';
                fill.pointerEvents = node_1.PointerEvents.None;
                fill.fill = seriesFill;
                fill.fillOpacity = fillOpacity;
                fill.strokeOpacity = strokeOpacity;
                fill.strokeWidth = strokeWidth;
                fill.lineDash = lineDash;
                fill.lineDashOffset = lineDashOffset;
                fill.fillShadow = shadow;
                (_f = _this.ctx.animationManager) === null || _f === void 0 ? void 0 : _f.animate(_this.id + "_empty-update-ready_fill_" + seriesIdx, __assign(__assign({}, animationOptions), { onUpdate: function (xValue) {
                        fill.path.clear({ trackChanges: true });
                        var x = 0;
                        var y = 0;
                        points_2.forEach(function (point, index) {
                            if (point.x <= xValue) {
                                // Draw/move the full segment if past the end of this segment
                                x = point.x;
                                y = point.y;
                                fill.path.lineTo(point.x, point.y);
                            }
                            else if (index > 0 && points_2[index - 1].x < xValue) {
                                // Draw/move partial line if in between the start and end of this segment
                                var start = points_2[index - 1];
                                var end = point;
                                x = xValue;
                                y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                fill.path.lineTo(x, y);
                            }
                        });
                        bottomPoints_1.forEach(function (point, index) {
                            var reverseIndex = bottomPoints_1.length - index - 1;
                            if (point.x <= xValue) {
                                fill.path.lineTo(point.x, point.y);
                            }
                            else if (reverseIndex > 0 && points_2[reverseIndex - 1].x < xValue) {
                                var start = point;
                                var end = bottomPoints_1[index + 1];
                                var bottomY = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                fill.path.lineTo(x, bottomY);
                            }
                        });
                        if (bottomPoints_1.length > 0) {
                            fill.path.lineTo(bottomPoints_1[bottomPoints_1.length - 1].x, bottomPoints_1[bottomPoints_1.length - 1].y);
                        }
                        fill.path.closePath();
                        fill.checkPathDirty();
                    } }));
            }
            markerSelections[seriesIdx].each(function (marker, datum) {
                var _a, _b, _c, _d;
                var delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                var format = _this.animateFormatter(datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                (_c = _this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.animate(_this.id + "_empty-update-ready_" + marker.id, __assign(__assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay: delay, duration: markerDuration, onUpdate: function (size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[seriesIdx].each(function (label, datum) {
                var _a;
                var delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
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
    AreaSeries.prototype.animateReadyUpdate = function (_a) {
        var _this = this;
        var contextData = _a.contextData, paths = _a.paths;
        var _b = this, seriesStroke = _b.stroke, seriesFill = _b.fill, fillOpacity = _b.fillOpacity, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, strokeOpacity = _b.strokeOpacity, strokeWidth = _b.strokeWidth, shadow = _b.shadow;
        contextData.forEach(function (_a, seriesIdx) {
            var strokeSelectionData = _a.strokeSelectionData, fillSelectionData = _a.fillSelectionData, itemId = _a.itemId;
            var _b = __read(paths[seriesIdx], 2), fill = _b[0], stroke = _b[1];
            // Stroke
            stroke.stroke = seriesStroke;
            stroke.strokeWidth = _this.getStrokeWidth(_this.strokeWidth, { itemId: itemId });
            stroke.strokeOpacity = strokeOpacity;
            stroke.lineDash = lineDash;
            stroke.lineDashOffset = lineDashOffset;
            stroke.path.clear({ trackChanges: true });
            var moveTo = true;
            strokeSelectionData.points.forEach(function (point, index) {
                if (strokeSelectionData.yValues[index] === undefined || isNaN(point.x) || isNaN(point.y)) {
                    moveTo = true;
                }
                else if (moveTo) {
                    stroke.path.moveTo(point.x, point.y);
                    moveTo = false;
                }
                else {
                    stroke.path.lineTo(point.x, point.y);
                }
            });
            stroke.checkPathDirty();
            // Fill
            fill.fill = seriesFill;
            fill.fillOpacity = fillOpacity;
            fill.strokeOpacity = strokeOpacity;
            fill.strokeWidth = strokeWidth;
            fill.lineDash = lineDash;
            fill.lineDashOffset = lineDashOffset;
            fill.fillShadow = shadow;
            fill.path.clear({ trackChanges: true });
            fillSelectionData.points.forEach(function (point) {
                fill.path.lineTo(point.x, point.y);
            });
            fill.path.closePath();
            fill.checkPathDirty();
        });
    };
    AreaSeries.prototype.animateFormatter = function (datum) {
        var _a, _b, _c;
        var _d = this, marker = _d.marker, seriesFill = _d.fill, seriesStroke = _d.stroke, _e = _d.xKey, xKey = _e === void 0 ? '' : _e, seriesId = _d.id, callbackCache = _d.ctx.callbackCache;
        var size = marker.size, formatter = marker.formatter;
        var fill = (_a = marker.fill) !== null && _a !== void 0 ? _a : seriesFill;
        var stroke = (_b = marker.stroke) !== null && _b !== void 0 ? _b : seriesStroke;
        var strokeWidth = (_c = marker.strokeWidth) !== null && _c !== void 0 ? _c : this.strokeWidth;
        var format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum.datum,
                xKey: xKey,
                yKey: datum.yKey,
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
    AreaSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    AreaSeries.className = 'AreaSeries';
    AreaSeries.type = 'area';
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], AreaSeries.prototype, "fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], AreaSeries.prototype, "stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], AreaSeries.prototype, "fillOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], AreaSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_LINE_DASH)
    ], AreaSeries.prototype, "lineDash", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AreaSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AreaSeries.prototype, "xKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AreaSeries.prototype, "xName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AreaSeries.prototype, "yKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AreaSeries.prototype, "yName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], AreaSeries.prototype, "normalizedTo", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AreaSeries.prototype, "strokeWidth", void 0);
    return AreaSeries;
}(cartesianSeries_1.CartesianSeries));
exports.AreaSeries = AreaSeries;
//# sourceMappingURL=areaSeries.js.map