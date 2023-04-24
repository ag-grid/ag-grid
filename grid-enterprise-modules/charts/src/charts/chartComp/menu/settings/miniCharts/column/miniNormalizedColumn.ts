import { MiniStackedColumn } from "./miniStackedColumn";
import { ChartType } from "@ag-grid-community/core";

export class MiniNormalizedColumn extends MiniStackedColumn {

    static chartType: ChartType = 'normalizedColumn';
    static data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6]
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, fills, strokes, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip");
    }
}
