"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const miniDoughnut_1 = require("./miniDoughnut");
class MiniPie extends miniDoughnut_1.MiniDoughnut {
    constructor(container, fills, strokes) {
        super(container, fills, strokes, 0, "pieTooltip");
    }
}
exports.MiniPie = MiniPie;
MiniPie.chartType = 'pie';
