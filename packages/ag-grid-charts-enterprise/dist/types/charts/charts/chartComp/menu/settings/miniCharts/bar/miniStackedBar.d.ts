import type { ChartType } from 'ag-grid-community';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniChartWithAxes } from '../miniChartWithAxes';
export declare class MiniStackedBar extends MiniChartWithAxes {
    static chartType: ChartType;
    static data: number[][];
    private readonly bars;
    constructor(container: HTMLElement, fills: string[], strokes: string[], _themeTemplateParameters: ThemeTemplateParameters, _isCustomTheme: boolean, data?: number[][], xScaleDomain?: number[], tooltipName?: ChartTranslationKey);
    updateColors(fills: string[], strokes: string[]): void;
}
