import {_, ChartType} from "@ag-grid-community/core";

import {MiniChartWithAxes} from "./miniChartWithAxes";
import {ICoordinate} from "./miniArea";
import {Path} from "../../../../../charts/scene/shape/path";
import linearScale from "../../../../../charts/scale/linearScale";
import {BandScale} from "../../../../../charts/scale/bandScale";

export class MiniStackedArea extends MiniChartWithAxes {
    static chartType = ChartType.StackedArea;
    static readonly data = [
        [2, 3, 2],
        [3, 6, 5],
        [6, 2, 2]
    ];

    private readonly areas: Path[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[], data: number[][] = MiniStackedArea.data, tooltipName = "stackedAreaTooltip") {
        super(parent, tooltipName);

        const size = this.size;
        const padding = this.padding;

        const xScale = new BandScale<number>();
        xScale.domain = [0, 1, 2];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.range = [padding + 0.5, size - padding - 0.5];

        const yScale = linearScale();
        yScale.domain = [0, 16];
        yScale.range = [size - padding + 0.5, padding + 0.5];

        const xCount = data.length;
        const last = xCount * 2 - 1;
        const pathData: ICoordinate[][] = [];

        data.forEach((datum, i) => {
            const x = xScale.convert(i);
            let total = 0;

            datum.forEach((yDatum, j) => {
                const y = yScale.convert(total + yDatum);
                const points = pathData[j] || (pathData[j] = []);

                points[i] = {
                    x,
                    y
                };

                points[last - i] = {
                    x,
                    y: yScale.convert(total) // bottom y
                };

                total += yDatum;
            });
        });

        this.areas = pathData.map(points => {
            const area = new Path();
            area.strokeWidth = 1;

            const path = area.path;
            path.clear();
            points.forEach((point, i) => path[i > 0 ? "lineTo" : "moveTo"](point.x, point.y));
            path.closePath();

            return area;
        });

        this.updateColors(fills, strokes);
        this.root.append(this.areas);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
