import {_, PostConstruct} from "ag-grid-community";

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

        const leftAxis = Line.create(padding, padding, padding, size - padding + this.axisOvershoot);
        leftAxis.stroke = this.stroke;

        const bottomAxis = Line.create(padding - this.axisOvershoot + 1, size - padding, size - padding + 1, size - padding);
        bottomAxis.stroke = this.stroke;
        
        const root = this.root;

        root.append(leftAxis);
        root.append(bottomAxis);
    }
}
