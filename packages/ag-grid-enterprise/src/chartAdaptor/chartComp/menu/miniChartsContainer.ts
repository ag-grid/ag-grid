import {
    _,
    Component,
    PostConstruct
} from "ag-grid-community";

import { palettes } from "../../../charts/chart/palettes";
import { ChartController } from "../chartController";

export class MiniChartsContainer extends Component {
    static TEMPLATE = '<div class="ag-chart-settings-mini-wrapper"></div>';

    private readonly colors: string[];
    private wrappers: HTMLElement[] = [];
    private chartController: ChartController;

    constructor(palette: number, chartController: ChartController) {
        super(MiniChartsContainer.TEMPLATE);
        this.colors = palettes[palette];
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const classes = [MiniBar, MiniStackedBar, MiniLine, MiniPie, MiniDonut];
        const eGui = this.getGui();
        classes.forEach((MiniClass: new (parent: HTMLElement, colors: string[]) => MiniChart, idx: number) => {
            const miniWrapper = document.createElement('div');
            _.addCssClass(miniWrapper, 'ag-chart-mini-thumbnail');

            this.addDestroyableEventListener(miniWrapper, 'click', () => {
                this.chartController.setChartType(idx);
                this.refreshSelected();
            });

            this.wrappers.push(miniWrapper);

            new MiniClass(miniWrapper, this.colors);
            eGui.appendChild(miniWrapper);
        });

        this.refreshSelected();
    }

    public refreshSelected() {
        this.wrappers.forEach((wrapper, idx) => {
            _.addOrRemoveCssClass(wrapper, 'ag-selected', idx === this.chartController.getChartType());
        });
    }
}

import { Group } from "../../../charts/scene/group";
import { Scene } from "../../../charts/scene/scene";
import { toRadians } from "../../../charts/util/angle";
import { Sector } from "../../../charts/scene/shape/sector";
import { Color } from "../../../charts/util/color";
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

    abstract updateColors(colors: string[]): void;
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
        sector.strokeStyle = null;
        return sector;
    });

    constructor(parent: HTMLElement, colors: string[]) {
        super();

        this.scene.parent = parent;
        this.root.append(this.sectors);
        this.updateColors(colors);
    }

    updateColors(colors: string[]) {
        this.sectors.forEach((sector, i) => {
            const color = colors[i];
            sector.fillStyle = color;
            sector.strokeStyle = Color.fromString(color).darker().toHexString();
        });
    }
}

export class MiniDonut extends MiniChart {
    private readonly radius = (this.size - this.padding * 2) / 2;
    private readonly center = this.radius + this.padding;

    private readonly sectors = MiniPie.angles.map(pair => {
        const sector = Sector.create(this.center, this.center, this.radius * 0.6, this.radius, pair[0], pair[1]);
        sector.strokeStyle = null;
        return sector;
    });

    constructor(parent: HTMLElement, colors: string[]) {
        super();

        this.scene.parent = parent;
        this.root.append(this.sectors);
        this.updateColors(colors);
    }

    updateColors(colors: string[]) {
        this.sectors.forEach((sector, i) => {
            const color = colors[i];
            sector.fillStyle = color;
            sector.strokeStyle = Color.fromString(color).darker().toHexString();
        });
    }
}

export class MiniLine extends MiniChart {
    private readonly lines: Path[];

    constructor(parent: HTMLElement, colors: string[]) {
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
            [9, 7, 8, 4, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];

        const leftAxis = Line.create(padding, padding, padding, size);
        leftAxis.strokeStyle = 'gray';
        leftAxis.lineWidth = 1;

        const bottomAxis = Line.create(0, size - padding, size - padding, size - padding);
        bottomAxis.strokeStyle = 'gray';
        bottomAxis.lineWidth = 1;

        this.lines = data.map(series => {
            const line = new Path();
            line.lineWidth = 3;
            line.lineCap = 'round';
            line.fillStyle = null;
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

        this.updateColors(colors);
    }

    updateColors(colors: string[]) {
        this.lines.forEach((line, i) => {
            const color = colors[i];
            line.strokeStyle = Color.fromString(color).darker().toHexString();
        });
    }
}

export class MiniBar extends MiniChart {
    private readonly bars: Rect[];

    constructor(parent: HTMLElement, colors: string[]) {
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

        const leftAxis = Line.create(padding, padding, padding, size);
        leftAxis.strokeStyle = 'gray';
        leftAxis.lineWidth = 1;

        const bottomAxis = Line.create(0, size - padding, size - padding, size - padding);
        bottomAxis.strokeStyle = 'gray';
        bottomAxis.lineWidth = 1;
        (this as any).axes = [leftAxis, bottomAxis];

        const bottom = yScale.convert(0);
        this.bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const rect = new Rect();
            rect.lineWidth = 1;
            rect.x = xScale.convert(i);
            rect.y = top;
            rect.width = xScale.bandwidth;
            rect.height = bottom - top;
            return rect;
        });

        const root = this.root;
        root.append(this.bars);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(colors);
    }

    updateColors(colors: string[]) {
        this.bars.forEach((bar, i) => {
            const color = colors[i];
            bar.fillStyle = color;
            bar.strokeStyle = Color.fromString(color).darker().toHexString();
        });
    }
}

export class MiniStackedBar extends MiniChart {
    private readonly bars: Rect[][];

    constructor(parent: HTMLElement, colors: string[]) {
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

        const leftAxis = Line.create(padding, padding, padding, size);
        leftAxis.strokeStyle = 'gray';
        leftAxis.lineWidth = 1;

        const bottomAxis = Line.create(0, size - padding, size - padding, size - padding);
        bottomAxis.strokeStyle = 'gray';
        bottomAxis.lineWidth = 1;

        const bottom = yScale.convert(0);
        this.bars = data.map(series => {
            return series.map((datum, i) => {
                const top = yScale.convert(datum);
                const rect = new Rect();
                rect.lineWidth = 1;
                rect.x = xScale.convert(i);
                rect.y = top;
                rect.width = xScale.bandwidth;
                rect.height = bottom - top;
                return rect;
            });
        });

        const root = this.root;
        root.append(([] as Rect[]).concat.apply([], this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(colors);
    }

    updateColors(colors: string[]) {
        this.bars.forEach((series, i) => {
            series.forEach(bar => {
                const color = colors[i];
                bar.fillStyle = color;
                bar.strokeStyle = Color.fromString(color).darker().toHexString();
            })
        });
    }
}
