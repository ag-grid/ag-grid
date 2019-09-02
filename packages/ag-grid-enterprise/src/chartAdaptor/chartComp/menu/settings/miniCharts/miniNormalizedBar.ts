import {_, ChartType} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {Rect} from "../../../../../charts/scene/shape/rect";
import {BandScale} from "../../../../../charts/scale/bandScale";

export class MiniNormalizedBar extends MiniChart {
    static chartType = ChartType.NormalizedBar;
    private readonly bars: Rect[][];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "normalizedBarTooltip");

        const size = this.size;
        const padding = this.padding;

        const data = [
            [10, 10, 10],
            [6, 7, 8],
            [2, 4, 6]
        ];

        const yScale = new BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = linearScale();
        xScale.domain = [0, 10];
        xScale.range = [size - padding, padding];

        const leftAxis = Line.create(padding, padding, padding, size - padding + this.axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - this.axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;

        const rectLineWidth = 1;
        const alignment = Math.floor(rectLineWidth) % 2 / 2;

        const bottom = xScale.convert(0);
        this.bars = data.map(series =>
            series.map((datum, i) => {
                const top = xScale.convert(datum);
                const rect = new Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(padding) + alignment;
                rect.y = Math.floor(yScale.convert(i)) + alignment;
                rect.width = Math.floor(bottom - top + rect.y % 1);
                rect.height = Math.floor(yScale.bandwidth + rect.x % 1);

                return rect;
            })
        );

        const root = this.root;
        root.append(([] as Rect[]).concat.apply([], this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((series, i) =>
            series.forEach(bar => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            })
        );
    }
}
