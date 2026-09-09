import { describe, expect, test } from 'vitest';

import type { AgColumn, CellPosition } from 'ag-grid-community';
import { CellRangeType } from 'ag-grid-community';

import type { RangeSnapshot } from './cellSelectionRefreshFilter';
import { createCellSelectionRefreshFilter } from './cellSelectionRefreshFilter';

const COLUMN_IDS = ['a', 'b', 'c', 'd', 'e'];
const COLUMNS = COLUMN_IDS.map((colId) => ({ colId }) as unknown as AgColumn);

const columnNeighbours = {
    getColBefore: (col: AgColumn) => COLUMNS[COLUMNS.indexOf(col) - 1] ?? null,
    getColAfter: (col: AgColumn) => COLUMNS[COLUMNS.indexOf(col) + 1] ?? null,
};

function columnById(colId: string): AgColumn {
    return COLUMNS[COLUMN_IDS.indexOf(colId)];
}

function snapshot(
    firstRow: number,
    lastRow: number,
    colIds: string[],
    extra: Partial<RangeSnapshot> = {}
): RangeSnapshot {
    return {
        firstRow,
        lastRow,
        firstRowPinned: null,
        lastRowPinned: null,
        columns: new Set(colIds.map(columnById)),
        type: undefined,
        colorClass: undefined,
        ...extra,
    };
}

function cell(rowIndex: number, colId: string): CellPosition {
    return { rowIndex, rowPinned: null, column: columnById(colId) };
}

const ALL_COLUMNS = COLUMN_IDS;

describe('createCellSelectionRefreshFilter', () => {
    test('every cell is stale when a range is added or removed', () => {
        expect(createCellSelectionRefreshFilter([], [snapshot(0, 5, ALL_COLUMNS)], columnNeighbours)).toBeNull();
        expect(createCellSelectionRefreshFilter([snapshot(0, 5, ALL_COLUMNS)], [], columnNeighbours)).toBeNull();
    });

    test('no cell is stale when the ranges are unchanged', () => {
        const filter = createCellSelectionRefreshFilter(
            [snapshot(0, 5, ALL_COLUMNS)],
            [snapshot(0, 5, ALL_COLUMNS)],
            columnNeighbours
        )!;

        expect(filter(cell(0, 'a'))).toBe(false);
        expect(filter(cell(3, 'c'))).toBe(false);
        expect(filter(cell(9, 'e'))).toBe(false);
    });

    test('extending the bottom edge stales only the rows around it', () => {
        const filter = createCellSelectionRefreshFilter(
            [snapshot(0, 5, ALL_COLUMNS)],
            [snapshot(0, 6, ALL_COLUMNS)],
            columnNeighbours
        )!;

        expect(filter(cell(6, 'c'))).toBe(true);
        expect(filter(cell(5, 'c'))).toBe(true);
        expect(filter(cell(4, 'c'))).toBe(false);
        expect(filter(cell(0, 'c'))).toBe(false);
    });

    test('extending the right edge stales only the columns around it', () => {
        const filter = createCellSelectionRefreshFilter(
            [snapshot(0, 20, ['a', 'b', 'c'])],
            [snapshot(0, 20, ['a', 'b', 'c', 'd'])],
            columnNeighbours
        )!;

        expect(filter(cell(10, 'd'))).toBe(true);
        expect(filter(cell(10, 'c'))).toBe(true);
        expect(filter(cell(10, 'b'))).toBe(false);
        expect(filter(cell(10, 'a'))).toBe(false);
    });

    test('a diagonal edge move stales the moved row and column, not the interior', () => {
        const filter = createCellSelectionRefreshFilter(
            [snapshot(0, 5, ['a', 'b', 'c'])],
            [snapshot(0, 6, ['a', 'b', 'c', 'd'])],
            columnNeighbours
        )!;

        expect(filter(cell(6, 'a'))).toBe(true);
        expect(filter(cell(2, 'd'))).toBe(true);
        expect(filter(cell(2, 'a'))).toBe(false);
    });

    test('a colour change stales every cell of the range', () => {
        const filter = createCellSelectionRefreshFilter(
            [snapshot(0, 5, ['a', 'b'])],
            [snapshot(0, 5, ['a', 'b'], { colorClass: 'ag-formula-range-1' })],
            columnNeighbours
        )!;

        expect(filter(cell(3, 'a'))).toBe(true);
        expect(filter(cell(3, 'b'))).toBe(true);
        expect(filter(cell(3, 'c'))).toBe(false);
    });

    test('every cell is stale when a range edge crosses a pinned section', () => {
        expect(
            createCellSelectionRefreshFilter(
                [snapshot(0, 5, ALL_COLUMNS)],
                [snapshot(0, 5, ALL_COLUMNS, { lastRowPinned: 'bottom' })],
                columnNeighbours
            )
        ).toBeNull();
    });

    test('every cell is stale when the selection stops being a single cell', () => {
        expect(
            createCellSelectionRefreshFilter([snapshot(3, 3, ['a'])], [snapshot(3, 3, ['a', 'b'])], columnNeighbours)
        ).toBeNull();
    });

    test('every cell is stale when the ranges start or stop being chart ranges', () => {
        expect(
            createCellSelectionRefreshFilter(
                [snapshot(0, 5, ['a', 'b'])],
                [snapshot(0, 5, ['a', 'b'], { type: CellRangeType.VALUE })],
                columnNeighbours
            )
        ).toBeNull();
    });
});
