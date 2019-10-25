import { MiniChart } from "./miniChart";
export declare abstract class MiniChartWithAxes extends MiniChart {
    private readonly stroke;
    private readonly axisOvershoot;
    constructor(parent: HTMLElement, tooltipName: string);
    private addAxes;
}
