import {
    _,
    Component,
    PostConstruct
} from "ag-grid-community";

import { ChartController } from "../chartController";

export class MiniChartsContainer extends Component {
    static TEMPLATE = '<div class="ag-chart-settings-mini-wrapper"></div>';

    private readonly fills: string[];
    private readonly strokes: string[];
    private wrappers: HTMLElement[] = [];
    private chartController: ChartController;

    constructor(activePalette: number, chartController: ChartController) {
        super(MiniChartsContainer.TEMPLATE);

        const palettes = chartController.getPalettes();
        this.fills = palettes[activePalette].fills;
        this.strokes = palettes[activePalette].strokes;

        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const classes = [MiniBar, MiniStackedBar, MiniLine, MiniPie, MiniDonut];
        const eGui = this.getGui();
        classes.forEach((MiniClass: new (parent: HTMLElement, fills: string[], strokes: string[]) => MiniChart, idx: number) => {
            const miniWrapper = document.createElement('div');
            _.addCssClass(miniWrapper, 'ag-chart-mini-thumbnail');

            this.addDestroyableEventListener(miniWrapper, 'click', () => {
                this.chartController.setChartType(idx);
                this.refreshSelected();
            });

            this.wrappers.push(miniWrapper);

            new MiniClass(miniWrapper, this.fills, this.strokes);
            eGui.appendChild(miniWrapper);
        });

        this.refreshSelected();
    }

    public refreshSelected() {
        const type = this.chartController.getChartType();
        _.radioCssClass(this.wrappers[type], 'ag-selected');
    }
}

import { Group } from "../../../charts/scene/group";
import { Scene } from "../../../charts/scene/scene";
import { toRadians } from "../../../charts/util/angle";
import { Sector } from "../../../charts/scene/shape/sector";
import { Path } from "../../../charts/scene/shape/path";
import linearScale from "../../../charts/scale/linearScale";
import { Line } from "../../../charts/scene/shape/line";
import { ClipRect } from "../../../charts/scene/clipRect";
import { Rect } from "../../../charts/scene/shape/rect";
import { BandScale } from "../../../charts/scale/bandScale";

export abstract class MiniChart {
    protected readonly size = 80;
    protected readonly padding = 5;
    protected readonly root = new Group();
    protected readonly scene: Scene = (() => {
        const scene = new Scene(this.size, this.size);
        scene.root = this.root;
        return scene;
    })();

    readonly element: HTMLElement = this.scene.hdpiCanvas.canvas;

    abstract updateColors(fills: string[], strokes: string[]): void;
}

export class MiniPie extends MiniChart {
    static readonly angles = [
        [toRadians(-90), toRadians(30)],
        [toRadians(30), toRadians(120)],
        [toRadians(120), toRadians(180)],
        [toRadians(180), toRadians(210)],
        [toRadians(210), toRadians(240)],
        [toRadians(240), toRadians(270)]
    ];

    private readonly radius = (this.size - this.padding * 2) / 2;
    private readonly center = this.radius + this.padding;

    private readonly sectors = MiniPie.angles.map(pair => {
        const sector = Sector.create(this.center, this.center, 0, this.radius, pair[0], pair[1]);
        sector.stroke = undefined;
        return sector;
    });

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;
        this.root.append(this.sectors);
        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.sectors.forEach((sector, i) => {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    }
}

export class MiniDonut extends MiniChart {
    private readonly radius = (this.size - this.padding * 2) / 2;
    private readonly center = this.radius + this.padding;

    private readonly sectors = MiniPie.angles.map(pair => {
        const sector = Sector.create(this.center, this.center, this.radius * 0.6, this.radius, pair[0], pair[1]);
        sector.stroke = undefined;
        return sector;
    });

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;
        this.root.append(this.sectors);
        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.sectors.forEach((sector, i) => {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    }
}

class MiniLine extends MiniChart {
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
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

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

    updateColors(fills: string[], strokes: string[]) {
        this.lines.forEach((line, i) => {
            line.stroke = strokes[i];
        });
    }
}

class MiniBar extends MiniChart {
    private readonly bars: Rect[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        const data = [2, 3, 4];

        const xScale = new BandScale<number>();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.4;
        xScale.paddingOuter = 0.4;

        const yScale = linearScale();
        yScale.domain = [0, 4];
        yScale.range = [size - padding, padding];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        (this as any).axes = [leftAxis, bottomAxis];

        const rectLineWidth = 1;
        const alignment = Math.floor(rectLineWidth) % 2 / 2;

        const bottom = yScale.convert(0);
        this.bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const rect = new Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(xScale.convert(i)) + alignment;
            rect.y = Math.floor(top) + alignment;
            const width = xScale.bandwidth;
            const height = bottom - top;
            rect.width = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
            rect.height = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
            return rect;
        });

        const root = this.root;
        root.append(this.bars);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    }
}

class MiniStackedBar extends MiniChart {
    private readonly bars: Rect[][];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        const data = [
            [8, 12, 16],
            [6, 9, 12],
            [2, 3, 4]
        ];

        const xScale = new BandScale<number>();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.4;
        xScale.paddingOuter = 0.4;

        const yScale = linearScale();
        yScale.domain = [0, 16];
        yScale.range = [size - padding, padding];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

        const rectLineWidth = 1;
        const alignment = Math.floor(rectLineWidth) % 2 / 2;

        const bottom = yScale.convert(0);
        this.bars = data.map(series => {
            return series.map((datum, i) => {
                const top = yScale.convert(datum);
                const rect = new Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(xScale.convert(i)) + alignment;
                rect.y = Math.floor(top) + alignment;
                const width = xScale.bandwidth;
                const height = bottom - top;
                rect.width = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
                rect.height = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
                return rect;
            });
        });

        const root = this.root;
        root.append(([] as Rect[]).concat.apply([], this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((series, i) => {
            series.forEach(bar => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            })
        });
    }
}
