import { MiniChart } from './miniChart';
import { ChartTranslationKey } from '../../../services/chartTranslationService';
export declare abstract class MiniChartWithPolarAxes extends MiniChart {
    private readonly stroke;
    private gridLines;
    protected showRadiusAxisLine: boolean;
    protected showAngleAxisLines: boolean;
    constructor(container: HTMLElement, tooltipName: ChartTranslationKey);
    private addAxes;
}
