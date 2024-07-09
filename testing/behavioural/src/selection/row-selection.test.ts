import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { ViewportRowModelModule } from '@ag-grid-enterprise/viewport-row-model';

import { GROUP_ROW_DATA } from './data';

describe('ag-grid Selection State', () => {
    const columnDefs = [{ field: 'sport' }];
    const rowData = [
        { sport: 'football' },
        { sport: 'rugby' },
        { sport: 'tennis' },
        { sport: 'cricket' },
        { sport: 'golf' },
        { sport: 'swimming' },
        { sport: 'rowing' },
    ];
    let consoleErrorSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    function wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function createMyGrid(gridOptions: GridOptions): GridApi {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    async function createMyGridAndWait(gridOptions: GridOptions, waitMs = 60): Promise<GridApi> {
        const api = createMyGrid(gridOptions);
        await wait(waitMs);
        return api;
    }

    function resetGrid(): void {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    function getRow(index: number): HTMLElement | null {
        return document.getElementById('myGrid')!.querySelector(`[row-index=${index}]`);
    }

    function getCheckbox(index: number): HTMLElement | null {
        return document
            .getElementById('myGrid')!
            .querySelectorAll<HTMLElement>('.ag-selection-checkbox')
            .item(index)
            .querySelector('input[type=checkbox]');
    }

    function getHeaderCheckbox(index: number): HTMLElement | null {
        return document
            .getElementById('myGrid')!
            .querySelectorAll<HTMLElement>('.ag-header-select-all')
            .item(index)
            .querySelector('input[type=checkbox]');
    }

    function selectRows(indices: number[], api?: GridApi): void {
        for (const i of indices) {
            clickRow(i, { ctrlKey: true });
        }
        if (api !== undefined) {
            assertSelectedRows(indices, api);
        }
    }

    function clickRow(index: number, opts?: MouseEventInit): void {
        getRow(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    function toggleCheckbox(index: number, opts?: MouseEventInit): void {
        getCheckbox(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    function toggleHeaderCheckbox(index: number, opts?: MouseEventInit): void {
        getHeaderCheckbox(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    function assertSelectedRows(indices: number[], api: GridApi) {
        const actual = new Set(api.getSelectedNodes().map((n) => n.rowIndex));
        const expected = new Set(indices);
        expect(actual).toEqual(expected);
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ServerSideRowModelModule,
            ViewportRowModelModule,
            InfiniteRowModelModule,
            RowGroupingModule,
        ]);
    });

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        resetGrid();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    describe('User Interactions', () => {
        describe('Single Row Selection', () => {
            test('Select single row', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                clickRow(2);

                assertSelectedRows([2], api);
            });

            test('Clicking two rows selects only the last clicked row', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                clickRow(2);
                clickRow(5);

                assertSelectedRows([5], api);
            });

            test("SHIFT-click doesn't select multiple rows in single row selection mode", () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                clickRow(2);
                clickRow(5, { shiftKey: true });

                assertSelectedRows([5], api);
            });

            test("CTRL-click doesn't select multiple rows in single row selection mode", () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                clickRow(2);
                clickRow(5, { metaKey: true });

                assertSelectedRows([5], api);
            });

            test('suppressRowClickSelection prevents row from being selected when clicked', () => {
                const api = createMyGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    suppressRowClickSelection: true,
                });

                clickRow(2);

                assertSelectedRows([], api);
            });

            test('un-selectable row cannot be selected', () => {
                const api = createMyGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    isRowSelectable: (node) => node.data.sport !== 'football',
                });

                clickRow(0);
                assertSelectedRows([], api);
            });
        });

        describe('Multiple Row Selection', () => {
            test('un-selectable row cannot be selected', () => {
                const api = createMyGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'multiple',
                    isRowSelectable: (node) => node.data.sport !== 'football',
                });

                clickRow(0);
                assertSelectedRows([], api);

                clickRow(0, { metaKey: true });
                assertSelectedRows([], api);

                clickRow(0, { ctrlKey: true });
                assertSelectedRows([], api);

                clickRow(0, { shiftKey: true });
                assertSelectedRows([], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click selects multiple rows', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { metaKey: true });
                    clickRow(3, { ctrlKey: true });

                    assertSelectedRows([2, 5, 3], api);
                });

                test('Single click after multiple selection clears previous selection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    selectRows([1, 3, 5], api);

                    clickRow(2);

                    assertSelectedRows([2], api);
                });

                test('SHIFT-click selects range of rows', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { shiftKey: true });

                    assertSelectedRows([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    selectRows([1, 3], api);

                    clickRow(5, { shiftKey: true });

                    assertSelectedRows([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    selectRows([2, 4], api);

                    clickRow(1, { shiftKey: true });

                    assertSelectedRows([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(4, { shiftKey: true });
                    assertSelectedRows([4], api);

                    clickRow(6, { shiftKey: true });
                    assertSelectedRows([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(1);
                    clickRow(3, { shiftKey: true });
                    assertSelectedRows([1, 2, 3], api);

                    clickRow(5, { metaKey: true });
                    assertSelectedRows([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(1);
                    clickRow(4, { shiftKey: true });
                    assertSelectedRows([1, 2, 3, 4], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([1, 2, 4], api);

                    clickRow(2, { ctrlKey: true });
                    assertSelectedRows([1, 4], api);
                });

                test('Range is extended downwards from selection root', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(4, { shiftKey: true });
                    assertSelectedRows([2, 3, 4], api);

                    clickRow(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(6);
                    clickRow(4, { shiftKey: true });
                    assertSelectedRows([6, 4, 5], api);

                    clickRow(2, { shiftKey: true });
                    assertSelectedRows([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(4);
                    clickRow(6, { shiftKey: true });
                    assertSelectedRows([4, 5, 6], api);

                    clickRow(2, { shiftKey: true });
                    assertSelectedRows([2, 3, 4], api);
                });

                test.skip('SHIFT-click within range after de-selection resets root and clears previous selection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5, 6], api);

                    clickRow(5, { shiftKey: true });
                    assertSelectedRows([3, 4, 5], api);
                });

                test.skip('SHIFT-click below range after de-selection resets root and clears previous selection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    clickRow(6, { shiftKey: true });
                    assertSelectedRows([3, 4, 5, 6], api);
                });

                test.skip('SHIFT-click above range after de-selection resets root and clears previous selection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    clickRow(1, { shiftKey: true });
                    assertSelectedRows([1, 2, 3], api);
                });

                test.skip('META+SHIFT-click within range allows batch deselection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5, 6], api);

                    clickRow(5, { shiftKey: true, metaKey: true });
                    assertSelectedRows([2, 6], api);
                });

                test.skip('META+SHIFT-click below range allows batch deselection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    clickRow(6, { shiftKey: true, metaKey: true });
                    assertSelectedRows([2], api);
                });

                test.skip('META+SHIFT-click above range allows batch deselection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    clickRow(1, { shiftKey: true, metaKey: true });
                    assertSelectedRows([4, 5], api);
                });

                test.skip('CTRL+SHIFT-click within range allows batch deselection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5, 6], api);

                    clickRow(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([2, 6], api);
                });

                test.skip('CTRL+SHIFT-click below range allows batch deselection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    clickRow(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([2], api);
                });

                test.skip('CTRL+SHIFT-click above range allows batch deselection', () => {
                    const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    clickRow(2);
                    clickRow(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    clickRow(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    clickRow(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([4, 5], api);
                });
            });
        });

        describe('Multiple Row Selection with Click', () => {
            test('Select multiple rows without modifier keys', () => {
                const api = createMyGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'multiple',
                    rowMultiSelectWithClick: true,
                });

                clickRow(2);
                clickRow(5);
                clickRow(3);

                assertSelectedRows([2, 5, 3], api);
            });

            test('De-select row with click', () => {
                const api = createMyGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'multiple',
                    rowMultiSelectWithClick: true,
                });

                selectRows([1, 2, 3], api);

                clickRow(2);

                assertSelectedRows([1, 3], api);
            });
        });

        describe('Checkbox selection', () => {
            test('Checkbox can be toggled on and off', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                });

                toggleCheckbox(1);
                assertSelectedRows([1], api);

                toggleCheckbox(1);
                assertSelectedRows([], api);
            });

            test('Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                });

                toggleCheckbox(1);
                assertSelectedRows([1], api);

                toggleCheckbox(2);
                assertSelectedRows([1, 2], api);
            });

            test('Clicking a row still selects it when `suppressRowClickSelection` is false', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        checkboxSelection: true,
                        showDisabledCheckboxes: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                });

                // click, not toggle
                clickRow(1);
                assertSelectedRows([1], api);

                // toggle, not click, to assert inter-op
                toggleCheckbox(1);
                assertSelectedRows([], api);
            });

            test('Clicking a row does nothing when `suppressRowClickSelection` is true', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        checkboxSelection: true,
                        showDisabledCheckboxes: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    suppressRowClickSelection: true,
                });

                // click, not toggle
                clickRow(1);
                assertSelectedRows([], api);
            });

            test('Un-selectable checkboxes cannot be toggled', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        checkboxSelection: true,
                        showDisabledCheckboxes: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    isRowSelectable: (node) => node.data.sport !== 'golf',
                });

                toggleCheckbox(4);

                assertSelectedRows([], api);

                toggleCheckbox(5);
                assertSelectedRows([5], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { metaKey: true });
                    toggleCheckbox(3, { ctrlKey: true });

                    assertSelectedRows([2, 5, 3], api);
                });

                test('SHIFT-click selects range of rows', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });

                    assertSelectedRows([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    selectRows([1, 3], api);

                    toggleCheckbox(5, { shiftKey: true });

                    assertSelectedRows([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    selectRows([2, 4], api);

                    toggleCheckbox(1, { shiftKey: true });

                    assertSelectedRows([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([4], api);

                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(3, { shiftKey: true });
                    assertSelectedRows([1, 2, 3], api);

                    toggleCheckbox(5, { metaKey: true });
                    assertSelectedRows([1, 2, 3, 5], api);
                });

                test('Range selection is preserved on checkbox toggle', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(3, { shiftKey: true });
                    assertSelectedRows([1, 2, 3], api);

                    toggleCheckbox(5);
                    assertSelectedRows([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([1, 2, 3, 4], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([1, 2, 4], api);

                    toggleCheckbox(2, { ctrlKey: true });
                    assertSelectedRows([1, 4], api);
                });

                test('Range members can be un-selected with toggle', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([1, 2, 3, 4], api);

                    toggleCheckbox(3);
                    assertSelectedRows([1, 2, 4], api);
                });

                test('Range is extended downwards from selection root', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([2, 3, 4], api);

                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(6);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([6, 4, 5], api);

                    toggleCheckbox(2, { shiftKey: true });
                    assertSelectedRows([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(4);
                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([4, 5, 6], api);

                    toggleCheckbox(2, { shiftKey: true });
                    assertSelectedRows([2, 3, 4], api);
                });

                test('SHIFT can be used for range de-selection (Checkbox selection ONLY)', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([1, 2, 3, 4, 5], api);

                    toggleCheckbox(2);
                    assertSelectedRows([1, 3, 4, 5], api);

                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([1, 5], api);
                });

                test.skip('META+SHIFT-click within range allows batch deselection', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5, 6], api);

                    toggleCheckbox(5, { shiftKey: true, metaKey: true });
                    assertSelectedRows([2, 6], api);
                });

                test.skip('META+SHIFT-click below range allows batch deselection', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(6, { shiftKey: true, metaKey: true });
                    assertSelectedRows([2], api);
                });

                test.skip('META+SHIFT-click above range allows batch deselection', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(1, { shiftKey: true, metaKey: true });
                    assertSelectedRows([4, 5], api);
                });

                test.skip('CTRL+SHIFT-click within range allows batch deselection', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5, 6], api);

                    toggleCheckbox(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([2, 6], api);
                });

                test.skip('CTRL+SHIFT-click below range allows batch deselection', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([2], api);
                });

                test.skip('CTRL+SHIFT-click above range allows batch deselection', () => {
                    const api = createMyGrid({
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([4, 5], api);
                });
            });
        });

        describe('Header checkbox selection', () => {
            test('can be used to select and deselect all rows', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({ ...d, headerCheckboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                });

                toggleHeaderCheckbox(0);
                assertSelectedRows([0, 1, 2, 3, 4, 5, 6], api);

                toggleHeaderCheckbox(0);
                assertSelectedRows([], api);
            });

            test('can select multiple pages of data', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({ ...d, headerCheckboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                    pagination: true,
                    paginationPageSize: 5,
                });

                toggleHeaderCheckbox(0);
                assertSelectedRows([0, 1, 2, 3, 4, 5, 6], api);

                toggleHeaderCheckbox(0);
                assertSelectedRows([], api);
            });

            test('can select only current page of data', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                        headerCheckboxSelectionCurrentPageOnly: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    pagination: true,
                    paginationPageSize: 5,
                });

                toggleHeaderCheckbox(0);
                assertSelectedRows([0, 1, 2, 3, 4], api);

                toggleHeaderCheckbox(0);
                assertSelectedRows([], api);
            });

            test('can select only filtered data', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                        headerCheckboxSelectionFilteredOnly: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    pagination: true,
                    paginationPageSize: 5,
                });

                api.setGridOption('quickFilterText', 'ing');

                toggleHeaderCheckbox(0);
                assertSelectedRows([0, 1], api);

                api.setGridOption('quickFilterText', '');

                assertSelectedRows([5, 6], api);
            });

            test('indeterminate selection state transitions to select all', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                });

                selectRows([3], api);

                toggleHeaderCheckbox(0);
                assertSelectedRows([3, 0, 1, 2, 4, 5, 6], api);
            });

            test('un-selectable rows are not part of the selection', () => {
                const api = createMyGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    isRowSelectable: (node) => node.data.sport !== 'football',
                });

                toggleHeaderCheckbox(0);
                assertSelectedRows([1, 2, 3, 4, 5, 6], api);
            });
        });

        describe('Group checkbox selection', () => {
            const groupGridOptions: Partial<GridOptions> = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'age' },
                    { field: 'year' },
                    { field: 'date' },
                ],
                autoGroupColumnDef: {
                    headerName: 'Athlete',
                    field: 'athlete',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        checkbox: true,
                    },
                },
                rowData: GROUP_ROW_DATA,
                groupDefaultExpanded: -1,
            };

            test('clicking group row selects only that row', async () => {
                const api = await createMyGridAndWait({
                    ...groupGridOptions,
                    rowSelection: 'multiple',
                });

                toggleCheckbox(0);
                assertSelectedRows([0], api);
            });

            test('clicking group row with `groupSelectsChildren` enabled selects that row and all its children', async () => {
                const api = await createMyGridAndWait({
                    ...groupGridOptions,
                    rowSelection: 'multiple',
                    groupSelectsChildren: true,
                });

                // Group selects children
                toggleCheckbox(0);
                assertSelectedRows([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13], api);

                // Can un-select child row
                toggleCheckbox(4);
                assertSelectedRows([2, 3, 5, 6, 7, 8, 9, 10, 11, 13], api);

                // Toggling group row from indeterminate state selects all children
                toggleCheckbox(0);
                assertSelectedRows([2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 4], api);

                // Toggle group row again de-selects all children
                toggleCheckbox(0);
                assertSelectedRows([], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { metaKey: true });
                    toggleCheckbox(3, { ctrlKey: true });

                    assertSelectedRows([2, 5, 3], api);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });

                    assertSelectedRows([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    selectRows([1, 3], api);

                    toggleCheckbox(5, { shiftKey: true });

                    assertSelectedRows([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    selectRows([2, 4], api);

                    toggleCheckbox(1, { shiftKey: true });

                    assertSelectedRows([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([4], api);

                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(3, { shiftKey: true });
                    assertSelectedRows([1, 2, 3], api);

                    toggleCheckbox(5, { metaKey: true });
                    assertSelectedRows([1, 2, 3, 5], api);
                });

                test('Range selection is preserved on checkbox toggle', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(3, { shiftKey: true });
                    assertSelectedRows([1, 2, 3], api);

                    toggleCheckbox(5);
                    assertSelectedRows([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([1, 2, 3, 4], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([1, 2, 4], api);

                    toggleCheckbox(2, { ctrlKey: true });
                    assertSelectedRows([1, 4], api);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([1, 2, 3, 4], api);

                    toggleCheckbox(3);
                    assertSelectedRows([1, 2, 4], api);
                });

                test('Range is extended downwards from selection root', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([2, 3, 4], api);

                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(6);
                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([6, 4, 5], api);

                    toggleCheckbox(2, { shiftKey: true });
                    assertSelectedRows([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(4);
                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([4, 5, 6], api);

                    toggleCheckbox(2, { shiftKey: true });
                    assertSelectedRows([2, 3, 4], api);
                });

                test('SHIFT can be used for range de-selection (Checkbox selection ONLY)', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(1);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([1, 2, 3, 4, 5], api);

                    toggleCheckbox(2);
                    assertSelectedRows([1, 3, 4, 5], api);

                    toggleCheckbox(4, { shiftKey: true });
                    assertSelectedRows([1, 5], api);
                });

                test.skip('META+SHIFT-click within range allows batch deselection', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5, 6], api);

                    toggleCheckbox(5, { shiftKey: true, metaKey: true });
                    assertSelectedRows([2, 6], api);
                });

                test.skip('META+SHIFT-click below range allows batch deselection', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(6, { shiftKey: true, metaKey: true });
                    assertSelectedRows([2], api);
                });

                test.skip('META+SHIFT-click above range allows batch deselection', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(1, { shiftKey: true, metaKey: true });
                    assertSelectedRows([4, 5], api);
                });

                test.skip('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(6, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5, 6], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5, 6], api);

                    toggleCheckbox(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([2, 6], api);
                });

                test.skip('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([2], api);
                });

                test.skip('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const api = await createMyGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });

                    toggleCheckbox(2);
                    toggleCheckbox(5, { shiftKey: true });
                    assertSelectedRows([2, 3, 4, 5], api);

                    toggleCheckbox(3, { metaKey: true });
                    assertSelectedRows([2, 4, 5], api);

                    toggleCheckbox(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRows([4, 5], api);
                });
            });
        });
    });

    describe('Selection API', () => {
        describe('setNodesSelected', () => {
            test('Select single row in single selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[3]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();

                expect(selectedNodes).toHaveLength(1);
                expect(selectedNodes[0]).toBe(toSelect[0]);
            });

            test('Select single row in multiple selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[3]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();
                expect(selectedNodes).toHaveLength(1);
                expect(selectedNodes[0]).toBe(toSelect[0]);
            });

            test('Cannot select multiple rows in single selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[0], nodes[3], nodes[1]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();

                expect(selectedNodes).toHaveLength(0);
                expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            });

            test('Can select multiple rows in multiple selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[5], nodes[4], nodes[2]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();
                expect(selectedNodes).toHaveLength(3);
            });
        });

        describe('selectAll', () => {
            test('Can select all rows in single selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                api.selectAll();

                expect(api.getSelectedNodes().length).toBe(rowData.length);
                expect(consoleWarnSpy).not.toHaveBeenCalled();

                api.deselectAll();
                expect(api.getSelectedNodes().length).toBe(0);
            });

            test('Can select all rows in multiple selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                api.selectAll();

                expect(api.getSelectedNodes().length).toBe(rowData.length);

                api.deselectAll();
                expect(api.getSelectedNodes().length).toBe(0);
            });
        });

        describe('selectAllOnCurrentPage', () => {
            test('Can select all rows on current page in single selection mode', () => {
                const api = createMyGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    pagination: true,
                    paginationPageSize: 5,
                });

                api.selectAllOnCurrentPage();

                assertSelectedRows([0, 1, 2, 3, 4], api);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            test('Can deselect only rows on current page in single selection mode', () => {
                const api = createMyGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    pagination: true,
                    paginationPageSize: 5,
                });

                api.selectAll();
                api.deselectAllOnCurrentPage();

                assertSelectedRows([5, 6], api);
            });
        });

        describe('selectAllFiltered', () => {
            test('Can select all filtered rows in single selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                api.setGridOption('quickFilterText', 'ing');

                api.selectAllFiltered();
                const selectedNodes = api.getSelectedNodes();

                expect(selectedNodes.length).toBe(2);
            });

            test('Can deselect filtered rows only in single selection mode', () => {
                const api = createMyGrid({ columnDefs, rowData, rowSelection: 'single' });

                api.selectAll();

                api.setGridOption('quickFilterText', 'ing');

                api.deselectAllFiltered();

                api.setGridOption('quickFilterText', '');

                assertSelectedRows([0, 1, 2, 3, 4], api);
            });
        });
    });
});
