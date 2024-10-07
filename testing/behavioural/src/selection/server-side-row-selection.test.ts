import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';
import { GridRowsDiagramTree } from '../test-utils/gridRows/gridRowsDiagramTree';
import { fakeFetch } from './data';
import {
    assertSelectedRowElementsById,
    assertSelectedRowsByIndex,
    clickRowByIndex,
    expandGroupRowByIndex,
    selectRowsByIndex,
    toggleCheckboxByIndex,
    toggleHeaderCheckboxByIndex,
    waitForEvent,
} from './utils';

function draw(api: GridApi) {
    const gr = new GridRows(api);
    const tr = new GridRowsDiagramTree(gr);
    console.log(tr.diagramToString(false, null));
}

describe('Row Selection Grid Options', () => {
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
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    function createGrid(gridOptions: GridOptions): GridApi {
        return gridMgr.createGrid('myGrid', gridOptions);
    }

    async function createGridAndWait(gridOptions: GridOptions): Promise<GridApi> {
        const api = createGrid(gridOptions);

        return new Promise((resolve) => api.addEventListener('firstDataRendered', () => resolve(api)));
    }

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ServerSideRowModelModule],
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

    describe('User Interactions', () => {
        describe('Single Row Selection', () => {
            test('Select single row', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                toggleCheckboxByIndex(2);

                assertSelectedRowsByIndex([2], api);
            });

            test('Clicking two rows selects only the last clicked row', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                toggleCheckboxByIndex(2);
                toggleCheckboxByIndex(5);

                assertSelectedRowsByIndex([5], api);
            });

            test("SHIFT-click doesn't select multiple rows in single row selection mode", async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                toggleCheckboxByIndex(2);
                toggleCheckboxByIndex(5, { shiftKey: true });

                assertSelectedRowsByIndex([5], api);
            });

            test("CTRL-click doesn't select multiple rows in single row selection mode", async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                toggleCheckboxByIndex(2);
                toggleCheckboxByIndex(5, { metaKey: true });

                assertSelectedRowsByIndex([5], api);
            });

            test('By default, prevents row from being selected when clicked', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                clickRowByIndex(2);

                assertSelectedRowsByIndex([], api);
            });

            test('enableClickSelection allows row to be selected when clicked', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: {
                        mode: 'singleRow',
                        enableClickSelection: true,
                    },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                clickRowByIndex(2);

                assertSelectedRowsByIndex([2], api);
            });

            test('enableClickSelection="enableDeselection" allows deselection via clicking', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'multiRow', enableClickSelection: 'enableDeselection' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                toggleCheckboxByIndex(2);
                assertSelectedRowsByIndex([2], api);

                clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
            });

            test('un-selectable row cannot be selected', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowSelection: {
                        mode: 'singleRow',
                        isRowSelectable: (node) => node.data.sport !== 'football',
                    },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
            });
        });

        describe('Multiple Row Selection', () => {
            test('un-selectable row cannot be selected', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data.sport !== 'football' },
                });

                toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                toggleCheckboxByIndex(0, { metaKey: true });
                assertSelectedRowsByIndex([], api);

                toggleCheckboxByIndex(0, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);

                toggleCheckboxByIndex(0, { shiftKey: true });
                assertSelectedRowsByIndex([], api);
            });

            test('row-click interaction with multiple selected rows', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                    },
                });

                // Select two rows by toggling checkboxes
                selectRowsByIndex([2, 3], false, api);

                clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([2, 3], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click selects multiple rows', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { metaKey: true });
                    toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                });

                test('Single click after multiple selection clears previous selection', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    selectRowsByIndex([1, 3, 5], true, api);

                    clickRowByIndex(2);

                    assertSelectedRowsByIndex([2], api);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    selectRowsByIndex([1, 3], false, api);

                    toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    selectRowsByIndex([2, 4], false, api);

                    toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                });

                test('Range is extended downwards from selection root', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(6);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(4);
                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                });

                test.skip('SHIFT-click within range after de-selection resets root and clears previous selection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5], api);
                });

                test.skip('SHIFT-click below range after de-selection resets root and clears previous selection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5, 6], api);
                });

                test.skip('SHIFT-click above range after de-selection resets root and clears previous selection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    clickRowByIndex(1, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);
                });

                test.skip('META+SHIFT-click within range allows batch deselection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    clickRowByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test.skip('META+SHIFT-click below range allows batch deselection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    clickRowByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test.skip('META+SHIFT-click above range allows batch deselection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    clickRowByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test.skip('CTRL+SHIFT-click within range allows batch deselection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    clickRowByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test.skip('CTRL+SHIFT-click below range allows batch deselection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    clickRowByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test.skip('CTRL+SHIFT-click above range allows batch deselection', () => {
                    const api = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });

                    clickRowByIndex(2);
                    clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    clickRowByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });
            });
        });

        describe('Multiple Row Selection with Click', () => {
            test('Select multiple rows without modifier keys', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });

                clickRowByIndex(2);
                clickRowByIndex(5);
                clickRowByIndex(3);

                assertSelectedRowsByIndex([2, 5, 3], api);
            });

            test('De-select row with click', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });

                selectRowsByIndex([1, 2, 3], true, api);

                clickRowByIndex(2);

                assertSelectedRowsByIndex([1, 3], api);
            });
        });

        describe('Checkbox selection', () => {
            test('Checkbox can be toggled on and off', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });

                toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([1], api);

                toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
            });

            test('Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });

                toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([1], api);

                toggleCheckboxByIndex(2);
                assertSelectedRowsByIndex([1, 2], api);
            });

            test('Clicking a row selects it when `enableClickSelection` is false', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                        hideDisabledCheckboxes: false,
                        enableClickSelection: true,
                    },
                });

                // click, not toggle
                clickRowByIndex(1);
                assertSelectedRowsByIndex([1], api);

                // toggle, not click, to assert inter-op
                toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
            });

            test('Clicking a row does nothing when `enableClickSelection` is false', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                        enableClickSelection: false,
                    },
                });

                // click, not toggle
                clickRowByIndex(1);
                assertSelectedRowsByIndex([], api);
            });

            test('Un-selectable checkboxes cannot be toggled', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                        isRowSelectable: (node) => node.data.sport !== 'golf',
                    },
                });

                toggleCheckboxByIndex(4);

                assertSelectedRowsByIndex([], api);

                toggleCheckboxByIndex(5);
                assertSelectedRowsByIndex([5], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { metaKey: true });
                    toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    selectRowsByIndex([1, 3], false, api);

                    toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    selectRowsByIndex([2, 4], false, api);

                    toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range selection is preserved on checkbox toggle', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                });

                test('Range is extended downwards from selection root', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(6);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(4);
                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                });

                test('SHIFT can be used for range de-selection (Checkbox selection ONLY)', async () => {
                    const api = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4, 5], api);

                    toggleCheckboxByIndex(2);
                    assertSelectedRowsByIndex([1, 3, 4, 5], api);

                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 5], api);
                });

                test.skip('META+SHIFT-click within range allows batch deselection', () => {
                    const api = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    toggleCheckboxByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test.skip('META+SHIFT-click below range allows batch deselection', () => {
                    const api = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test.skip('META+SHIFT-click above range allows batch deselection', () => {
                    const api = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test.skip('CTRL+SHIFT-click within range allows batch deselection', () => {
                    const api = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test.skip('CTRL+SHIFT-click below range allows batch deselection', () => {
                    const api = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test.skip('CTRL+SHIFT-click above range allows batch deselection', () => {
                    const api = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });
            });
        });

        describe('Header checkbox selection', () => {
            test('can be used to select and deselect all rows', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });

                toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            test('can select multiple pages of data', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                    pagination: true,
                    paginationPageSize: 5,
                });

                toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            test('indeterminate selection state transitions to select all', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });

                toggleCheckboxByIndex(3);
                assertSelectedRowElementsById(['3'], api);

                toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['3', '0', '1', '2', '4', '5', '6'], api);
            });

            test('un-selectable rows are not part of the selection', async () => {
                const api = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        headerCheckbox: true,
                        isRowSelectable: (node) => node.data.sport !== 'football',
                    },
                });

                toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['1', '2', '3', '4', '5', '6'], api);
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
                },
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows(params) {
                        const data = fakeFetch(params.request);
                        return params.success({ rowData: data, rowCount: data.length });
                    },
                },
                getRowId(params) {
                    return JSON.stringify(params.data);
                },
            };

            test('clicking group row selects only that row', async () => {
                const api = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow' },
                });

                toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
            });

            test('clicking group row with `groupSelects = "descendants"` enabled selects that row and all its children', async () => {
                const api = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });

                // Group selects children
                toggleCheckboxByIndex(0);
                const updated = waitForEvent('modelUpdated', api, 2); // attach listener first
                expandGroupRowByIndex(0);
                await updated;

                assertSelectedRowElementsById(
                    [
                        { country: 'United States' },
                        { sport: 'Swimming' },
                        { sport: 'Gymnastics' },
                        { sport: 'Speed Skating' },
                        { sport: 'Cross Country Skiing' },
                    ].map((r) => JSON.stringify(r)),
                    api
                );

                // Can un-select child row
                toggleCheckboxByIndex(4);
                assertSelectedRowElementsById(
                    [{ sport: 'Swimming' }, { sport: 'Gymnastics' }, { sport: 'Speed Skating' }].map((r) =>
                        JSON.stringify(r)
                    ),
                    api
                );

                // Toggling group row from indeterminate state selects all children
                toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        { country: 'United States' },
                        { sport: 'Swimming' },
                        { sport: 'Gymnastics' },
                        { sport: 'Speed Skating' },
                        { sport: 'Cross Country Skiing' },
                    ].map((r) => JSON.stringify(r)),
                    api
                );

                // Toggle group row again de-selects all children
                toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "self"', async () => {
                const api = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                const updated = waitForEvent('modelUpdated', api, 2); // attach listener first
                expandGroupRowByIndex(0);
                await updated;

                toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);

                toggleCheckboxByIndex(1);
                assertSelectedRowElementsById(
                    [{ sport: 'Swimming' }].map((r) => JSON.stringify(r)),
                    api
                );
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "descendants"', async () => {
                const api = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                const updated = waitForEvent('modelUpdated', api, 2); // attach listener first
                expandGroupRowByIndex(0);
                await updated;

                toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            test.only('Selection state changes when `isRowSelectable` changes', async () => {
                const api = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                const updated = waitForEvent('modelUpdated', api, 2); // attach listener first
                expandGroupRowByIndex(0);
                await updated;

                toggleCheckboxByIndex(1);
                assertSelectedRowElementsById(
                    [{ sport: 'Swimming' }].map((r) => JSON.stringify(r)),
                    api
                );

                draw(api);
                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    groupSelects: 'descendants',
                    isRowSelectable: (node) => node.data?.sport === 'Gymnastics',
                });
                draw(api);

                assertSelectedRowElementsById([], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { metaKey: true });
                    toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    selectRowsByIndex([1, 3], false, api);

                    toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    selectRowsByIndex([2, 4], false, api);

                    toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range selection is preserved on checkbox toggle', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                });

                test('Range is extended downwards from selection root', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(6);
                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(4);
                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                });

                test('SHIFT can be used for range de-selection (Checkbox selection ONLY)', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(1);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4, 5], api);

                    toggleCheckboxByIndex(2);
                    assertSelectedRowsByIndex([1, 3, 4, 5], api);

                    toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 5], api);
                });

                test.skip('META+SHIFT-click within range allows batch deselection', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    toggleCheckboxByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test.skip('META+SHIFT-click below range allows batch deselection', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test.skip('META+SHIFT-click above range allows batch deselection', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test.skip('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test.skip('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test.skip('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const api = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    toggleCheckboxByIndex(2);
                    toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    toggleCheckboxByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });
            });
        });
    });
});
