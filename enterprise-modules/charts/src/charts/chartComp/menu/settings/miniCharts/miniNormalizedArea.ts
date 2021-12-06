import { MiniStackedArea } from "./miniStackedArea";

export class MiniNormalizedArea extends MiniStackedArea {

    static chartType = 'normalizedArea';
    static readonly data = MiniStackedArea.data.map(stack => {
        const sum = stack.reduce((p, c) => p + c, 0);
        return stack.map(v => v / sum * 16);
    });

    constructor(container: HTMLElement, fills: string[], strokes: string[], data: number[][] = MiniNormalizedArea.data) {
        super(container, fills, strokes, data, "normalizedAreaTooltip");
    }
}
