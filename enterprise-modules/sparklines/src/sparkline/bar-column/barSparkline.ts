import { BandScale } from '../../scale/bandScale';
import { BarColumnSparkline, RectNodeDatum } from './barColumnSparkline';


export interface BarNodeDatum extends RectNodeDatum {}
export class BarSparkline extends BarColumnSparkline {

    static className = 'BarSparkline';

    protected updateYScaleRange() {
        const { seriesRect, yScale } = this;
        yScale.range = [0, seriesRect.width];
    }

    protected updateXScaleRange() {
        const { xScale, seriesRect, paddingOuter, paddingInner, data } = this;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.height];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        } else {
            // last node will be clipped if the scale is not a band scale
            // subtract maximum possible node width from the range so that the last node is not clipped
            xScale.range = [0, seriesRect.height - (seriesRect.height / data!.length)];
        }
    }

    protected updateAxisLine() {
        const { yScale, axis, axisLine, seriesRect } = this;
        const { strokeWidth } = axis;

        axisLine.x1 = 0;
        axisLine.x2 = 0;
        axisLine.y1 = 0;
        axisLine.y2 = seriesRect.height;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);

        const yZero: number = yScale.convert(0);
        axisLine.translationX = yZero;
    }

    protected generateNodeData(): BarNodeDatum[] | undefined {
        const { data, yData, xData, xScale, yScale, fill, stroke, strokeWidth } = this;

        if (!data) {
            return;
        }

        const nodeData: BarNodeDatum[] = [];

        const yZero = yScale.convert(0);

        for (let i = 0, n = yData.length; i < n; i++) {
            let yDatum = yData[i];
            let xDatum = xData[i];

            let invalidDatum = yDatum === undefined;

            if (invalidDatum) {
                yDatum = 0;
            }

            const y = xScale.convert(xDatum);
            const x = Math.min(yScale.convert(yDatum), yZero);

            const bottom: number = Math.max(yScale.convert(yDatum), yZero);

            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            const height = xScale instanceof BandScale ? xScale.bandwidth : (Math.abs(yScale.range[1] - yScale.range[0]) / data.length);

            const width = bottom - x;

            const midPoint = {
                x: yZero,
                y: y
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
                point: midPoint
            });
        }
        return nodeData;
    }
}