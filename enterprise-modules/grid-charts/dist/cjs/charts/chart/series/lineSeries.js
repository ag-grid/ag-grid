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
var continuousScale_1 = require("../../scale/continuousScale");
var selection_1 = require("../../scene/selection");
var group_1 = require("../../scene/group");
var palettes_1 = require("../palettes");
var series_1 = require("./series");
var array_1 = require("../../util/array");
var color_1 = require("../../util/color");
var number_1 = require("../../util/number");
var node_1 = require("../../scene/node");
var marker_1 = require("../marker/marker");
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
        _this._xKey = '';
        _this._xName = '';
        _this._yKey = '';
        _this._yName = '';
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
        _this.marker.onChange = _this.update.bind(_this);
        _this.marker.onTypeChange = _this.onMarkerTypeChange.bind(_this);
        return _this;
    }
    LineSeries.prototype.onMarkerTypeChange = function () {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
    };
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
    Object.defineProperty(LineSeries.prototype, "xKey", {
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
    Object.defineProperty(LineSeries.prototype, "xName", {
        get: function () {
            return this._xName;
        },
        set: function (value) {
            if (this._xName !== value) {
                this._xName = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "yKey", {
        get: function () {
            return this._yKey;
        },
        set: function (value) {
            if (this._yKey !== value) {
                this._yKey = value;
                this.yData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "yName", {
        get: function () {
            return this._yName;
        },
        set: function (value) {
            if (this._yName !== value) {
                this._yName = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    LineSeries.prototype.processData = function () {
        var _a = this, chart = _a.chart, xKey = _a.xKey, yKey = _a.yKey;
        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }
        if (!(xKey && yKey)) {
            this._data = [];
        }
        this.xData = this.data.map(function (datum) { return datum[xKey]; });
        this.yData = this.data.map(function (datum) { return datum[yKey]; });
        var isContinuousX = chart.xAxis.scale instanceof continuousScale_1.default;
        var domainX = isContinuousX ? (array_1.numericExtent(this.xData) || [0, 1]) : this.xData;
        var domainY = array_1.numericExtent(this.yData) || [0, 1];
        if (isContinuousX) {
            var _b = domainX, min_1 = _b[0], max_1 = _b[1];
            if (min_1 === max_1) {
                domainX[0] = min_1 - 1;
                domainX[1] = max_1 + 1;
            }
        }
        var min = domainY[0], max = domainY[1];
        if (min === max) {
            domainY[0] = min - 1;
            domainY[1] = max + 1;
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
    LineSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof marker_1.Marker)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    LineSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    LineSeries.prototype.update = function () {
        var chart = this.chart;
        var visible = this.group.visible = this.visible;
        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }
        var xScale = chart.xAxis.scale, yScale = chart.yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _a = this, data = _a.data, xData = _a.xData, yData = _a.yData, fill = _a.fill, marker = _a.marker, lineNode = _a.lineNode;
        var linePath = lineNode.path;
        var Marker = marker.type;
        var markerSize = marker.size;
        var markerFill = this.fill;
        var markerStroke = this.stroke;
        var markerStrokeWidth = marker.strokeWidth;
        linePath.clear();
        var groupSelectionData = [];
        xData.forEach(function (xDatum, i) {
            var yDatum = yData[i];
            var x = xScale.convert(xDatum) + xOffset;
            var y = yScale.convert(yDatum) + yOffset;
            if (i > 0) {
                linePath.lineTo(x, y);
            }
            else {
                linePath.moveTo(x, y);
            }
            if (marker) {
                groupSelectionData.push({
                    seriesDatum: data[i],
                    x: x,
                    y: y,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize
                });
            }
        });
        lineNode.stroke = fill; // use fill colour for the line
        lineNode.strokeWidth = this.strokeWidth;
        var updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(Marker);
        var highlightedNode = this.highlightedNode;
        var groupSelection = updateGroups.merge(enterGroups);
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke;
        groupSelection.selectByClass(Marker)
            .each(function (node, datum) {
            node.translationX = datum.x;
            node.translationY = datum.y;
            node.size = datum.size;
            node.fill = node === highlightedNode && highlightFill !== undefined ? highlightFill : datum.fill;
            node.stroke = node === highlightedNode && highlightStroke !== undefined ? highlightStroke : datum.stroke;
            node.fillOpacity = marker.fillOpacity;
            node.strokeOpacity = marker.strokeOpacity;
            node.strokeWidth = datum.strokeWidth;
            node.visible = marker.enabled && datum.size > 0;
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
        var _a = this, xKey = _a.xKey, yKey = _a.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, color = _b.fill, title = _b.title, tooltipRenderer = _b.tooltipRenderer;
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey: xKey,
                xName: xName,
                yKey: yKey,
                yName: yName,
                title: title,
                color: color,
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleString = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var xValue = seriesDatum[xKey];
            var yValue = seriesDatum[yKey];
            var xString = typeof xValue === 'number' ? number_1.toFixed(xValue) : String(xValue);
            var yString = typeof yValue === 'number' ? number_1.toFixed(yValue) : String(yValue);
            return titleString + "<div class=\"content\">" + xString + ": " + yString + "</div>";
        }
    };
    LineSeries.prototype.listSeriesItems = function (data) {
        if (this.data.length && this.xKey && this.yKey) {
            data.push({
                id: this.id,
                itemId: undefined,
                enabled: this.visible,
                label: {
                    text: this.title || this.yKey
                },
                marker: {
                    fill: this.fill,
                    stroke: this.stroke
                }
            });
        }
    };
    LineSeries.className = 'LineSeries';
    return LineSeries;
}(series_1.Series));
exports.LineSeries = LineSeries;
