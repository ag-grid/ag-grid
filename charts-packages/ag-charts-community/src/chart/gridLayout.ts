import { BBox } from '../scene/bbox';

export type Page = { columns: Column[]; pageWidth: number; pageHeight: number; startIndex: number; endIndex: number };

type Column = {
    rowCount: number;
    columnWidth: number;
    columnHeight: number;
    startIndex: number;
    endIndex: number;
    bboxes: BBox[];
};
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
    let gridHeight = 0;
    let startIndex = 0;
    let endIndex = 0;

    for (let i = 0; i < itemCount; i++) {
        const { height: itemHeight, width: itemWidth } = bboxes[i];
        const paddedItemHeight = itemHeight + itemPaddingY;
        const paddedItemWidth = itemWidth + itemPaddingX;
        if (gridHeight + paddedItemHeight < maxHeight) {
            gridHeight += paddedItemHeight;
            rowCount++;

            endIndex = i;

            if (paddedItemWidth > columnWidth) {
                columnWidth = paddedItemWidth;
            }
        } else {
            columnCount++;
            gridHeight = paddedItemHeight;
            columnWidth = paddedItemWidth;
            rowCount = 1;
            startIndex = i;
            endIndex = i;
        }

        grid[columnCount] = {
            rowCount,
            columnWidth,
            columnHeight: gridHeight,
            startIndex: startIndex,
            endIndex: endIndex,
            bboxes: bboxes.slice(startIndex, endIndex + 1),
        };
    }

    const pages = paginate(grid, maxWidth);

    return { grid, pages };
}

export function paginate(grid: Grid, maxWidth: number) {
    const pages: Page[] = [];
    let pageWidth = 0;
    let pageHeight = 0;
    let page = 0;
    let startIndex = 0;
    let endIndex = 0;
    let columns = [];
    for (let column in grid) {
        const { columnWidth, columnHeight, startIndex: columnStartIdx, endIndex: columnEndIdx } = grid[column];
        if (pageHeight < columnHeight) {
            pageHeight = columnHeight;
        }

        if (pageWidth + columnWidth > maxWidth && pages[page]) {
            // start new page
            page++;
            columns = [];
            startIndex = columnStartIdx;
            endIndex = columnEndIdx;
            pageWidth = columnWidth;
        } else {
            endIndex = columnEndIdx;
            pageWidth += columnWidth;
        }

        columns.push(grid[column]);
        pages[page] = {
            columns,
            pageWidth,
            pageHeight,
            startIndex,
            endIndex,
        };
    }

    return pages;
}
