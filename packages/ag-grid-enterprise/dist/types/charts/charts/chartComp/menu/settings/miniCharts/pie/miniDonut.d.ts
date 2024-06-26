import type { ChartType } from 'ag-grid-community';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniChart } from '../miniChart';
export declare class MiniDonut extends MiniChart {
    static chartType: ChartType;
    private readonly sectors;
    constructor(container: HTMLElement, fills: string[], strokes: string[], _themeTemplateParameters: ThemeTemplateParameters, _isCustomTheme: boolean, centerRadiusScaler?: number, tooltipName?: ChartTranslationKey);
    updateColors(fills: string[], strokes: string[]): void;
}
