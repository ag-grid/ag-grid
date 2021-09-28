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
var line_1 = require("../../scene/shape/line");
var selection_1 = require("../../scene/selection");
var sparkline_1 = require("../sparkline");
var sparklineTooltip_1 = require("../tooltip/sparklineTooltip");
var rectangle_1 = require("./rectangle");
var array_1 = require("../../util/array");
var value_1 = require("../../util/value");
var ColumnSparkline = /** @class */ (function (_super) {
    __extends(ColumnSparkline, _super);
    function ColumnSparkline() {
        var _this = _super.call(this) || this;
        _this.columnSparklineGroup = new group_1.Group();
        _this.xAxisLine = new line_1.Line();
        _this.columns = new group_1.Group();
        _this.columnSelection = selection_1.Selection.select(_this.columns).selectAll();
        _this.columnSelectionData = [];
        _this.fill = 'rgb(124, 181, 236)';
        _this.stroke = 'silver';
        _this.strokeWidth = 0;
        _this.paddingInner = 0.5;
        _this.paddingOuter = 0.2;
        _this.yScaleDomain = undefined;
        _this.formatter = undefined;
        _this.rootGroup.append(_this.columnSparklineGroup);
        _this.columnSparklineGroup.append([_this.columns, _this.xAxisLine]);
        _this.xAxisLine.lineCap = 'round';
        return _this;
    }
    ColumnSparkline.prototype.getNodeData = function () {
        return this.columnSelectionData;
    };
    ColumnSparkline.prototype.update = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.columnSelectionData = nodeData;
        this.updateSelection(nodeData);
        this.updateNodes();
    };
    ColumnSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yScale = _a.yScale, yData = _a.yData, yScaleDomain = _a.yScaleDomain;
        var yMinMax = array_1.extent(yData, value_1.isNumber);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
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
        if (yScaleDomain) {
            if (yScaleDomain[1] < yMax) {
                yScaleDomain[1] = yMax;
            }
            if (yScaleDomain[0] > yMin) {
                yScaleDomain[0] = yMin;
            }
        }
        yScale.domain = yScaleDomain ? yScaleDomain : [yMin, yMax];
    };
    ColumnSparkline.prototype.updateXScaleRange = function () {
        var _a = this, xScale = _a.xScale, seriesRect = _a.seriesRect, paddingOuter = _a.paddingOuter, paddingInner = _a.paddingInner, xData = _a.xData;
        if (xScale instanceof bandScale_1.BandScale) {
            xScale.range = [0, seriesRect.width];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        }
        else {
            // last column will be clipped if the scale is not a band scale
            // subtract maximum possible column width from the range so that the last column is not clipped
            xScale.range = [0, seriesRect.width - (seriesRect.width / xData.length)];
        }
    };
    ColumnSparkline.prototype.updateXAxisLine = function () {
        var _a = this, xScale = _a.xScale, yScale = _a.yScale, axis = _a.axis, xAxisLine = _a.xAxisLine;
        var strokeWidth = axis.strokeWidth;
        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
        var yZero = yScale.convert(0);
        xAxisLine.translationY = yZero;
    };
    ColumnSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        if (!data) {
            return;
        }
        var nodeData = [];
        var yZero = yScale.convert(0);
        // if the scale is a band scale, the width of the columns will be the bandwidth, otherwise the width of the columns will be the range / number of items in the data
        var width = xScale instanceof bandScale_1.BandScale ? xScale.bandwidth : (Math.abs(xScale.range[1] - xScale.range[0]) / xData.length);
        for (var i = 0, n = yData.length; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            var y = Math.min(yScale.convert(yDatum), yZero);
            var yBottom = Math.max(yScale.convert(yDatum), yZero);
            var height = yBottom - y;
            var x = xScale.convert(xDatum);
            var midPoint = {
                x: x + (width / 2),
                y: yZero
            };
            nodeData.push({
                x: x,
                y: y,
                width: width,
                height: height,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                seriesDatum: { x: xDatum, y: invalidDatum ? undefined : yDatum },
                point: midPoint
            });
        }
        return nodeData;
    };
    ColumnSparkline.prototype.updateSelection = function (selectionData) {
        var updateColumnsSelection = this.columnSelection.setData(selectionData);
        var enterColumnsSelection = updateColumnsSelection.enter.append(rectangle_1.Rectangle);
        updateColumnsSelection.exit.remove();
        this.columnSelection = updateColumnsSelection.merge(enterColumnsSelection);
    };
    ColumnSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, columnFormatter = _a.formatter, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth, min = _a.min, max = _a.max;
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke, highlightStrokeWidth = _b.strokeWidth;
        this.columnSelection.each(function (column, datum, index) {
            var highlighted = datum === highlightedDatum;
            var columnFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            var columnStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            var columnStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;
            var columnFormat = undefined;
            var x = datum.x, y = datum.y, width = datum.width, height = datum.height, seriesDatum = datum.seriesDatum;
            if (columnFormatter) {
                var first = index === 0;
                var last = index === _this.columnSelectionData.length - 1;
                var min_1 = seriesDatum.y === _this.min;
                var max_1 = seriesDatum.y === _this.max;
                columnFormat = columnFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min: min_1,
                    max: max_1,
                    first: first,
                    last: last,
                    fill: columnFill,
                    stroke: columnStroke,
                    strokeWidth: columnStrokeWidth,
                    highlighted: highlighted
                });
            }
            column.fill = columnFormat && columnFormat.fill || columnFill;
            column.stroke = columnFormat && columnFormat.stroke || columnStroke;
            column.strokeWidth = columnFormat && columnFormat.strokeWidth || columnStrokeWidth;
            column.x = column.y = 0;
            column.width = width;
            column.height = height;
            column.visible = column.height > 0;
            column.translationX = x;
            column.translationY = y;
            // shifts bars upwards?
            // column.crisp = true;
        });
    };
    ColumnSparkline.prototype.getTooltipHtml = function (datum) {
        var _a = this, fill = _a.fill, dataType = _a.dataType;
        var seriesDatum = datum.seriesDatum;
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        var backgroundColor = fill;
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
    ColumnSparkline.className = 'ColumnSparkline';
    return ColumnSparkline;
}(sparkline_1.Sparkline));
exports.ColumnSparkline = ColumnSparkline;
//# sourceMappingURL=columnSparkline.js.map