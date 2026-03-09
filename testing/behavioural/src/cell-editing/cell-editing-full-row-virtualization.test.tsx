import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import {
    ClientSideRowModelModule,
    ScrollApiModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { TestGridsManager, asyncSetTimeout, initPointerEventPolyfill, waitForInput } from '../test-utils';

const ROW_COUNT = 200;
const COL_COUNT = 50;

function makeRowData() {
    return Array.from({ length: ROW_COUNT }, (_, rowIndex) => {
        const row: Record<string, string> = { id: String(rowIndex) };
        for (let i = 1; i <= COL_COUNT; i++) {
            row[`field${i}`] = `r${rowIndex + 1}-c${i}`;
        }
        return row;
    });
}

const columnDefs = Array.from({ length: COL_COUNT }, (_, i) => ({
    field: `field${i + 1}`,
    headerName: `Field ${i + 1}`,
}));

/** Returns whether a given row-index is present in the DOM */
function hasRow(gridDiv: HTMLElement, rowIndex: number): boolean {
    return gridDiv.querySelector(`.ag-row[row-index="${rowIndex}"]`) !== null;
}

/** Returns whether a given cell is present in the DOM via row-index + col-id selectors */
function hasCell(gridDiv: HTMLElement, rowIndex: number, colId: string): boolean {
    return gridDiv.querySelector(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${colId}"]`) !== null;
}

describe('Cell Editing: full-row virtualization', () => {
    const gridMgr = new TestGridsManager({
        modules: [TextEditorModule, ScrollApiModule],
    });

    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
    });
    afterEach(() => {
        gridMgr.reset();
        vi.clearAllMocks();
    });

    // Regression: scrolling away from the editing row while in full-row edit mode
    // triggered virtual row/column recycling which caused onRowEditingStopped to fire
    // more than once when editing was eventually stopped.
    test('onRowEditingStopped fires exactly once after scrolling during full-row edit', async () => {
        const onRowEditingStopped = vi.fn();
        const onCellValueChanged = vi.fn();

        const api = await gridMgr.createGridAndWait('fullRowVirtualization', {
            rowData: makeRowData(),
            columnDefs,
            getRowId: (params) => params.data.id,
            defaultColDef: { editable: true, cellDataType: false },
            editType: 'fullRow',
            onRowEditingStopped,
            onCellValueChanged,
            // Must explicitly enable virtualisation — TestGridsManager disables it by default
            // because jsdom has no layout engine. The bug only manifests when row/column
            // recycling is active.
            suppressRowVirtualisation: false,
            suppressColumnVirtualisation: false,
            // Make scroll-triggered row redraws synchronous so virtualisation fires
            // immediately when scrollTop/scrollLeft change in jsdom.
            suppressAnimationFrame: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        // Start editing row 0 by double-clicking field1
        const firstCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field1'));
        await user.dblClick(firstCell);
        const input = await waitForInput(gridDiv, firstCell);

        // Type a new value into the editor — this becomes the pending edit value.
        // After scrolling (which re-invokes model.start() for virtualised columns),
        // this pending value must survive intact and be committed on stop.
        await user.clear(input);
        await user.type(input, 'edited-r0-c1');

        // ----- Verify initial state -----
        // Row 0 (editing) and a mid-range row (row 5) are both rendered.
        // Cells within those rows should also be present.
        expect(hasRow(gridDiv, 0)).toBe(true);
        expect(hasRow(gridDiv, 5)).toBe(true);
        expect(hasCell(gridDiv, 5, 'field1')).toBe(true);

        // ----- Scroll to the far end -----
        // Triggers row virtualisation recycling. The grid intentionally keeps the editing
        // row (row 0) in the DOM via doNotUnVirtualiseRow, so other rows virtualise while
        // the editing row remains.
        api.ensureIndexVisible(ROW_COUNT - 1);
        api.ensureColumnVisible(`field${COL_COUNT}`);
        await asyncSetTimeout(0);

        // Row virtualisation: row 5 and its cells must have been removed from the DOM.
        // Row 0 must stay (protected by doNotUnVirtualiseRow because it is being edited).
        expect(hasRow(gridDiv, 5)).toBe(false);
        expect(hasCell(gridDiv, 5, 'field1')).toBe(false);
        expect(hasRow(gridDiv, 0)).toBe(true);
        // Row near the bottom should now be rendered
        expect(hasRow(gridDiv, ROW_COUNT - 1)).toBe(true);

        // ----- Scroll back to origin -----
        api.ensureIndexVisible(0);
        api.ensureColumnVisible('field1');
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // After scrolling back, row 5 and its cells must be re-created in the DOM.
        expect(hasRow(gridDiv, 5)).toBe(true);
        expect(hasCell(gridDiv, 5, 'field1')).toBe(true);

        // ----- Stop editing by clicking on an unrelated cell -----
        // Clicking another row's cell triggers onCellFocusChanged which drives
        // the full-row editing strategy to clean up and fire rowEditingStopped.
        const anotherCell = getByTestId(gridDiv, agTestIdFor.cell('1', 'field1'));
        await user.click(anotherCell);
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        expect(onRowEditingStopped).toHaveBeenCalledTimes(1);
        expect(onRowEditingStopped.mock.calls[0][0].rowIndex).toBe(0);

        // The typed value must have survived the scroll cycle and been committed.
        // This verifies that model.start() (re-invoked by virtualisation recycling)
        // is idempotent and does not overwrite an already-started pending edit.
        const committedChanges = onCellValueChanged.mock.calls.map((c) => ({
            field: c[0].colDef.field,
            newValue: c[0].newValue,
        }));
        expect(committedChanges).toContainEqual({ field: 'field1', newValue: 'edited-r0-c1' });
    }, 15_000);
});

describe('Cell Editing: full-row virtualization (React)', () => {
    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    // Regression: scrolling away from the editing row while in full-row edit mode
    // triggered virtual row/column recycling which caused onRowEditingStopped to fire
    // more than once when editing was eventually stopped.
    // React rendering is async (cell editors are attached asynchronously), which makes
    // this scenario more susceptible to duplicate strategy.start() calls.
    test('onRowEditingStopped fires exactly once after scrolling during full-row edit', async () => {
        const onRowEditingStopped = vi.fn();

        let readyResolve!: (api: GridApi) => void;
        const readyPromise = new Promise<GridApi>((resolve) => {
            readyResolve = resolve;
        });

        render(
            <div style={{ width: 1000, height: 800 }}>
                <AgGridReact
                    rowData={makeRowData()}
                    columnDefs={columnDefs}
                    getRowId={(params) => params.data.id}
                    defaultColDef={{ editable: true, cellDataType: false }}
                    editType="fullRow"
                    onRowEditingStopped={onRowEditingStopped}
                    suppressRowVirtualisation={false}
                    suppressColumnVirtualisation={false}
                    suppressAnimationFrame={true}
                    modules={[ClientSideRowModelModule, TextEditorModule, ScrollApiModule]}
                    onGridReady={(params: GridReadyEvent) => readyResolve(params.api)}
                />
            </div>
        );

        const api = await readyPromise;
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        // Start editing row 0 by double-clicking field1
        const firstCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field1'));
        await user.dblClick(firstCell);
        await waitForInput(gridDiv, firstCell);

        // ----- Verify initial state -----
        expect(hasRow(gridDiv, 0)).toBe(true);
        expect(hasRow(gridDiv, 5)).toBe(true);
        expect(hasCell(gridDiv, 5, 'field1')).toBe(true);

        // ----- Scroll to the far end -----
        // In React, cell editor attachment is async, making this scenario prone to
        // duplicate strategy.start() calls pushed to startedRows.
        await act(async () => {
            api.ensureIndexVisible(ROW_COUNT - 1);
            api.ensureColumnVisible(`field${COL_COUNT}`);
            await asyncSetTimeout(0);
        });

        // Row virtualisation: row 5 must have been removed, editing row 0 must stay.
        expect(hasRow(gridDiv, 5)).toBe(false);
        expect(hasCell(gridDiv, 5, 'field1')).toBe(false);
        expect(hasRow(gridDiv, 0)).toBe(true);
        expect(hasRow(gridDiv, ROW_COUNT - 1)).toBe(true);

        // ----- Scroll back to origin -----
        await act(async () => {
            api.ensureIndexVisible(0);
            api.ensureColumnVisible('field1');
            await asyncSetTimeout(0);
        });
        await act(async () => {
            await asyncSetTimeout(0);
        });

        // After scrolling back, row 5 and its cells must be re-created.
        expect(hasRow(gridDiv, 5)).toBe(true);
        expect(hasCell(gridDiv, 5, 'field1')).toBe(true);

        // ----- Stop editing by clicking on an unrelated cell -----
        // Use raw DOM selector instead of getByTestId because setupAllTestIds is
        // debounced and may not have run yet for the re-created cells.
        const anotherCell = gridDiv.querySelector('.ag-row[row-index="1"] .ag-cell[col-id="field1"]') as HTMLElement;
        expect(anotherCell).toBeTruthy();

        await act(async () => {
            await user.click(anotherCell);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
        });

        expect(onRowEditingStopped).toHaveBeenCalledTimes(1);
        expect(onRowEditingStopped.mock.calls[0][0].rowIndex).toBe(0);
    }, 15_000);
});
