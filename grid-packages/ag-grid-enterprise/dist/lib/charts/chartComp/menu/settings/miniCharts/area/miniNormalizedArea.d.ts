import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { MiniStackedArea } from "./miniStackedArea";
import { ChartType } from "ag-grid-community";
export declare class MiniNormalizedArea extends MiniStackedArea {
    static chartType: ChartType;
    static readonly data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean, data?: number[][]);
}
