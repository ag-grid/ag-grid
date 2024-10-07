import { ChartWrapper } from '../../charts/chartWrapper';
import type { Point } from '../sparkline';
import type { RectNodeDatum } from './barColumnSparkline';
import { BarColumnLabelPlacement, BarColumnSparkline } from './barColumnSparkline';

interface BarNodeDatum extends RectNodeDatum {}
export class BarSparkline extends BarColumnSparkline {
    protected updateYScaleRange() {
        const { seriesRect, yScale } = this;
        yScale.range = [0, seriesRect.width];
    }

    protected updateXScaleRange() {
        const { xScale, seriesRect, paddingOuter, paddingInner } = this;
        if (xScale instanceof ChartWrapper._Scale.BandScale) {
            xScale.range = [0, seriesRect.height];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        } else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped

            const step = this.calculateStep(seriesRect.height);

            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            const padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);

            xScale.range = [padding, seriesRect.height - padding - this.bandWidth];
        }
    }

    protected override updateAxisLine() {
        const {
            yScale,
            axis: { stroke, strokeWidth },
            axisLine,
            seriesRect,
        } = this;
        const yZero: number = yScale.convert(0);

        axisLine.x1 = axisLine.x2 = yZero;
        axisLine.y1 = 0;
        axisLine.y2 = seriesRect.height;
        axisLine.stroke = stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
    }

    protected generateNodeData(): BarNodeDatum[] | undefined {
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

        const nodeData: BarNodeDatum[] = [];

        const yZero = yScale.convert(0);
        const continuous = !(xScale instanceof ChartWrapper._Scale.BandScale);

        for (let i = 0, n = yData.length; i < n; i++) {
            let yDatum = yData[i];
            const xDatum = xData[i];
            const invalidDatum = yDatum === undefined;

            if (invalidDatum) {
                yDatum = 0;
            }

            const y = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum);
            const x = Math.min(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);

            const bottom: number = Math.max(yDatum === undefined ? NaN : yScale.convert(yDatum), yZero);

            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            const height = !continuous ? xScale.bandwidth : this.bandWidth;

            const width = bottom - x;

            const midPoint = {
                x: yZero,
                y: y,
            };

            let labelText: string;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            } else {
                labelText =
                    yDatum !== undefined && ChartWrapper._Util.isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }

            const labelY: number = y + height / 2;
            let labelX: number;

            const labelTextBaseline: CanvasTextBaseline = 'middle';
            let labelTextAlign: CanvasTextAlign;

            const isPositiveY = yDatum !== undefined && yDatum >= 0;
            const labelPadding = 4;

            if (labelPlacement === BarColumnLabelPlacement.Center) {
                labelX = x + width / 2;
                labelTextAlign = 'center';
            } else if (labelPlacement === BarColumnLabelPlacement.OutsideEnd) {
                labelX = x + (isPositiveY ? width + labelPadding : -labelPadding);
                labelTextAlign = isPositiveY ? 'start' : 'end';
            } else if (labelPlacement === BarColumnLabelPlacement.InsideEnd) {
                labelX = x + (isPositiveY ? width - labelPadding : labelPadding);
                labelTextAlign = isPositiveY ? 'end' : 'start';

                const textSize = ChartWrapper._ModuleSupport.CachedTextMeasurerPool.measureText(labelText, {
                    font: labelFontFamily,
                });
                const textWidth = textSize.width || 20;
                const positiveBoundary = yZero + textWidth;
                const negativeBoundary = yZero - textWidth;
                const exceedsBoundaries =
                    (isPositiveY && labelX < positiveBoundary) || (!isPositiveY && labelX > negativeBoundary);

                if (exceedsBoundaries) {
                    // if labelX exceeds the boundary, labels should be positioned at `insideBase`.
                    labelX = yZero + labelPadding * (isPositiveY ? 1 : -1);
                    labelTextAlign = isPositiveY ? 'start' : 'end';
                }
            } else {
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

    protected override getDistance(p1: Point, p2: Point): number {
        return Math.abs(p1.y - p2.y);
    }
}
