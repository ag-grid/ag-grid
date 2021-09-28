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
var path_1 = require("../../scene/shape/path");
var line_1 = require("../../scene/shape/line");
var bandScale_1 = require("../../scale/bandScale");
var observable_1 = require("../../util/observable");
var selection_1 = require("../../scene/selection");
var sparkline_1 = require("../sparkline");
var sparklineTooltip_1 = require("../tooltip/sparklineTooltip");
var markerFactory_1 = require("../marker/markerFactory");
var array_1 = require("../../util/array");
var value_1 = require("../../util/value");
var SparklineMarker = /** @class */ (function (_super) {
    __extends(SparklineMarker, _super);
    function SparklineMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.enabled = true;
        _this.shape = 'circle';
        _this.size = 0;
        _this.fill = 'rgb(124, 181, 236)';
        _this.stroke = 'rgb(124, 181, 236)';
        _this.strokeWidth = 1;
        _this.formatter = undefined;
        return _this;
    }
    return SparklineMarker;
}(observable_1.Observable));
var SparklineLine = /** @class */ (function (_super) {
    __extends(SparklineLine, _super);
    function SparklineLine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stroke = 'rgb(124, 181, 236)';
        _this.strokeWidth = 1;
        return _this;
    }
    return SparklineLine;
}(observable_1.Observable));
var AreaSparkline = /** @class */ (function (_super) {
    __extends(AreaSparkline, _super);
    function AreaSparkline() {
        var _this = _super.call(this) || this;
        _this.fill = 'rgba(124, 181, 236, 0.25)';
        _this.areaSparklineGroup = new group_1.Group();
        _this.strokePath = new path_1.Path();
        _this.fillPath = new path_1.Path();
        _this.areaPathData = [];
        _this.xAxisLine = new line_1.Line();
        _this.markers = new group_1.Group();
        _this.markerSelection = selection_1.Selection.select(_this.markers).selectAll();
        _this.markerSelectionData = [];
        _this.marker = new SparklineMarker();
        _this.line = new SparklineLine();
        _this.rootGroup.append(_this.areaSparklineGroup);
        _this.areaSparklineGroup.append([_this.fillPath, _this.xAxisLine, _this.strokePath, _this.markers]);
        return _this;
    }
    AreaSparkline.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    /**
    * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
    */
    AreaSparkline.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    };
    AreaSparkline.prototype.update = function () {
        var data = this.generateNodeData();
        if (!data) {
            return;
        }
        var nodeData = data.nodeData, areaData = data.areaData;
        this.markerSelectionData = nodeData;
        this.areaPathData = areaData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateStroke(nodeData);
        this.updateFill(areaData);
    };
    AreaSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yData = _a.yData, yScale = _a.yScale;
        var yMinMax = array_1.extent(yData, value_1.isNumber);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        if (yData.length > 1) {
            // if yMin is positive, set yMin to 0
            yMin = yMin < 0 ? yMin : 0;
            // if yMax is negative, set yMax to 0
            yMax = yMax < 0 ? 0 : yMax;
            // if yMin and yMax are equal, yMax should be set to 0
            if (yMin === yMax) {
                var padding = Math.abs(yMin * 0.01);
                yMax = 0 + padding;
                yMin -= padding;
            }
        }
        yScale.domain = [yMin, yMax];
    };
    AreaSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale;
        if (!data) {
            return;
        }
        var offsetX = xScale instanceof bandScale_1.BandScale ? xScale.bandwidth / 2 : 0;
        var n = yData.length;
        var nodeData = [];
        var areaData = [];
        for (var i = 0; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var invalidYDatum = yDatum === undefined;
            var invalidXDatum = xDatum === undefined;
            if (invalidYDatum) {
                yDatum = 0;
            }
            if (invalidXDatum) {
                xDatum = 0;
            }
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            nodeData.push({
                seriesDatum: { x: invalidXDatum ? undefined : xDatum, y: invalidYDatum ? undefined : yDatum },
                point: { x: x, y: y }
            });
            areaData.push({
                seriesDatum: { x: invalidXDatum ? undefined : xDatum, y: invalidYDatum ? undefined : yDatum },
                point: { x: x, y: y }
            });
        }
        // phantom points for creating closed area
        var yZero = yScale.convert(0);
        var firstX = xScale.convert(xData[0]) + offsetX;
        var lastX = xScale.convert(xData[n - 1]) + offsetX;
        areaData.push({ seriesDatum: undefined, point: { x: lastX, y: yZero } }, { seriesDatum: undefined, point: { x: firstX, y: yZero } });
        return { nodeData: nodeData, areaData: areaData };
    };
    AreaSparkline.prototype.updateXAxisLine = function () {
        var _a = this, xScale = _a.xScale, yScale = _a.yScale, axis = _a.axis, xAxisLine = _a.xAxisLine;
        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = axis.strokeWidth;
        var yZero = yScale.convert(0);
        xAxisLine.translationY = yZero;
    };
    AreaSparkline.prototype.updateSelection = function (selectionData) {
        var marker = this.marker;
        var shape = markerFactory_1.getMarker(marker.shape);
        var updateMarkerSelection = this.markerSelection.setData(selectionData);
        var enterMarkerSelection = updateMarkerSelection.enter.append(shape);
        updateMarkerSelection.exit.remove();
        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    };
    AreaSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, highlightStyle = _a.highlightStyle, marker = _a.marker;
        var highlightSize = highlightStyle.size, highlightFill = highlightStyle.fill, highlightStroke = highlightStyle.stroke, highlightStrokeWidth = highlightStyle.strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var point = datum.point, seriesDatum = datum.seriesDatum;
            if (!point) {
                return;
            }
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            var markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            var markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            var markerFormat = undefined;
            if (markerFormatter) {
                var first = index === 0;
                var last = index === _this.markerSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                markerFormat = markerFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: highlighted
                });
            }
            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth = markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;
            node.translationX = point.x;
            node.translationY = point.y;
            node.visible = markerFormat && markerFormat.enabled != undefined ? markerFormat.enabled : marker.enabled && node.size > 0;
        });
    };
    AreaSparkline.prototype.updateStroke = function (nodeData) {
        var _a = this, strokePath = _a.strokePath, yData = _a.yData, line = _a.line;
        var path = strokePath.path;
        var n = yData.length;
        path.clear();
        if (yData.length < 2) {
            return;
        }
        for (var i = 0; i < n; i++) {
            var point = nodeData[i].point;
            if (!point) {
                return;
            }
            var x = point.x;
            var y = point.y;
            if (i > 0) {
                path.lineTo(x, y);
            }
            else {
                path.moveTo(x, y);
            }
        }
        strokePath.lineJoin = strokePath.lineCap = 'round';
        strokePath.fill = undefined;
        strokePath.stroke = line.stroke;
        strokePath.strokeWidth = line.strokeWidth;
    };
    AreaSparkline.prototype.updateFill = function (areaData) {
        var _a = this, fillPath = _a.fillPath, yData = _a.yData, fill = _a.fill;
        var path = fillPath.path;
        var n = areaData.length;
        path.clear();
        if (yData.length < 2) {
            return;
        }
        for (var i = 0; i < n; i++) {
            var point = areaData[i].point;
            if (!point) {
                return;
            }
            var x = point.x;
            var y = point.y;
            if (i > 0) {
                path.lineTo(x, y);
            }
            else {
                path.moveTo(x, y);
            }
        }
        path.closePath();
        fillPath.lineJoin = 'round';
        fillPath.stroke = undefined;
        fillPath.fill = fill;
    };
    AreaSparkline.prototype.getTooltipHtml = function (datum) {
        var _a = this, marker = _a.marker, dataType = _a.dataType;
        var seriesDatum = datum.seriesDatum;
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        var backgroundColor = marker.fill;
        var content = this.formatNumericDatum(yValue);
        var title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        var defaults = {
            backgroundColor: backgroundColor,
            content: content,
            title: title
        };
        if (this.tooltip.renderer) {
            return sparklineTooltip_1.toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            }), defaults);
        }
        return sparklineTooltip_1.toTooltipHtml(defaults);
    };
    AreaSparkline.className = 'AreaSparkline';
    return AreaSparkline;
}(sparkline_1.Sparkline));
exports.AreaSparkline = AreaSparkline;
//# sourceMappingURL=areaSparkline.js.map