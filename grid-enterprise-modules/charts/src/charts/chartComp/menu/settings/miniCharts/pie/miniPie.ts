import { ThemeTemplateParameters } from "../../miniChartsContainer";
import { MiniDoughnut } from "./miniDoughnut";
import { ChartType } from "@ag-grid-community/core";

export class MiniPie extends MiniDoughnut {

    static chartType: ChartType = 'pie';

    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters) {
        super(container, fills, strokes, themeTemplateParameters, 0, "pieTooltip");
    }
}
