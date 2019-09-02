import {_, ChartType, PostConstruct} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {ClipRect} from "../../../../../charts/scene/clipRect";
import {Arc} from "../../../../../charts/scene/shape/arc";
import {Shape} from "../../../../../charts/scene/shape/shape";

export class MiniScatter extends MiniChart {
    static chartType = ChartType.Scatter;
    private readonly points: Shape[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        // [x, y] pairs
        const data = [
            [[0.3, 3], [1.1, 0.9], [2, 0.4], [3.4, 2.4]],
            [[0, 0.3], [1, 2], [2.4, 1.4], [3, 0]]
        ];

        const xScale = linearScale();
        xScale.domain = [-0.5, 4];
        xScale.range = [padding * 2, size - padding];

        const yScale = linearScale();
        yScale.domain = [-0.5, 3.5];
        yScale.range = [size - padding, padding];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;

        const points: Shape[] = [];
        data.forEach(series => {
            series.forEach(datum => {
                const [x, y] = datum;
                const arc = new Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radiusX = 2.5;
                arc.radiusY = 2.5;
                points.push(arc);
            });
        });
        this.points = points;

        const clipRect = new ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;

        clipRect.append(this.points);
        const root = this.root;
        root.append(clipRect);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('scatterTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.points.forEach((line, i) => {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    }
}
