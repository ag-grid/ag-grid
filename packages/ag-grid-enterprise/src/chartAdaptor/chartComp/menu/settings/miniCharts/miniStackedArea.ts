import {_, ChartType} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import {ICoordinate} from "./miniArea";
import {Path} from "../../../../../charts/scene/shape/path";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {BandScale} from "../../../../../charts/scale/bandScale";

export class MiniStackedArea extends MiniChart {
    static chartType = ChartType.StackedArea;
    private readonly areas: Path[];

    static readonly data = [
        [2, 3, 2],
        [3, 6, 5],
        [6, 2, 2]
    ];

    constructor(parent: HTMLElement, fills: string[], strokes: string[], data: number[][] = MiniStackedArea.data) {
        super(parent, "stackedAreaTooltip");

        const size = this.size;
        const padding = this.padding;

        const xScale = new BandScale<number>();
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.domain = [0, 1, 2];
        xScale.range = [padding + 0.5, size - padding - 0.5];

        const yScale = linearScale();
        yScale.domain = [0, 16];
        yScale.range = [size - padding + 0.5, padding + 0.5];

        const leftAxis = Line.create(padding, padding, padding, size - padding + this.axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - this.axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;

        const xCount = data.length;
        const last = xCount * 2 - 1;
        const pathData: ICoordinate[][] = [];

        for (let i = 0; i < xCount; i++) {
            const yDatum = data[i];
            const yCount = yDatum.length;
            const x = xScale.convert(i);
            let prev = 0;

            for (let j = 0; j < yCount; j++) {
                const curr = yDatum[j];
                const y = yScale.convert(prev + curr);
                const points = pathData[j] || (pathData[j] = []);

                points[i] = {
                    x,
                    y
                };

                points[last - i] = {
                    x,
                    y: yScale.convert(prev) // bottom y
                };

                prev += curr;
            }
        }

        this.areas = pathData.map(points => {
            const area = new Path();
            area.strokeWidth = 1;
            const path = area.path;
            path.clear();

            points.forEach((point, i) => {
                if (!i) {
                    path.moveTo(point.x, point.y);
                } else {
                    path.lineTo(point.x, point.y);
                }
            });

            path.closePath();

            return area;
        });

        const root = this.root;
        root.append(this.areas);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
