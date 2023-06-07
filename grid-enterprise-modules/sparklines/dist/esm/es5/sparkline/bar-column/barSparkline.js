var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { _Scale, _Scene, _Util } from 'ag-charts-community';
import { BarColumnLabelPlacement, BarColumnSparkline } from './barColumnSparkline';
var isNumber = _Util.isNumber;
var BandScale = _Scale.BandScale;
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
        if (xScale instanceof BandScale) {
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
        var continuous = !(xScale instanceof BandScale);
        for (var i = 0, n = yData.length; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            var y = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum);
            var x = Math.min(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            var bottom = Math.max(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            var height = !continuous ? xScale.bandwidth : this.bandWidth;
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
                labelText = yDatum !== undefined && isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }
            var labelY = y + height / 2;
            var labelX = void 0;
            var labelTextBaseline = 'middle';
            var labelTextAlign = void 0;
            var isPositiveY = yDatum !== undefined && yDatum >= 0;
            var labelPadding = 4;
            if (labelPlacement === BarColumnLabelPlacement.Center) {
                labelX = x + width / 2;
                labelTextAlign = 'center';
            }
            else if (labelPlacement === BarColumnLabelPlacement.OutsideEnd) {
                labelX = x + (isPositiveY ? width + labelPadding : -labelPadding);
                labelTextAlign = isPositiveY ? 'start' : 'end';
            }
            else if (labelPlacement === BarColumnLabelPlacement.InsideEnd) {
                labelX = x + (isPositiveY ? width - labelPadding : labelPadding);
                labelTextAlign = isPositiveY ? 'end' : 'start';
                var textSize = _Scene.HdpiCanvas.getTextSize(labelText, labelFontFamily);
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
}(BarColumnSparkline));
export { BarSparkline };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyU3BhcmtsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NwYXJrbGluZS9iYXItY29sdW1uL2JhclNwYXJrbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQWlCLE1BQU0sc0JBQXNCLENBQUM7QUFHMUYsSUFBQSxRQUFRLEdBQUssS0FBSyxTQUFWLENBQVc7QUFDbkIsSUFBQSxTQUFTLEdBQUssTUFBTSxVQUFYLENBQVk7QUFHN0I7SUFBa0MsZ0NBQWtCO0lBQXBEOztJQW1LQSxDQUFDO0lBaEthLHdDQUFpQixHQUEzQjtRQUNVLElBQUEsS0FBeUIsSUFBSSxFQUEzQixVQUFVLGdCQUFBLEVBQUUsTUFBTSxZQUFTLENBQUM7UUFDcEMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVTLHdDQUFpQixHQUEzQjtRQUNVLElBQUEsS0FBcUQsSUFBSSxFQUF2RCxNQUFNLFlBQUEsRUFBRSxVQUFVLGdCQUFBLEVBQUUsWUFBWSxrQkFBQSxFQUFFLFlBQVksa0JBQVMsQ0FBQztRQUNoRSxJQUFJLE1BQU0sWUFBWSxTQUFTLEVBQUU7WUFDN0IsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFDbkMsTUFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7U0FDdEM7YUFBTTtZQUNILDZEQUE2RDtZQUM3RCwrRUFBK0U7WUFFL0UsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxV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