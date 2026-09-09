import { _makeNull } from 'ag-stack';

import type { AgColumn, CellPosition, CellRange, Column, RowPinnedType, RowPosition } from 'ag-grid-community';
import { CellRangeType } from 'ag-grid-community';

/**
 * Everything about a single cell range that the selection styling of a cell depends on, captured as
 * of the last time the rendered cells were refreshed. Rows are held as plain indexes so that the
 * per-cell filter can compare them without going through the row position helpers.
 */
export interface RangeSnapshot {
    /** Normalised (topmost) row of the range. */
    firstRow: number;
    /** Normalised (bottommost) row of the range. */
    lastRow: number;
    firstRowPinned: RowPinnedType;
    lastRowPinned: RowPinnedType;
    columns: Set<Column>;
    type: CellRangeType | undefined;
    colorClass: string | null | undefined;
}

/** Matches the rendered cells whose selection state can have changed. */
export type CellSelectionRefreshFilter = (cell: CellPosition) => boolean;

/** The columns adjacent to a column, in visible order. Modelled on `VisibleColsService`. */
interface ColumnNeighbours {
    getColBefore(col: AgColumn): AgColumn | null;
    getColAfter(col: AgColumn): AgColumn | null;
}

export function snapshotCellRange(range: CellRange, firstRow: RowPosition, lastRow: RowPosition): RangeSnapshot {
    return {
        firstRow: firstRow.rowIndex,
        lastRow: lastRow.rowIndex,
        firstRowPinned: _makeNull(firstRow.rowPinned),
        lastRowPinned: _makeNull(lastRow.rowPinned),
        // ranges are mutated in place while dragging, so the columns are copied rather than shared
        columns: new Set(range.columns),
        type: range.type,
        colorClass: range.colorClass,
    };
}

/**
 * Works out which rendered cells need their selection state refreshed, given the ranges as they were
 * last painted and as they are now. Returns `null` when every cell has to be refreshed.
 */
export function createCellSelectionRefreshFilter(
    painted: RangeSnapshot[],
    current: RangeSnapshot[],
    columns: ColumnNeighbours
): CellSelectionRefreshFilter | null {
    // adding or removing a range changes the range count and which range owns the selection handle,
    // neither of which is a per-cell property, so there is nothing to narrow down
    if (painted.length !== current.length) {
        return null;
    }
    // both are read globally by every cell, so a flip invalidates the whole viewport
    if (isMoreThanOneCell(painted) !== isMoreThanOneCell(current)) {
        return null;
    }
    if (isChartRangeSet(painted) !== isChartRangeSet(current)) {
        return null;
    }

    const changes: RangeChange[] = [];

    for (let i = 0; i < current.length; i++) {
        const before = painted[i];
        const after = current[i];

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

interface RangeChange {
    before: RangeSnapshot;
    after: RangeSnapshot;
    /** The colour and chart category classes apply to every cell of the range, not just its edge. */
    wholeRange: boolean;
    rowPinned: RowPinnedType;
    regions: CandidateRegion[];
    columns: ColumnNeighbours;
}

function createRangeChange(before: RangeSnapshot, after: RangeSnapshot, columns: ColumnNeighbours): RangeChange | null {
    const rowPinned = before.firstRowPinned;
    if (before.lastRowPinned !== rowPinned || after.firstRowPinned !== rowPinned || after.lastRowPinned !== rowPinned) {
        return null;
    }

    const wholeRange = before.type !== after.type || before.colorClass !== after.colorClass;
    const change: RangeChange = { before, after, wholeRange, rowPinned, regions: [], columns };

    const spannedFirstRow = Math.min(before.firstRow, after.firstRow);
    const spannedLastRow = Math.max(before.lastRow, after.lastRow);

    if (wholeRange) {
        change.regions.push({
            firstRow: spannedFirstRow,
            lastRow: spannedLastRow,
            columns: unionColumns(before.columns, after.columns),
        });

        return change;
    }

    // borders, the single-cell class and the selection handle all depend on whether the neighbouring
    // cells share the range, so each region is widened by one cell in every direction
    const changedColumns = widenColumns(symmetricDifferenceOfColumns(before.columns, after.columns), columns);
    if (changedColumns.size) {
        change.regions.push({ firstRow: spannedFirstRow - 1, lastRow: spannedLastRow + 1, columns: changedColumns });
    }

    if (before.firstRow !== after.firstRow || before.lastRow !== after.lastRow) {
        const spannedColumns = widenColumns(unionColumns(before.columns, after.columns), columns);

        if (before.firstRow !== after.firstRow) {
            change.regions.push({
                firstRow: Math.min(before.firstRow, after.firstRow) - 1,
                lastRow: Math.max(before.firstRow, after.firstRow) + 1,
                columns: spannedColumns,
            });
        }
        if (before.lastRow !== after.lastRow) {
            change.regions.push({
                firstRow: Math.min(before.lastRow, after.lastRow) - 1,
                lastRow: Math.max(before.lastRow, after.lastRow) + 1,
                columns: spannedColumns,
            });
        }
    }

    return change;
}

function isCellAffected(change: RangeChange, cell: CellPosition): boolean {
    const { regions, rowPinned } = change;
    const { column, rowIndex } = cell;

    if (_makeNull(cell.rowPinned) !== rowPinned) {
        return false;
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

function isCellIn({ columns, firstRow, lastRow }: RangeSnapshot, column: Column, rowIndex: number): boolean {
    return rowIndex >= firstRow && rowIndex <= lastRow && columns.has(column);
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

function isUnchanged(before: RangeSnapshot, after: RangeSnapshot): boolean {
    return (
        before.type === after.type &&
        before.colorClass === after.colorClass &&
        before.firstRow === after.firstRow &&
        before.lastRow === after.lastRow &&
        before.firstRowPinned === after.firstRowPinned &&
        before.lastRowPinned === after.lastRowPinned &&
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

/** Mirrors `IRangeService.isMoreThanOneCell()`, which every cell reads for the single-cell class. */
function isMoreThanOneCell(snapshots: RangeSnapshot[]): boolean {
    if (snapshots.length === 0) {
        return false;
    }
    if (snapshots.length > 1) {
        return true;
    }

    const { firstRow, lastRow, firstRowPinned, lastRowPinned, columns } = snapshots[0];

    return firstRow !== lastRow || firstRowPinned !== lastRowPinned || columns.size !== 1;
}

/** Mirrors the all-ranges test behind the `ag-cell-range-chart` class. */
function isChartRangeSet(snapshots: RangeSnapshot[]): boolean {
    return (
        snapshots.length > 0 &&
        snapshots.every(({ type }) => type === CellRangeType.DIMENSION || type === CellRangeType.VALUE)
    );
}
