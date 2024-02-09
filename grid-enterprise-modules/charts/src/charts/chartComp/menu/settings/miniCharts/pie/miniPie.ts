import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { MiniDoughnut } from "./miniDoughnut";
import { ChartType } from "@ag-grid-community/core";

export class MiniPie extends MiniDoughnut {

    static chartType: ChartType = 'pie';

    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, 0, "pieTooltip");
    }
}
