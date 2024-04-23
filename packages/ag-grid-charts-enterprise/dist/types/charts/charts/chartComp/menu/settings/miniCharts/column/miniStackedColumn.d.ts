import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "ag-grid-community";
import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { ChartTranslationKey } from "../../../../services/chartTranslationService";
export declare class MiniStackedColumn extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly stackedColumns;
    static data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], _themeTemplateParameters: ThemeTemplateParameters, _isCustomTheme: boolean, data?: number[][], yScaleDomain?: number[], tooltipName?: ChartTranslationKey);
    updateColors(fills: string[], strokes: string[]): void;
}
