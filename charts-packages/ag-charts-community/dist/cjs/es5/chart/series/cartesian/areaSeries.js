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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaSeries = void 0;
var series_1 = require("../series");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var util_1 = require("../../marker/util");
var tooltip_1 = require("../../tooltip/tooltip");
var array_1 = require("../../../util/array");
var equal_1 = require("../../../util/equal");
var string_1 = require("../../../util/string");
var text_1 = require("../../../scene/shape/text");
var label_1 = require("../../label");
var sanitize_1 = require("../../../util/sanitize");
var value_1 = require("../../../util/value");
var continuousScale_1 = require("../../../scale/continuousScale");
var function_1 = require("../../../util/function");
var validation_1 = require("../../../util/validation");
var logAxis_1 = require("../../axis/logAxis");
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
    function AreaSeries() {
        var _this = _super.call(this, {
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
            renderLayerPerSubSeries: false,
        }) || this;
        _this.tooltip = new AreaSeriesTooltip();
        _this.xData = [];
        _this.yData = [];
        _this.yDomain = [];
        _this.xDomain = [];
        _this.directionKeys = {
            x: ['xKey'],
            y: ['yKeys'],
        };
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.label = new AreaSeriesLabel();
        _this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        _this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this._xKey = '';
        _this.xName = '';
        _this._yKeys = [];
        _this._visibles = [];
        _this.yNames = [];
        _this.strokeWidth = 2;
        _this.shadow = undefined;
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.enabled = false;
        label.enabled = false;
        return _this;
    }
    Object.defineProperty(AreaSeries.prototype, "xKey", {
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
    Object.defineProperty(AreaSeries.prototype, "yKeys", {
        get: function () {
            return this._yKeys;
        },
        set: function (values) {
            if (!equal_1.areArrayItemsStrictlyEqual(this._yKeys, values)) {
                this._yKeys = values;
                this.yData = [];
                this.processSeriesItemEnabled();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "visibles", {
        get: function () {
            return this._visibles;
        },
        set: function (visibles) {
            this._visibles = visibles;
            this.processSeriesItemEnabled();
        },
        enumerable: false,
        configurable: true
    });
    AreaSeries.prototype.processSeriesItemEnabled = function () {
        var _a = this, seriesItemEnabled = _a.seriesItemEnabled, _b = _a._visibles, visibles = _b === void 0 ? [] : _b;
        seriesItemEnabled.clear();
        this._yKeys.forEach(function (key, idx) { var _a; return seriesItemEnabled.set(key, (_a = visibles[idx]) !== null && _a !== void 0 ? _a : true); });
    };
    Object.defineProperty(AreaSeries.prototype, "normalizedTo", {
        get: function () {
            return this._normalizedTo;
        },
        set: function (value) {
            var absValue = value ? Math.abs(value) : undefined;
            if (this._normalizedTo !== absValue) {
                this._normalizedTo = absValue;
            }
        },
        enumerable: false,
        configurable: true
    });
    AreaSeries.prototype.processData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, xKey, yKeys, seriesItemEnabled, xAxis, yAxis, normalizedTo, data, isContinuousX, isContinuousY, normalized, yData, xData, xValues, missingYKeys, _loop_1, data_1, data_1_1, datum, missingYKeysString_1, xyValid, yMin, yMax, i, total, yData_1, yData_1_1, seriesYs, y, normalizedTotal, yData_2, yData_2_1, seriesYs, normalizedY, domainWhitespaceAdjustment, isLogAxis;
            var e_1, _c, e_2, _d, e_3, _e;
            return __generator(this, function (_f) {
                _b = this, xKey = _b.xKey, yKeys = _b.yKeys, seriesItemEnabled = _b.seriesItemEnabled, xAxis = _b.xAxis, yAxis = _b.yAxis, normalizedTo = _b.normalizedTo;
                data = xKey && yKeys.length && this.data ? this.data : [];
                if (!xAxis || !yAxis) {
                    return [2 /*return*/];
                }
                isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
                isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
                normalized = normalizedTo && isFinite(normalizedTo);
                yData = [];
                xData = [];
                xValues = [];
                missingYKeys = new Set(yKeys);
                _loop_1 = function (datum) {
                    // X datum
                    if (!(xKey in datum)) {
                        function_1.doOnce(function () { return console.warn("AG Charts - The key '" + xKey + "' was not found in the data: ", datum); }, xKey + " not found in data");
                        return "continue";
                    }
                    var xDatum = value_1.checkDatum(datum[xKey], isContinuousX);
                    if (isContinuousX && xDatum === undefined) {
                        return "continue";
                    }
                    else {
                        xValues.push(xDatum);
                        xData.push({ xDatum: xDatum, seriesDatum: datum });
                    }
                    // Y datum
                    yKeys.forEach(function (yKey, i) {
                        var seriesYs = yData[i] || (yData[i] = []);
                        if (!(yKey in datum)) {
                            seriesYs.push(NaN);
                            return;
                        }
                        missingYKeys.delete(yKey);
                        var value = datum[yKey];
                        if (!seriesItemEnabled.get(yKey)) {
                            seriesYs.push(NaN);
                        }
                        else {
                            var yDatum = value_1.checkDatum(value, isContinuousY);
                            seriesYs.push(yDatum);
                        }
                    });
                };
                try {
                    for (data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                        datum = data_1_1.value;
                        _loop_1(datum);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (data_1_1 && !data_1_1.done && (_c = data_1.return)) _c.call(data_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (missingYKeys.size > 0) {
                    missingYKeysString_1 = JSON.stringify(__spread(missingYKeys));
                    function_1.doOnce(function () { return console.log("AG Charts - yKeys " + missingYKeysString_1 + " were not found in the data."); }, missingYKeysString_1 + " not found in data.");
                }
                xyValid = this.validateXYData(this.xKey, this.yKeys.join(', '), data, xAxis, yAxis, xData.map(function (x) { return x.xDatum; }), yData, 2);
                if (!xyValid) {
                    this.xData = [];
                    this.yData = [];
                    this.yDomain = [];
                    return [2 /*return*/];
                }
                this.yData = yData;
                this.xData = xData;
                this.xDomain = isContinuousX ? this.fixNumericExtent(array_1.extent(xValues), xAxis) : xValues;
                yMin = undefined;
                yMax = undefined;
                for (i = 0; i < xData.length; i++) {
                    total = { sum: 0, absSum: 0 };
                    try {
                        for (yData_1 = (e_2 = void 0, __values(yData)), yData_1_1 = yData_1.next(); !yData_1_1.done; yData_1_1 = yData_1.next()) {
                            seriesYs = yData_1_1.value;
                            if (seriesYs[i] === undefined || isNaN(seriesYs[i])) {
                                continue;
                            }
                            y = +seriesYs[i];
                            total.absSum += Math.abs(y);
                            total.sum += y;
                            if (total.sum >= (yMax !== null && yMax !== void 0 ? yMax : 0)) {
                                yMax = total.sum;
                            }
                            else if (total.sum <= (yMin !== null && yMin !== void 0 ? yMin : 0)) {
                                yMin = total.sum;
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (yData_1_1 && !yData_1_1.done && (_d = yData_1.return)) _d.call(yData_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    if (!(normalized && normalizedTo)) {
                        continue;
                    }
                    normalizedTotal = undefined;
                    try {
                        // normalize y values using the absolute sum of y values in the stack
                        for (yData_2 = (e_3 = void 0, __values(yData)), yData_2_1 = yData_2.next(); !yData_2_1.done; yData_2_1 = yData_2.next()) {
                            seriesYs = yData_2_1.value;
                            normalizedY = (+seriesYs[i] / total.absSum) * normalizedTo;
                            seriesYs[i] = normalizedY;
                            if (!isNaN(normalizedY)) {
                                // sum normalized values to get updated yMin and yMax of normalized area
                                normalizedTotal = (normalizedTotal !== null && normalizedTotal !== void 0 ? normalizedTotal : 0) + normalizedY;
                            }
                            else {
                                continue;
                            }
                            if (normalizedTotal >= (yMax !== null && yMax !== void 0 ? yMax : 0)) {
                                yMax = normalizedTotal;
                            }
                            else if (normalizedTotal <= (yMin !== null && yMin !== void 0 ? yMin : 0)) {
                                yMin = normalizedTotal;
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (yData_2_1 && !yData_2_1.done && (_e = yData_2.return)) _e.call(yData_2);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
                if (normalized && normalizedTo) {
                    domainWhitespaceAdjustment = 0.5;
                    // set the yMin and yMax based on cumulative sum of normalized values
                    yMin = (yMin !== null && yMin !== void 0 ? yMin : 0) < -normalizedTo * domainWhitespaceAdjustment ? -normalizedTo : yMin;
                    yMax = (yMax !== null && yMax !== void 0 ? yMax : 0) > normalizedTo * domainWhitespaceAdjustment ? normalizedTo : yMax;
                }
                isLogAxis = yAxis instanceof logAxis_1.LogAxis;
                if (yMin === undefined && isLogAxis) {
                    yMin = (_a = array_1.extent(yData[0])) === null || _a === void 0 ? void 0 : _a[0];
                }
                this.yDomain = this.fixNumericExtent(yMin === undefined && yMax === undefined ? undefined : [yMin !== null && yMin !== void 0 ? yMin : 0, yMax !== null && yMax !== void 0 ? yMax : 0], yAxis);
                return [2 /*return*/];
            });
        });
    };
    AreaSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    AreaSeries.prototype.createNodeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, xAxis, yAxis, xData, yData, contexts, _b, yKeys, marker, label, fills, strokes, seriesId, xScale, yScale, continuousY, xOffset, cumulativePathValues, cumulativeMarkerValues, createPathCoordinates, createMarkerCoordinate;
            var _this = this;
            return __generator(this, function (_c) {
                _a = this, data = _a.data, xAxis = _a.xAxis, yAxis = _a.yAxis, xData = _a.xData, yData = _a.yData;
                if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
                    return [2 /*return*/, []];
                }
                contexts = [];
                _b = this, yKeys = _b.yKeys, marker = _b.marker, label = _b.label, fills = _b.fills, strokes = _b.strokes, seriesId = _b.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                continuousY = yScale instanceof continuousScale_1.ContinuousScale;
                xOffset = (xScale.bandwidth || 0) / 2;
                cumulativePathValues = new Array(xData.length)
                    .fill(null)
                    .map(function () { return ({ left: 0, right: 0 }); });
                cumulativeMarkerValues = new Array(xData.length).fill(0);
                createPathCoordinates = function (xDatum, yDatum, idx, side) {
                    var x = xScale.convert(xDatum) + xOffset;
                    var prevY = cumulativePathValues[idx][side];
                    var currY = cumulativePathValues[idx][side] + yDatum;
                    var prevYCoordinate = yScale.convert(prevY, { strict: false });
                    var currYCoordinate = yScale.convert(currY, { strict: false });
                    cumulativePathValues[idx][side] = currY;
                    return [
                        { x: x, y: currYCoordinate, size: marker.size },
                        { x: x, y: prevYCoordinate, size: marker.size },
                    ];
                };
                createMarkerCoordinate = function (xDatum, yDatum, idx, rawYDatum) {
                    var currY;
                    // if not normalized, the invalid data points will be processed as `undefined` in processData()
                    // if normalized, the invalid data points will be processed as 0 rather than `undefined`
                    // check if unprocessed datum is valid as we only want to show markers for valid points
                    var normalized = _this.normalizedTo && isFinite(_this.normalizedTo);
                    var normalizedAndValid = normalized && continuousY && value_1.isContinuous(rawYDatum);
                    var valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;
                    if (valid) {
                        currY = cumulativeMarkerValues[idx] += yDatum;
                    }
                    var x = xScale.convert(xDatum) + xOffset;
                    var y = yScale.convert(currY, { strict: false });
                    return { x: x, y: y, size: marker.size };
                };
                yData.forEach(function (seriesYs, seriesIdx) {
                    var yKey = yKeys[seriesIdx];
                    var labelSelectionData = [];
                    var markerSelectionData = [];
                    var strokeSelectionData = { itemId: yKey, points: [], yValues: [] };
                    var fillSelectionData = { itemId: yKey, points: [] };
                    contexts[seriesIdx] = {
                        itemId: yKey,
                        fillSelectionData: fillSelectionData,
                        labelData: labelSelectionData,
                        nodeData: markerSelectionData,
                        strokeSelectionData: strokeSelectionData,
                    };
                    if (!_this.seriesItemEnabled.get(yKey)) {
                        return;
                    }
                    var fillPoints = fillSelectionData.points;
                    var fillPhantomPoints = [];
                    var strokePoints = strokeSelectionData.points;
                    var yValues = strokeSelectionData.yValues;
                    seriesYs.forEach(function (rawYDatum, datumIdx) {
                        var _a;
                        var yDatum = isNaN(rawYDatum) ? undefined : rawYDatum;
                        var _b = xData[datumIdx], xDatum = _b.xDatum, seriesDatum = _b.seriesDatum;
                        var nextXDatum = (_a = xData[datumIdx + 1]) === null || _a === void 0 ? void 0 : _a.xDatum;
                        var rawNextYDatum = seriesYs[datumIdx + 1];
                        var nextYDatum = isNaN(rawNextYDatum) ? undefined : rawNextYDatum;
                        // marker data
                        var point = createMarkerCoordinate(xDatum, +yDatum, datumIdx, seriesDatum[yKey]);
                        if (marker) {
                            markerSelectionData.push({
                                index: datumIdx,
                                series: _this,
                                itemId: yKey,
                                datum: seriesDatum,
                                yValue: yDatum,
                                yKey: yKey,
                                point: point,
                                fill: fills[seriesIdx % fills.length],
                                stroke: strokes[seriesIdx % strokes.length],
                            });
                        }
                        // label data
                        var labelText;
                        if (label.formatter) {
                            labelText = label.formatter({ value: yDatum, seriesId: seriesId });
                        }
                        else {
                            labelText = value_1.isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                        }
                        if (label) {
                            labelSelectionData.push({
                                index: datumIdx,
                                itemId: yKey,
                                point: point,
                                label: _this.seriesItemEnabled.get(yKey) && labelText
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
                        var windowX = [xDatum, nextXDatum];
                        var windowY = [yDatum, nextYDatum];
                        if (windowX.some(function (v) { return v == undefined; })) {
                            return;
                        }
                        if (windowY.some(function (v) { return v == undefined; })) {
                            windowY[0] = 0;
                            windowY[1] = 0;
                        }
                        var currCoordinates = createPathCoordinates(windowX[0], +windowY[0], datumIdx, 'right');
                        fillPoints.push(currCoordinates[0]);
                        fillPhantomPoints.push(currCoordinates[1]);
                        var nextCoordinates = createPathCoordinates(windowX[1], +windowY[1], datumIdx, 'left');
                        fillPoints.push(nextCoordinates[0]);
                        fillPhantomPoints.push(nextCoordinates[1]);
                        // stroke data
                        strokePoints.push({ x: NaN, y: NaN }); // moveTo
                        yValues.push(undefined);
                        strokePoints.push(currCoordinates[0]);
                        yValues.push(yDatum);
                        if (nextYDatum !== undefined) {
                            strokePoints.push(nextCoordinates[0]);
                            yValues.push(yDatum);
                        }
                    });
                    for (var i = fillPhantomPoints.length - 1; i >= 0; i--) {
                        fillPoints.push(fillPhantomPoints[i]);
                    }
                });
                return [2 /*return*/, contexts];
            });
        });
    };
    AreaSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    AreaSeries.prototype.updatePaths = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fillSelectionData, strokeSelectionData, _b, fill, stroke;
            return __generator(this, function (_c) {
                _a = opts.contextData, fillSelectionData = _a.fillSelectionData, strokeSelectionData = _a.strokeSelectionData, _b = __read(opts.paths, 2), fill = _b[0], stroke = _b[1];
                fill.datum = fillSelectionData;
                fill.tag = AreaSeriesTag.Fill;
                fill.lineJoin = 'round';
                fill.stroke = undefined;
                fill.pointerEvents = node_1.PointerEvents.None;
                stroke.datum = strokeSelectionData;
                stroke.tag = AreaSeriesTag.Stroke;
                stroke.fill = undefined;
                stroke.lineJoin = stroke.lineCap = 'round';
                stroke.pointerEvents = node_1.PointerEvents.None;
                return [2 /*return*/];
            });
        });
    };
    AreaSeries.prototype.updatePathNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fill, stroke, seriesIdx, itemId, _b, strokes, fills, fillOpacity, strokeOpacity, strokeWidth, shadow, points, path, i, points_1, points_1_1, p, _c, points, yValues, moveTo_1, path, i, points_2, points_2_1, p;
            var e_4, _d, e_5, _e;
            return __generator(this, function (_f) {
                _a = __read(opts.paths, 2), fill = _a[0], stroke = _a[1], seriesIdx = opts.seriesIdx, itemId = opts.itemId;
                _b = this, strokes = _b.strokes, fills = _b.fills, fillOpacity = _b.fillOpacity, strokeOpacity = _b.strokeOpacity, strokeWidth = _b.strokeWidth, shadow = _b.shadow;
                {
                    points = fill.datum.points;
                    fill.fill = fills[seriesIdx % fills.length];
                    fill.fillOpacity = fillOpacity;
                    fill.strokeOpacity = strokeOpacity;
                    fill.strokeWidth = strokeWidth;
                    fill.lineDash = this.lineDash;
                    fill.lineDashOffset = this.lineDashOffset;
                    fill.fillShadow = shadow;
                    path = fill.path;
                    path.clear({ trackChanges: true });
                    i = 0;
                    try {
                        for (points_1 = __values(points), points_1_1 = points_1.next(); !points_1_1.done; points_1_1 = points_1.next()) {
                            p = points_1_1.value;
                            if (i++ > 0) {
                                path.lineTo(p.x, p.y);
                            }
                            else {
                                path.moveTo(p.x, p.y);
                            }
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (points_1_1 && !points_1_1.done && (_d = points_1.return)) _d.call(points_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    path.closePath();
                    fill.checkPathDirty();
                }
                {
                    _c = stroke.datum, points = _c.points, yValues = _c.yValues;
                    moveTo_1 = true;
                    stroke.stroke = strokes[seriesIdx % strokes.length];
                    stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId: itemId });
                    stroke.strokeOpacity = strokeOpacity;
                    stroke.lineDash = this.lineDash;
                    stroke.lineDashOffset = this.lineDashOffset;
                    path = stroke.path;
                    path.clear({ trackChanges: true });
                    i = 0;
                    try {
                        for (points_2 = __values(points), points_2_1 = points_2.next(); !points_2_1.done; points_2_1 = points_2.next()) {
                            p = points_2_1.value;
                            if (yValues[i++] === undefined) {
                                moveTo_1 = true;
                            }
                            else if (moveTo_1) {
                                path.moveTo(p.x, p.y);
                                moveTo_1 = false;
                            }
                            else {
                                path.lineTo(p.x, p.y);
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (points_2_1 && !points_2_1.done && (_e = points_2.return)) _e.call(points_2);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    stroke.checkPathDirty();
                }
                return [2 /*return*/];
            });
        });
    };
    AreaSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, markerSelection, _a, enabled, shape, data, MarkerShape, updateMarkerSelection, enterMarkers;
            return __generator(this, function (_b) {
                nodeData = opts.nodeData, markerSelection = opts.markerSelection;
                _a = this.marker, enabled = _a.enabled, shape = _a.shape;
                data = enabled && nodeData ? nodeData : [];
                MarkerShape = util_1.getMarker(shape);
                if (this.marker.isDirty()) {
                    markerSelection = markerSelection.setData([]);
                    markerSelection.exit.remove();
                }
                updateMarkerSelection = markerSelection.setData(data);
                updateMarkerSelection.exit.remove();
                enterMarkers = updateMarkerSelection.enter.append(MarkerShape).each(function (marker) {
                    marker.tag = AreaSeriesTag.Marker;
                });
                return [2 /*return*/, updateMarkerSelection.merge(enterMarkers)];
            });
        });
    };
    AreaSeries.prototype.updateMarkerNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var markerSelection, isDatumHighlighted, _a, seriesId, xKey, marker, seriesItemEnabled, yKeys, fills, strokes, seriesFillOpacity, _b, markerFillOpacity, strokeOpacity, _c, highlightedFill, _d, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, size, formatter, markerStrokeWidth, customMarker;
            return __generator(this, function (_e) {
                markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
                _a = this, seriesId = _a.id, xKey = _a.xKey, marker = _a.marker, seriesItemEnabled = _a.seriesItemEnabled, yKeys = _a.yKeys, fills = _a.fills, strokes = _a.strokes, seriesFillOpacity = _a.fillOpacity, _b = _a.marker.fillOpacity, markerFillOpacity = _b === void 0 ? seriesFillOpacity : _b, strokeOpacity = _a.strokeOpacity, _c = _a.highlightStyle.item, highlightedFill = _c.fill, _d = _c.fillOpacity, highlightFillOpacity = _d === void 0 ? markerFillOpacity : _d, highlightedStroke = _c.stroke, highlightedDatumStrokeWidth = _c.strokeWidth;
                size = marker.size, formatter = marker.formatter;
                markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
                customMarker = typeof marker.shape === 'function';
                markerSelection.each(function (node, datum) {
                    var _a, _b;
                    var yKeyIndex = yKeys.indexOf(datum.yKey);
                    var fill = isDatumHighlighted && highlightedFill !== undefined
                        ? highlightedFill
                        : marker.fill || fills[yKeyIndex % fills.length];
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined
                        ? highlightedStroke
                        : marker.stroke || strokes[yKeyIndex % fills.length];
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : markerStrokeWidth;
                    var format = undefined;
                    if (formatter) {
                        format = formatter({
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
                    node.fill = (format && format.fill) || fill;
                    node.stroke = (format && format.stroke) || stroke;
                    node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
                    node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                    node.strokeOpacity = (_b = (_a = marker.strokeOpacity) !== null && _a !== void 0 ? _a : strokeOpacity) !== null && _b !== void 0 ? _b : 1;
                    node.size = format && format.size !== undefined ? format.size : size;
                    node.translationX = datum.point.x;
                    node.translationY = datum.point.y;
                    node.visible =
                        node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);
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
    AreaSeries.prototype.updateLabelSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelData, labelSelection, updateLabels, enterLabels;
            return __generator(this, function (_a) {
                labelData = opts.labelData, labelSelection = opts.labelSelection;
                updateLabels = labelSelection.setData(labelData);
                updateLabels.exit.remove();
                enterLabels = updateLabels.enter.append(text_1.Text).each(function (text) {
                    text.tag = AreaSeriesTag.Label;
                });
                return [2 /*return*/, updateLabels.merge(enterLabels)];
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
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, seriesId = _a.id;
        var yKey = nodeDatum.yKey;
        if (!(xKey && yKey) || !this.seriesItemEnabled.get(yKey)) {
            return '';
        }
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var _b = this, xAxis = _b.xAxis, yAxis = _b.yAxis;
        if (!(xAxis && yAxis && value_1.isNumber(yValue))) {
            return '';
        }
        var _c = this, xName = _c.xName, yKeys = _c.yKeys, yNames = _c.yNames, yData = _c.yData, fills = _c.fills, strokes = _c.strokes, tooltip = _c.tooltip, marker = _c.marker;
        var size = marker.size, markerFormatter = marker.formatter, markerStrokeWidth = marker.strokeWidth, markerFill = marker.fill, markerStroke = marker.stroke;
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var yKeyIndex = yKeys.indexOf(yKey);
        var seriesYs = yData[yKeyIndex];
        var processedYValue = seriesYs[nodeDatum.index];
        var yName = yNames[yKeyIndex];
        var title = sanitize_1.sanitizeHtml(yName);
        var content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
        var strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        var fill = markerFill || fills[yKeyIndex % fills.length];
        var stroke = markerStroke || strokes[yKeyIndex % fills.length];
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
        var _a, _b;
        var _c = this, data = _c.data, id = _c.id, xKey = _c.xKey, yKeys = _c.yKeys, yNames = _c.yNames, seriesItemEnabled = _c.seriesItemEnabled, marker = _c.marker, fills = _c.fills, strokes = _c.strokes, fillOpacity = _c.fillOpacity, strokeOpacity = _c.strokeOpacity;
        if (!data || !data.length || !xKey || !yKeys.length) {
            return [];
        }
        var legendData = [];
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (var index = yKeys.length - 1; index >= 0; index--) {
            var yKey = yKeys[index];
            legendData.push({
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: seriesItemEnabled.get(yKey) || false,
                label: {
                    text: yNames[index] || yKeys[index],
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fills[index % fills.length],
                    stroke: marker.stroke || strokes[index % strokes.length],
                    fillOpacity: (_a = marker.fillOpacity) !== null && _a !== void 0 ? _a : fillOpacity,
                    strokeOpacity: (_b = marker.strokeOpacity) !== null && _b !== void 0 ? _b : strokeOpacity,
                },
            });
        }
        return legendData;
    };
    AreaSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    AreaSeries.className = 'AreaSeries';
    AreaSeries.type = 'area';
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
    ], AreaSeries.prototype, "fills", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
    ], AreaSeries.prototype, "strokes", void 0);
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
        validation_1.Validate(validation_1.STRING)
    ], AreaSeries.prototype, "_xKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], AreaSeries.prototype, "xName", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING_ARRAY)
    ], AreaSeries.prototype, "_yKeys", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN_ARRAY)
    ], AreaSeries.prototype, "_visibles", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING_ARRAY)
    ], AreaSeries.prototype, "yNames", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER())
    ], AreaSeries.prototype, "_normalizedTo", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AreaSeries.prototype, "strokeWidth", void 0);
    return AreaSeries;
}(cartesianSeries_1.CartesianSeries));
exports.AreaSeries = AreaSeries;
