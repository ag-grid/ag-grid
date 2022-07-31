import { MiniStackedColumn } from "./miniStackedColumn";
export class MiniNormalizedColumn extends MiniStackedColumn {
    constructor(container, fills, strokes) {
        super(container, fills, strokes, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip");
    }
}
MiniNormalizedColumn.chartType = 'normalizedColumn';
MiniNormalizedColumn.data = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6]
];
