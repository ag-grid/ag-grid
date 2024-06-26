import type { ChartType } from 'ag-grid-community';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniDonut } from './miniDonut';
export declare class MiniPie extends MiniDonut {
    static chartType: ChartType;
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean);
}
