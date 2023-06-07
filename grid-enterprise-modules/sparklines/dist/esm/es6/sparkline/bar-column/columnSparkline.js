import { _Scale, _Scene, _Util } from 'ag-charts-community';
import { BarColumnLabelPlacement, BarColumnSparkline } from './barColumnSparkline';
const { isNumber } = _Util;
const { BandScale } = _Scale;
export class ColumnSparkline extends BarColumnSparkline {
    updateYScaleRange() {
        const { seriesRect, yScale } = this;
        yScale.range = [seriesRect.height, 0];
    }
    updateXScaleRange() {
        const { xScale, seriesRect, paddingOuter, paddingInner } = this;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.width];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        }
        else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            const step = this.calculateStep(seriesRect.width);
            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            const padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);
            xScale.range = [padding, seriesRect.width - padding - this.bandWidth];
        }
    }
    updateAxisLine() {
        const { yScale, axis, axisLine, seriesRect } = this;
        const { strokeWidth } = axis;
        axisLine.x1 = 0;
        axisLine.x2 = seriesRect.width;
        axisLine.y1 = 0;
        axisLine.y2 = 0;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
        const yZero = yScale.convert(0);
        axisLine.translationY = yZero;
    }
    generateNodeData() {
        const { data, yData, xData, xScale, yScale, fill, stroke, strokeWidth, label } = this;
        if (!data) {
            return;
        }
        const { fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor, formatter: labelFormatter, placement: labelPlacement, } = label;
        const nodeData = [];
        const yZero = yScale.convert(0);
        const continuous = !(xScale instanceof BandScale);
        for (let i = 0, n = yData.length; i < n; i++) {
            let yDatum = yData[i];
            const xDatum = xData[i];
            const invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            const y = Math.min(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum);
            const bottom = Math.max(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            const width = !continuous ? xScale.bandwidth : this.bandWidth;
            const height = bottom - y;
            const midPoint = {
                x: x + width / 2,
                y: yZero,
            };
            let labelText;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            }
            else {
                labelText = yDatum !== undefined && isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }
            const labelX = x + width / 2;
            let labelY;
            const labelTextAlign = 'center';
            let labelTextBaseline;
            const isPositiveY = yDatum !== undefined && yDatum >= 0;
            const labelPadding = 2;
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
                const textSize = _Scene.HdpiCanvas.getTextSize(labelText, labelFontFamily);
                const textHeight = textSize.height || 10;
                const positiveBoundary = yZero - textHeight;
                const negativeBoundary = yZero + textHeight;
                const exceedsBoundaries = (isPositiveY && labelY > positiveBoundary) || (!isPositiveY && labelY < negativeBoundary);
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
                x,
                y,
                width,
                height,
                fill,
                stroke,
                strokeWidth,
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
    }
}
ColumnSparkline.className = 'ColumnSparkline';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uU3BhcmtsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NwYXJrbGluZS9iYXItY29sdW1uL2NvbHVtblNwYXJrbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQWlCLE1BQU0sc0JBQXNCLENBQUM7QUFFbEcsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUMzQixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBRzdCLE1BQU0sT0FBTyxlQUFnQixTQUFRLGtCQUFrQjtJQUd6QyxpQkFBaUI7UUFDdkIsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDcEMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVTLGlCQUFpQjtRQUN2QixNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2hFLElBQUksTUFBTSxZQUFZLFNBQVMsRUFBRTtZQUM3QixNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztZQUNuQyxNQUFNLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztTQUN0QzthQUFNO1lBQ0gsNkRBQTZEO1lBQzdELCtFQUErRTtZQUUvRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsRCxzRkFBc0Y7WUFD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