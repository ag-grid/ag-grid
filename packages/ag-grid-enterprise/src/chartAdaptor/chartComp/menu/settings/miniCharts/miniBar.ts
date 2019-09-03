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

        const bottom = xScale.convert(0);
        const height = yScale.bandwidth;

        this.bars = data.map((datum, i) => {
            const rect = Rect.create(padding, yScale.convert(i), bottom - xScale.convert(datum), height);
            rect.strokeWidth = 1;
            rect.crisp = true;

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
