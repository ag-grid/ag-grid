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
var path_1 = require("../../../scene/shape/path");
var continuousScale_1 = require("../../../scale/continuousScale");
var selection_1 = require("../../../scene/selection");
var group_1 = require("../../../scene/group");
var series_1 = require("../series");
var array_1 = require("../../../util/array");
var node_1 = require("../../../scene/node");
var text_1 = require("../../../scene/shape/text");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var util_1 = require("../../marker/util");
var observable_1 = require("../../../util/observable");
var chart_1 = require("../../chart");
var string_1 = require("../../../util/string");
var label_1 = require("../../label");
var sanitize_1 = require("../../../util/sanitize");
var value_1 = require("../../../util/value");
var LineSeriesLabel = /** @class */ (function (_super) {
    __extends(LineSeriesLabel, _super);
    function LineSeriesLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        observable_1.reactive('change')
    ], LineSeriesLabel.prototype, "formatter", void 0);
    return LineSeriesLabel;
}(label_1.Label));
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
        _this.nodeSelection = selection_1.Selection.select(_this.pickGroup).selectAll();
        _this.nodeData = [];
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.label = new LineSeriesLabel();
        _this.stroke = '#874349';
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.strokeWidth = 2;
        _this.strokeOpacity = 1;
        _this.tooltip = new LineSeriesTooltip();
        _this._xKey = '';
        _this.xName = '';
        _this._yKey = '';
        _this.yName = '';
        var lineNode = _this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = node_1.PointerEvents.None;
        // Make line render before markers in the pick group.
        _this.group.insertBefore(lineNode, _this.pickGroup);
        _this.addEventListener('update', _this.scheduleUpdate);
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        marker.addPropertyListener('shape', _this.onMarkerShapeChange, _this);
        marker.addEventListener('change', _this.scheduleUpdate, _this);
        label.enabled = false;
        label.addEventListener('change', _this.scheduleUpdate, _this);
        return _this;
    }
    LineSeries.prototype.onMarkerShapeChange = function () {
        this.nodeSelection = this.nodeSelection.setData([]);
        this.nodeSelection.exit.remove();
        this.fireEvent({ type: 'legendChange' });
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
        if (!xAxis || !yAxis) {
            return false;
        }
        var isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
        var isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
        xData.length = 0;
        yData.length = 0;
        for (var i = 0, n = data.length; i < n; i++) {
            var datum = data[i];
            var x = datum[xKey];
            var y = datum[yKey];
            var xDatum = this.checkDatum(x, isContinuousX);
            if (isContinuousX && xDatum === undefined) {
                continue;
            }
            else {
                xData.push(xDatum);
            }
            var yDatum = this.checkDatum(y, isContinuousY);
            yData.push(yDatum);
        }
        this.xDomain = isContinuousX ? this.fixNumericExtent(array_1.extent(xData, value_1.isContinuous), 'x', xAxis) : xData;
        this.yDomain = isContinuousY ? this.fixNumericExtent(array_1.extent(yData, value_1.isContinuous), 'y', yAxis) : yData;
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
    LineSeries.prototype.resetHighlight = function () {
        this.lineNode.strokeWidth = this.strokeWidth;
    };
    LineSeries.prototype.update = function () {
        this.updatePending = false;
        this.updateSelections();
        this.updateNodes();
    };
    LineSeries.prototype.updateSelections = function () {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;
        this.updateLinePath(); // this will create node data too
        this.updateNodeSelection();
    };
    LineSeries.prototype.updateLinePath = function () {
        var _a;
        var _b = this, data = _b.data, xAxis = _b.xAxis, yAxis = _b.yAxis;
        if (!data || !xAxis || !yAxis) {
            return;
        }
        var _c = this, xData = _c.xData, yData = _c.yData, lineNode = _c.lineNode, label = _c.label, xKey = _c.xKey, yKey = _c.yKey;
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
            var xyDatums = nextXYDatums || [xData[i], yData[i]];
            if (xyDatums[1] === undefined) {
                prevXInRange = undefined;
                moveTo = true;
            }
            else {
                var _d = __read(xyDatums, 2), xDatum = _d[0], yDatum = _d[1];
                var x = xScale.convert(xDatum) + xOffset;
                if (isNaN(x)) {
                    prevXInRange = undefined;
                    moveTo = true;
                    continue;
                }
                var tolerance = (xScale.bandwidth || (this.marker.size * 0.5 + (this.marker.strokeWidth || 0))) + 1;
                nextXYDatums = yData[i + 1] === undefined ? undefined : [xData[i + 1], yData[i + 1]];
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
                var labelText = void 0;
                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                }
                else {
                    labelText = typeof yDatum === 'number' && isFinite(yDatum) ? yDatum.toFixed(2) : yDatum ? String(yDatum) : '';
                }
                var seriesDatum = (_a = {}, _a[xKey] = xDatum, _a[yKey] = yDatum, _a);
                nodeData.push({
                    series: this,
                    datum: seriesDatum,
                    point: { x: x, y: y },
                    label: labelText ? {
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
        }
        // Used by marker nodes and for hit-testing even when not using markers
        // when `chart.tooltip.tracking` is true.
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
        enterSelection.append(text_1.Text);
        this.nodeSelection = updateSelection.merge(enterSelection);
    };
    LineSeries.prototype.updateNodes = function () {
        this.group.visible = this.visible;
        this.updateLineNode();
        this.updateMarkerNodes();
        this.updateTextNodes();
    };
    LineSeries.prototype.updateLineNode = function () {
        var lineNode = this.lineNode;
        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
        lineNode.strokeOpacity = this.strokeOpacity;
        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;
        lineNode.opacity = this.getOpacity();
    };
    LineSeries.prototype.updateMarkerNodes = function () {
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, lineStroke = _a.stroke, highlightedDatum = _a.chart.highlightedDatum, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        var size = marker.size, formatter = marker.formatter;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        var MarkerShape = util_1.getMarker(marker.shape);
        this.nodeSelection.selectByClass(MarkerShape)
            .each(function (node, datum) {
            var isDatumHighlighted = datum === highlightedDatum;
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
            var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || lineStroke;
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;
            var format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey: xKey,
                    yKey: yKey,
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
            node.opacity = _this.getOpacity(datum);
            node.visible = marker.enabled && node.size > 0;
        });
    };
    LineSeries.prototype.updateTextNodes = function () {
        var _this = this;
        this.nodeSelection.selectByClass(text_1.Text)
            .each(function (text, datum) {
            var point = datum.point, label = datum.label;
            var _a = _this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
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
    LineSeries.prototype.getNodeData = function () {
        return this.nodeData;
    };
    LineSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey
        });
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, tooltip = _b.tooltip, marker = _b.marker;
        var tooltipRenderer = tooltip.renderer, tooltipFormat = tooltip.format;
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var title = sanitize_1.sanitizeHtml(this.title || yName);
        var content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
        var markerFormatter = marker.formatter, fill = marker.fill, stroke = marker.stroke, markerStrokeWidth = marker.strokeWidth, size = marker.size;
        var strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
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
        var color = format && format.fill || fill;
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