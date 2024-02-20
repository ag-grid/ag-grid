"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniPie = void 0;
const miniDonut_1 = require("./miniDonut");
class MiniPie extends miniDonut_1.MiniDonut {
    constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, 0, "pieTooltip");
    }
}
exports.MiniPie = MiniPie;
MiniPie.chartType = 'pie';
