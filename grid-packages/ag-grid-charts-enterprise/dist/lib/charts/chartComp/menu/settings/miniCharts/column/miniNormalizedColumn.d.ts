import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { MiniStackedColumn } from "./miniStackedColumn";
import { ChartType } from "ag-grid-community";
export declare class MiniNormalizedColumn extends MiniStackedColumn {
    static chartType: ChartType;
    static data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean);
}
