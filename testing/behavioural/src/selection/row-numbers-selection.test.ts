import { getByTestId } from '@testing-library/dom';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    KeyCode,
    ROW_NUMBERS_COLUMN_ID,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
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

describe('Row Numbers Keyboard Navigation', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, RowNumbersModule],
    });

    async function createGrid(go: GridOptions): Promise<GridApi> {
        const api = gridMgr.createGrid('myGrid', go);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        return api;
    }

    function pressKey(element: HTMLElement, key: string, opts?: KeyboardEventInit): void {
        element.dispatchEvent(new KeyboardEvent('keydown', { ...opts, key, bubbles: true }));
    }

    function getAriaAnnouncementText(gridDiv: HTMLElement): string {
        return gridDiv.querySelector('.ag-aria-description-container')?.textContent ?? '';
    }

    function getFocusedHeaderColId(): string | null {
        const activeElement = document.activeElement as HTMLElement | null;
        return activeElement?.closest('.ag-header-cell')?.getAttribute('col-id') ?? null;
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
    const dataColumns = columnDefs.map((colDef) => colDef.field!);
    const rowData = [
        { sport: 'football', year: 2021, amount: 43, day: 'monday' },
        { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
        { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
        { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
    ];

    test('Arrow Left from first data column navigates to row number cell', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedCell(0, 'sport');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.LEFT);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(0);
    });

    test('Arrow Right from row number cell navigates to first data column', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.RIGHT);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.column.getColId()).toBe('sport');
        expect(focused!.rowIndex).toBe(0);
    });

    test('Arrow Up/Down navigates within row number column', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        let focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;

        pressKey(focusedCell, KeyCode.DOWN);
        await asyncSetTimeout(0);

        let focused = api.getFocusedCell();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(1);

        focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        pressKey(focusedCell, KeyCode.DOWN);
        await asyncSetTimeout(0);

        focused = api.getFocusedCell();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(2);

        focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        pressKey(focusedCell, KeyCode.UP);
        await asyncSetTimeout(0);

        focused = api.getFocusedCell();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(1);
    });

    test('Tab can focus row number cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        // Focus the last column of row 0
        api.setFocusedCell(0, 'day');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;

        // Tab forward should wrap to next row and focus the row number column
        pressKey(focusedCell, KeyCode.TAB);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.rowIndex).toBe(1);
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
    });

    test('Tab from header into grid can focus row number cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedHeader('day');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const dayHeader = getByTestId(gridDiv, agTestIdFor.headerCell('day'));
        pressKey(dayHeader, KeyCode.TAB);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.rowIndex).toBe(0);
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
    });

    test('Row number header focus does not announce select-all hint when cell selection integration is disabled', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        rowNumberHeader.dispatchEvent(new Event('focus'));

        await asyncSetTimeout(300);

        expect(getAriaAnnouncementText(gridDiv)).toBe('');
    });

    test('Row number header focus does not announce column selection hint', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: { enableColumnSelection: true },
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        rowNumberHeader.dispatchEvent(new Event('focus'));

        await asyncSetTimeout(300);

        const announcement = getAriaAnnouncementText(gridDiv);
        expect(announcement).toContain('Press Space or Enter to select all cells');
        expect(announcement).not.toContain('Press Enter to toggle selection for all visible cells in this column');
    });

    test('Space on row number header selects all cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedHeader(ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        pressKey(rowNumberHeader, KeyCode.SPACE);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 3, columns: dataColumns }], api);
        expect(getFocusedHeaderColId()).toBe(ROW_NUMBERS_COLUMN_ID);
    });

    test('Enter on row number header selects all cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedHeader(ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        pressKey(rowNumberHeader, KeyCode.ENTER);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 3, columns: dataColumns }], api);
        expect(getFocusedHeaderColId()).toBe(ROW_NUMBERS_COLUMN_ID);
    });

    test('Space on row number cell does not select cells in that row', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.SPACE);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([], api);
    });

    test('Enter on row number cell selects all cells in that row', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedCell(2, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.ENTER);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 2, columns: dataColumns }], api);
    });

    test('Row number cell includes aria-rowindex attribute', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberCell = getByTestId(gridDiv, agTestIdFor.rowNumber('2'));

        expect(rowNumberCell.getAttribute('aria-rowindex')).toBe('4');
    });

    test('Row number cell focus announces select-row-cells hint', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(300);

        expect(getAriaAnnouncementText(gridDiv)).toContain('Press Enter to select all cells on this row');
    });

    test('Arrow navigation into row number cell does not clear an existing range', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.addCellRange({
            rowStartIndex: 0,
            rowEndIndex: 1,
            columnStart: 'sport',
            columnEnd: 'year',
        });

        api.setFocusedCell(0, 'sport');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.LEFT);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused?.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 1, columns: ['sport', 'year'] }], api);
    });

    test('Ctrl+Enter on row number cell supports add and remove selection', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER);
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 0, columns: dataColumns }], api);

        api.setFocusedCell(2, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER, { ctrlKey: true });
        await asyncSetTimeout(0);
        assertSelectedCellRanges(
            [
                { rowStartIndex: 0, rowEndIndex: 0, columns: dataColumns },
                { rowStartIndex: 2, rowEndIndex: 2, columns: dataColumns },
            ],
            api
        );

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER, { ctrlKey: true });
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 2, columns: dataColumns }], api);
    });

    test('Ctrl+Enter does not deselect with suppressMultiRanges', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: { suppressMultiRanges: true },
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER);
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 1, columns: dataColumns }], api);

        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER, { ctrlKey: true });
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 1, columns: dataColumns }], api);
    });

    test('Shift+Arrow Down from row number cell preserves full-row range', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER);
        await asyncSetTimeout(0);

        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.DOWN, { shiftKey: true });
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 2, columns: dataColumns }], api);
    });

    test('Shift+Arrow Left from first data column does not extend range into row number column', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });

        api.setFocusedCell(0, 'sport');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;

        // Shift+Left should not extend range into the row number column
        pressKey(focusedCell, KeyCode.LEFT, { shiftKey: true });
        await asyncSetTimeout(0);

        const ranges = api.getCellRanges();
        if (ranges && ranges.length > 0) {
            for (const range of ranges) {
                const rangeCols = range.columns.map((c) => c.getColId());
                expect(rangeCols).not.toContain(ROW_NUMBERS_COLUMN_ID);
            }
        }
    });
});
