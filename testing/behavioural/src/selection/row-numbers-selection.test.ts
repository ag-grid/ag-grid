import { getByTestId } from '@testing-library/dom';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, RowNumbersModule } from 'ag-grid-enterprise';

import { TestGridsManager, assertSelectedCellRanges, asyncSetTimeout, waitForEvent } from '../test-utils';
import { GridActions } from './utils';

describe('Row Numbers Cell Selection', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, RowNumbersModule],
    });

    async function createGrid(go: GridOptions): Promise<[GridApi, GridActions]> {
        const api = gridMgr.createGrid('myGrid', go);
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        return [api, actions];
    }

    // Have to use touch instead of click because the grid only attaches touchstart in JSDOM
    function click(element: HTMLElement, options?: MouseEventInit): void {
        element.dispatchEvent(new MouseEvent('touchstart', { bubbles: true, ...options }));
    }

    beforeAll(() => {
        setupAgTestIds();
    });

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    const columnDefs = [{ field: 'sport' }, { field: 'year' }, { field: 'amount' }, { field: 'day' }];
    const rowData = [
        { sport: 'football', year: 2021, amount: 43, day: 'monday' },
        { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
        { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
        { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
        { sport: 'golf', year: 2021, amount: 7, day: 'monday' },
        { sport: 'swimming', year: 2020, amount: 93, day: 'tuesday' },
        { sport: 'rowing', year: 2019, amount: 32, day: 'saturday' },
    ];

    test('click row number selects row cells, clears existing range', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row2);
        assertSelectedCellRanges([{ rowEndIndex: 1, rowStartIndex: 1, columns }], api);
    });

    test('CTRL-click row number selects row cells additively', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 1, rowStartIndex: 1, columns },
            ],
            api
        );
    });

    test('CTRL-click row number deselects already-selected row cells', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row1, { ctrlKey: true });
        assertSelectedCellRanges([], api);
    });

    test('CTRL-click row number deselects, re-selecting does not merge with adjacent ranges', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const row3 = getByTestId(gridDiv, agTestIdFor.rowNumber('2'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        click(row3, { shiftKey: true });
        assertSelectedCellRanges([{ rowEndIndex: 2, rowStartIndex: 0, columns }], api);

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 2, rowStartIndex: 2, columns },
            ],
            api
        );

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 2, rowStartIndex: 2, columns },
                { rowEndIndex: 1, rowStartIndex: 1, columns },
            ],
            api
        );
    });

    test('SHIFT-click row number selects range of row cells', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row4 = getByTestId(gridDiv, agTestIdFor.rowNumber('3'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row4, { shiftKey: true });
        assertSelectedCellRanges([{ rowEndIndex: 3, rowStartIndex: 0, columns }], api);
    });

    test('CTRL-SHIFT-click row number selects range of row cells additively', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const row4 = getByTestId(gridDiv, agTestIdFor.rowNumber('3'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row4, { ctrlKey: true, shiftKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 3, rowStartIndex: 1, columns },
            ],
            api
        );
    });

    test('CTRL-click to deselect when range created bottom-up', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row4 = getByTestId(gridDiv, agTestIdFor.rowNumber('3'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row4);
        click(row1, { shiftKey: true });
        assertSelectedCellRanges([{ rowStartIndex: 3, rowEndIndex: 0, columns }], api);

        click(row1, { ctrlKey: true });
        assertSelectedCellRanges([{ rowStartIndex: 3, rowEndIndex: 1, columns }], api);

        click(row4, { ctrlKey: true });
        assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 1, columns }], api);
    });
});
