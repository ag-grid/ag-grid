"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniNormalizedBar = void 0;
const miniStackedBar_1 = require("./miniStackedBar");
class MiniNormalizedBar extends miniStackedBar_1.MiniStackedBar {
    constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, MiniNormalizedBar.data, [0, 10], 'normalizedBarTooltip');
    }
}
exports.MiniNormalizedBar = MiniNormalizedBar;
MiniNormalizedBar.chartType = 'normalizedBar';
MiniNormalizedBar.data = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6],
];
