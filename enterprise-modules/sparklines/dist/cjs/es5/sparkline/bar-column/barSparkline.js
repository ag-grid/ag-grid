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
var value_1 = require("../../util/value");
var barColumnSparkline_1 = require("./barColumnSparkline");
var hdpiCanvas_1 = require("../../canvas/hdpiCanvas");
var BarSparkline = /** @class */ (function (_super) {
    __extends(BarSparkline, _super);
    function BarSparkline() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BarSparkline.prototype.updateYScaleRange = function () {
        var _a = this, seriesRect = _a.seriesRect, yScale = _a.yScale;
        yScale.range = [0, seriesRect.width];
    };
    BarSparkline.prototype.updateXScaleRange = function () {
        var _a = this, xScale = _a.xScale, seriesRect = _a.seriesRect, paddingOuter = _a.paddingOuter, paddingInner = _a.paddingInner;
        if (xScale instanceof bandScale_1.BandScale) {
            xScale.range = [0, seriesRect.height];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        }
        else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            var step = this.calculateStep(seriesRect.height);
            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            var padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);
            xScale.range = [padding, seriesRect.height - padding - this.bandWidth];
        }
    };
    BarSparkline.prototype.updateAxisLine = function () {
        var _a = this, yScale = _a.yScale, axis = _a.axis, axisLine = _a.axisLine, seriesRect = _a.seriesRect;
        var strokeWidth = axis.strokeWidth;
        axisLine.x1 = 0;
        axisLine.x2 = 0;
        axisLine.y1 = 0;
        axisLine.y2 = seriesRect.height;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
        var yZero = yScale.convert(0);
        axisLine.translationX = yZero;
    };
    BarSparkline.prototype.generateNodeData = function () {
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
            var y = xScale.convert(xDatum);
            var x = Math.min(yScale.convert(yDatum), yZero);
            var bottom = Math.max(yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            var height = xScale instanceof bandScale_1.BandScale
                ? xScale.bandwidth
                : this.bandWidth;
            var width = bottom - x;
            var midPoint = {
                x: yZero,
                y: y,
            };
            var labelText = void 0;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            }
            else {
                labelText = yDatum !== undefined && value_1.isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }
            var labelY = y + height / 2;
            var labelX = void 0;
            var labelTextBaseline = 'middle';
            var labelTextAlign = void 0;
            var isPositiveY = yDatum !== undefined && yDatum >= 0;
            var labelPadding = 4;
            if (labelPlacement === barColumnSparkline_1.BarColumnLabelPlacement.Center) {
                labelX = x + width / 2;
                labelTextAlign = 'center';
            }
            else if (labelPlacement === barColumnSparkline_1.BarColumnLabelPlacement.OutsideEnd) {
                labelX = x + (isPositiveY ? width + labelPadding : -labelPadding);
                labelTextAlign = isPositiveY ? 'start' : 'end';
            }
            else if (labelPlacement === barColumnSparkline_1.BarColumnLabelPlacement.InsideEnd) {
                labelX = x + (isPositiveY ? width - labelPadding : labelPadding);
                labelTextAlign = isPositiveY ? 'end' : 'start';
                var textSize = hdpiCanvas_1.HdpiCanvas.getTextSize(labelText, labelFontFamily);
                var textWidth = textSize.width || 20;
                var positiveBoundary = yZero + textWidth;
                var negativeBoundary = yZero - textWidth;
                var exceedsBoundaries = (isPositiveY && labelX < positiveBoundary) || (!isPositiveY && labelX > negativeBoundary);
                if (exceedsBoundaries) {
                    // if labelX exceeds the boundary, labels should be positioned at `insideBase`.
                    labelX = yZero + labelPadding * (isPositiveY ? 1 : -1);
                    labelTextAlign = isPositiveY ? 'start' : 'end';
                }
            }
            else {
                // if labelPlacement === BarColumnLabelPlacement.InsideBase
                labelX = yZero + labelPadding * (isPositiveY ? 1 : -1);
                labelTextAlign = isPositiveY ? 'start' : 'end';
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
    BarSparkline.prototype.getDistance = function (p1, p2) {
        return Math.abs(p1.y - p2.y);
    };
    BarSparkline.className = 'BarSparkline';
    return BarSparkline;
}(barColumnSparkline_1.BarColumnSparkline));
exports.BarSparkline = BarSparkline;
