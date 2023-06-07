import { _Scale, _Scene, _Util } from 'ag-charts-community';
import { BarColumnLabelPlacement, BarColumnSparkline } from './barColumnSparkline';
const { isNumber } = _Util;
const { BandScale } = _Scale;
export class BarSparkline extends BarColumnSparkline {
    updateYScaleRange() {
        const { seriesRect, yScale } = this;
        yScale.range = [0, seriesRect.width];
    }
    updateXScaleRange() {
        const { xScale, seriesRect, paddingOuter, paddingInner } = this;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.height];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        }
        else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            const step = this.calculateStep(seriesRect.height);
            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            const padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);
            xScale.range = [padding, seriesRect.height - padding - this.bandWidth];
        }
    }
    updateAxisLine() {
        const { yScale, axis, axisLine, seriesRect } = this;
        const { strokeWidth } = axis;
        axisLine.x1 = 0;
        axisLine.x2 = 0;
        axisLine.y1 = 0;
        axisLine.y2 = seriesRect.height;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
        const yZero = yScale.convert(0);
        axisLine.translationX = yZero;
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
            const y = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum);
            const x = Math.min(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            const bottom = Math.max(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            const height = !continuous ? xScale.bandwidth : this.bandWidth;
            const width = bottom - x;
            const midPoint = {
                x: yZero,
                y: y,
            };
            let labelText;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            }
            else {
                labelText = yDatum !== undefined && isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }
            const labelY = y + height / 2;
            let labelX;
            const labelTextBaseline = 'middle';
            let labelTextAlign;
            const isPositiveY = yDatum !== undefined && yDatum >= 0;
            const labelPadding = 4;
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
                const textSize = _Scene.HdpiCanvas.getTextSize(labelText, labelFontFamily);
                const textWidth = textSize.width || 20;
                const positiveBoundary = yZero + textWidth;
                const negativeBoundary = yZero - textWidth;
                const exceedsBoundaries = (isPositiveY && labelX < positiveBoundary) || (!isPositiveY && labelX > negativeBoundary);
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
    getDistance(p1, p2) {
        return Math.abs(p1.y - p2.y);
    }
}
BarSparkline.className = 'BarSparkline';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyU3BhcmtsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NwYXJrbGluZS9iYXItY29sdW1uL2JhclNwYXJrbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQWlCLE1BQU0sc0JBQXNCLENBQUM7QUFHbEcsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUMzQixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBRzdCLE1BQU0sT0FBTyxZQUFhLFNBQVEsa0JBQWtCO0lBR3RDLGlCQUFpQjtRQUN2QixNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUNwQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRVMsaUJBQWlCO1FBQ3ZCLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDaEUsSUFBSSxNQUFNLFlBQVksU0FBUyxFQUFFO1lBQzdCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1NBQ3RDO2FBQU07WUFDSCw2REFBNkQ7WUFDN0QsK0VBQStFO1lBRS9FLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRW5ELHNGQUFzRjtZQUN0RixNQUFN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