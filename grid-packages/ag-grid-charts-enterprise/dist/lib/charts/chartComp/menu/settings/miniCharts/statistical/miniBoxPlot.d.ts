import { ChartType } from 'ag-grid-community';
import { _Scene } from 'ag-charts-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
import { ThemeTemplateParameters } from '../../miniChartsContainer';
export declare class MiniBoxPlot extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly boxPlotGroups;
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean);
    updateColors(fills: string[], strokes: string[], themeTemplateParameters?: ThemeTemplateParameters, isCustomTheme?: boolean): void;
    setLineProperties(line: _Scene.Line, x1: number, x2: number, y1: number, y2: number): void;
}
