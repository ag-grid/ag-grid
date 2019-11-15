import {_, PostConstruct} from "@ag-grid-community/core";

import {MiniChart} from "./miniChart";
import {Line} from "../../../../../charts/scene/shape/line";

export abstract class MiniChartWithAxes extends MiniChart {
    private readonly stroke = 'gray';
    private readonly axisOvershoot = 3;

    constructor(parent: HTMLElement, tooltipName: string) {
        super(parent, tooltipName);
    }

    @PostConstruct
    private addAxes() {
        const size = this.size;
        const padding = this.padding;

        const leftAxis = new Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + this.axisOvershoot;
        leftAxis.stroke = this.stroke;

        const bottomAxis = new Line();
        bottomAxis.x1 = padding - this.axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = this.stroke;

        const root = this.root;

        root.append(leftAxis);
        root.append(bottomAxis);
    }
}
