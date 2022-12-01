import { _Scene } from 'ag-charts-community';
import { BandScale } from '../../scale/bandScale';
import { isNumber } from '../../util/value';
import { BarColumnLabelPlacement, BarColumnSparkline, RectNodeDatum } from './barColumnSparkline';

interface ColumnNodeDatum extends RectNodeDatum { }
export class ColumnSparkline extends BarColumnSparkline {
    static className = 'ColumnSparkline';

    protected updateYScaleRange() {
        const { seriesRect, yScale } = this;
        yScale.range = [seriesRect.height, 0];
    }

    protected updateXScaleRange() {
        const { xScale, seriesRect, paddingOuter, paddingInner } = this;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.width];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        } else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped

            const step = this.calculateStep(seriesRect.width);

            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            const padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);

            xScale.range = [padding, seriesRect.width - padding - this.bandWidth];
        }
    }

    protected updateAxisLine() {
        const { yScale, axis, axisLine, seriesRect } = this;
        const { strokeWidth } = axis;

        axisLine.x1 = 0;
        axisLine.x2 = seriesRect.width;
        axisLine.y1 = 0;
        axisLine.y2 = 0;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);

        const yZero: number = yScale.convert(0);
        axisLine.translationY = yZero;
    }

    protected generateNodeData(): ColumnNodeDatum[] | undefined {
        const { data, yData, xData, xScale, yScale, fill, stroke, strokeWidth, label } = this;

        if (!data) {
            return;
        }

        const {
            fontStyle: labelFontStyle,
            fontWeight: labelFontWeight,
            fontSize: labelFontSize,
            fontFamily: labelFontFamily,
            color: labelColor,
            formatter: labelFormatter,
            placement: labelPlacement,
        } = label;

        const nodeData: ColumnNodeDatum[] = [];

        const yZero = yScale.convert(0);

        for (let i = 0, n = yData.length; i < n; i++) {
            let yDatum = yData[i];
            const xDatum = xData[i];
            const invalidDatum = yDatum === undefined;

            if (invalidDatum) {
                yDatum = 0;
            }

            const y = Math.min(yScale.convert(yDatum), yZero);
            const x = xScale.convert(xDatum);

            const bottom: number = Math.max(yScale.convert(yDatum), yZero);

            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            const width =
                xScale instanceof BandScale
                    ? xScale.bandwidth
                    : this.bandWidth;

            const height = bottom - y;

            const midPoint = {
                x: x + width / 2,
                y: yZero,
            };

            let labelText: string;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            } else {
                labelText = yDatum !== undefined && isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }

            const labelX: number = x + width / 2;
            let labelY: number;

            const labelTextAlign: CanvasTextAlign = 'center';
            let labelTextBaseline: CanvasTextBaseline;

            const isPositiveY = yDatum !== undefined && yDatum >= 0;
            const labelPadding = 2;

            if (labelPlacement === BarColumnLabelPlacement.Center) {
                labelY = y + height / 2;
                labelTextBaseline = 'middle';
            } else if (labelPlacement === BarColumnLabelPlacement.OutsideEnd) {
                labelY = y + (isPositiveY ? -labelPadding : height + labelPadding);
                labelTextBaseline = isPositiveY ? 'bottom' : 'top';
            } else if (labelPlacement === BarColumnLabelPlacement.InsideEnd) {
                labelY = y + (isPositiveY ? labelPadding : height - labelPadding);
                labelTextBaseline = isPositiveY ? 'top' : 'bottom';

                const textSize = _Scene.HdpiCanvas.getTextSize(labelText, labelFontFamily);
                const textHeight = textSize.height || 10;
                const positiveBoundary = yZero - textHeight;
                const negativeBoundary = yZero + textHeight;
                const exceedsBoundaries =
                    (isPositiveY && labelY > positiveBoundary) || (!isPositiveY && labelY < negativeBoundary);

                if (exceedsBoundaries) {
                    // if labelY exceeds the y boundary, labels should be positioned at the insideBase
                    labelY = yZero + labelPadding * (isPositiveY ? -1 : 1);
                    labelTextBaseline = isPositiveY ? 'bottom' : 'top';
                }
            } else {
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