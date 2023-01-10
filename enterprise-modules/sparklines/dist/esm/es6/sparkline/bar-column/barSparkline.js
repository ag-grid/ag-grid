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
        for (let i = 0, n = yData.length; i < n; i++) {
            let yDatum = yData[i];
            const xDatum = xData[i];
            const invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            const y = xScale.convert(xDatum);
            const x = Math.min(yScale.convert(yDatum), yZero);
            const bottom = Math.max(yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            const height = xScale instanceof BandScale
                ? xScale.bandwidth
                : this.bandWidth;
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
