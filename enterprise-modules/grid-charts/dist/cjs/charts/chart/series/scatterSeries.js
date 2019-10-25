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
var selection_1 = require("../../scene/selection");
var group_1 = require("../../scene/group");
var series_1 = require("./series");
var array_1 = require("../../util/array");
var number_1 = require("../../util/number");
var linearScale_1 = require("../../scale/linearScale");
var marker_1 = require("../marker/marker");
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries() {
        var _this = _super.call(this) || this;
        _this.domainX = [];
        _this.domainY = [];
        _this.xData = [];
        _this.yData = [];
        _this.sizeData = [];
        _this.sizeScale = linearScale_1.default();
        _this.groupSelection = selection_1.Selection.select(_this.group).selectAll();
        _this._xKey = '';
        _this._yKey = '';
        _this.xName = 'X';
        _this.yName = 'Y';
        _this.sizeName = 'Size';
        _this.labelName = 'Label';
        _this.highlightStyle = {
            fill: 'yellow'
        };
        _this.marker.onChange = _this.update.bind(_this);
        _this.marker.onTypeChange = _this.onMarkerTypeChange.bind(_this);
        return _this;
    }
    ScatterSeries.prototype.onMarkerTypeChange = function () {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
    };
    Object.defineProperty(ScatterSeries.prototype, "chart", {
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
    Object.defineProperty(ScatterSeries.prototype, "title", {
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
    Object.defineProperty(ScatterSeries.prototype, "xKey", {
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
    Object.defineProperty(ScatterSeries.prototype, "yKey", {
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
    Object.defineProperty(ScatterSeries.prototype, "sizeKey", {
        get: function () {
            return this._sizeKey;
        },
        set: function (value) {
            if (this._sizeKey !== value) {
                this._sizeKey = value;
                this.sizeData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScatterSeries.prototype, "labelKey", {
        get: function () {
            return this._labelKey;
        },
        set: function (value) {
            if (this._labelKey !== value) {
                this._labelKey = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    ScatterSeries.prototype.processData = function () {
        var _a = this, chart = _a.chart, xKey = _a.xKey, yKey = _a.yKey, sizeKey = _a.sizeKey;
        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }
        if (!(xKey && yKey)) {
            this._data = [];
        }
        this.xData = this.data.map(function (d) { return d[xKey]; });
        this.yData = this.data.map(function (d) { return d[yKey]; });
        if (sizeKey) {
            this.sizeData = this.data.map(function (d) { return d[sizeKey]; });
        }
        else {
            this.sizeData = [];
        }
        this.sizeScale.domain = array_1.numericExtent(this.sizeData) || [1, 1];
        this.domainX = this.calculateDomain(this.xData);
        this.domainY = this.calculateDomain(this.yData);
        return true;
    };
    ScatterSeries.prototype.calculateDomain = function (data) {
        var domain = array_1.numericExtent(data) || [0, 1];
        var min = domain[0], max = domain[1];
        if (min === max) {
            domain[0] = min - 1;
            domain[1] = max + 1;
        }
        return domain;
    };
    ScatterSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof marker_1.Marker)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    ScatterSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    ScatterSeries.prototype.update = function () {
        var chart = this.chart;
        var visible = this.group.visible = this.visible;
        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }
        var xAxis = chart.xAxis, yAxis = chart.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _a = this, data = _a.data, xData = _a.xData, yData = _a.yData, sizeData = _a.sizeData, sizeScale = _a.sizeScale, marker = _a.marker, highlightedNode = _a.highlightedNode;
        var Marker = marker.type;
        this.sizeScale.range = [marker.minSize, marker.size];
        var groupSelectionData = xData.map(function (xDatum, i) { return ({
            seriesDatum: data[i],
            x: xScale.convert(xDatum) + xOffset,
            y: yScale.convert(yData[i]) + yOffset,
            fill: marker.fill,
            stroke: marker.stroke,
            strokeWidth: marker.strokeWidth,
            size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size
        }); });
        var updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(Marker);
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
    ScatterSeries.prototype.getDomainX = function () {
        return this.domainX;
    };
    ScatterSeries.prototype.getDomainY = function () {
        return this.domainY;
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _b = this, title = _b.title, tooltipRenderer = _b.tooltipRenderer, xName = _b.xName, yName = _b.yName, sizeKey = _b.sizeKey, sizeName = _b.sizeName, labelKey = _b.labelKey, labelName = _b.labelName;
        var color = this.marker.fill || 'gray';
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey: xKey,
                yKey: yKey,
                sizeKey: sizeKey,
                labelKey: labelKey,
                xName: xName,
                yName: yName,
                sizeName: sizeName,
                labelName: labelName,
                title: title,
                color: color
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleHtml = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var xValue = seriesDatum[xKey];
            var yValue = seriesDatum[yKey];
            var contentHtml = "<b>" + xName + "</b>: " + number_1.toFixed(xValue) + "<br><b>" + yName + "</b>: " + number_1.toFixed(yValue);
            if (sizeKey) {
                contentHtml += "<br><b>" + sizeName + "</b>: " + seriesDatum[sizeKey];
            }
            if (labelKey) {
                contentHtml = "<b>" + labelName + "</b>: " + seriesDatum[labelKey] + "<br>" + contentHtml;
            }
            return titleHtml + "<div class=\"content\">" + contentHtml + "</div>";
        }
    };
    ScatterSeries.prototype.listSeriesItems = function (data) {
        if (this.data.length && this.xKey && this.yKey) {
            data.push({
                id: this.id,
                itemId: undefined,
                enabled: this.visible,
                label: {
                    text: this.title || this.yKey
                },
                marker: {
                    fill: this.marker.fill || 'gray',
                    stroke: this.marker.stroke || 'black'
                }
            });
        }
    };
    ScatterSeries.className = 'ScatterSeries';
    return ScatterSeries;
}(series_1.Series));
exports.ScatterSeries = ScatterSeries;
