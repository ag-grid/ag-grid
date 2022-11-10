import { PostConstruct } from "@ag-grid-community/core";
import { MiniChart } from "./miniChart";
import { Integrated } from "ag-charts-community";

export abstract class MiniChartWithAxes extends MiniChart {

    private readonly stroke = 'gray';
    private readonly axisOvershoot = 3;

    constructor(container: HTMLElement, tooltipName: string) {
        super(container, tooltipName);
    }

    @PostConstruct
    private addAxes() {
        const size = this.size;
        const padding = this.padding;

        const leftAxis = new Integrated.Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + this.axisOvershoot;
        leftAxis.stroke = this.stroke;

        const bottomAxis = new Integrated.Line();
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
