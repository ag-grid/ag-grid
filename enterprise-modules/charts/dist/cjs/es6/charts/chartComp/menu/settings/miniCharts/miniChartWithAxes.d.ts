import { MiniChart } from "./miniChart";
export declare abstract class MiniChartWithAxes extends MiniChart {
    private readonly stroke;
    private readonly axisOvershoot;
    constructor(container: HTMLElement, tooltipName: string);
    private addAxes;
}
