import {_, ChartType} from "ag-grid-community";

import {MiniChartWithAxes} from "./miniChartWithAxes";
import {Rect} from "../../../../../charts/scene/shape/rect";
import linearScale from "../../../../../charts/scale/linearScale";
import {BandScale} from "../../../../../charts/scale/bandScale";

export class MiniStackedBar extends MiniChartWithAxes {
    static chartType = ChartType.StackedBar;
    static data = [
        [8, 12, 16],
        [6, 9, 12],
        [2, 3, 4]
    ];

    private readonly bars: Rect[][];

    constructor(
        parent: HTMLElement, 
        fills: string[], 
        strokes: string[],
        data = MiniStackedBar.data,
        xScaleDomain = [0, 16], 
        tooltipName = "stackedBarTooltip") {
        super(parent, tooltipName);

        const size = this.size;
        const padding = this.padding;

        const yScale = new BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = linearScale();
        xScale.domain = xScaleDomain;
        xScale.range = [size - padding, padding];

        const rectLineWidth = 1;
        const alignment = rectLineWidth % 2 / 2;
        const bottom = xScale.convert(0);

        this.bars = data.map(series => 
            series.map((datum, i) => {
                const top = xScale.convert(datum);
                const rect = new Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(padding) + alignment;
                rect.y = Math.floor(yScale.convert(i)) + alignment;
                rect.width = Math.floor(bottom - top + alignment);
                rect.height = Math.floor(yScale.bandwidth + alignment);
                
                return rect;
            })
        );

        this.updateColors(fills, strokes);
        this.root.append(([] as Rect[]).concat.apply([], this.bars));
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
