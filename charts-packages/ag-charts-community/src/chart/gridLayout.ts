import { BBox } from '../scene/bbox';

type Column = { rowCount: number; columnWidth: number; columnHeight: number; startIdx: number; endIdx: number };
type Grid = { [column: number]: Column };

export function gridLayout({
    bboxes,
    maxHeight,
    maxWidth,
    itemPaddingY = 0,
    itemPaddingX = 0,
}: {
    bboxes: BBox[];
    maxHeight: number;
    maxWidth: number;
    itemPaddingY?: number;
    itemPaddingX?: number;
}) {
    const itemCount = bboxes.length;
    const grid: Grid = {};
    let rowCount = 0;
    let columnCount = 1;
    let columnWidth = 0;
    let height = 0;
    let startIdx = 0;
    let endIdx = 0;

    for (let i = 0; i < itemCount; i++) {
        const { height: itemHeight, width: itemWidth } = bboxes[i];
        const paddedItemHeight = itemHeight + itemPaddingY;
        const paddedItemWidth = itemWidth + itemPaddingX;
        if (height + paddedItemHeight < maxHeight) {
            height += paddedItemHeight;
            rowCount++;

            endIdx = i;

            if (paddedItemWidth > columnWidth) {
                columnWidth = paddedItemWidth;
            }
        } else {
            columnCount++;
            height = paddedItemHeight;
            columnWidth = paddedItemWidth;
            rowCount = 1;
            startIdx = i;
            endIdx = i;
        }

        grid[columnCount] = { rowCount, columnWidth, columnHeight: height, startIdx, endIdx };
    }

    const pages = paginate(grid, maxWidth);

    return { grid, pages };
}

export function paginate(grid: Grid, maxWidth: number) {
    const pages: { [page: number]: Column[] } = {};
    let width = 0;
    let page = 0;
    for (let column in grid) {
        const { columnWidth } = grid[column];
        if (width + columnWidth > maxWidth && pages[page]) {
            width = 0;
            page++;
        }
        width += columnWidth;
        pages[page] ??= [];
        pages[page].push(grid[column]);
    }

    return pages;
}
