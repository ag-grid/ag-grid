import { MiniStackedArea } from "./miniStackedArea";
export class MiniNormalizedArea extends MiniStackedArea {
    constructor(container, fills, strokes, data = MiniNormalizedArea.data) {
        super(container, fills, strokes, data, "normalizedAreaTooltip");
    }
}
MiniNormalizedArea.chartType = 'normalizedArea';
MiniNormalizedArea.data = MiniStackedArea.data.map(stack => {
    const sum = stack.reduce((p, c) => p + c, 0);
    return stack.map(v => v / sum * 16);
});
