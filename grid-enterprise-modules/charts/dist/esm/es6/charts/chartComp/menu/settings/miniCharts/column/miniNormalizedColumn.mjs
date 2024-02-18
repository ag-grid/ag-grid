import { MiniStackedColumn } from "./miniStackedColumn.mjs";
export class MiniNormalizedColumn extends MiniStackedColumn {
    constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip");
    }
}
MiniNormalizedColumn.chartType = 'normalizedColumn';
MiniNormalizedColumn.data = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6]
];
