import {
    Component,
    PostConstruct
} from "ag-grid-community";

import { Scene } from "../../../charts/scene/scene";
import { Group } from "../../../charts/scene/group";
import { Sector } from "../../../charts/scene/shape/sector";
import { palettes } from "../../../charts/chart/palettes";
import { Color } from "../../../charts/util/color";
import { toRadians } from "../../../charts/util/angle";
import { Path } from "../../../charts/scene/shape/path";
import { Line } from "../../../charts/scene/shape/line";
import linearScale from "../../../charts/scale/linearScale";
import { BandScale } from "../../../charts/scale/bandScale";
import { Rect } from "../../../charts/scene/shape/rect";

export class MiniChartsContainer extends Component {
    static TEMPLATE = '<div class="ag-chart-settings-mini-wrapper"></div>';

    private colors: string[];

    constructor(palette: number) {
        super(MiniChartsContainer.TEMPLATE);
        this.colors = palettes[palette];
    }

    @PostConstruct
    private init() {
        const classes = [MiniBar, MiniLine, MiniPie, MiniDonut];
        const eGui = this.getGui();
        classes.forEach((MiniClass: new (parent: HTMLElement, colors: string[]) => MiniChart) => {
            const miniWrapper = document.createElement('div');
            new MiniClass(miniWrapper, this.colors);
            eGui.appendChild(miniWrapper);
        });
    }
}

abstract class MiniChart {
    protected scene: Scene;
    protected root = new Group();
    element: HTMLElement;

    protected size = 100;
    protected padding = 5;

    constructor(parent: HTMLElement, colors: string[]) {
        this.scene = new Scene(this.size, this.size);
        this.scene.parent = document.body;
        this.scene.root = this.root;
        this.scene.parent = parent;
        this.element = this.scene.hdpiCanvas.canvas;
        this.init();
        this.updateColors(colors);
    }

    protected abstract init(): void;

    abstract updateColors(colors: string[]): void;
}

class MiniBar extends MiniChart {
    init() {
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
        (this as any).bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const rect = new Rect();
            rect.lineWidth = 1;
            rect.x = xScale.convert(i);
            rect.y = top;
            rect.width = xScale.bandwidth;
            rect.height = bottom - top;
            return rect;
        });

        this.root.append((this as any).bars);
        this.root.append((this as any).axes);
    }

    updateColors(colors: string[]) {
        ((this as any).bars as Rect[]).forEach((bar, i) => {
            const color = colors[i];
            bar.fillStyle = color;
            bar.strokeStyle = Color.fromString(color).darker().toHexString();
        });
    }
}

class MiniStackedBar extends MiniChart {
    init() {
        const size = this.size;
        const padding = this.padding;
        const that = this as any;

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
        that.axes = [leftAxis, bottomAxis];

        const bottom = yScale.convert(0);
        that.bars = data.map(series => {
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

        that.root.append(Array.prototype.concat.apply(null, that.bars));
        this.root.append(that.axes);
    }

    updateColors(colors: string[]) {
        const that = this as any;
        (that.bars as Rect[][]).forEach((series, i) => {
            series.forEach(bar => {
                const color = colors[i];
                bar.fillStyle = color;
                bar.strokeStyle = Color.fromString(color).darker().toHexString();
            })
        });
    }
}

class MiniPie extends MiniChart {

    protected static angles = [
        [toRadians(-90), toRadians(30)],
        [toRadians(30), toRadians(120)],
        [toRadians(120), toRadians(180)],
        [toRadians(180), toRadians(210)],
        [toRadians(210), toRadians(240)],
        [toRadians(240), toRadians(270)]
    ];

    // protected sectors?: Sector[];

    init() {
        const radius = (this.size - this.padding * 2) / 2;
        const center = radius + this.padding;
        const sectors = MiniPie.angles.map(pair => {
            const sector = Sector.create(center, center, 0, radius, pair[0], pair[1]);
            sector.lineWidth = 0;
            return sector;
        });
        (this as any).sectors = sectors;
        this.root.append(sectors);
    }

    updateColors(colors: string[]) {
        ((this as any).sectors as Sector[]).forEach((sector, i) => {
            const color = colors[i];
            sector.fillStyle = color;
            sector.strokeStyle = Color.fromString(color).darker().toHexString();
        });
    }
}

class MiniDonut extends MiniPie {
    init() {
        const r1 = (this.size - this.padding * 2) / 2;
        const r0 = r1 * 0.6;
        const center = r1 + this.padding;
        const sectors = MiniPie.angles.map(pair => {
            const sector = Sector.create(center, center, r0, r1, pair[0], pair[1]);
            sector.lineWidth = 0;
            return sector;
        });
        (this as any).sectors = sectors;
        this.root.append(sectors);
    }
}

class MiniLine extends MiniChart {

    init() {
        const size = this.size;
        const padding = this.padding;

        const xScale = linearScale();
        const yScale = linearScale();
        xScale.domain = [0, 4];
        xScale.range = [padding, size - padding];
        yScale.domain = [0, 10];
        yScale.range = [size - padding, padding];

        const data = [
            [9, 7, 8, 4, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];

        const leftAxis = Line.create(padding, padding, padding, size);
        leftAxis.strokeStyle = 'gray';
        leftAxis.lineWidth = 2;
        const bottomAxis = Line.create(0, size - padding, size - padding, size - padding);
        bottomAxis.strokeStyle = 'gray';
        bottomAxis.lineWidth = 2;
        (this as any).axes = [leftAxis, bottomAxis];

        (this as any).lines = data.map(series => {
            const line = new Path();
            line.lineWidth = 3;
            line.fillStyle = null;
            series.forEach((datum, i) => {
                line.path[i > 0 ? 'lineTo' : 'moveTo'](xScale.convert(i), yScale.convert(datum));
            });
            return line;
        });

        this.root.append((this as any).lines);
        this.root.append((this as any).axes);
    }

    updateColors(colors: string[]) {
        ((this as any).lines as Path[]).forEach((line, i) => {
            const color = colors[i];
            line.strokeStyle = Color.fromString(color).darker().toHexString();
        });
    }
}