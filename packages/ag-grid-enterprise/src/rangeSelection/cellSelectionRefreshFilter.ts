import { _makeNull } from 'ag-stack';

import type { AgColumn, CellPosition, CellSelectionRange, CellSelectionSnapshot, Column } from 'ag-grid-community';

import { areAllChartRanges, isCellInSelectionRange, isMoreThanOneCell } from './cellSelectionState';

/** Matches the rendered cells whose selection state can have changed. */
export type CellSelectionRefreshFilter = (cell: CellPosition) => boolean;

/** The columns adjacent to a column, in visible order. Modelled on `VisibleColsService`. */
interface ColumnNeighbours {
    getColBefore(col: AgColumn): AgColumn | null;
    getColAfter(col: AgColumn): AgColumn | null;
}

/**
 * Works out which rendered cells need their selection state refreshed, given the ranges as they were
 * last painted and as they are now. Returns `null` when every cell has to be refreshed.
 */
export function createCellSelectionRefreshFilter(
    painted: CellSelectionRange[],
    current: CellSelectionSnapshot,
    columns: ColumnNeighbours
): CellSelectionRefreshFilter | null {
    const currentRanges = current.ranges;

    // adding or removing a range changes the range count and which range owns the selection handle,
    // neither of which is a per-cell property, so there is nothing to narrow down
    if (painted.length !== currentRanges.length) {
        return null;
    }
    // both are read globally by every cell, so a flip invalidates the whole viewport
    if (isMoreThanOneCell(painted) !== current.moreThanOneCell) {
        return null;
    }
    if (areAllChartRanges(painted) !== current.allChartRanges) {
        return null;
    }

    const changes: RangeChange[] = [];

    for (let i = 0; i < currentRanges.length; i++) {
        const before = painted[i];
        const after = currentRanges[i];

        if (isUnchanged(before, after)) {
            continue;
        }

        const change = createRangeChange(before, after, columns);
        // a range spanning more than one pinned section cannot be compared by row index alone
        if (!change) {
            return null;
        }

        changes.push(change);
    }

    return function isCellStale(cell: CellPosition): boolean {
        for (let i = 0, len = changes.length; i < len; i++) {
            if (isCellAffected(changes[i], cell)) {
                return true;
            }
        }
        return false;
    };
}

/** A band of rows crossed with a set of columns, holding every cell a change could have staled. */
interface CandidateRegion {
    firstRow: number;
    lastRow: number;
    columns: Set<Column>;
}

interface CandidateCell {
    rowIndex: number;
    column: Column;
}

interface RangeChange {
    before: CellSelectionRange;
    after: CellSelectionRange;
    /** The colour and chart category classes apply to every cell of the range, not just its edge. */
    wholeRange: boolean;
    rowPinned: string | null;
    regions: CandidateRegion[];
    /**
     * The cells owning the selection handle before and after the change. The handle caches the range
     * row boundaries and its availability depends on contiguity across every selected column, so it
     * goes stale on changes that leave its own cell's membership and borders untouched.
     */
    handleCells: CandidateCell[];
    columns: ColumnNeighbours;
}

function createRangeChange(
    before: CellSelectionRange,
    after: CellSelectionRange,
    columns: ColumnNeighbours
): RangeChange | null {
    const rowPinned = before.firstRow.rowPinned ?? null;
    if (!before.withinOneSection || !after.withinOneSection || (after.firstRow.rowPinned ?? null) !== rowPinned) {
        return null;
    }

    const beforeFirst = before.firstRow.rowIndex;
    const beforeLast = before.lastRow.rowIndex;
    const afterFirst = after.firstRow.rowIndex;
    const afterLast = after.lastRow.rowIndex;

    const wholeRange = before.type !== after.type || before.colorClass !== after.colorClass;
    const change: RangeChange = {
        before,
        after,
        wholeRange,
        rowPinned,
        regions: [],
        handleCells: collectHandleCells(before, after),
        columns,
    };

    const spannedFirstRow = Math.min(beforeFirst, afterFirst);
    const spannedLastRow = Math.max(beforeLast, afterLast);

    if (wholeRange) {
        change.regions.push({
            firstRow: spannedFirstRow,
            lastRow: spannedLastRow,
            columns: unionColumns(before.columns, after.columns),
        });

        return change;
    }

    // borders and the single-cell class depend on whether the neighbouring cells share the range, so
    // each region is widened by one cell in every direction
    const changedColumns = widenColumns(symmetricDifferenceOfColumns(before.columns, after.columns), columns);
    if (changedColumns.size) {
        change.regions.push({ firstRow: spannedFirstRow - 1, lastRow: spannedLastRow + 1, columns: changedColumns });
    }

    if (beforeFirst !== afterFirst || beforeLast !== afterLast) {
        const spannedColumns = widenColumns(unionColumns(before.columns, after.columns), columns);

        if (beforeFirst !== afterFirst) {
            change.regions.push({
                firstRow: Math.min(beforeFirst, afterFirst) - 1,
                lastRow: Math.max(beforeFirst, afterFirst) + 1,
                columns: spannedColumns,
            });
        }
        if (beforeLast !== afterLast) {
            change.regions.push({
                firstRow: Math.min(beforeLast, afterLast) - 1,
                lastRow: Math.max(beforeLast, afterLast) + 1,
                columns: spannedColumns,
            });
        }
    }

    return change;
}

function collectHandleCells(before: CellSelectionRange, after: CellSelectionRange): CandidateCell[] {
    const cells: CandidateCell[] = [];
    for (const { lastRow, lastColumn } of [before, after]) {
        const rowIndex = lastRow.rowIndex;
        if (lastColumn && !cells.some((cell) => cell.rowIndex === rowIndex && cell.column === lastColumn)) {
            cells.push({ rowIndex, column: lastColumn });
        }
    }
    return cells;
}

function isCellAffected(change: RangeChange, cell: CellPosition): boolean {
    const { regions, rowPinned, handleCells } = change;
    const { column, rowIndex } = cell;

    if (_makeNull(cell.rowPinned) !== rowPinned) {
        return false;
    }

    for (let i = 0, len = handleCells.length; i < len; i++) {
        const handleCell = handleCells[i];
        if (handleCell.rowIndex === rowIndex && handleCell.column === column) {
            return true;
        }
    }

    let isCandidate = false;
    for (let i = 0, len = regions.length; i < len && !isCandidate; i++) {
        const region = regions[i];
        isCandidate = rowIndex >= region.firstRow && rowIndex <= region.lastRow && region.columns.has(column);
    }
    if (!isCandidate) {
        return false;
    }

    const { before, after } = change;
    if (change.wholeRange) {
        return isCellIn(before, column, rowIndex) || isCellIn(after, column, rowIndex);
    }

    if (
        hasMembershipChanged(change, column, rowIndex) ||
        (rowIndex > 0 && hasMembershipChanged(change, column, rowIndex - 1)) ||
        hasMembershipChanged(change, column, rowIndex + 1)
    ) {
        return true;
    }

    const agColumn = column as AgColumn;
    const colBefore = change.columns.getColBefore(agColumn);
    const colAfter = change.columns.getColAfter(agColumn);

    return (
        (!!colBefore && hasMembershipChanged(change, colBefore, rowIndex)) ||
        (!!colAfter && hasMembershipChanged(change, colAfter, rowIndex))
    );
}

function hasMembershipChanged({ before, after }: RangeChange, column: Column, rowIndex: number): boolean {
    return isCellIn(before, column, rowIndex) !== isCellIn(after, column, rowIndex);
}

function isCellIn(selectionRange: CellSelectionRange, column: Column, rowIndex: number): boolean {
    return isCellInSelectionRange(selectionRange, {
        rowIndex,
        rowPinned: selectionRange.firstRow.rowPinned,
        column,
    });
}

function unionColumns(before: Set<Column>, after: Set<Column>): Set<Column> {
    const union = new Set(before);
    for (const column of after) {
        union.add(column);
    }
    return union;
}

function symmetricDifferenceOfColumns(before: Set<Column>, after: Set<Column>): Set<Column> {
    const difference = new Set<Column>();
    for (const column of before) {
        if (!after.has(column)) {
            difference.add(column);
        }
    }
    for (const column of after) {
        if (!before.has(column)) {
            difference.add(column);
        }
    }
    return difference;
}

function widenColumns(selected: Set<Column>, columns: ColumnNeighbours): Set<Column> {
    if (!selected.size) {
        return selected;
    }

    const widened = new Set(selected);
    for (const column of selected) {
        const agColumn = column as AgColumn;
        const colBefore = columns.getColBefore(agColumn);
        const colAfter = columns.getColAfter(agColumn);
        if (colBefore) {
            widened.add(colBefore);
        }
        if (colAfter) {
            widened.add(colAfter);
        }
    }
    return widened;
}

function isUnchanged(before: CellSelectionRange, after: CellSelectionRange): boolean {
    return (
        before.type === after.type &&
        before.colorClass === after.colorClass &&
        before.firstRow.rowIndex === after.firstRow.rowIndex &&
        before.lastRow.rowIndex === after.lastRow.rowIndex &&
        before.firstRow.rowPinned === after.firstRow.rowPinned &&
        before.lastRow.rowPinned === after.lastRow.rowPinned &&
        haveSameColumns(before.columns, after.columns)
    );
}

function haveSameColumns(before: Set<Column>, after: Set<Column>): boolean {
    if (before.size !== after.size) {
        return false;
    }
    for (const column of before) {
        if (!after.has(column)) {
            return false;
        }
    }
    return true;
}
