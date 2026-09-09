import { _makeNull } from 'ag-stack';

import type { AgColumn, CellPosition, CellRange, CellSelectionRange, Column, RowPosition } from 'ag-grid-community';
import { CellRangeType, _isRowBefore, _isSameRow } from 'ag-grid-community';

/** The per-range facts a cell needs, gathered once so a viewport of cells does not each recompute them. */
export function buildCellSelectionRange(
    range: CellRange,
    firstRow: RowPosition,
    lastRow: RowPosition,
    contiguous: boolean
): CellSelectionRange {
    const firstRowPinned = _makeNull(firstRow.rowPinned);
    const lastRowPinned = _makeNull(lastRow.rowPinned);

    return {
        range,
        // ranges are mutated in place while dragging, so the rows are copied rather than shared
        firstRow: { rowIndex: firstRow.rowIndex, rowPinned: firstRowPinned },
        lastRow: { rowIndex: lastRow.rowIndex, rowPinned: lastRowPinned },
        withinOneSection: firstRowPinned === lastRowPinned,
        columns: new Set(range.columns),
        lastColumn: findLastColumn(range.columns),
        contiguous,
        type: range.type,
        colorClass: range.colorClass,
    };
}

/** Mirrors the rightmost column that `IRangeService.isBottomRightCell()` compares against. */
function findLastColumn(columns: Column[]): Column | undefined {
    let last: AgColumn | undefined;
    for (let i = 0, len = columns.length; i < len; i++) {
        const column = columns[i] as AgColumn;
        if (!last || column.allColsIndex > last.allColsIndex) {
            last = column;
        }
    }
    return last;
}

function isRowInSelectionRange({ firstRow, lastRow, withinOneSection }: CellSelectionRange, row: RowPosition) {
    if (withinOneSection) {
        // the common case: one pinned section, so the row indexes alone order the rows
        return (
            _makeNull(row.rowPinned) === firstRow.rowPinned &&
            row.rowIndex >= firstRow.rowIndex &&
            row.rowIndex <= lastRow.rowIndex
        );
    }

    if (_isSameRow(row, firstRow) || _isSameRow(row, lastRow)) {
        return true;
    }

    return !_isRowBefore(row, firstRow) && _isRowBefore(row, lastRow);
}

export function isCellInSelectionRange(selectionRange: CellSelectionRange, cell: CellPosition): boolean {
    return selectionRange.columns.has(cell.column) && isRowInSelectionRange(selectionRange, cell);
}

/** Mirrors `IRangeService.isMoreThanOneCell()`. */
export function isMoreThanOneCell(ranges: CellSelectionRange[]): boolean {
    if (ranges.length === 0) {
        return false;
    }
    if (ranges.length > 1) {
        return true;
    }

    const { firstRow, lastRow, columns } = ranges[0];

    return firstRow.rowIndex !== lastRow.rowIndex || firstRow.rowPinned !== lastRow.rowPinned || columns.size !== 1;
}

/** Mirrors the all-ranges test behind the `ag-cell-range-chart` class. */
export function areAllChartRanges(ranges: CellSelectionRange[]): boolean {
    return (
        ranges.length > 0 &&
        ranges.every(({ type }) => type === CellRangeType.DIMENSION || type === CellRangeType.VALUE)
    );
}
