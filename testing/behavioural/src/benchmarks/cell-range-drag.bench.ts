// Cell-range drag benchmark: the cost of ONE frame of a mouse drag that extends a cell range.
//
// This drives the real drag path — a `mousemove` over a neighbouring cell, which mutates the live
// range and dispatches `cellSelectionChanged` once. That matters for what is measured: only the
// cells at the moving edge change CSS classes, and the rest of the viewport hits the class-state
// dedupe in `CssClassManager`. Rebuilding a selection through `clearCellSelection()` +
// `addCellRange()` instead makes every rendered cell write classes twice, which is a different and
// much more expensive scenario — see `cell-range-selection.bench.ts`.
//
// Column virtualisation is suppressed and rowHeight is small, so the fixed 100vh viewport holds as
// many cells as possible.
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const modules = [ClientSideRowModelModule, CellSelectionModule];

const COL_COUNT = 40;
const ROW_COUNT = 500;

interface Row {
    [key: string]: string;
}

const buildCols = (): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < COL_COUNT; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}`, width: 100 });
    }
    return cols;
};

const buildData = (): Row[] => {
    const rows: Row[] = [];
    for (let r = 0; r < ROW_COUNT; ++r) {
        const row: Row = {};
        for (let c = 0; c < COL_COUNT; ++c) {
            row[`c${c}`] = `r${r}c${c}`;
        }
        rows.push(row);
    }
    return rows;
};

const gridOptions: GridOptions = {
    columnDefs: buildCols(),
    rowHeight: 20,
    suppressColumnVirtualisation: true,
    cellSelection: { handle: { mode: 'range' } },
};

const data = buildData();

const findCell = (gridId: string, rowIndex: number, colId: string): HTMLElement => {
    const cell = document.querySelector<HTMLElement>(`#${gridId} [row-index="${rowIndex}"] [col-id="${colId}"]`);
    if (!cell) {
        throw new Error(`bench setup: no rendered cell at row ${rowIndex}, col ${colId}`);
    }
    return cell;
};

const dispatchMouse = (cell: HTMLElement, type: string): void => {
    const rect = cell.getBoundingClientRect();
    cell.dispatchEvent(
        new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            button: 0,
            buttons: type === 'mouseup' ? 0 : 1,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
        })
    );
};

/**
 * Press on `c0` of the first row and drag far enough to open a range, leaving the mouse down so
 * every later `mousemove` is measured as a drag frame.
 */
const startDrag = (api: GridApi, gridId: string, edgeRow: number): void => {
    const edgeCell = findCell(gridId, edgeRow, `c${COL_COUNT - 1}`);
    // Release any drag a previous suite left open: the range service stays in its dragging state
    // until it sees a mouseup, and would ignore the mousedown below.
    dispatchMouse(edgeCell, 'mouseup');
    dispatchMouse(findCell(gridId, 0, 'c0'), 'mousedown');
    // The first move past the drag threshold only opens the drag; the second one extends the range.
    dispatchMouse(edgeCell, 'mousemove');
    dispatchMouse(edgeCell, 'mousemove');
    api.flushAllAnimationFrames();

    const ranges = api.getCellRanges();
    if (!ranges?.length || ranges[0].columns.length < 2) {
        throw new Error('bench setup: drag did not open a multi-column range');
    }
};

let benchGridSeq = 0;

/**
 * Alternate the drag's pointer between two adjacent cells, so each measured iteration is one frame
 * of a drag whose selection edge moves by `edgeRow` - `edgeRowAlt` (a row) or by one column.
 */
const benchDragFrame = (name: string, edgeRow: number, altCol: string, noiseFactor: number): void => {
    suite(`cell range drag: ${name}`, () => {
        const gridsManager = new BenchGridsManager({ modules });
        const gridId = `bench-drag-grid-${++benchGridSeq}`;
        let api!: GridApi;
        let forward = true;
        let cellA!: HTMLElement;
        let cellB!: HTMLElement;

        bench(
            name,
            () => {
                dispatchMouse(forward ? cellA : cellB, 'mousemove');
                api.flushAllAnimationFrames();
                forward = !forward;
            },
            {
                ...benchDefaults({ noiseFactor }),
                setup: async () => {
                    await gridsManager.reset();
                    api = gridsManager.createGrid(gridId, { ...gridOptions, rowData: data });
                    api.flushAllAnimationFrames();
                    startDrag(api, gridId, edgeRow);
                    cellA = findCell(gridId, edgeRow, `c${COL_COUNT - 1}`);
                    cellB = findCell(gridId, edgeRow - 1, altCol);
                    forward = true;
                },
            }
        );
    });
};

// Edge moves by one row: the selection grows/shrinks by a single row of cells.
benchDragFrame('extend by one row', 20, `c${COL_COUNT - 1}`, 2);

// Edge moves by one row and one column: a diagonal drag frame, the common gesture.
benchDragFrame('extend by one row and column', 20, `c${COL_COUNT - 2}`, 2);
