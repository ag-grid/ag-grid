"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var series_1 = require("../series");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var util_1 = require("../../marker/util");
var chart_1 = require("../../chart");
var array_1 = require("../../../util/array");
var equal_1 = require("../../../util/equal");
var string_1 = require("../../../util/string");
var text_1 = require("../../../scene/shape/text");
var label_1 = require("../../label");
var sanitize_1 = require("../../../util/sanitize");
var value_1 = require("../../../util/value");
var continuousScale_1 = require("../../../scale/continuousScale");
var function_1 = require("../../../util/function");
var AreaSeriesLabel = /** @class */ (function (_super) {
    __extends(AreaSeriesLabel, _super);
    function AreaSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
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
    return AreaSeriesTooltip;
}(series_1.SeriesTooltip));
exports.AreaSeriesTooltip = AreaSeriesTooltip;
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
            pickGroupIncludes: ['markers'],
            features: ['markers'],
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
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "yKeys", {
        get: function () {
            return this._yKeys;
        },
        set: function (values) {
            if (!equal_1.equal(this._yKeys, values)) {
                this._yKeys = values;
                this.yData = [];
                this.processSeriesItemEnabled();
            }
        },
        enumerable: true,
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
        enumerable: true,
        configurable: true
    });
    AreaSeries.prototype.processSeriesItemEnabled = function () {
        var _a = this, seriesItemEnabled = _a.seriesItemEnabled, _b = _a._visibles, visibles = _b === void 0 ? [] : _b;
        seriesItemEnabled.clear();
        this._yKeys.forEach(function (key, idx) { var _a; return seriesItemEnabled.set(key, (_a = visibles[idx], (_a !== null && _a !== void 0 ? _a : true))); });
    };
    AreaSeries.prototype.setColors = function (fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
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
        enumerable: true,
        configurable: true
    });
    AreaSeries.prototype.processData = function () {
        var e_1, _a, e_2, _b, e_3, _c;
        var _d = this, xKey = _d.xKey, yKeys = _d.yKeys, seriesItemEnabled = _d.seriesItemEnabled, xAxis = _d.xAxis, yAxis = _d.yAxis, normalizedTo = _d.normalizedTo;
        var data = xKey && yKeys.length && this.data ? this.data : [];
        if (!xAxis || !yAxis) {
            return false;
        }
        // If the data is an array of rows like so:
        //
        // [{
        //   xKey: 'Jan',
        //   yKey1: 5,
        //   yKey2: 7,
        //   yKey3: -9,
        // }, {
        //   xKey: 'Feb',
        //   yKey1: 10,
        //   yKey2: -15,
        //   yKey3: 20
        // }]
        //
        var isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
        var isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
        var normalized = normalizedTo && isFinite(normalizedTo);
        var yData = [];
        var xData = [];
        var xValues = [];
        var _loop_1 = function (datum) {
            // X datum
            if (!(xKey in datum)) {
                function_1.doOnce(function () { return console.warn("The key '" + xKey + "' was not found in the data: ", datum); }, xKey + " not found in data");
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
                if (!(yKey in datum)) {
                    function_1.doOnce(function () { return console.warn("The key '" + yKey + "' was not found in the data: ", datum); }, yKey + " not found in data");
                    return;
                }
                var value = datum[yKey];
                var seriesYs = yData[i] || (yData[i] = []);
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
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                _loop_1(datum);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.yData = yData;
        this.xData = xData;
        this.xDomain = isContinuousX ? this.fixNumericExtent(array_1.extent(xValues, value_1.isContinuous), xAxis) : xValues;
        // xData: ['Jan', 'Feb', undefined]
        //
        // yData: [
        //   [5, 10], <- series 1 (yKey1)
        //   [7, -15], <- series 2 (yKey2)
        //   [-9, 20] <- series 3 (yKey3)
        // ]
        var yMin = undefined;
        var yMax = undefined;
        for (var i = 0; i < xData.length; i++) {
            var total = { sum: 0, absSum: 0 };
            try {
                for (var yData_1 = (e_2 = void 0, __values(yData)), yData_1_1 = yData_1.next(); !yData_1_1.done; yData_1_1 = yData_1.next()) {
                    var seriesYs = yData_1_1.value;
                    if (seriesYs[i] === undefined || isNaN(seriesYs[i])) {
                        continue;
                    }
                    var y = +seriesYs[i]; // convert to number as the value could be a Date object
                    total.absSum += Math.abs(y);
                    total.sum += y;
                    if (total.sum >= ((yMax !== null && yMax !== void 0 ? yMax : 0))) {
                        yMax = total.sum;
                    }
                    else if (total.sum <= ((yMin !== null && yMin !== void 0 ? yMin : 0))) {
                        yMin = total.sum;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (yData_1_1 && !yData_1_1.done && (_b = yData_1.return)) _b.call(yData_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (!(normalized && normalizedTo)) {
                continue;
            }
            var normalizedTotal = undefined;
            try {
                // normalize y values using the absolute sum of y values in the stack
                for (var yData_2 = (e_3 = void 0, __values(yData)), yData_2_1 = yData_2.next(); !yData_2_1.done; yData_2_1 = yData_2.next()) {
                    var seriesYs = yData_2_1.value;
                    var normalizedY = (+seriesYs[i] / total.absSum) * normalizedTo;
                    seriesYs[i] = normalizedY;
                    if (!isNaN(normalizedY)) {
                        // sum normalized values to get updated yMin and yMax of normalized area
                        normalizedTotal = ((normalizedTotal !== null && normalizedTotal !== void 0 ? normalizedTotal : 0)) + normalizedY;
                    }
                    else {
                        continue;
                    }
                    if (normalizedTotal >= ((yMax !== null && yMax !== void 0 ? yMax : 0))) {
                        yMax = normalizedTotal;
                    }
                    else if (normalizedTotal <= ((yMin !== null && yMin !== void 0 ? yMin : 0))) {
                        yMin = normalizedTotal;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (yData_2_1 && !yData_2_1.done && (_c = yData_2.return)) _c.call(yData_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        if (normalized && normalizedTo) {
            // multiplier to control the unused whitespace in the y domain, value selected by subjective visual 'niceness'.
            var domainWhitespaceAdjustment = 0.5;
            // set the yMin and yMax based on cumulative sum of normalized values
            yMin = ((yMin !== null && yMin !== void 0 ? yMin : 0)) < -normalizedTo * domainWhitespaceAdjustment ? -normalizedTo : yMin;
            yMax = ((yMax !== null && yMax !== void 0 ? yMax : 0)) > normalizedTo * domainWhitespaceAdjustment ? normalizedTo : yMax;
        }
        this.yDomain = this.fixNumericExtent(yMin === undefined && yMax === undefined ? undefined : [(yMin !== null && yMin !== void 0 ? yMin : 0), (yMax !== null && yMax !== void 0 ? yMax : 0)], yAxis);
        return true;
    };
    AreaSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    AreaSeries.prototype.createNodeData = function () {
        var _this = this;
        var _a = this, data = _a.data, xAxis = _a.xAxis, yAxis = _a.yAxis, xData = _a.xData, yData = _a.yData;
        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return [];
        }
        var contexts = [];
        var _b = this, yKeys = _b.yKeys, marker = _b.marker, label = _b.label, fills = _b.fills, strokes = _b.strokes;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var continuousY = yScale instanceof continuousScale_1.ContinuousScale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var cumulativePathValues = new Array(xData.length)
            .fill(null)
            .map(function () { return ({ left: 0, right: 0 }); });
        var cumulativeMarkerValues = new Array(xData.length).fill(0);
        var createPathCoordinates = function (xDatum, yDatum, idx, side) {
            var x = xScale.convert(xDatum) + xOffset;
            var prevY = cumulativePathValues[idx][side];
            var currY = cumulativePathValues[idx][side] + yDatum;
            var prevYCoordinate = yScale.convert(prevY, continuousY ? continuousScale_1.clamper : undefined);
            var currYCoordinate = yScale.convert(currY, continuousY ? continuousScale_1.clamper : undefined);
            cumulativePathValues[idx][side] = currY;
            return [
                { x: x, y: currYCoordinate, size: marker.size },
                { x: x, y: prevYCoordinate, size: marker.size },
            ];
        };
        var createMarkerCoordinate = function (xDatum, yDatum, idx, rawYDatum) {
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
            var y = yScale.convert(currY, continuousY ? continuousScale_1.clamper : undefined);
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
                    labelText = label.formatter({ value: yDatum });
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
        return contexts;
    };
    AreaSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    AreaSeries.prototype.updatePaths = function (opts) {
        var _a = opts.contextData, fillSelectionData = _a.fillSelectionData, strokeSelectionData = _a.strokeSelectionData, _b = __read(opts.paths, 2), fill = _b[0], stroke = _b[1];
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
    };
    AreaSeries.prototype.updatePathNodes = function (opts) {
        var e_4, _a, e_5, _b;
        var _c = __read(opts.paths, 2), fill = _c[0], stroke = _c[1], seriesIdx = opts.seriesIdx, itemId = opts.itemId;
        var _d = this, strokes = _d.strokes, fills = _d.fills, fillOpacity = _d.fillOpacity, strokeOpacity = _d.strokeOpacity, strokeWidth = _d.strokeWidth, shadow = _d.shadow;
        {
            var points = fill.datum.points;
            fill.fill = fills[seriesIdx % fills.length];
            fill.fillOpacity = fillOpacity;
            fill.strokeOpacity = strokeOpacity;
            fill.strokeWidth = strokeWidth;
            fill.lineDash = this.lineDash;
            fill.lineDashOffset = this.lineDashOffset;
            fill.fillShadow = shadow;
            var path = fill.path;
            path.clear({ trackChanges: true });
            var i = 0;
            try {
                for (var points_1 = __values(points), points_1_1 = points_1.next(); !points_1_1.done; points_1_1 = points_1.next()) {
                    var p = points_1_1.value;
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
                    if (points_1_1 && !points_1_1.done && (_a = points_1.return)) _a.call(points_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            path.closePath();
            fill.checkPathDirty();
        }
        {
            var _e = stroke.datum, points = _e.points, yValues = _e.yValues;
            var moveTo_1 = true;
            stroke.stroke = strokes[seriesIdx % strokes.length];
            stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId: itemId });
            stroke.strokeOpacity = strokeOpacity;
            stroke.lineDash = this.lineDash;
            stroke.lineDashOffset = this.lineDashOffset;
            var path = stroke.path;
            path.clear({ trackChanges: true });
            var i = 0;
            try {
                for (var points_2 = __values(points), points_2_1 = points_2.next(); !points_2_1.done; points_2_1 = points_2.next()) {
                    var p = points_2_1.value;
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
                    if (points_2_1 && !points_2_1.done && (_b = points_2.return)) _b.call(points_2);
                }
                finally { if (e_5) throw e_5.error; }
            }
            stroke.checkPathDirty();
        }
    };
    AreaSeries.prototype.updateMarkerSelection = function (opts) {
        var nodeData = opts.nodeData, markerSelection = opts.markerSelection;
        var _a = this.marker, enabled = _a.enabled, shape = _a.shape;
        var data = enabled && nodeData ? nodeData : [];
        var MarkerShape = util_1.getMarker(shape);
        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }
        var updateMarkerSelection = markerSelection.setData(data);
        updateMarkerSelection.exit.remove();
        var enterMarkers = updateMarkerSelection.enter.append(MarkerShape).each(function (marker) {
            marker.tag = AreaSeriesTag.Marker;
        });
        return updateMarkerSelection.merge(enterMarkers);
    };
    AreaSeries.prototype.updateMarkerNodes = function (opts) {
        var markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
        var _a = this, xKey = _a.xKey, marker = _a.marker, seriesItemEnabled = _a.seriesItemEnabled, yKeys = _a.yKeys, fills = _a.fills, strokes = _a.strokes, seriesFillOpacity = _a.fillOpacity, _b = _a.marker.fillOpacity, markerFillOpacity = _b === void 0 ? seriesFillOpacity : _b, strokeOpacity = _a.strokeOpacity, _c = _a.highlightStyle, deprecatedFill = _c.fill, deprecatedStroke = _c.stroke, deprecatedStrokeWidth = _c.strokeWidth, _d = _c.item, _e = _d.fill, highlightedFill = _e === void 0 ? deprecatedFill : _e, _f = _d.fillOpacity, highlightFillOpacity = _f === void 0 ? markerFillOpacity : _f, _g = _d.stroke, highlightedStroke = _g === void 0 ? deprecatedStroke : _g, _h = _d.strokeWidth, highlightedDatumStrokeWidth = _h === void 0 ? deprecatedStrokeWidth : _h;
        var size = marker.size, formatter = marker.formatter;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        markerSelection.each(function (node, datum) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
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
                });
            }
            node.fill = (format && format.fill) || fill;
            node.stroke = (format && format.stroke) || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            node.fillOpacity = (fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1);
            node.strokeOpacity = (_b = (_a = marker.strokeOpacity, (_a !== null && _a !== void 0 ? _a : strokeOpacity)), (_b !== null && _b !== void 0 ? _b : 1));
            node.size = format && format.size !== undefined ? format.size : size;
            node.translationX = (_d = (_c = datum.point) === null || _c === void 0 ? void 0 : _c.x, (_d !== null && _d !== void 0 ? _d : 0));
            node.translationY = (_f = (_e = datum.point) === null || _e === void 0 ? void 0 : _e.y, (_f !== null && _f !== void 0 ? _f : 0));
            node.visible =
                node.size > 0 &&
                    !!seriesItemEnabled.get(datum.yKey) &&
                    !isNaN(((_g = datum.point) === null || _g === void 0 ? void 0 : _g.x) || 0) &&
                    !isNaN(((_h = datum.point) === null || _h === void 0 ? void 0 : _h.y) || 0);
        });
        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    };
    AreaSeries.prototype.updateLabelSelection = function (opts) {
        var labelData = opts.labelData, labelSelection = opts.labelSelection;
        var updateLabels = labelSelection.setData(labelData);
        updateLabels.exit.remove();
        var enterLabels = updateLabels.enter.append(text_1.Text).each(function (text) {
            text.tag = AreaSeriesTag.Label;
        });
        return updateLabels.merge(enterLabels);
    };
    AreaSeries.prototype.updateLabelNodes = function (opts) {
        var labelSelection = opts.labelSelection;
        var _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
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
    };
    AreaSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: datum.yKey,
        });
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var xKey = this.xKey;
        var yKey = nodeDatum.yKey;
        if (!(xKey && yKey) || !this.seriesItemEnabled.get(yKey)) {
            return '';
        }
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!(xAxis && yAxis && value_1.isNumber(yValue))) {
            return '';
        }
        var _b = this, xName = _b.xName, yKeys = _b.yKeys, yNames = _b.yNames, yData = _b.yData, fills = _b.fills, strokes = _b.strokes, tooltip = _b.tooltip, marker = _b.marker;
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
            };
            if (tooltipFormat) {
                return chart_1.toTooltipHtml({
                    content: string_1.interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return chart_1.toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return chart_1.toTooltipHtml(defaults);
    };
    AreaSeries.prototype.listSeriesItems = function (legendData) {
        var _a, _b;
        var _c = this, data = _c.data, id = _c.id, xKey = _c.xKey, yKeys = _c.yKeys, yNames = _c.yNames, seriesItemEnabled = _c.seriesItemEnabled, marker = _c.marker, fills = _c.fills, strokes = _c.strokes, fillOpacity = _c.fillOpacity, strokeOpacity = _c.strokeOpacity;
        if (!data || !data.length || !xKey || !yKeys.length) {
            return;
        }
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (var index = yKeys.length - 1; index >= 0; index--) {
            var yKey = yKeys[index];
            legendData.push({
                id: id,
                itemId: yKey,
                enabled: seriesItemEnabled.get(yKey) || false,
                label: {
                    text: yNames[index] || yKeys[index],
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fills[index % fills.length],
                    stroke: marker.stroke || strokes[index % strokes.length],
                    fillOpacity: (_a = marker.fillOpacity, (_a !== null && _a !== void 0 ? _a : fillOpacity)),
                    strokeOpacity: (_b = marker.strokeOpacity, (_b !== null && _b !== void 0 ? _b : strokeOpacity)),
                },
            });
        }
    };
    AreaSeries.className = 'AreaSeries';
    AreaSeries.type = 'area';
    return AreaSeries;
}(cartesianSeries_1.CartesianSeries));
exports.AreaSeries = AreaSeries;
