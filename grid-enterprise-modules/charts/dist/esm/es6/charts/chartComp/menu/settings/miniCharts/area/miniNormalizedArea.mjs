import { MiniStackedArea } from "./miniStackedArea.mjs";
export class MiniNormalizedArea extends MiniStackedArea {
    constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme, data = MiniNormalizedArea.data) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, data, "normalizedAreaTooltip");
    }
}
MiniNormalizedArea.chartType = 'normalizedArea';
MiniNormalizedArea.data = MiniStackedArea.data.map(stack => {
    const sum = stack.reduce((p, c) => p + c, 0);
    return stack.map(v => v / sum * 16);
});
