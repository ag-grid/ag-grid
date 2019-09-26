// ag-grid-enterprise v21.2.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var selection_1 = require("../../scene/selection");
var series_1 = require("./series");
var continuousScale_1 = require("../../scale/continuousScale");
var node_1 = require("../../scene/node");
var number_1 = require("../../util/number");
var path_1 = require("../../scene/shape/path");
var arc_1 = require("../../scene/shape/arc");
var palettes_1 = require("../palettes");
var array_1 = require("../../util/array");
var AreaSeries = /** @class */ (function (_super) {
    __extends(AreaSeries, _super);
    function AreaSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.areaGroup = _this.group.appendChild(new group_1.Group);
        _this.strokeGroup = _this.group.appendChild(new group_1.Group);
        _this.markerGroup = _this.group.appendChild(new group_1.Group);
        _this.areaSelection = selection_1.Selection.select(_this.areaGroup).selectAll();
        _this.strokeSelection = selection_1.Selection.select(_this.strokeGroup).selectAll();
        _this.markerSelection = selection_1.Selection.select(_this.markerGroup).selectAll();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yFields} setter.
         */
        _this.enabled = new Map();
        _this._fills = palettes_1.default.fills;
        _this._strokes = ['white'];
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this.xData = [];
        _this.yData = [];
        _this.ySums = [];
        _this.domainX = [];
        _this.domainY = [];
        _this._xField = '';
        _this._yFields = [];
        _this._yFieldNames = [];
        _this._normalizedTo = NaN;
        _this._strokeWidth = 3;
        _this._marker = false;
        _this._markerSize = 8;
        _this._markerStrokeWidth = 2;
        _this._shadow = undefined;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        return _this;
    }
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
    Object.defineProperty(AreaSeries.prototype, "chart", {
        get: function () {
            return this._chart;
        },
        set: function (chart) {
            if (this._chart !== chart) {
                this._chart = chart;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "xField", {
        get: function () {
            return this._xField;
        },
        set: function (value) {
            if (this._xField !== value) {
                this._xField = value;
                this.xData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "yFields", {
        get: function () {
            return this._yFields;
        },
        set: function (values) {
            this._yFields = values;
            var enabled = this.enabled;
            enabled.clear();
            values.forEach(function (field) { return enabled.set(field, true); });
            this.yData = [];
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "yFieldNames", {
        get: function () {
            return this._yFieldNames;
        },
        set: function (values) {
            this._yFieldNames = values;
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
            if (value === 0) {
                value = NaN;
            }
            var absValue = Math.abs(value);
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
    Object.defineProperty(AreaSeries.prototype, "marker", {
        get: function () {
            return this._marker;
        },
        set: function (value) {
            if (this._marker !== value) {
                this._marker = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "markerSize", {
        get: function () {
            return this._markerSize;
        },
        set: function (value) {
            if (this._markerSize !== value) {
                this._markerSize = Math.abs(value);
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "markerStrokeWidth", {
        get: function () {
            return this._markerStrokeWidth;
        },
        set: function (value) {
            if (this._markerStrokeWidth !== value) {
                this._markerStrokeWidth = value;
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
        if (!(node instanceof arc_1.Arc)) {
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
        var chart = this.chart;
        var xField = this.xField;
        var yFields = this.yFields;
        var data = this.data;
        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }
        if (!(xField && yFields.length)) {
            this._data = data = [];
        }
        // If the data is an array of rows like so:
        //
        // [{
        //   xField: 'Jan',
        //   yField1: 5,
        //   yField2: 7,
        //   yField3: -9,
        // }, {
        //   xField: 'Feb',
        //   yField1: 10,
        //   yField2: -15,
        //   yField3: 20
        // }]
        //
        var enabled = this.enabled;
        var normalizedTo = this.normalizedTo;
        var continuousX = chart.xAxis.scale instanceof continuousScale_1.default;
        var xData = this.xData = data.map(function (datum) { return datum[xField]; });
        var ySums = this.ySums = []; // used for normalization
        var yData = this.yData = data.map(function (datum, xIndex) {
            var values = [];
            var ySum = 0;
            yFields.forEach(function (field) {
                var value = datum[field];
                if (!isFinite(value) || !enabled.get(field)) {
                    value = 0;
                }
                if (value < 0) {
                    value = Math.abs(value);
                }
                if (value > 0) {
                    ySum += value;
                }
                values.push(value);
            });
            ySums[xIndex] = ySum;
            return values;
        });
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        var yMin = Infinity;
        var yMax = -Infinity;
        if (isFinite(normalizedTo)) {
            yMin = 0;
            yMax = normalizedTo;
            yData.forEach(function (stack, i) {
                var ySum = ySums[i];
                stack.forEach(function (y, j) { return stack[j] = y / ySum * normalizedTo; });
            });
        }
        else {
            // Find the height of each stack in the positive and negative directions,
            // then find the tallest stacks in both directions.
            yMin = Math.min.apply(Math, [0].concat(yData.map(function (stackValues) {
                var min = 0;
                stackValues.forEach(function (value) {
                    if (value < 0) {
                        min -= value;
                    }
                });
                return min;
            })));
            yMax = Math.max.apply(Math, yData.map(function (stackValues) {
                var max = 0;
                stackValues.forEach(function (value) {
                    if (value > 0) {
                        max += value;
                    }
                });
                return max;
            }));
        }
        if (yMin === yMax || !isFinite(yMin) || !isFinite(yMax)) {
            yMin = 0;
            yMax = 1;
            // console.warn('Zero or infinite y-range.');
        }
        var domainX = continuousX ? (array_1.numericExtent(xData) || [0, 1]) : xData;
        if (continuousX) {
            var _a = domainX, min = _a[0], max = _a[1];
            if (min === max) {
                domainX[0] = min - 1;
                domainX[1] = max + 1;
            }
        }
        this.domainX = domainX;
        this.domainY = [yMin, yMax];
        if (chart) {
            chart.updateAxes();
        }
        return true;
    };
    AreaSeries.prototype.getDomainX = function () {
        return this.xData;
    };
    AreaSeries.prototype.getDomainY = function () {
        return this.domainY;
    };
    AreaSeries.prototype.update = function () {
        var _this = this;
        var chart = this.chart;
        var visible = this.group.visible = this.visible;
        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }
        var xCount = this.data.length;
        var xAxis = chart.xAxis;
        var yAxis = chart.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var yFields = this.yFields;
        var enabled = this.enabled;
        var fills = this.fills;
        var strokes = this.strokes;
        var fillOpacity = this.fillOpacity;
        var strokeOpacity = this.strokeOpacity;
        var strokeWidth = this.strokeWidth;
        var data = this.data;
        var xData = this.xData;
        var yData = this.yData;
        var marker = this.marker;
        var markerSize = this.markerSize;
        var markerStrokeWidth = this.markerStrokeWidth;
        var areaSelectionData = [];
        var markerSelectionData = [];
        var last = xCount * 2 - 1;
        for (var i = 0; i < xCount; i++) {
            var xDatum = xData[i];
            var yDatum = yData[i];
            var yCount = yDatum.length;
            var x = xScale.convert(xDatum) + xOffset;
            var prev = 0;
            var curr = void 0;
            for (var j = 0; j < yCount; j++) {
                curr = yDatum[j];
                var y = yScale.convert(prev + curr) + yOffset;
                var yField = yFields[j];
                var seriesDatum = data[i];
                var yValue = seriesDatum[yField];
                if (marker) {
                    markerSelectionData.push({
                        seriesDatum: seriesDatum,
                        yValue: yValue,
                        yField: yField,
                        x: x,
                        y: y,
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length],
                        radius: markerSize / 2,
                        text: this.yFieldNames[j]
                    });
                }
                var areaDatum = areaSelectionData[j] || (areaSelectionData[j] = {
                    yField: yField,
                    points: []
                });
                var areaPoints = areaDatum.points;
                areaPoints[i] = {
                    x: x,
                    y: y
                };
                areaPoints[last - i] = {
                    x: x,
                    y: yScale.convert(prev) + yOffset // bottom y
                };
                prev += curr;
            }
        }
        var updateAreas = this.areaSelection.setData(areaSelectionData);
        var updateStrokes = this.strokeSelection.setData(areaSelectionData);
        var updateMarkers = this.markerSelection.setData(markerSelectionData);
        updateAreas.exit.remove();
        updateStrokes.exit.remove();
        updateMarkers.exit.remove();
        var enterAreas = updateAreas.enter.append(path_1.Path)
            .each(function (path) {
            path.stroke = undefined;
            path.pointerEvents = node_1.PointerEvents.None;
        });
        var enterStrokes = updateStrokes.enter.append(path_1.Path)
            .each(function (path) {
            path.fill = undefined;
            path.lineJoin = 'round';
            path.lineCap = 'round';
            path.pointerEvents = node_1.PointerEvents.None;
        });
        var enterMarkers = updateMarkers.enter.append(arc_1.Arc)
            .each(function (arc) { return arc.type = arc_1.ArcType.Chord; });
        var highlightedNode = this.highlightedNode;
        var areaSelection = updateAreas.merge(enterAreas);
        var strokeSelection = updateStrokes.merge(enterStrokes);
        var markerSelection = updateMarkers.merge(enterMarkers);
        areaSelection.each(function (shape, datum, index) {
            var path = shape.path;
            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.fillShadow = _this.shadow;
            shape.visible = !!enabled.get(datum.yField);
            path.clear();
            var points = datum.points;
            var n = points.length;
            for (var i = 0; i < n; i++) {
                var _a = points[i], x = _a.x, y = _a.y;
                if (!i) {
                    path.moveTo(x, y);
                }
                else {
                    path.lineTo(x, y);
                }
            }
            path.closePath();
        });
        strokeSelection.each(function (shape, datum, index) {
            var path = shape.path;
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = strokeWidth;
            shape.visible = !!enabled.get(datum.yField);
            shape.strokeOpacity = strokeOpacity;
            path.clear();
            var points = datum.points;
            // The stroke doesn't go all the way around the fill, only on top,
            // that's why we iterate until `xCount` (rather than `points.length`) and stop.
            for (var i = 0; i < xCount; i++) {
                var _a = points[i], x = _a.x, y = _a.y;
                if (!i) {
                    path.moveTo(x, y);
                }
                else {
                    path.lineTo(x, y);
                }
            }
        });
        markerSelection.each(function (arc, datum) {
            arc.centerX = datum.x;
            arc.centerY = datum.y;
            arc.radiusX = datum.radius;
            arc.radiusY = datum.radius;
            arc.fill = arc === highlightedNode && _this.highlightStyle.fill !== undefined
                ? _this.highlightStyle.fill
                : datum.fill;
            arc.stroke = arc === highlightedNode && _this.highlightStyle.stroke !== undefined
                ? _this.highlightStyle.stroke
                : datum.stroke;
            arc.strokeWidth = markerStrokeWidth;
            arc.visible = datum.radius > 0 && !!enabled.get(datum.yField);
        });
        this.areaSelection = areaSelection;
        this.strokeSelection = strokeSelection;
        this.markerSelection = markerSelection;
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var html = '';
        if (this.tooltipEnabled) {
            var xField = this.xField;
            var yField = nodeDatum.yField;
            var yFields = this.yFields;
            var yFieldIndex = yFields.indexOf(yField);
            var color = this.fills[yFieldIndex % this.fills.length];
            var title = nodeDatum.text;
            if (this.tooltipRenderer && xField) {
                html = this.tooltipRenderer({
                    datum: nodeDatum.seriesDatum,
                    xField: xField,
                    yField: yField,
                    title: title,
                    color: color
                });
            }
            else {
                var titleStyle = "style=\"color: white; background-color: " + color + "\"";
                title = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
                var seriesDatum = nodeDatum.seriesDatum;
                var xValue = seriesDatum[xField];
                var yValue = seriesDatum[yField];
                var xString = typeof (xValue) === 'number' ? number_1.toFixed(xValue) : String(xValue);
                var yString = typeof (yValue) === 'number' ? number_1.toFixed(yValue) : String(yValue);
                html = title + "<div class=\"content\">" + xString + ": " + yString + "</div>";
            }
        }
        return html;
    };
    AreaSeries.prototype.listSeriesItems = function (data) {
        var _this = this;
        if (this.data.length && this.xField && this.yFields.length) {
            var fills_1 = this.fills;
            var strokes_1 = this.strokes;
            var id_1 = this.id;
            this.yFields.forEach(function (yField, index) {
                data.push({
                    id: id_1,
                    itemId: yField,
                    enabled: _this.enabled.get(yField) || false,
                    label: {
                        text: _this.yFieldNames[index] || _this.yFields[index]
                    },
                    marker: {
                        fill: fills_1[index % fills_1.length],
                        stroke: strokes_1[index % strokes_1.length]
                    }
                });
            });
        }
    };
    AreaSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.enabled.set(itemId, enabled);
        this.scheduleData();
    };
    AreaSeries.className = 'AreaSeries';
    return AreaSeries;
}(series_1.Series));
exports.AreaSeries = AreaSeries;
