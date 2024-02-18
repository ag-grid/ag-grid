import { ChartType } from 'ag-grid-community';
import { _Scene } from 'ag-charts-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
import { ThemeTemplateParameters } from '../../miniChartsContainer';
export declare class MiniWaterfall extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly bars;
    private data;
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplate: ThemeTemplateParameters, isCustomTheme: boolean);
    updateColors(fills: string[], strokes: string[], themeTemplate?: ThemeTemplateParameters, isCustomTheme?: boolean): void;
    createWaterfall(root: _Scene.Group, data: number[], size: number, padding: number, direction: 'horizontal' | 'vertical'): {
        bars: _Scene.Rect[];
    };
}
