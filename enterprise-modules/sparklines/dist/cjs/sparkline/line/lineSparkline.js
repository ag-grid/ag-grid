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
var bandScale_1 = require("../../scale/bandScale");
var group_1 = require("../../scene/group");
var path_1 = require("../../scene/shape/path");
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
var LineSparkline = /** @class */ (function (_super) {
    __extends(LineSparkline, _super);
    function LineSparkline() {
        var _this = _super.call(this) || this;
        _this.lineSparklineGroup = new group_1.Group();
        _this.linePath = new path_1.Path();
        _this.markers = new group_1.Group();
        _this.markerSelection = selection_1.Selection.select(_this.markers).selectAll();
        _this.markerSelectionData = [];
        _this.marker = new SparklineMarker();
        _this.line = new SparklineLine();
        _this.rootGroup.append(_this.lineSparklineGroup);
        _this.lineSparklineGroup.append([_this.linePath, _this.markers]);
        return _this;
    }
    LineSparkline.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    LineSparkline.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    };
    LineSparkline.prototype.update = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.markerSelectionData = nodeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateLine();
    };
    LineSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yData = _a.yData, yScale = _a.yScale;
        var yMinMax = array_1.extent(yData, value_1.isNumber);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        if (yMin === yMax) {
            // if all values in the data are the same, yMin and yMax will be equal, need to adjust the domain with some padding
            var padding = Math.abs(yMin * 0.01);
            yMin -= padding;
            yMax += padding;
        }
        yScale.domain = [yMin, yMax];
    };
    LineSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale;
        if (!data) {
            return;
        }
        var offsetX = xScale instanceof bandScale_1.BandScale ? xScale.bandwidth / 2 : 0;
        var nodeData = [];
        for (var i = 0; i < yData.length; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            if (yDatum == undefined || xDatum == undefined) {
                continue;
            }
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            nodeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x: x, y: y }
            });
        }
        return nodeData;
    };
    LineSparkline.prototype.updateSelection = function (selectionData) {
        var marker = this.marker;
        var shape = markerFactory_1.getMarker(marker.shape);
        var updateMarkerSelection = this.markerSelection.setData(selectionData);
        var enterMarkerSelection = updateMarkerSelection.enter.append(shape);
        updateMarkerSelection.exit.remove();
        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    };
    LineSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, highlightStyle = _a.highlightStyle, marker = _a.marker, min = _a.min, max = _a.max;
        var highlightSize = highlightStyle.size, highlightFill = highlightStyle.fill, highlightStroke = highlightStyle.stroke, highlightStrokeWidth = highlightStyle.strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            var markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            var markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            var markerFormat = undefined;
            var seriesDatum = datum.seriesDatum, point = datum.point;
            if (markerFormatter) {
                var first = index === 0;
                var last = index === _this.markerSelectionData.length - 1;
                var min_1 = seriesDatum.y === _this.min;
                var max_1 = seriesDatum.y === _this.max;
                markerFormat = markerFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min: min_1,
                    max: max_1,
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
    LineSparkline.prototype.updateLine = function () {
        var _a = this, linePath = _a.linePath, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, line = _a.line;
        if (yData.length < 2) {
            return;
        }
        var path = linePath.path;
        var n = yData.length;
        var offsetX = xScale instanceof bandScale_1.BandScale ? xScale.bandwidth / 2 : 0;
        var moveTo = true;
        path.clear();
        for (var i = 0; i < n; i++) {
            var xDatum = xData[i];
            var yDatum = yData[i];
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            if (yDatum == undefined) {
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
        linePath.fill = undefined;
        linePath.stroke = line.stroke;
        linePath.strokeWidth = line.strokeWidth;
    };
    LineSparkline.prototype.getTooltipHtml = function (datum) {
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
    LineSparkline.className = 'LineSparkline';
    return LineSparkline;
}(sparkline_1.Sparkline));
exports.LineSparkline = LineSparkline;
//# sourceMappingURL=lineSparkline.js.map