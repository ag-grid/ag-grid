import type { ChartTranslationKey } from '../../../services/chartTranslationService';
import { MiniChart } from './miniChart';
export declare abstract class MiniChartWithAxes extends MiniChart {
    private readonly stroke;
    private readonly axisOvershoot;
    constructor(container: HTMLElement, tooltipName: ChartTranslationKey);
    postConstruct(): void;
}
