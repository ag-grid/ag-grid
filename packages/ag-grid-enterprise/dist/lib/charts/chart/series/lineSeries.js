// ag-grid-enterprise v21.0.1
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
var path_1 = require("../../scene/shape/path");
var color_1 = require("../../util/color");
var continuousScale_1 = require("../../scale/continuousScale");
var selection_1 = require("../../scene/selection");
var group_1 = require("../../scene/group");
var arc_1 = require("../../scene/shape/arc");
var array_1 = require("../../util/array");
var palettes_1 = require("../palettes");
var series_1 = require("./series");
var number_1 = require("../../util/number");
var node_1 = require("../../scene/node");
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries() {
        var _this = _super.call(this) || this;
        _this.domainX = [];
        _this.domainY = [];
        _this.xData = [];
        _this.yData = [];
        _this.lineNode = new path_1.Path();
        _this.groupSelection = selection_1.Selection.select(_this.group).selectAll();
        _this._title = '';
        _this._xField = '';
        _this._yField = '';
        _this._marker = false;
        _this._markerSize = 8;
        _this._markerStrokeWidth = 2;
        _this._fill = palettes_1.default.fills[0];
        _this._stroke = palettes_1.default.strokes[0];
        _this._strokeWidth = 3;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        var lineNode = _this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = node_1.PointerEvents.None;
        _this.group.append(lineNode);
        return _this;
    }
    Object.defineProperty(LineSeries.prototype, "chart", {
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
    Object.defineProperty(LineSeries.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            if (this._title !== value) {
                this._title = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "xField", {
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
    Object.defineProperty(LineSeries.prototype, "yField", {
        get: function () {
            return this._yField;
        },
        set: function (value) {
            if (this._yField !== value) {
                this._yField = value;
                this.yData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "marker", {
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
    Object.defineProperty(LineSeries.prototype, "markerSize", {
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
    Object.defineProperty(LineSeries.prototype, "markerStrokeWidth", {
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
    LineSeries.prototype.processData = function () {
        var chart = this.chart;
        var xField = this.xField;
        var yField = this.yField;
        var data = this.data;
        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }
        if (!(xField && yField)) {
            this._data = data = [];
        }
        this.xData = data.map(function (datum) { return datum[xField]; });
        this.yData = data.map(function (datum) { return datum[yField]; });
        var continuousX = chart.xAxis.scale instanceof continuousScale_1.default;
        var domainX = continuousX ? array_1.extent(this.xData) : this.xData;
        var domainY = array_1.extent(this.yData);
        if (continuousX) {
            var min = domainX[0];
            var max = domainX[1];
            if (min === max) {
                if (typeof min === 'number' && isFinite(min)) {
                    domainX[0] -= 1;
                }
                else {
                    domainX[0] = 0;
                }
                if (typeof max === 'number' && isFinite(max)) {
                    domainX[1] += 1;
                }
                else {
                    domainX[1] = 1;
                }
            }
        }
        if (domainY[0] === domainY[1]) {
            var min = domainY[0];
            var max = domainY[1];
            if (typeof min === 'number' && isFinite(min)) {
                domainY[0] -= 1;
            }
            else {
                domainY[0] = 0;
            }
            if (typeof max === 'number' && isFinite(max)) {
                domainY[1] += 1;
            }
            else {
                domainY[1] = 1;
            }
        }
        this.domainX = domainX;
        this.domainY = domainY;
        return true;
    };
    Object.defineProperty(LineSeries.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (this._fill !== value) {
                this._fill = value;
                this.stroke = color_1.Color.fromString(value).darker().toHexString();
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "stroke", {
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (this._stroke !== value) {
                this._stroke = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "strokeWidth", {
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
    LineSeries.prototype.highlight = function (node) {
        if (!(node instanceof arc_1.Arc)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    LineSeries.prototype.dehighlight = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    LineSeries.prototype.update = function () {
        var _this = this;
        var chart = this.chart;
        var visible = this.group.visible = this.visible;
        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }
        var xAxis = chart.xAxis;
        var yAxis = chart.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var data = this.data;
        var xData = this.xData;
        var yData = this.yData;
        var n = xData.length;
        var fill = this.fill;
        var stroke = this.stroke;
        var marker = this.marker;
        var markerStrokeWidth = this.markerStrokeWidth;
        var markerSize = this.markerSize;
        var lineNode = this.lineNode;
        var linePath = lineNode.path;
        var groupSelectionData = [];
        linePath.clear();
        for (var i = 0; i < n; i++) {
            var xDatum = xData[i];
            var yDatum = yData[i];
            var x = xScale.convert(xDatum) + xOffset;
            var y = yScale.convert(yDatum) + yOffset;
            if (!i) {
                linePath.moveTo(x, y);
            }
            else {
                linePath.lineTo(x, y);
            }
            if (marker) {
                groupSelectionData.push({
                    seriesDatum: data[i],
                    x: x,
                    y: y,
                    fill: fill,
                    stroke: stroke,
                    strokeWidth: markerStrokeWidth,
                    radius: markerSize / 2
                });
            }
        }
        lineNode.stroke = stroke;
        lineNode.strokeWidth = this.strokeWidth;
        // ------------------------------------------
        var updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(arc_1.Arc).each(function (arc) { return arc.type = arc_1.ArcType.Chord; });
        var highlightedNode = this.highlightedNode;
        var groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByClass(arc_1.Arc)
            .each(function (arc, datum) {
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
            arc.strokeWidth = datum.strokeWidth;
            arc.visible = datum.radius > 0;
        });
        this.groupSelection = groupSelection;
    };
    LineSeries.prototype.getDomainX = function () {
        return this.domainX;
    };
    LineSeries.prototype.getDomainY = function () {
        return this.domainY;
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var xField = this.xField;
        var yField = this.yField;
        var html = '';
        if (!xField || !yField) {
            return html;
        }
        if (this.tooltipRenderer && this.xField) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xField: xField,
                yField: yField
            });
        }
        else {
            var title = this.title ? "<div class=\"title\">" + this.title + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var xValue = seriesDatum[xField];
            var yValue = seriesDatum[yField];
            var xString = typeof (xValue) === 'number' ? number_1.toFixed(xValue) : String(xValue);
            var yString = typeof (yValue) === 'number' ? number_1.toFixed(yValue) : String(yValue);
            html = "" + title + xString + ": " + yString;
        }
        return html;
    };
    LineSeries.prototype.listSeriesItems = function (data) {
        if (this.data.length && this.xField && this.yField) {
            data.push({
                id: this.id,
                itemId: undefined,
                enabled: this.visible,
                label: {
                    text: this.title || this.yField
                },
                marker: {
                    fillStyle: this.fill,
                    strokeStyle: this.stroke
                }
            });
        }
    };
    LineSeries.className = 'LineSeries';
    return LineSeries;
}(series_1.Series));
exports.LineSeries = LineSeries;
