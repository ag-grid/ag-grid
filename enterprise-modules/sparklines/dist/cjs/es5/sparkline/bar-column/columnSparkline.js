"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnSparkline = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var barColumnSparkline_1 = require("./barColumnSparkline");
var isNumber = ag_charts_community_1._Util.isNumber;
var BandScale = ag_charts_community_1._Scale.BandScale;
var ColumnSparkline = /** @class */ (function (_super) {
    __extends(ColumnSparkline, _super);
    function ColumnSparkline() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnSparkline.prototype.updateYScaleRange = function () {
        var _a = this, seriesRect = _a.seriesRect, yScale = _a.yScale;
        yScale.range = [seriesRect.height, 0];
    };
    ColumnSparkline.prototype.updateXScaleRange = function () {
        var _a = this, xScale = _a.xScale, seriesRect = _a.seriesRect, paddingOuter = _a.paddingOuter, paddingInner = _a.paddingInner;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.width];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        }
        else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            var step = this.calculateStep(seriesRect.width);
            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            var padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);
            xScale.range = [padding, seriesRect.width - padding - this.bandWidth];
        }
    };
    ColumnSparkline.prototype.updateAxisLine = function () {
        var _a = this, yScale = _a.yScale, axis = _a.axis, axisLine = _a.axisLine, seriesRect = _a.seriesRect;
        var strokeWidth = axis.strokeWidth;
        axisLine.x1 = 0;
        axisLine.x2 = seriesRect.width;
        axisLine.y1 = 0;
        axisLine.y2 = 0;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
        var yZero = yScale.convert(0);
        axisLine.translationY = yZero;
    };
    ColumnSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth, label = _a.label;
        if (!data) {
            return;
        }
        var labelFontStyle = label.fontStyle, labelFontWeight = label.fontWeight, labelFontSize = label.fontSize, labelFontFamily = label.fontFamily, labelColor = label.color, labelFormatter = label.formatter, labelPlacement = label.placement;
        var nodeData = [];
        var yZero = yScale.convert(0);
        for (var i = 0, n = yData.length; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            var y = Math.min(yScale.convert(yDatum), yZero);
            var x = xScale.convert(xDatum);
            var bottom = Math.max(yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            var width = xScale instanceof BandScale
                ? xScale.bandwidth
                : this.bandWidth;
            var height = bottom - y;
            var midPoint = {
                x: x + width / 2,
                y: yZero,
            };
            var labelText = void 0;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            }
            else {
                labelText = yDatum !== undefined && isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }
            var labelX = x + width / 2;
            var labelY = void 0;
            var labelTextAlign = 'center';
            var labelTextBaseline = void 0;
            var isPositiveY = yDatum !== undefined && yDatum >= 0;
            var labelPadding = 2;
            if (labelPlacement === barColumnSparkline_1.BarColumnLabelPlacement.Center) {
                labelY = y + height / 2;
                labelTextBaseline = 'middle';
            }
            else if (labelPlacement === barColumnSparkline_1.BarColumnLabelPlacement.OutsideEnd) {
                labelY = y + (isPositiveY ? -labelPadding : height + labelPadding);
                labelTextBaseline = isPositiveY ? 'bottom' : 'top';
            }
            else if (labelPlacement === barColumnSparkline_1.BarColumnLabelPlacement.InsideEnd) {
                labelY = y + (isPositiveY ? labelPadding : height - labelPadding);
                labelTextBaseline = isPositiveY ? 'top' : 'bottom';
                var textSize = ag_charts_community_1._Scene.HdpiCanvas.getTextSize(labelText, labelFontFamily);
                var textHeight = textSize.height || 10;
                var positiveBoundary = yZero - textHeight;
                var negativeBoundary = yZero + textHeight;
                var exceedsBoundaries = (isPositiveY && labelY > positiveBoundary) || (!isPositiveY && labelY < negativeBoundary);
                if (exceedsBoundaries) {
                    // if labelY exceeds the y boundary, labels should be positioned at the insideBase
                    labelY = yZero + labelPadding * (isPositiveY ? -1 : 1);
                    labelTextBaseline = isPositiveY ? 'bottom' : 'top';
                }
            }
            else {
                // if labelPlacement === BarColumnLabelPlacement.InsideBase
                labelY = yZero + labelPadding * (isPositiveY ? -1 : 1);
                labelTextBaseline = isPositiveY ? 'bottom' : 'top';
            }
            nodeData.push({
                x: x,
                y: y,
                width: width,
                height: height,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                seriesDatum: { x: xDatum, y: invalidDatum ? undefined : yDatum },
                point: midPoint,
                label: {
                    x: labelX,
                    y: labelY,
                    text: labelText,
                    fontStyle: labelFontStyle,
                    fontWeight: labelFontWeight,
                    fontSize: labelFontSize,
                    fontFamily: labelFontFamily,
                    textAlign: labelTextAlign,
                    textBaseline: labelTextBaseline,
                    fill: labelColor,
                },
            });
        }
        return nodeData;
    };
    ColumnSparkline.className = 'ColumnSparkline';
    return ColumnSparkline;
}(barColumnSparkline_1.BarColumnSparkline));
exports.ColumnSparkline = ColumnSparkline;
