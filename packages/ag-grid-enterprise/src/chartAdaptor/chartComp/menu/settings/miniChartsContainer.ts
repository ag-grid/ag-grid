import {_, AgGroupComponent, Autowired, ChartType, Component, PostConstruct} from "ag-grid-community";

import {ChartController} from "../../chartController";
import {ChartTranslator} from "../../chartTranslator";
import {Group} from "../../../../charts/scene/group";
import {Scene} from "../../../../charts/scene/scene";
import {toRadians} from "../../../../charts/util/angle";
import {Sector} from "../../../../charts/scene/shape/sector";
import {Path} from "../../../../charts/scene/shape/path";
import linearScale from "../../../../charts/scale/linearScale";
import {Line} from "../../../../charts/scene/shape/line";
import {ClipRect} from "../../../../charts/scene/clipRect";
import {Rect} from "../../../../charts/scene/shape/rect";
import {BandScale} from "../../../../charts/scale/bandScale";
import {Arc} from "../../../../charts/scene/shape/arc";
import {Shape} from "../../../../charts/scene/shape/shape";

type ChartGroupsType = 'barGroup' | 'columnGroup' | 'pieGroup' | 'lineGroup' | 'scatterGroup' | 'areaGroup';

type ChartGroups = {
    [key in ChartGroupsType]: any[];
};

export class MiniChartsContainer extends Component {
    static TEMPLATE = '<div class="ag-chart-settings-mini-wrapper"></div>';

    private readonly fills: string[];
    private readonly strokes: string[];
    private wrappers: { [key: string ]: HTMLElement } = {};
    private chartController: ChartController;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    constructor(activePalette: number, chartController: ChartController) {
        super(MiniChartsContainer.TEMPLATE);

        const palettes = chartController.getPalettes();
        this.fills = palettes[activePalette].fills;
        this.strokes = palettes[activePalette].strokes;

        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const chartGroups: ChartGroups = {
            columnGroup: [
                MiniColumn,
                MiniStackedColumn,
                MiniNormalizedColumn
            ],
            barGroup: [
                MiniBar,
                MiniStackedBar,
                MiniNormalizedBar
            ],
            pieGroup: [
                MiniPie,
                MiniDoughnut
            ],
            lineGroup: [
                MiniLine
            ],
            scatterGroup: [
                MiniScatter,
                MiniBubble
            ],
            areaGroup: [
                MiniArea,
                MiniStackedArea,
                MiniNormalizedArea
            ]
        };

        const eGui = this.getGui();
        Object.keys(chartGroups).forEach(group => {
            const chartGroup = chartGroups[group as ChartGroupsType];
            const groupComponent = new AgGroupComponent({
                title: this.chartTranslator.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true
            });
            this.getContext().wireBean(groupComponent);

            chartGroup.forEach(MiniClass => {
                const miniWrapper = document.createElement('div');
                _.addCssClass(miniWrapper, 'ag-chart-mini-thumbnail');

                this.addDestroyableEventListener(miniWrapper, 'click', () => {
                    this.chartController.setChartType(MiniClass.chartType);
                    this.refreshSelected();
                });

                this.wrappers[MiniClass.chartType] = miniWrapper;

                const miniChart = new MiniClass(miniWrapper, this.fills, this.strokes);
                this.getContext().wireBean(miniChart);
                groupComponent.addItem(miniWrapper);
            });

            eGui.appendChild(groupComponent.getGui());
        });

        this.refreshSelected();
    }

    public refreshSelected() {
        const type = this.chartController.getChartType();

        for (const wrapper in this.wrappers) {
            _.addOrRemoveCssClass(this.wrappers[wrapper], 'ag-selected', wrapper === type);
        }
    }
}

export abstract class MiniChart extends Component {
    @Autowired('chartTranslator') protected chartTranslator: ChartTranslator;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly root = new Group();
    protected readonly scene: Scene = (() => {
        const scene = new Scene({
            width: this.size,
            height: this.size
        });
        scene.root = this.root;
        return scene;
    })();

    readonly element: HTMLElement = this.scene.canvas.element;

    abstract updateColors(fills: string[], strokes: string[]): void;
}

export class MiniPie extends MiniChart {
    static chartType = ChartType.Pie;

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

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('pieTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.sectors.forEach((sector, i) => {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    }
}

class MiniDoughnut extends MiniChart {
    static chartType = ChartType.Doughnut;
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

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('doughnutTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.sectors.forEach((sector, i) => {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    }
}

class MiniLine extends MiniChart {
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

class MiniColumn extends MiniChart {
    static chartType = ChartType.GroupedColumn;
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
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;

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

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('groupedColumnTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    }
}

class MiniBar extends MiniChart {
    static chartType = ChartType.GroupedBar;
    private readonly bars: Rect[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        const data = [2, 3, 4];

        const yScale = new BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = linearScale();
        xScale.domain = [0, 4];
        xScale.range = [size - padding, padding];

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

        const bottom = xScale.convert(0);
        this.bars = data.map((datum, i) => {
            const top = xScale.convert(datum);
            const rect = new Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(padding) + alignment;
            rect.y = Math.floor(yScale.convert(i)) + alignment;
            const width = yScale.bandwidth;
            const height = bottom - top;
            rect.width = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
            rect.height = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
            return rect;
        });

        const root = this.root;
        root.append(this.bars);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('groupedBarTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    }
}

class MiniStackedColumn extends MiniChart {
    static chartType = ChartType.StackedColumn;
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
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;

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

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('stackedColumnTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((series, i) => {
            series.forEach(bar => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    }
}

class MiniStackedBar extends MiniChart {
    static chartType = ChartType.StackedBar;
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

        const yScale = new BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = linearScale();
        xScale.domain = [0, 16];
        xScale.range = [size - padding, padding];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

        const rectLineWidth = 1;
        const alignment = Math.floor(rectLineWidth) % 2 / 2;

        const bottom = xScale.convert(0);
        this.bars = data.map(series => {
            return series.map((datum, i) => {
                const top = xScale.convert(datum);
                const rect = new Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(padding) + alignment;
                rect.y = Math.floor(yScale.convert(i)) + alignment;
                const width = yScale.bandwidth;
                const height = bottom - top;
                rect.width = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
                rect.height = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
                return rect;
            });
        });

        const root = this.root;
        root.append(([] as Rect[]).concat.apply([], this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('stackedBarTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((series, i) => {
            series.forEach(bar => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    }
}

class MiniNormalizedColumn extends MiniChart {
    static chartType = ChartType.NormalizedColumn;
    private readonly bars: Rect[][];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        const data = [
            [10, 10, 10],
            [6, 7, 8],
            [2, 4, 6]
        ];

        const xScale = new BandScale<number>();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;

        const yScale = linearScale();
        yScale.domain = [0, 10];
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

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('normalizedColumnTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((series, i) => {
            series.forEach(bar => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    }
}

class MiniNormalizedBar extends MiniChart {
    static chartType = ChartType.NormalizedBar;
    private readonly bars: Rect[][];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        const data = [
            [10, 10, 10],
            [6, 7, 8],
            [2, 4, 6]
        ];

        const yScale = new BandScale<number>();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = linearScale();
        xScale.domain = [0, 10];
        xScale.range = [size - padding, padding];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

        const rectLineWidth = 1;
        const alignment = Math.floor(rectLineWidth) % 2 / 2;

        const bottom = xScale.convert(0);
        this.bars = data.map(series => {
            return series.map((datum, i) => {
                const top = xScale.convert(datum);
                const rect = new Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(padding) + alignment;
                rect.y = Math.floor(yScale.convert(i)) + alignment;
                const width = yScale.bandwidth;
                const height = bottom - top;
                rect.width = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
                rect.height = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
                return rect;
            });
        });

        const root = this.root;
        root.append(([] as Rect[]).concat.apply([], this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    @PostConstruct
    private init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('normalizedBarTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((series, i) => {
            series.forEach(bar => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    }
}

class MiniScatter extends MiniChart {
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
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

        const points: Shape[] = [];
        data.forEach((series, i) => {
            series.forEach((datum, j) => {
                const arc = new Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(datum[0]);
                arc.centerY = yScale.convert(datum[1]);
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

class MiniBubble extends MiniChart {
    static chartType = ChartType.Bubble;
    private readonly points: Shape[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super();

        this.scene.parent = parent;

        const size = this.size;
        const padding = this.padding;

        // [x, y, radius] triples
        const data = [
            [[0.1, 0.3, 5], [0.5, 0.4, 7], [0.2, 0.8, 7]], [[0.8, 0.7, 5], [0.7, 0.3, 9]]
        ];

        const xScale = linearScale();
        xScale.domain = [0, 1];
        xScale.range = [padding * 2, size - padding];

        const yScale = linearScale();
        yScale.domain = [0, 1];
        yScale.range = [size - padding, padding];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

        const points: Shape[] = [];
        data.forEach((series, i) => {
            series.forEach((datum, j) => {
                const arc = new Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(datum[0]);
                arc.centerY = yScale.convert(datum[1]);
                arc.radiusX = datum[2];
                arc.radiusY = datum[2];
                arc.fillOpacity = 0.7;
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
        this.scene.canvas.element.title = this.chartTranslator.translate('bubbleTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.points.forEach((line, i) => {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    }
}

class MiniArea extends MiniChart {
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
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

        const xCount = data.length;
        const last = xCount * 2 - 1;
        const pathData: {x: number, y: number}[][] = [];

        const bottomY = yScale.convert(0);
        for (let i = 0; i < xCount; i++) {
            const yDatum = data[i];
            const yCount = yDatum.length;
            const x = xScale.convert(i);

            let curr: number;
            for (let j = 0; j < yCount; j++) {
                curr = yDatum[j];

                const y = yScale.convert(curr);
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

class MiniStackedArea extends MiniChart {
    static chartType = ChartType.StackedArea;
    private readonly areas: Path[];

    static readonly data = [
        [2, 3, 2],
        [3, 6, 5],
        [6, 2, 2]
    ];

    constructor(parent: HTMLElement, fills: string[], strokes: string[], data: number[][] = MiniStackedArea.data) {
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
        yScale.domain = [0, 16];
        yScale.range = [size - padding + 0.5, padding + 0.5];

        const axisOvershoot = 3;

        const leftAxis = Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;

        const bottomAxis = Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;

        const xCount = data.length;
        const last = xCount * 2 - 1;
        const pathData: {x: number, y: number}[][] = [];

        for (let i = 0; i < xCount; i++) {
            const yDatum = data[i];
            const yCount = yDatum.length;
            const x = xScale.convert(i);

            let prev = 0;
            let curr: number;
            for (let j = 0; j < yCount; j++) {
                curr = yDatum[j];

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

    @PostConstruct
    protected init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('stackedAreaTooltip');
    }

    updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}

class MiniNormalizedArea extends MiniStackedArea {
    static chartType = ChartType.NormalizedArea;
    static readonly data = MiniStackedArea.data.map(stack => {
        const sum = stack.reduce((p, c) => p + c, 0);
        return stack.map(v => v / sum * 16);
    });

    constructor(parent: HTMLElement, fills: string[], strokes: string[], data: number[][] = MiniNormalizedArea.data) {
        super(parent, fills, strokes, data);
    }

    @PostConstruct
    protected init() {
        this.scene.canvas.element.title = this.chartTranslator.translate('normalizedAreaTooltip');
    }
}
