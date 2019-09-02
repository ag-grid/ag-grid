import {_, ChartType, PostConstruct} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import {Path} from "../../../../../charts/scene/shape/path";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {ClipRect} from "../../../../../charts/scene/clipRect";

export class MiniLine extends MiniChart {
    static chartType = ChartType.Line;
    private readonly lines: Path[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        const xScale = linearScale();
        xScale.domain = [0, 4];
        xScale.range = [padding, size - padding];

        const yScale = linearScale();
        yScale.domain = [0, 10];
        yScale.range = [size - padding, padding];

        const data = [
            [9, 7, 8, 5, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;

        this.lines = data.map(series => {
            const line = new Path();
            line.strokeWidth = 3;
            line.lineCap = 'round';
            line.fill = undefined;
            series.forEach((datum, i) => {
                line.path[i > 0 ? 'lineTo' : 'moveTo'](xScale.convert(i), yScale.convert(datum));
            });

            return line;
        });

        const clipRect = new ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;

        clipRect.append(this.lines);
        const root = this.root;
        root.append(clipRect);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('lineTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.lines.forEach((line, i) => {
            line.stroke = strokes[i];
        });
    }
}
