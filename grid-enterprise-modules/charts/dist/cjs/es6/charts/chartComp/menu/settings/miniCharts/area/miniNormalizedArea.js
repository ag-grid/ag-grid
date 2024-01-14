"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniNormalizedArea = void 0;
const miniStackedArea_1 = require("./miniStackedArea");
class MiniNormalizedArea extends miniStackedArea_1.MiniStackedArea {
    constructor(container, fills, strokes, data = MiniNormalizedArea.data) {
        super(container, fills, strokes, data, "normalizedAreaTooltip");
    }
}
exports.MiniNormalizedArea = MiniNormalizedArea;
MiniNormalizedArea.chartType = 'normalizedArea';
MiniNormalizedArea.data = miniStackedArea_1.MiniStackedArea.data.map(stack => {
    const sum = stack.reduce((p, c) => p + c, 0);
    return stack.map(v => v / sum * 16);
});
