import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { MiniDonut } from "./miniDonut";
import { ChartType } from "ag-grid-community";
export declare class MiniPie extends MiniDonut {
    static chartType: ChartType;
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean);
}
