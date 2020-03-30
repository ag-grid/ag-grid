import {ChartType} from "@ag-grid-community/core";
import {MiniChartWithAxes} from "./miniChartWithAxes";
import { linearScale, BandScale, Rect} from "ag-charts-community";

export class MiniHistogram extends MiniChartWithAxes {
    static chartType = ChartType.Histogram;

    private readonly bars: Rect[];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, "groupedColumnTooltip");

        const padding = this.padding;
        const size = this.size;

        // approx normal curve
        const data = [2,5,11,13,10,6,1];

        const xScale = linearScale();
        xScale.domain = [0, data.length];
        xScale.range = [padding, size - padding];

        const yScale = linearScale();
        yScale.domain = [0, data.reduce((a, b) => Math.max(a,b), 0)];
        yScale.range = [size - padding, padding];

        const bottom = yScale.convert(0);

        this.bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const left = xScale.convert(i);
            const right = xScale.convert(i+1);

            const rect = new Rect();
            rect.x = left;
            rect.y = top;
            rect.width = right - left;
            rect.height = bottom - top;
            rect.strokeWidth = 1;
            rect.crisp = true;

            return rect;
        });

        this.updateColors(fills, strokes);
        this.root.append(this.bars);
    }

    updateColors([fill]: string[], [stroke]: string[]) {
        this.bars.forEach(bar => {
            bar.fill = fill;
            bar.stroke = stroke;
        });
    }
}
