import { MiniDonut } from "./miniDonut.mjs";
export class MiniPie extends MiniDonut {
    constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, 0, "pieTooltip");
    }
}
MiniPie.chartType = 'pie';
