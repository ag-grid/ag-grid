import type { ChartType } from 'ag-grid-community';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniChartWithAxes } from '../miniChartWithAxes';
export declare class MiniStackedArea extends MiniChartWithAxes {
    static chartType: ChartType;
    static readonly data: number[][];
    private readonly areas;
    constructor(container: HTMLElement, fills: string[], strokes: string[], _themeTemplateParameters: ThemeTemplateParameters, _isCustomTheme: boolean, data?: number[][], tooltipName?: ChartTranslationKey);
    updateColors(fills: string[], strokes: string[]): void;
}
