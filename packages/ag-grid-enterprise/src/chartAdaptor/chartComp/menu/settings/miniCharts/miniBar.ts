import {_, ChartType} from "ag-grid-community";

import {MiniChartWithAxes} from "./miniChartWithAxes";
import {Rect} from "../../../../../charts/scene/shape/rect";
import linearScale from "../../../../../charts/scale/linearScale";
import {BandScale} from "../../../../../charts/scale/bandScale";

export  class MiniBar extends MiniChartWithAxes {
    static chartType = ChartType.GroupedBar;
    private readonly bars: Rect[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "groupedBarTooltip");

        const padding = this.padding;
        const size = this.size;
        const data = [2, 3, 4];

        const yScale = new BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = linearScale();
        xScale.domain = [0, 4];
        xScale.range = [size - padding, padding];

        const rectLineWidth = 1;
        const alignment = rectLineWidth % 2 / 2;
        const bottom = xScale.convert(0);

        this.bars = data.map((datum, i) => {
            const top = xScale.convert(datum);
            const rect = new Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(padding) + alignment;
            rect.y = Math.floor(yScale.convert(i)) + alignment;
            rect.width = Math.floor(bottom - top + alignment);
            rect.height = Math.floor(yScale.bandwidth + alignment);

            return rect;
        });

        this.updateColors(fills, strokes);
        this.root.append(this.bars);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    }
}
