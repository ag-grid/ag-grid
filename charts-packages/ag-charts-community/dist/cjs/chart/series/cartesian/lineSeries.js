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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("../../../scene/shape/path");
var continuousScale_1 = require("../../../scale/continuousScale");
var selection_1 = require("../../../scene/selection");
var group_1 = require("../../../scene/group");
var series_1 = require("../series");
var array_1 = require("../../../util/array");
var number_1 = require("../../../util/number");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var util_1 = require("../../marker/util");
var observable_1 = require("../../../util/observable");
var chart_1 = require("../../chart");
var string_1 = require("../../../util/string");
var LineSeriesTooltip = /** @class */ (function (_super) {
    __extends(LineSeriesTooltip, _super);
    function LineSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        observable_1.reactive('change')
    ], LineSeriesTooltip.prototype, "renderer", void 0);
    __decorate([
        observable_1.reactive('change')
    ], LineSeriesTooltip.prototype, "format", void 0);
    return LineSeriesTooltip;
}(series_1.SeriesTooltip));
exports.LineSeriesTooltip = LineSeriesTooltip;
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries() {
        var _this = _super.call(this) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.lineNode = new path_1.Path();
        // We use groups for this selection even though each group only contains a marker ATM
        // because in the future we might want to add label support as well.
        _this.nodeSelection = selection_1.Selection.select(_this.group).selectAll();
        _this.nodeData = [];
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.stroke = '#874349';
        _this.lineDash = undefined;
        _this.lineDashOffset = 0;
        _this.strokeWidth = 2;
        _this.strokeOpacity = 1;
        _this.tooltip = new LineSeriesTooltip();
        _this._xKey = '';
        _this.xName = '';
        _this._yKey = '';
        _this.yName = '';
        _this.highlightStyle = { fill: 'yellow' };
        var lineNode = _this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = node_1.PointerEvents.None;
        _this.group.append(lineNode);
        _this.addEventListener('update', _this.update);
        var marker = _this.marker;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        marker.addPropertyListener('shape', _this.onMarkerShapeChange, _this);
        marker.addPropertyListener('enabled', _this.onMarkerEnabledChange, _this);
        marker.addEventListener('change', _this.update, _this);
        return _this;
    }
    LineSeries.prototype.onMarkerShapeChange = function () {
        this.nodeSelection = this.nodeSelection.setData([]);
        this.nodeSelection.exit.remove();
        this.update();
        this.fireEvent({ type: 'legendChange' });
    };
    LineSeries.prototype.onMarkerEnabledChange = function (event) {
        if (!event.value) {
            this.nodeSelection = this.nodeSelection.setData([]);
            this.nodeSelection.exit.remove();
        }
    };
    LineSeries.prototype.setColors = function (fills, strokes) {
        this.stroke = fills[0];
        this.marker.stroke = strokes[0];
        this.marker.fill = fills[0];
    };
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
    LineSeries.prototype.processData = function () {
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis, xKey = _a.xKey, yKey = _a.yKey, xData = _a.xData, yData = _a.yData;
        var data = xKey && yKey && this.data ? this.data : [];
        if (!xAxis) {
            return false;
        }
        var isContinuousX = xAxis.scale instanceof continuousScale_1.default;
        var isContinuousY = yAxis.scale instanceof continuousScale_1.default;
        xData.length = 0;
        yData.length = 0;
        for (var i = 0, n = data.length; i < n; i++) {
            var datum = data[i];
            var x = datum[xKey];
            var y = datum[yKey];
            xData.push(x);
            yData.push(y);
        }
        this.xDomain = isContinuousX ? this.fixNumericExtent(array_1.numericExtent(xData), 'x') : xData;
        this.yDomain = isContinuousY ? this.fixNumericExtent(array_1.numericExtent(yData), 'y') : yData;
        return true;
    };
    LineSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    };
    LineSeries.prototype.onHighlightChange = function () {
        this.updateNodes();
    };
    LineSeries.prototype.update = function () {
        this.group.visible = this.visible;
        var _a = this, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!chart || chart.layoutPending || chart.dataPending || !xAxis || !yAxis) {
            return;
        }
        this.updateLinePath(); // this will generate node data too
        this.updateNodeSelection();
        this.updateNodes();
    };
    LineSeries.prototype.getXYDatums = function (i, xData, yData, xScale, yScale) {
        var isContinuousX = xScale instanceof continuousScale_1.default;
        var isContinuousY = yScale instanceof continuousScale_1.default;
        var xDatum = xData[i];
        var yDatum = yData[i];
        var noDatum = yDatum == null || (isContinuousY && (isNaN(yDatum) || !isFinite(yDatum))) ||
            xDatum == null || (isContinuousX && (isNaN(xDatum) || !isFinite(xDatum)));
        return noDatum ? undefined : [xDatum, yDatum];
    };
    LineSeries.prototype.updateLinePath = function () {
        if (!this.data) {
            return;
        }
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis, data = _a.data, xData = _a.xData, yData = _a.yData, lineNode = _a.lineNode;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var linePath = lineNode.path;
        var nodeData = [];
        linePath.clear();
        var moveTo = true;
        var prevXInRange = undefined;
        var nextXYDatums = undefined;
        for (var i = 0; i < xData.length; i++) {
            var xyDatums = nextXYDatums || this.getXYDatums(i, xData, yData, xScale, yScale);
            if (!xyDatums) {
                prevXInRange = undefined;
                moveTo = true;
            }
            else {
                var xDatum = xyDatums[0], yDatum = xyDatums[1];
                var x = xScale.convert(xDatum) + xOffset;
                var tolerance = (xScale.bandwidth || (this.marker.size * 0.5 + (this.marker.strokeWidth || 0))) + 1;
                nextXYDatums = this.getXYDatums(i + 1, xData, yData, xScale, yScale);
                var xInRange = xAxis.inRangeEx(x, 0, tolerance);
                var nextXInRange = nextXYDatums && xAxis.inRangeEx(xScale.convert(nextXYDatums[0]) + xOffset, 0, tolerance);
                if (xInRange === -1 && nextXInRange === -1) {
                    moveTo = true;
                    continue;
                }
                if (xInRange === 1 && prevXInRange === 1) {
                    moveTo = true;
                    continue;
                }
                prevXInRange = xInRange;
                var y = yScale.convert(yDatum) + yOffset;
                if (moveTo) {
                    linePath.moveTo(x, y);
                    moveTo = false;
                }
                else {
                    linePath.lineTo(x, y);
                }
                nodeData.push({
                    series: this,
                    seriesDatum: data[i],
                    point: { x: x, y: y }
                });
            }
        }
        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.strokeWidth;
        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;
        lineNode.strokeOpacity = this.strokeOpacity;
        // Used by marker nodes and for hit-testing even when not using markers
        // when `chart.tooltipTracking` is true.
        this.nodeData = nodeData;
    };
    LineSeries.prototype.updateNodeSelection = function () {
        var marker = this.marker;
        var nodeData = marker.shape ? this.nodeData : [];
        var MarkerShape = util_1.getMarker(marker.shape);
        var updateSelection = this.nodeSelection.setData(nodeData);
        updateSelection.exit.remove();
        var enterSelection = updateSelection.enter.append(group_1.Group);
        enterSelection.append(MarkerShape);
        this.nodeSelection = updateSelection.merge(enterSelection);
    };
    LineSeries.prototype.updateNodes = function () {
        if (!this.chart) {
            return;
        }
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        var MarkerShape = util_1.getMarker(marker.shape);
        var highlightedDatum = this.chart.highlightedDatum;
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke;
        var markerFormatter = marker.formatter;
        var markerSize = marker.size;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        this.nodeSelection.selectByClass(MarkerShape)
            .each(function (node, datum) {
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke || stroke;
            var markerFormat = undefined;
            if (markerFormatter) {
                markerFormat = markerFormatter({
                    datum: datum.seriesDatum,
                    xKey: xKey,
                    yKey: yKey,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: highlighted
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
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = marker.enabled && node.size > 0;
        });
    };
    LineSeries.prototype.getNodeData = function () {
        return this.nodeData;
    };
    LineSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: this.yKey
        });
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, color = _b.stroke, tooltip = _b.tooltip;
        var _c = tooltip.renderer, tooltipRenderer = _c === void 0 ? this.tooltipRenderer : _c, tooltipFormat = tooltip.format;
        var datum = nodeDatum.seriesDatum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = typeof xValue === 'number' ? number_1.toFixed(xValue) : String(xValue);
        var yString = typeof yValue === 'number' ? number_1.toFixed(yValue) : String(yValue);
        var title = this.title || yName;
        var content = xString + ': ' + yString;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content
        };
        if (tooltipFormat || tooltipRenderer) {
            var params = {
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                title: title,
                color: color
            };
            if (tooltipFormat) {
                return chart_1.toTooltipHtml({
                    content: string_1.interpolate(tooltipFormat, params)
                }, defaults);
            }
            if (tooltipRenderer) {
                return chart_1.toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return chart_1.toTooltipHtml(defaults);
    };
    LineSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKey = _a.yKey, yName = _a.yName, visible = _a.visible, title = _a.title, marker = _a.marker, stroke = _a.stroke, strokeOpacity = _a.strokeOpacity;
        if (data && data.length && xKey && yKey) {
            legendData.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: 1,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    };
    LineSeries.className = 'LineSeries';
    LineSeries.type = 'line';
    __decorate([
        observable_1.reactive('layoutChange')
    ], LineSeries.prototype, "title", void 0);
    __decorate([
        observable_1.reactive('update')
    ], LineSeries.prototype, "stroke", void 0);
    __decorate([
        observable_1.reactive('update')
    ], LineSeries.prototype, "lineDash", void 0);
    __decorate([
        observable_1.reactive('update')
    ], LineSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        observable_1.reactive('update')
    ], LineSeries.prototype, "strokeWidth", void 0);
    __decorate([
        observable_1.reactive('update')
    ], LineSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        observable_1.reactive('update')
    ], LineSeries.prototype, "xName", void 0);
    __decorate([
        observable_1.reactive('update')
    ], LineSeries.prototype, "yName", void 0);
    return LineSeries;
}(cartesianSeries_1.CartesianSeries));
exports.LineSeries = LineSeries;
//# sourceMappingURL=lineSeries.js.map