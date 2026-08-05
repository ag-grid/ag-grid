import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { isColumnGroup } from '../entities/agColumnGroup';
import type { GridHeaderCell } from './iGridSerializer';

interface GridHeaderLayoutRow {
    cells: GridHeaderCell[];
    grouping: boolean;
}

interface HeaderLayout {
    rows: GridHeaderLayoutRow[];
    /** One entry per row marking which column indexes already hold a cell. */
    occupied: boolean[][];
}

/**
 * Build the rectangular header layout shared by grid exporters.
 * Every row tiles each column index exactly once; consumers rely on that
 * invariant for cell separators and merge references.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function createExportHeaderLayout(
    tree: (AgColumn | AgColumnGroup)[],
    columns: AgColumn[],
    hidePaddedHeaderRows: boolean,
    includeColumnHeaders: boolean,
    spanColumnHeaders: boolean
): GridHeaderLayoutRow[] {
    const groups: AgColumnGroup[] = [];
    collectGroups(tree, groups);
    const groupRowCount = getGroupRowCount(groups, hidePaddedHeaderRows);
    const layout = createEmptyLayout(groupRowCount, includeColumnHeaders, columns.length);

    appendGroupCells(layout, groups, columns, groupRowCount, includeColumnHeaders, spanColumnHeaders);
    if (includeColumnHeaders) {
        appendColumnCells(layout, columns, groupRowCount, spanColumnHeaders);
    }
    fillPaddingCells(layout, columns.length);

    return layout.rows;
}

function createEmptyLayout(groupRowCount: number, includeColumnHeaders: boolean, columnCount: number): HeaderLayout {
    const rowCount = groupRowCount + (includeColumnHeaders ? 1 : 0);
    const rows: GridHeaderLayoutRow[] = [];
    const occupied: boolean[][] = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        rows.push({ cells: [], grouping: rowIndex < groupRowCount });
        occupied.push(new Array<boolean>(columnCount).fill(false));
    }

    return { rows, occupied };
}

function appendGroupCells(
    layout: HeaderLayout,
    groups: AgColumnGroup[],
    columns: AgColumn[],
    groupRowCount: number,
    includeColumnHeaders: boolean,
    spanColumnHeaders: boolean
): void {
    const columnIndexByColumn = new Map<AgColumn, number>();
    for (let i = 0; i < columns.length; i++) {
        columnIndexByColumn.set(columns[i], i);
    }

    for (const group of groups) {
        const providedGroup = group.getProvidedColumnGroup();
        const rowIndex = providedGroup.getLevel();
        if (rowIndex >= groupRowCount) {
            continue;
        }

        const columnIndexes: number[] = [];
        for (const column of group.getLeafColumns()) {
            const columnIndex = columnIndexByColumn.get(column);
            if (columnIndex == null) {
                continue;
            }
            const paddingIsCoveredByColumn =
                providedGroup.isPadding() && includeColumnHeaders && spanColumnHeaders && column.isSpanHeaderHeight();
            if (!paddingIsCoveredByColumn) {
                columnIndexes.push(columnIndex);
            }
        }
        appendGroupSegments(layout.rows[rowIndex].cells, layout.occupied[rowIndex], group, columnIndexes);
    }
}

function appendColumnCells(
    layout: HeaderLayout,
    columns: AgColumn[],
    columnHeaderRowIndex: number,
    spanColumnHeaders: boolean
): void {
    const { rows, occupied } = layout;

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
        const column = columns[columnIndex];
        const startRowIndex = spanColumnHeaders
            ? getSpanStartRowIndex(column, columnHeaderRowIndex)
            : columnHeaderRowIndex;

        rows[startRowIndex].cells.push({
            type: 'column',
            column,
            columnIndex,
            columnSpan: 1,
            rowSpan: columnHeaderRowIndex - startRowIndex + 1,
        });
        occupied[startRowIndex][columnIndex] = true;
        for (let rowIndex = startRowIndex + 1; rowIndex <= columnHeaderRowIndex; rowIndex++) {
            // padding chains are contiguous above leaves, so covered rows are always free.
            if (!occupied[rowIndex][columnIndex]) {
                rows[rowIndex].cells.push({
                    type: 'covered',
                    columnIndex,
                    columnSpan: 1,
                    rowSpan: 1,
                });
                occupied[rowIndex][columnIndex] = true;
            }
        }
    }
}

function getSpanStartRowIndex(column: AgColumn, columnHeaderRowIndex: number): number {
    if (!column.isSpanHeaderHeight()) {
        return columnHeaderRowIndex;
    }

    let startRowIndex = columnHeaderRowIndex;
    let parent = column.getOriginalParent();
    while (parent) {
        const parentLevel = parent.getLevel();
        if (parent.isPadding() && parentLevel < startRowIndex) {
            startRowIndex = parentLevel;
        }
        parent = parent.getOriginalParent();
    }

    return startRowIndex;
}

function fillPaddingCells(layout: HeaderLayout, columnCount: number): void {
    const { rows, occupied } = layout;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            if (!occupied[rowIndex][columnIndex]) {
                row.cells.push({
                    type: 'padding',
                    columnIndex,
                    columnSpan: 1,
                    rowSpan: 1,
                });
            }
        }
        row.cells.sort((a, b) => a.columnIndex - b.columnIndex);
    }
}

function collectGroups(nodes: (AgColumn | AgColumnGroup)[], groups: AgColumnGroup[]): void {
    for (const node of nodes) {
        if (!isColumnGroup(node)) {
            continue;
        }
        groups.push(node);
        collectGroups(node.children ?? [], groups);
    }
}

function getGroupRowCount(groups: AgColumnGroup[], hidePaddedHeaderRows: boolean): number {
    let rowCount = 0;
    for (const group of groups) {
        const providedGroup = group.getProvidedColumnGroup();
        if (!hidePaddedHeaderRows || !providedGroup.isPadding()) {
            rowCount = Math.max(rowCount, providedGroup.getLevel() + 1);
        }
    }
    return rowCount;
}

function appendGroupSegments(
    cells: GridHeaderCell[],
    occupied: boolean[],
    group: AgColumnGroup,
    columnIndexes: number[]
): void {
    columnIndexes.sort((a, b) => a - b);
    let segmentStart = 0;
    while (segmentStart < columnIndexes.length) {
        let segmentEnd = segmentStart;
        while (
            segmentEnd + 1 < columnIndexes.length &&
            columnIndexes[segmentEnd + 1] === columnIndexes[segmentEnd] + 1
        ) {
            segmentEnd += 1;
        }

        const columnIndex = columnIndexes[segmentStart];
        const columnSpan = columnIndexes[segmentEnd] - columnIndex + 1;
        cells.push({
            type: group.isPadding() ? 'padding' : 'group',
            column: group,
            columnIndex,
            columnSpan,
            rowSpan: 1,
        });
        for (let index = columnIndex; index < columnIndex + columnSpan; index++) {
            occupied[index] = true;
        }
        segmentStart = segmentEnd + 1;
    }
}
