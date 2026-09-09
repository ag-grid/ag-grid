import { describe, expect, test } from 'vitest';

import type { AgColumn, CellPosition, CellSelectionRange, CellSelectionSnapshot } from 'ag-grid-community';
import { CellRangeType } from 'ag-grid-community';

import { createCellSelectionRefreshFilter } from './cellSelectionRefreshFilter';
import { areAllChartRanges, isMoreThanOneCell } from './cellSelectionState';

const COLUMN_IDS = ['a', 'b', 'c', 'd', 'e'];
const COLUMNS = COLUMN_IDS.map((colId, i) => ({ colId, allColsIndex: i }) as unknown as AgColumn);

const columnNeighbours = {
    getColBefore: (col: AgColumn) => COLUMNS[COLUMNS.indexOf(col) - 1] ?? null,
    getColAfter: (col: AgColumn) => COLUMNS[COLUMNS.indexOf(col) + 1] ?? null,
};

function columnById(colId: string): AgColumn {
    return COLUMNS[COLUMN_IDS.indexOf(colId)];
}

function range(
    firstRow: number,
    lastRow: number,
    colIds: string[],
    extra: Partial<CellSelectionRange> = {}
): CellSelectionRange {
    const columns = colIds.map(columnById);

    return {
        range: { columns, startColumn: columns[0], startRow: { rowIndex: firstRow, rowPinned: null } },
        firstRow: { rowIndex: firstRow, rowPinned: null },
        lastRow: { rowIndex: lastRow, rowPinned: null },
        withinOneSection: true,
        columns: new Set(columns),
        lastColumn: columns[columns.length - 1],
        contiguous: true,
        type: undefined,
        colorClass: undefined,
        ...extra,
    };
}

/** Wraps the ranges the way `RangeService.getSelectionState()` does, so the globals match. */
function state(...ranges: CellSelectionRange[]): CellSelectionSnapshot {
    return {
        ranges,
        moreThanOneCell: isMoreThanOneCell(ranges),
        allChartRanges: areAllChartRanges(ranges),
    };
}

function cell(rowIndex: number, colId: string): CellPosition {
    return { rowIndex, rowPinned: null, column: columnById(colId) };
}

const ALL_COLUMNS = COLUMN_IDS;

describe('createCellSelectionRefreshFilter', () => {
    test('every cell is stale when a range is added or removed', () => {
        expect(createCellSelectionRefreshFilter([], state(range(0, 5, ALL_COLUMNS)), columnNeighbours)).toBeNull();
        expect(createCellSelectionRefreshFilter([range(0, 5, ALL_COLUMNS)], state(), columnNeighbours)).toBeNull();
    });

    test('no cell is stale when the ranges are unchanged', () => {
        const filter = createCellSelectionRefreshFilter(
            [range(0, 5, ALL_COLUMNS)],
            state(range(0, 5, ALL_COLUMNS)),
            columnNeighbours
        )!;

        expect(filter(cell(0, 'a'))).toBe(false);
        expect(filter(cell(3, 'c'))).toBe(false);
        expect(filter(cell(9, 'e'))).toBe(false);
    });

    test('extending the bottom edge stales only the rows around it', () => {
        const filter = createCellSelectionRefreshFilter(
            [range(0, 5, ALL_COLUMNS)],
            state(range(0, 6, ALL_COLUMNS)),
            columnNeighbours
        )!;

        expect(filter(cell(6, 'c'))).toBe(true);
        expect(filter(cell(5, 'c'))).toBe(true);
        expect(filter(cell(4, 'c'))).toBe(false);
        expect(filter(cell(0, 'c'))).toBe(false);
    });

    test('extending the right edge stales only the columns around it', () => {
        const filter = createCellSelectionRefreshFilter(
            [range(0, 20, ['a', 'b', 'c'])],
            state(range(0, 20, ['a', 'b', 'c', 'd'])),
            columnNeighbours
        )!;

        expect(filter(cell(10, 'd'))).toBe(true);
        expect(filter(cell(10, 'c'))).toBe(true);
        expect(filter(cell(10, 'b'))).toBe(false);
        expect(filter(cell(10, 'a'))).toBe(false);
    });

    test('a diagonal edge move stales the moved row and column, not the interior', () => {
        const filter = createCellSelectionRefreshFilter(
            [range(0, 5, ['a', 'b', 'c'])],
            state(range(0, 6, ['a', 'b', 'c', 'd'])),
            columnNeighbours
        )!;

        expect(filter(cell(6, 'a'))).toBe(true);
        expect(filter(cell(2, 'd'))).toBe(true);
        expect(filter(cell(2, 'a'))).toBe(false);
    });

    test('the handle owner is stale when the opposite row edge moves', () => {
        const filter = createCellSelectionRefreshFilter(
            [range(3, 10, ALL_COLUMNS)],
            state(range(2, 10, ALL_COLUMNS)),
            columnNeighbours
        )!;

        expect(filter(cell(10, 'e'))).toBe(true);
        expect(filter(cell(10, 'c'))).toBe(false);
        expect(filter(cell(7, 'c'))).toBe(false);
    });

    test('the handle owner is stale when an interior column changes the contiguity', () => {
        const filter = createCellSelectionRefreshFilter(
            [range(0, 10, ['a', 'b', 'c', 'd', 'e'])],
            state(range(0, 10, ['a', 'c', 'd', 'e'])),
            columnNeighbours
        )!;

        expect(filter(cell(10, 'e'))).toBe(true);
        expect(filter(cell(5, 'e'))).toBe(false);
    });

    test('a colour change stales every cell of the range', () => {
        const filter = createCellSelectionRefreshFilter(
            [range(0, 5, ['a', 'b'])],
            state(range(0, 5, ['a', 'b'], { colorClass: 'ag-formula-range-1' })),
            columnNeighbours
        )!;

        expect(filter(cell(3, 'a'))).toBe(true);
        expect(filter(cell(3, 'b'))).toBe(true);
        expect(filter(cell(3, 'c'))).toBe(false);
    });

    test('every cell is stale when a range edge crosses a pinned section', () => {
        expect(
            createCellSelectionRefreshFilter(
                [range(0, 5, ALL_COLUMNS)],
                state(
                    range(0, 5, ALL_COLUMNS, {
                        lastRow: { rowIndex: 5, rowPinned: 'bottom' },
                        withinOneSection: false,
                    })
                ),
                columnNeighbours
            )
        ).toBeNull();
    });

    test('every cell is stale when the selection stops being a single cell', () => {
        expect(
            createCellSelectionRefreshFilter([range(3, 3, ['a'])], state(range(3, 3, ['a', 'b'])), columnNeighbours)
        ).toBeNull();
    });

    test('every cell is stale when the ranges start or stop being chart ranges', () => {
        expect(
            createCellSelectionRefreshFilter(
                [range(0, 5, ['a', 'b'])],
                state(range(0, 5, ['a', 'b'], { type: CellRangeType.VALUE })),
                columnNeighbours
            )
        ).toBeNull();
    });
});
