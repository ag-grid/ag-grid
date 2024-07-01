import type { ChartTranslationKey } from '../../../services/chartTranslationService';
import { MiniChart } from './miniChart';
export declare abstract class MiniChartWithPolarAxes extends MiniChart {
    private readonly stroke;
    private gridLines;
    protected showRadiusAxisLine: boolean;
    protected showAngleAxisLines: boolean;
    constructor(container: HTMLElement, tooltipName: ChartTranslationKey);
    postConstruct(): void;
}
