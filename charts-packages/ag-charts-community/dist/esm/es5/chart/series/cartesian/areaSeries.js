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
import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { SeriesTooltip } from "../series";
import { PointerEvents } from "../../../scene/node";
import { Path } from "../../../scene/shape/path";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { toTooltipHtml } from "../../chart";
import { extent } from "../../../util/array";
import { equal } from "../../../util/equal";
import { reactive } from "../../../util/observable";
import { interpolate } from "../../../util/string";
import { Text } from "../../../scene/shape/text";
import { Label } from "../../label";
import { sanitizeHtml } from "../../../util/sanitize";
import { isContinuous, isDiscrete, isNumber } from "../../../util/value";
import { clamper, ContinuousScale } from "../../../scale/continuousScale";
var AreaSeriesLabel = /** @class */ (function (_super) {
    __extends(AreaSeriesLabel, _super);
    function AreaSeriesLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive('change')
    ], AreaSeriesLabel.prototype, "formatter", void 0);
    return AreaSeriesLabel;
}(Label));
var AreaSeriesTooltip = /** @class */ (function (_super) {
    __extends(AreaSeriesTooltip, _super);
    function AreaSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive('change')
    ], AreaSeriesTooltip.prototype, "renderer", void 0);
    __decorate([
        reactive('change')
    ], AreaSeriesTooltip.prototype, "format", void 0);
    return AreaSeriesTooltip;
}(SeriesTooltip));
export { AreaSeriesTooltip };
var AreaSeries = /** @class */ (function (_super) {
    __extends(AreaSeries, _super);
    function AreaSeries() {
        var _this = _super.call(this) || this;
        _this.tooltip = new AreaSeriesTooltip();
        _this.areaGroup = _this.group.insertBefore(new Group, _this.pickGroup);
        _this.strokeGroup = _this.group.insertBefore(new Group, _this.pickGroup);
        _this.markerGroup = _this.pickGroup.appendChild(new Group);
        _this.labelGroup = _this.group.appendChild(new Group);
        _this.fillSelection = Selection.select(_this.areaGroup).selectAll();
        _this.strokeSelection = Selection.select(_this.strokeGroup).selectAll();
        _this.markerSelection = Selection.select(_this.markerGroup).selectAll();
        _this.labelSelection = Selection.select(_this.labelGroup).selectAll();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.seriesItemEnabled = new Map();
        _this.xData = [];
        _this.yData = [];
        _this.fillSelectionData = [];
        _this.strokeSelectionData = [];
        _this.markerSelectionData = [];
        _this.labelSelectionData = [];
        _this.yDomain = [];
        _this.xDomain = [];
        _this.directionKeys = {
            x: ['xKey'],
            y: ['yKeys']
        };
        _this.marker = new CartesianSeriesMarker();
        _this.label = new AreaSeriesLabel();
        _this.fills = [
            '#c16068',
            '#a2bf8a',
            '#ebcc87',
            '#80a0c3',
            '#b58dae',
            '#85c0d1'
        ];
        _this.strokes = [
            '#874349',
            '#718661',
            '#a48f5f',
            '#5a7088',
            '#7f637a',
            '#5d8692'
        ];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this._xKey = '';
        _this.xName = '';
        _this._yKeys = [];
        _this.yNames = [];
        _this.strokeWidth = 2;
        _this.addEventListener('update', _this.scheduleUpdate);
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.enabled = false;
        marker.addPropertyListener('shape', _this.onMarkerShapeChange, _this);
        marker.addEventListener('change', _this.scheduleUpdate, _this);
        label.enabled = false;
        label.addEventListener('change', _this.scheduleUpdate, _this);
        return _this;
    }
    AreaSeries.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.fireEvent({ type: 'legendChange' });
    };
    Object.defineProperty(AreaSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            if (this._xKey !== value) {
                this._xKey = value;
                this.xData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "yKeys", {
        get: function () {
            return this._yKeys;
        },
        set: function (values) {
            if (!equal(this._yKeys, values)) {
                this._yKeys = values;
                this.yData = [];
                var seriesItemEnabled_1 = this.seriesItemEnabled;
                seriesItemEnabled_1.clear();
                values.forEach(function (key) { return seriesItemEnabled_1.set(key, true); });
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
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
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    AreaSeries.prototype.processData = function () {
        var e_1, _a;
        var _b = this, xKey = _b.xKey, yKeys = _b.yKeys, seriesItemEnabled = _b.seriesItemEnabled, xAxis = _b.xAxis, yAxis = _b.yAxis, normalizedTo = _b.normalizedTo;
        var data = xKey && yKeys.length && this.data ? this.data : [];
        if (!xAxis || !yAxis) {
            return false;
        }
        // If the data is an array of rows like so:
        //
        // [{
        //   xKy: 'Jan',
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
        var isContinuousX = xAxis.scale instanceof ContinuousScale;
        var isContinuousY = yAxis.scale instanceof ContinuousScale;
        var normalized = normalizedTo && isFinite(normalizedTo);
        var keysFound = true; // only warn once
        this.xData = data.map(function (datum) {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn("The key '" + xKey + "' was not found in the data: ", datum);
            }
            if (isContinuousX) {
                return isContinuous(datum[xKey]) ? datum[xKey] : undefined;
            }
            else {
                // i.e. category axis
                return isDiscrete(datum[xKey]) ? datum[xKey] : String(datum[xKey]);
            }
        });
        this.yData = data.map(function (datum) { return yKeys.map(function (yKey) {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn("The key '" + yKey + "' was not found in the data: ", datum);
            }
            var value = datum[yKey];
            if (!seriesItemEnabled.get(yKey)) {
                return 0;
            }
            if (isContinuousY) {
                return isContinuous(value) ? value : normalized ? 0 : undefined;
            }
            else {
                return isDiscrete(value) ? value : String(value);
            }
        }); });
        this.xDomain = isContinuousX ? this.fixNumericExtent(extent(this.xData, isContinuous), 'x', xAxis) : this.xData;
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        var yData = this.yData;
        var processedYData = [];
        var yMin = 0;
        var yMax = 0;
        try {
            for (var yData_1 = __values(yData), yData_1_1 = yData_1.next(); !yData_1_1.done; yData_1_1 = yData_1.next()) {
                var stack = yData_1_1.value;
                // find the sum of y values in the stack, used for normalization of stacked areas and determining yDomain of data
                var total = { sum: 0, absSum: 0 };
                for (var i = 0; i < stack.length; i++) {
                    var y = +stack[i]; // convert to number as the value could be a Date object
                    total.absSum += Math.abs(y);
                    total.sum += y;
                    if (total.sum > yMax) {
                        yMax = total.sum;
                    }
                    else if (total.sum < yMin) {
                        yMin = total.sum;
                    }
                }
                var normalizedTotal = 0;
                for (var i = 0; i < stack.length; i++) {
                    if (normalized && normalizedTo) {
                        // normalize y values using the absolute sum of y values in the stack
                        var normalizedY = +stack[i] / total.absSum * normalizedTo;
                        stack[i] = normalizedY;
                        // sum normalized values to get updated yMin and yMax of normalized area
                        normalizedTotal += normalizedY;
                        if (normalizedTotal > yMax) {
                            yMax = normalizedTotal;
                        }
                        else if (normalizedTotal < yMin) {
                            yMin = normalizedTotal;
                        }
                    }
                    // TODO: test performance to see impact of this
                    // process data to be in the format required for creating node data and rendering area paths
                    (processedYData[i] || (processedYData[i] = [])).push(stack[i]);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (yData_1_1 && !yData_1_1.done && (_a = yData_1.return)) _a.call(yData_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (normalized && normalizedTo) {
            // Multiplier to control the unused whitespace in the y domain, value selected by subjective visual 'niceness'.
            var domainWhitespaceAdjustment = 0.5;
            // set the yMin and yMax based on cumulative sum of normalized values
            yMin = yMin < (-normalizedTo * domainWhitespaceAdjustment) ? -normalizedTo : yMin;
            yMax = yMax > (normalizedTo * domainWhitespaceAdjustment) ? normalizedTo : yMax;
        }
        this.yData = processedYData;
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y', yAxis);
        this.fireEvent({ type: 'dataProcessed' });
        return true;
    };
    AreaSeries.prototype.findLargestMinMax = function (totals) {
        var e_2, _a;
        var min = 0;
        var max = 0;
        try {
            for (var totals_1 = __values(totals), totals_1_1 = totals_1.next(); !totals_1_1.done; totals_1_1 = totals_1.next()) {
                var total = totals_1_1.value;
                if (total.min < min) {
                    min = total.min;
                }
                if (total.max > max) {
                    max = total.max;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (totals_1_1 && !totals_1_1.done && (_a = totals_1.return)) _a.call(totals_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return { min: min, max: max };
    };
    AreaSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    AreaSeries.prototype.update = function () {
        this.updatePending = false;
        this.updateSelections();
        this.updateNodes();
    };
    AreaSeries.prototype.updateSelections = function () {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;
        this.createSelectionData();
        this.updateFillSelection();
        this.updateStrokeSelection();
        this.updateMarkerSelection();
        this.updateLabelSelection();
    };
    AreaSeries.prototype.updateNodes = function () {
        this.group.visible = this.visible && this.xData.length > 0 && this.yData.length > 0;
        this.updateFillNodes();
        this.updateStrokeNodes();
        this.updateMarkerNodes();
        this.updateLabelNodes();
    };
    AreaSeries.prototype.createSelectionData = function () {
        var _this = this;
        var _a = this, data = _a.data, xAxis = _a.xAxis, yAxis = _a.yAxis, xData = _a.xData, yData = _a.yData, labelSelectionData = _a.labelSelectionData, markerSelectionData = _a.markerSelectionData, strokeSelectionData = _a.strokeSelectionData, fillSelectionData = _a.fillSelectionData, xKey = _a.xKey;
        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return;
        }
        var _b = this, yKeys = _b.yKeys, marker = _b.marker, label = _b.label, fills = _b.fills, strokes = _b.strokes;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var continuousY = yScale instanceof ContinuousScale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        markerSelectionData.length = 0;
        labelSelectionData.length = 0;
        strokeSelectionData.length = 0;
        fillSelectionData.length = 0;
        var cumulativePathValues = new Array(xData.length).fill(null).map(function () { return ({ left: 0, right: 0 }); });
        var cumulativeMarkerValues = new Array(xData.length).fill(0);
        var createPathCoordinates = function (xDatum, yDatum, idx, side) {
            var x = xScale.convert(xDatum) + xOffset;
            var prevY = cumulativePathValues[idx][side];
            var currY = cumulativePathValues[idx][side] + yDatum;
            var prevYCoordinate = yScale.convert(prevY, continuousY ? clamper : undefined);
            var currYCoordinate = yScale.convert(currY, continuousY ? clamper : undefined);
            cumulativePathValues[idx][side] = currY;
            return [
                { x: x, y: currYCoordinate },
                { x: x, y: prevYCoordinate },
            ];
        };
        var createMarkerCoordinate = function (xDatum, yDatum, idx, rawYDatum) {
            var currY;
            // if not normalized, the invalid data points will be processed as `undefined` in processData()
            // if normalized, the invalid data points will be processed as 0 rather than `undefined`
            // check if unprocessed datum is valid as we only want to show markers for valid points
            var normalized = _this.normalizedTo && isFinite(_this.normalizedTo);
            var normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);
            if (!normalized || normalizedAndValid) {
                currY = cumulativeMarkerValues[idx] += yDatum;
            }
            var x = xScale.convert(xDatum) + xOffset;
            var y = yScale.convert(currY, continuousY ? clamper : undefined);
            return { x: x, y: y };
        };
        yData.forEach(function (seriesYs, seriesIdx) {
            var yKey = yKeys[seriesIdx];
            var fillSelectionForSeries = fillSelectionData[seriesIdx] || (fillSelectionData[seriesIdx] = { itemId: yKey, points: [] });
            var fillPoints = fillSelectionForSeries.points;
            var fillPhantomPoints = [];
            var strokeDatum = strokeSelectionData[seriesIdx] || (strokeSelectionData[seriesIdx] = { itemId: yKey, points: [], yValues: [] });
            var strokePoints = strokeDatum.points;
            var yValues = strokeDatum.yValues;
            seriesYs.forEach(function (yDatum, datumIdx) {
                var xDatum = xData[datumIdx];
                var nextXDatum = xData[datumIdx + 1];
                var nextYDatum = seriesYs[datumIdx + 1];
                // marker data
                var seriesDatum = data[datumIdx];
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
                        stroke: strokes[seriesIdx % strokes.length]
                    });
                }
                // label data
                var labelText;
                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                }
                else {
                    labelText = isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                }
                if (label) {
                    labelSelectionData.push({
                        index: datumIdx,
                        itemId: yKey,
                        point: point,
                        label: _this.seriesItemEnabled.get(yKey) && labelText ? {
                            text: labelText,
                            fontStyle: label.fontStyle,
                            fontWeight: label.fontWeight,
                            fontSize: label.fontSize,
                            fontFamily: label.fontFamily,
                            textAlign: 'center',
                            textBaseline: 'bottom',
                            fill: label.color
                        } : undefined
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
            fillPoints.push.apply(fillPoints, __spread(fillPhantomPoints.slice().reverse()));
        });
    };
    AreaSeries.prototype.updateFillSelection = function () {
        var updateFills = this.fillSelection.setData(this.fillSelectionData);
        updateFills.exit.remove();
        var enterFills = updateFills.enter.append(Path)
            .each(function (path) {
            path.lineJoin = 'round';
            path.stroke = undefined;
            path.pointerEvents = PointerEvents.None;
        });
        this.fillSelection = updateFills.merge(enterFills);
    };
    AreaSeries.prototype.updateFillNodes = function () {
        var _this = this;
        var _a = this, fills = _a.fills, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, strokeWidth = _a.strokeWidth, shadow = _a.shadow, seriesItemEnabled = _a.seriesItemEnabled;
        this.fillSelection.each(function (shape, datum, index) {
            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.strokeOpacity = strokeOpacity;
            shape.strokeWidth = strokeWidth;
            shape.lineDash = _this.lineDash;
            shape.lineDashOffset = _this.lineDashOffset;
            shape.fillShadow = shadow;
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = _this.getOpacity(datum);
            var points = datum.points;
            var path = shape.path;
            path.clear();
            points.forEach(function (_a, i) {
                var x = _a.x, y = _a.y;
                if (i > 0) {
                    path.lineTo(x, y);
                }
                else {
                    path.moveTo(x, y);
                }
            });
            path.closePath();
        });
    };
    AreaSeries.prototype.updateStrokeSelection = function () {
        var updateStrokes = this.strokeSelection.setData(this.strokeSelectionData);
        updateStrokes.exit.remove();
        var enterStrokes = updateStrokes.enter.append(Path)
            .each(function (path) {
            path.fill = undefined;
            path.lineJoin = path.lineCap = 'round';
            path.pointerEvents = PointerEvents.None;
        });
        this.strokeSelection = updateStrokes.merge(enterStrokes);
    };
    AreaSeries.prototype.updateStrokeNodes = function () {
        var _this = this;
        if (!this.data) {
            return;
        }
        var _a = this, strokes = _a.strokes, strokeOpacity = _a.strokeOpacity, seriesItemEnabled = _a.seriesItemEnabled;
        var moveTo = true;
        this.strokeSelection.each(function (shape, datum, index) {
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = _this.getOpacity(datum);
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = _this.getStrokeWidth(_this.strokeWidth, datum);
            shape.strokeOpacity = strokeOpacity;
            shape.lineDash = _this.lineDash;
            shape.lineDashOffset = _this.lineDashOffset;
            var points = datum.points, yValues = datum.yValues;
            var path = shape.path;
            path.clear();
            for (var i = 0; i < points.length; i++) {
                var _a = points[i], x = _a.x, y = _a.y;
                if (yValues[i] === undefined) {
                    moveTo = true;
                }
                else {
                    if (moveTo) {
                        path.moveTo(x, y);
                        moveTo = false;
                    }
                    else {
                        path.lineTo(x, y);
                    }
                }
            }
        });
    };
    AreaSeries.prototype.updateMarkerSelection = function () {
        var MarkerShape = getMarker(this.marker.shape);
        var data = MarkerShape ? this.markerSelectionData : [];
        var updateMarkers = this.markerSelection.setData(data);
        updateMarkers.exit.remove();
        var enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    };
    AreaSeries.prototype.updateMarkerNodes = function () {
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this, xKey = _a.xKey, marker = _a.marker, seriesItemEnabled = _a.seriesItemEnabled, yKeys = _a.yKeys, fills = _a.fills, strokes = _a.strokes, highlightedDatum = _a.chart.highlightedDatum, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        var size = marker.size, formatter = marker.formatter;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        this.markerSelection.each(function (node, datum) {
            var yKeyIndex = yKeys.indexOf(datum.yKey);
            var isDatumHighlighted = datum === highlightedDatum;
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || fills[yKeyIndex % fills.length];
            var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || strokes[yKeyIndex % fills.length];
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
                    highlighted: isDatumHighlighted
                });
            }
            node.fill = format && format.fill || fill;
            node.stroke = format && format.stroke || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined
                ? format.strokeWidth
                : strokeWidth;
            node.size = format && format.size !== undefined
                ? format.size
                : size;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = marker.enabled && node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);
            node.opacity = _this.getOpacity(datum);
        });
    };
    AreaSeries.prototype.updateLabelSelection = function () {
        var updateLabels = this.labelSelection.setData(this.labelSelectionData);
        updateLabels.exit.remove();
        var enterLabels = updateLabels.enter.append(Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    };
    AreaSeries.prototype.updateLabelNodes = function () {
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
        this.labelSelection.each(function (text, datum) {
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
                text.opacity = _this.getOpacity(datum);
            }
            else {
                text.visible = false;
            }
        });
    };
    AreaSeries.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    AreaSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var xKey = this.xKey;
        var yKey = nodeDatum.yKey;
        if (!(xKey && yKey)) {
            return '';
        }
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!(xAxis && yAxis && isNumber(yValue))) {
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
        var title = sanitizeHtml(yName);
        var content = sanitizeHtml(xString + ': ' + yString);
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
                highlighted: false
            });
        }
        var color = format && format.fill || markerFill;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content
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
                color: color
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params)
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return toTooltipHtml(defaults);
    };
    AreaSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, data = _a.data, id = _a.id, xKey = _a.xKey, yKeys = _a.yKeys, yNames = _a.yNames, seriesItemEnabled = _a.seriesItemEnabled, marker = _a.marker, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (data && data.length && xKey && yKeys.length) {
            yKeys.forEach(function (yKey, index) {
                legendData.push({
                    id: id,
                    itemId: yKey,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[index] || yKeys[index]
                    },
                    marker: {
                        shape: marker.shape,
                        fill: marker.fill || fills[index % fills.length],
                        stroke: marker.stroke || strokes[index % strokes.length],
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity
                    }
                });
            });
        }
    };
    AreaSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.seriesItemEnabled.set(itemId, enabled);
        this.scheduleData();
    };
    AreaSeries.className = 'AreaSeries';
    AreaSeries.type = 'area';
    __decorate([
        reactive('dataChange')
    ], AreaSeries.prototype, "fills", void 0);
    __decorate([
        reactive('dataChange')
    ], AreaSeries.prototype, "strokes", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "fillOpacity", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "lineDash", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "xName", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "yNames", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "strokeWidth", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "shadow", void 0);
    return AreaSeries;
}(CartesianSeries));
export { AreaSeries };
//# sourceMappingURL=areaSeries.js.map