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
        var continuous = !(xScale instanceof BandScale);
        for (var i = 0, n = yData.length; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            var y = Math.min(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            var x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum);
            var bottom = Math.max(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            var width = !continuous ? xScale.bandwidth : this.bandWidth;
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
            if (labelPlacement === BarColumnLabelPlacement.Center) {
                labelY = y + height / 2;
                labelTextBaseline = 'middle';
            }
            else if (labelPlacement === BarColumnLabelPlacement.OutsideEnd) {
                labelY = y + (isPositiveY ? -labelPadding : height + labelPadding);
                labelTextBaseline = isPositiveY ? 'bottom' : 'top';
            }
            else if (labelPlacement === BarColumnLabelPlacement.InsideEnd) {
                labelY = y + (isPositiveY ? labelPadding : height - labelPadding);
                labelTextBaseline = isPositiveY ? 'top' : 'bottom';
                var textSize = _Scene.HdpiCanvas.getTextSize(labelText, labelFontFamily);
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
}(BarColumnSparkline));
export { ColumnSparkline };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uU3BhcmtsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NwYXJrbGluZS9iYXItY29sdW1uL2NvbHVtblNwYXJrbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQWlCLE1BQU0sc0JBQXNCLENBQUM7QUFFMUYsSUFBQSxRQUFRLEdBQUssS0FBSyxTQUFWLENBQVc7QUFDbkIsSUFBQSxTQUFTLEdBQUssTUFBTSxVQUFYLENBQVk7QUFHN0I7SUFBcUMsbUNBQWtCO0lBQXZEOztJQStKQSxDQUFDO0lBNUphLDJDQUFpQixHQUEzQjtRQUNVLElBQUEsS0FBeUIsSUFBSSxFQUEzQixVQUFVLGdCQUFBLEVBQUUsTUFBTSxZQUFTLENBQUM7UUFDcEMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVTLDJDQUFpQixHQUEzQjtRQUNVLElBQUEsS0FBcUQsSUFBSSxFQUF2RCxNQUFNLFlBQUEsRUFBRSxVQUFVLGdCQUFBLEVBQUUsWUFBWSxrQkFBQSxFQUFFLFlBQVksa0JBQVMsQ0FBQztRQUNoRSxJQUFJLE1BQU0sWUFBWSxTQUFTLEVBQUU7WUFDN0IsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFDbkMsTUFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7U0FDdEM7YUFBTTtZQUNILDZEQUE2RDtZQUM3RCwrRUFBK0U7WUFFL0UsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEs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