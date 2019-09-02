import {_, ChartType, PostConstruct} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import {MiniPie} from "./miniPie";
import {Sector} from "../../../../../charts/scene/shape/sector";

export class MiniDoughnut extends MiniChart {
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
