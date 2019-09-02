import {_, ChartType} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {Rect} from "../../../../../charts/scene/shape/rect";
import {BandScale} from "../../../../../charts/scale/bandScale";

export class MiniColumn extends MiniChart {
    static chartType = ChartType.GroupedColumn;
    private readonly bars: Rect[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "groupedColumnTooltip");

        const size = this.size;
        const padding = this.padding;
        const data = [2, 3, 4];

        const xScale = new BandScale<number>();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;

        const yScale = linearScale();
        yScale.domain = [0, 4];
        yScale.range = [size - padding, padding];

        const leftAxis = Line.create(padding, padding, padding, size - padding + this.axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - this.axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;
        (this as any).axes = [leftAxis, bottomAxis];

        const rectLineWidth = 1;
        const alignment = Math.floor(rectLineWidth) % 2 / 2;
        const bottom = yScale.convert(0);

        this.bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const rect = new Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(xScale.convert(i)) + alignment;
            rect.y = Math.floor(top) + alignment;
            rect.width = Math.floor(xScale.bandwidth + rect.x % 1);
            rect.height = Math.floor(bottom - top + rect.y % 1);

            return rect;
        });

        const root = this.root;

        root.append(this.bars);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    }
}
