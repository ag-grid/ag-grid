import { MiniStackedBar } from "./miniStackedBar";
import { ChartType } from "@ag-grid-community/core";

export class MiniNormalizedBar extends MiniStackedBar {

    static chartType: ChartType = 'normalizedBar';
    static data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6]
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, fills, strokes, MiniNormalizedBar.data, [0, 10], "normalizedBarTooltip");
    }
}
