import {_, ChartType} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {Rect} from "../../../../../charts/scene/shape/rect";
import {BandScale} from "../../../../../charts/scale/bandScale";

export  class MiniBar extends MiniChart {
    static chartType = ChartType.GroupedBar;
    private readonly bars: Rect[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "groupedBarTooltip");

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;
        const data = [2, 3, 4];

        const yScale = new BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = linearScale();
        xScale.domain = [0, 4];
        xScale.range = [size - padding, padding];

        const leftAxis = Line.create(padding, padding, padding, size - padding + this.axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - this.axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;
        (this as any).axes = [leftAxis, bottomAxis];

        const rectLineWidth = 1;
        const alignment = Math.floor(rectLineWidth) % 2 / 2;

        const bottom = xScale.convert(0);
        this.bars = data.map((datum, i) => {
            const top = xScale.convert(datum);
            const rect = new Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(padding) + alignment;
            rect.y = Math.floor(yScale.convert(i)) + alignment;
            rect.width = Math.floor(bottom - top + rect.y % 1);
            rect.height = Math.floor(yScale.bandwidth + rect.x % 1);

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
