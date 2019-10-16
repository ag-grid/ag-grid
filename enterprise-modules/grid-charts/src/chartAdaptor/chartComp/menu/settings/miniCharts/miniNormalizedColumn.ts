import {_, ChartType} from "@ag-community/grid-core";

import {MiniStackedColumn} from "./miniStackedColumn";

export class MiniNormalizedColumn extends MiniStackedColumn {
    static chartType = ChartType.NormalizedColumn;
    static data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6]
    ];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, fills, strokes, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip");
    }
}
