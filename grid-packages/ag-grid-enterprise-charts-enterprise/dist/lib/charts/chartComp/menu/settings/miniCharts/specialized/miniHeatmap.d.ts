import { ChartType } from 'ag-grid-community';
import { MiniChart } from '../miniChart';
import { ThemeTemplateParameters } from '../../miniChartsContainer';
export declare class MiniHeatmap extends MiniChart {
    static chartType: ChartType;
    private readonly rects;
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplate: ThemeTemplateParameters, isCustomTheme: boolean);
    updateColors(fills: string[], strokes: string[], themeTemplate?: ThemeTemplateParameters, isCustomTheme?: boolean): void;
}
