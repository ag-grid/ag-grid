import { MiniChart } from "../miniChart";
import { ChartType } from "ag-grid-community";
import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { ChartTranslationKey } from "../../../../services/chartTranslationService";
export declare class MiniDonut extends MiniChart {
    static chartType: ChartType;
    private readonly sectors;
    constructor(container: HTMLElement, fills: string[], strokes: string[], _themeTemplateParameters: ThemeTemplateParameters, _isCustomTheme: boolean, centerRadiusScaler?: number, tooltipName?: ChartTranslationKey);
    updateColors(fills: string[], strokes: string[]): void;
}
