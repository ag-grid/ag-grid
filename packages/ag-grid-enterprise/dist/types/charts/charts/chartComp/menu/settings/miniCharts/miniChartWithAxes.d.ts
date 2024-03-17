import { MiniChart } from "./miniChart";
import { ChartTranslationKey } from "../../../services/chartTranslationService";
export declare abstract class MiniChartWithAxes extends MiniChart {
    private readonly stroke;
    private readonly axisOvershoot;
    constructor(container: HTMLElement, tooltipName: ChartTranslationKey);
    private addAxes;
}
