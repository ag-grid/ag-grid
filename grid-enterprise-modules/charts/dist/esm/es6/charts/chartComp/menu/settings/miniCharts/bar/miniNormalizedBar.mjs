import { MiniStackedBar } from './miniStackedBar.mjs';
export class MiniNormalizedBar extends MiniStackedBar {
    constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, MiniNormalizedBar.data, [0, 10], 'normalizedBarTooltip');
    }
}
MiniNormalizedBar.chartType = 'normalizedBar';
MiniNormalizedBar.data = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6],
];
