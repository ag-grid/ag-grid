import { _, ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
import { Rect } from "../../../../../charts/scene/shape/rect";
import { BandScale } from "../../../../../charts/scale/bandScale";
import linearScale from "../../../../../charts/scale/linearScale";

export class MiniStackedColumn extends MiniChartWithAxes {
    static chartType = ChartType.StackedColumn;
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
        data = MiniStackedColumn.data,
        yScaleDomain = [0, 16],
        tooltipName = "stackedColumnTooltip") {
        super(parent, tooltipName);

        const padding = this.padding;
        const size = this.size;

        const xScale = new BandScale<number>();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;

        const yScale = linearScale();
        yScale.domain = yScaleDomain;
        yScale.range = [size - padding, padding];

        const bottom = yScale.convert(0);
        const width = xScale.bandwidth;

        this.bars = data.map(series =>
            series.map((datum, i) => {
                const top = yScale.convert(datum);
                const rect = new Rect();
                rect.x = xScale.convert(i);
                rect.y = top;
                rect.width = width;
                rect.height = bottom - top;
                rect.strokeWidth = 1;
                rect.crisp = true;

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
