import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { MiniDonut } from "./miniDonut";
import { ChartType } from "@ag-grid-community/core";

export class MiniPie extends MiniDonut {

    static chartType: ChartType = 'pie';

    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, 0, "pieTooltip");
    }
}
