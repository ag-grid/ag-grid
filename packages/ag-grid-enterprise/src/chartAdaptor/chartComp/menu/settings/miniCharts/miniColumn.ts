import {_, ChartType} from "ag-grid-community";

import {MiniChartWithAxes} from "./miniChartWithAxes";
import {Rect} from "../../../../../charts/scene/shape/rect";
import {BandScale} from "../../../../../charts/scale/bandScale";
import linearScale from "../../../../../charts/scale/linearScale";

export class MiniColumn extends MiniChartWithAxes {
    static chartType = ChartType.GroupedColumn;

    private readonly bars: Rect[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "groupedColumnTooltip");

        const padding = this.padding;
        const size = this.size;
        const data = [2, 3, 4];

        const xScale = new BandScale<number>();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;

        const yScale = linearScale();
        yScale.domain = [0, 4];
        yScale.range = [size - padding, padding];

        const rectLineWidth = 1;
        const alignment = rectLineWidth % 2 / 2;
        const bottom = yScale.convert(0);

        this.bars = data.map((datum, i) => {
            const top = Math.floor(yScale.convert(datum));
            const rect = new Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(xScale.convert(i)) + alignment;
            rect.y = top + alignment;
            rect.width = Math.floor(xScale.bandwidth + alignment);
            rect.height = Math.floor(bottom - top + alignment);

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
