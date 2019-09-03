import {_, PostConstruct} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import {Line} from "../../../../../charts/scene/shape/line";

export abstract class MiniChartWithAxes extends MiniChart {
    private readonly stroke = 'gray';
    private readonly strokeWidth = 1;
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
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - this.axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;
        
        const root = this.root;

        root.append(leftAxis);
        root.append(bottomAxis);
    }
}
