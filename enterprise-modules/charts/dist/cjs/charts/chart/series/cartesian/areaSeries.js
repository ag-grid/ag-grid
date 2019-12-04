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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../../scene/group");
var selection_1 = require("../../../scene/selection");
var node_1 = require("../../../scene/node");
var array_1 = require("../../../util/array");
var number_1 = require("../../../util/number");
var path_1 = require("../../../scene/shape/path");
var palettes_1 = require("../../palettes");
var marker_1 = require("../../marker/marker");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var AreaSeries = /** @class */ (function (_super) {
    __extends(AreaSeries, _super);
    function AreaSeries() {
        var _this = _super.call(this) || this;
        _this.areaGroup = _this.group.appendChild(new group_1.Group);
        _this.strokeGroup = _this.group.appendChild(new group_1.Group);
        _this.markerGroup = _this.group.appendChild(new group_1.Group);
        _this.areaSelection = selection_1.Selection.select(_this.areaGroup).selectAll();
        _this.strokeSelection = selection_1.Selection.select(_this.strokeGroup).selectAll();
        _this.markerSelection = selection_1.Selection.select(_this.markerGroup).selectAll();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.yKeyEnabled = new Map();
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this._fills = palettes_1.default.fills;
        _this._strokes = palettes_1.default.strokes;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this.xData = [];
        _this.yData = [];
        _this.yDomain = [];
        _this.directionKeys = {
            x: ['xKey'],
            y: ['yKeys']
        };
        _this._xKey = '';
        _this._xName = '';
        _this._yKeys = [];
        _this._yNames = [];
        _this._strokeWidth = 2;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        _this.marker.enabled = false;
        _this.marker.addPropertyListener('type', function () { return _this.onMarkerTypeChange(); });
        _this.marker.addEventListener('change', function () { return _this.update(); });
        return _this;
    }
    AreaSeries.prototype.onMarkerTypeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.update();
        this.fireEvent({ type: 'legendChange' });
    };
    Object.defineProperty(AreaSeries.prototype, "fills", {
        get: function () {
            return this._fills;
        },
        set: function (values) {
            this._fills = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "strokes", {
        get: function () {
            return this._strokes;
        },
        set: function (values) {
            this._strokes = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "fillOpacity", {
        get: function () {
            return this._fillOpacity;
        },
        set: function (value) {
            if (this._fillOpacity !== value) {
                this._fillOpacity = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "strokeOpacity", {
        get: function () {
            return this._strokeOpacity;
        },
        set: function (value) {
            if (this._strokeOpacity !== value) {
                this._strokeOpacity = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(AreaSeries.prototype, "xName", {
        get: function () {
            return this._xName;
        },
        set: function (value) {
            this._xName = value;
            this.update();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "yKeys", {
        get: function () {
            return this._yKeys;
        },
        set: function (values) {
            this._yKeys = values;
            this.yData = [];
            var yKeyEnabled = this.yKeyEnabled;
            yKeyEnabled.clear();
            values.forEach(function (key) { return yKeyEnabled.set(key, true); });
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "yNames", {
        get: function () {
            return this._yNames;
        },
        set: function (values) {
            this._yNames = values;
            this.update();
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(AreaSeries.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
            if (this._strokeWidth !== value) {
                this._strokeWidth = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "shadow", {
        get: function () {
            return this._shadow;
        },
        set: function (value) {
            if (this._shadow !== value) {
                this._shadow = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    AreaSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof marker_1.Marker)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    AreaSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    AreaSeries.prototype.processData = function () {
        var _a = this, xKey = _a.xKey, yKeys = _a.yKeys, yKeyEnabled = _a.yKeyEnabled;
        var data = xKey && yKeys.length ? this.data : [];
        // if (!(chart && chart.xAxis && chart.yAxis)) {
        //     return false;
        // }
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
        var keysFound = true; // only warn once
        this.xData = data.map(function (datum) {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn("The key '" + xKey + "' was not found in the data: ", datum);
            }
            return datum[xKey];
        });
        this.yData = data.map(function (datum) { return yKeys.map(function (yKey) {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn("The key '" + yKey + "' was not found in the data: ", datum);
            }
            var value = datum[yKey];
            return isFinite(value) && yKeyEnabled.get(yKey) ? Math.abs(value) : 0;
        }); });
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        var _b = this, yData = _b.yData, normalizedTo = _b.normalizedTo;
        var ySums = yData.map(function (values) { return array_1.sumPositiveValues(values); }); // used for normalization
        var yMin;
        var yMax;
        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = 0;
            yMax = normalizedTo;
            yData.forEach(function (stack, i) { return stack.forEach(function (y, j) { return stack[j] = y / ySums[i] * normalizedTo; }); });
        }
        else {
            // Find the height of each stack in the positive and negative directions,
            // then find the tallest stacks in both directions.
            yMin = Math.min.apply(Math, __spreadArrays([0], yData.map(function (values) { return values.reduce(function (min, value) { return value < 0 ? min - value : min; }, 0); })));
            yMax = Math.max.apply(Math, yData.map(function (values) { return values.reduce(function (max, value) { return value > 0 ? max + value : max; }, 0); }));
        }
        if (yMin === 0 && yMax === 0) {
            yMax = 1;
        }
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');
        this.fireEvent({ type: 'dataProcessed' });
        return true;
    };
    AreaSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xData;
        }
        else {
            return this.yDomain;
        }
    };
    AreaSeries.prototype.update = function () {
        var _a = this, visible = _a.visible, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis, xData = _a.xData, yData = _a.yData;
        this.group.visible = visible && !!(xData.length && yData.length);
        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending || !xData.length || !yData.length) {
            return;
        }
        var _b = this.generateSelectionData(), areaSelectionData = _b.areaSelectionData, markerSelectionData = _b.markerSelectionData;
        this.updateAreaSelection(areaSelectionData);
        this.updateStrokeSelection(areaSelectionData);
        this.updateMarkerSelection(markerSelectionData);
    };
    AreaSeries.prototype.generateSelectionData = function () {
        var _a = this, yKeys = _a.yKeys, yNames = _a.yNames, data = _a.data, xData = _a.xData, yData = _a.yData, marker = _a.marker, fills = _a.fills, strokes = _a.strokes, xScale = _a.xAxis.scale, yScale = _a.yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var areaSelectionData = [];
        var markerSelectionData = [];
        var last = xData.length * 2 - 1;
        xData.forEach(function (xDatum, i) {
            var yDatum = yData[i];
            var seriesDatum = data[i];
            var x = xScale.convert(xDatum) + xOffset;
            var prev = 0;
            yDatum.forEach(function (curr, j) {
                var y = yScale.convert(prev + curr) + yOffset;
                var yKey = yKeys[j];
                var yValue = seriesDatum[yKey];
                if (marker) {
                    markerSelectionData.push({
                        seriesDatum: seriesDatum,
                        yValue: yValue,
                        yKey: yKey,
                        x: x,
                        y: y,
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length],
                        text: yNames[j]
                    });
                }
                var areaDatum = areaSelectionData[j] || (areaSelectionData[j] = { yKey: yKey, points: [] });
                var areaPoints = areaDatum.points;
                areaPoints[i] = { x: x, y: y };
                areaPoints[last - i] = { x: x, y: yScale.convert(prev) + yOffset }; // bottom y
                prev += curr;
            });
        });
        return { areaSelectionData: areaSelectionData, markerSelectionData: markerSelectionData };
    };
    AreaSeries.prototype.updateAreaSelection = function (areaSelectionData) {
        var _a = this, fills = _a.fills, fillOpacity = _a.fillOpacity, yKeyEnabled = _a.yKeyEnabled, shadow = _a.shadow;
        var updateAreas = this.areaSelection.setData(areaSelectionData);
        updateAreas.exit.remove();
        var enterAreas = updateAreas.enter.append(path_1.Path)
            .each(function (path) {
            path.stroke = undefined;
            path.pointerEvents = node_1.PointerEvents.None;
        });
        var areaSelection = updateAreas.merge(enterAreas);
        areaSelection.each(function (shape, datum, index) {
            var path = shape.path;
            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.fillShadow = shadow;
            shape.visible = !!yKeyEnabled.get(datum.yKey);
            path.clear();
            var points = datum.points;
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
        this.areaSelection = areaSelection;
    };
    AreaSeries.prototype.updateStrokeSelection = function (areaSelectionData) {
        var _a = this, strokes = _a.strokes, strokeWidth = _a.strokeWidth, strokeOpacity = _a.strokeOpacity, data = _a.data, yKeyEnabled = _a.yKeyEnabled;
        var updateStrokes = this.strokeSelection.setData(areaSelectionData);
        updateStrokes.exit.remove();
        var enterStrokes = updateStrokes.enter.append(path_1.Path)
            .each(function (path) {
            path.fill = undefined;
            path.lineJoin = path.lineCap = 'round';
            path.pointerEvents = node_1.PointerEvents.None;
        });
        var strokeSelection = updateStrokes.merge(enterStrokes);
        strokeSelection.each(function (shape, datum, index) {
            var path = shape.path;
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = strokeWidth;
            shape.visible = !!yKeyEnabled.get(datum.yKey);
            shape.strokeOpacity = strokeOpacity;
            path.clear();
            var points = datum.points;
            // The stroke doesn't go all the way around the fill, only on top,
            // that's why we iterate until `data.length` (rather than `points.length`) and stop.
            for (var i = 0; i < data.length; i++) {
                var _a = points[i], x = _a.x, y = _a.y;
                if (i > 0) {
                    path.lineTo(x, y);
                }
                else {
                    path.moveTo(x, y);
                }
            }
        });
        this.strokeSelection = strokeSelection;
    };
    AreaSeries.prototype.updateMarkerSelection = function (markerSelectionData) {
        var _a = this, marker = _a.marker, xKey = _a.xKey;
        var Marker = marker.type;
        if (!Marker) {
            return;
        }
        var markerFormatter = marker.formatter;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        var markerSize = marker.size;
        var _b = this, yKeyEnabled = _b.yKeyEnabled, highlightedNode = _b.highlightedNode;
        var _c = this.highlightStyle, highlightFill = _c.fill, highlightStroke = _c.stroke;
        var updateMarkers = this.markerSelection.setData(markerSelectionData);
        updateMarkers.exit.remove();
        var enterMarkers = updateMarkers.enter.append(Marker);
        var markerSelection = updateMarkers.merge(enterMarkers);
        markerSelection.each(function (node, datum) {
            var isHighlightedNode = node === highlightedNode;
            var markerFill = isHighlightedNode && highlightFill !== undefined ? highlightFill : marker.fill || datum.fill;
            var markerStroke = isHighlightedNode && highlightStroke !== undefined ? highlightStroke : marker.stroke || datum.stroke;
            var markerFormat = undefined;
            if (markerFormatter) {
                markerFormat = markerFormatter({
                    datum: datum.seriesDatum,
                    xKey: xKey,
                    yKey: datum.yKey,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: isHighlightedNode
                });
            }
            node.fill = markerFormat && markerFormat.fill || markerFill;
            node.stroke = markerFormat && markerFormat.stroke || markerStroke;
            node.strokeWidth = markerFormat && markerFormat.strokeWidth !== undefined
                ? markerFormat.strokeWidth
                : markerStrokeWidth;
            node.size = markerFormat && markerFormat.size !== undefined
                ? markerFormat.size
                : markerSize;
            node.translationX = datum.x;
            node.translationY = datum.y;
            node.visible = marker.enabled && node.size > 0 && !!yKeyEnabled.get(datum.yKey);
        });
        this.markerSelection = markerSelection;
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var xKey = this.xKey;
        var yKey = nodeDatum.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _a = this, xName = _a.xName, yKeys = _a.yKeys, yNames = _a.yNames, fills = _a.fills, tooltipRenderer = _a.tooltipRenderer;
        var text = nodeDatum.text;
        var yKeyIndex = yKeys.indexOf(yKey);
        var yName = yNames[yKeyIndex];
        var color = fills[yKeyIndex % fills.length];
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey: xKey,
                xName: xName,
                yKey: yKey,
                yName: yName,
                title: text,
                color: color,
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var title = text ? "<div class=\"title\" " + titleStyle + ">" + text + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var xValue = seriesDatum[xKey];
            var yValue = seriesDatum[yKey];
            var xString = typeof xValue === 'number' ? number_1.toFixed(xValue) : String(xValue);
            var yString = typeof yValue === 'number' ? number_1.toFixed(yValue) : String(yValue);
            return title + "<div class=\"content\">" + xString + ": " + yString + "</div>";
        }
    };
    AreaSeries.prototype.listSeriesItems = function (data) {
        var _a = this, id = _a.id, xKey = _a.xKey, yKeys = _a.yKeys, yNames = _a.yNames, yKeyEnabled = _a.yKeyEnabled, marker = _a.marker, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (this.data.length && xKey && yKeys.length) {
            yKeys.forEach(function (yKey, index) {
                data.push({
                    id: id,
                    itemId: yKey,
                    enabled: yKeyEnabled.get(yKey) || false,
                    label: {
                        text: yNames[index] || yKeys[index]
                    },
                    marker: {
                        type: marker.type,
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
        this.yKeyEnabled.set(itemId, enabled);
        this.scheduleData();
    };
    AreaSeries.className = 'AreaSeries';
    return AreaSeries;
}(cartesianSeries_1.CartesianSeries));
exports.AreaSeries = AreaSeries;
//# sourceMappingURL=areaSeries.js.map