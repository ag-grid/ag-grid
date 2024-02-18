"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniNormalizedColumn = void 0;
const miniStackedColumn_1 = require("./miniStackedColumn");
class MiniNormalizedColumn extends miniStackedColumn_1.MiniStackedColumn {
    constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip");
    }
}
exports.MiniNormalizedColumn = MiniNormalizedColumn;
MiniNormalizedColumn.chartType = 'normalizedColumn';
MiniNormalizedColumn.data = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6]
];
