import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";

export class MiniStackedBar extends MiniChartWithAxes {

    static chartType: ChartType = 'stackedBar';
    static data = [
        [8, 12, 16],
        [6, 9, 12],
        [2, 3, 4]
    ];

    private readonly bars: _Scene.Rect[][];

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        data = MiniStackedBar.data,
        xScaleDomain = [0, 16],
        tooltipName = "stackedBarTooltip") {
        super(container, tooltipName);

        const size = this.size;
        const padding = this.padding;

        const yScale = new _Scene.BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = new _Scene.LinearScale();
        xScale.domain = xScaleDomain;
        xScale.range = [size - padding, padding];

        const bottom = xScale.convert(0);
        const height = yScale.bandwidth;

        this.bars = data.map(series =>
            series.map((datum, i) => {
                const rect = new _Scene.Rect();
                rect.x = padding;
                rect.y = yScale.convert(i);
                rect.width = bottom - xScale.convert(datum);
                rect.height = height;
                rect.strokeWidth = 1;
                rect.crisp = true;

                return rect;
            })
        );

        this.updateColors(fills, strokes);
        this.root.append(([] as _Scene.Rect[]).concat.apply([], this.bars));
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
