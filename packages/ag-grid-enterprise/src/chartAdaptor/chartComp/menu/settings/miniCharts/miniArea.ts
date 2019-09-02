import {_, ChartType, PostConstruct} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import {Path} from "../../../../../charts/scene/shape/path";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {BandScale} from "../../../../../charts/scale/bandScale";

export interface ICoordinate {
    x: number;
    y: number;
}

export class MiniArea extends MiniChart {
    static chartType = ChartType.Area;
    private readonly areas: Path[];

    static readonly data = [
        [1, 3, 5],
        [2, 6, 4],
        [5, 3, 1]
    ];

    constructor(parent: HTMLElement, fills: string[], strokes: string[], data: number[][] = MiniArea.data) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        const xScale = new BandScale<number>();
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.domain = [0, 1, 2];
        xScale.range = [padding + 0.5, size - padding - 0.5];

        const yScale = linearScale();
        yScale.domain = [0, 6];
        yScale.range = [size - padding + 0.5, padding];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;

        const xCount = data.length;
        const last = xCount * 2 - 1;
        const pathData: ICoordinate[][] = [];
        const bottomY = yScale.convert(0);

        for (let i = 0; i < xCount; i++) {
            const yDatum = data[i];
            const yCount = yDatum.length;
            const x = xScale.convert(i);

            for (let j = 0; j < yCount; j++) {
                const y = yScale.convert(yDatum[j]);
                const points = pathData[j] || (pathData[j] = []);

                points[i] = {
                    x,
                    y
                };

                points[last - i] = {
                    x,
                    y: bottomY
                };
            }
        }

        this.areas = pathData.reverse().map(points => {
            const area = new Path();
            area.strokeWidth = 1;
            area.fillOpacity = 0.7;

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

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('groupedAreaTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
