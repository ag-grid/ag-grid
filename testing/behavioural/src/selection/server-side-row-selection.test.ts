import type { MockInstance } from 'vitest';

import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';
import { fakeFetch } from './group-data';
import { GridActions, assertSelectedRowElementsById, assertSelectedRowsByIndex, waitForEvent } from './utils';

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

    function createGrid(gridOptions: GridOptions): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions);
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    async function createGridAndWait(gridOptions: GridOptions): Promise<[GridApi, GridActions]> {
        const [api, actions] = createGrid(gridOptions);

        await waitForEvent('firstDataRendered', api);

        return [api, actions];
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                actions.toggleCheckboxByIndex(2);

                assertSelectedRowsByIndex([2], api);
            });

            test('Clicking two rows selects only the last clicked row', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5);

                assertSelectedRowsByIndex([5], api);
            });

            test("SHIFT-click doesn't select multiple rows in single row selection mode", async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5, { shiftKey: true });

                assertSelectedRowsByIndex([5], api);
            });

            test("CTRL-click doesn't select multiple rows in single row selection mode", async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5, { metaKey: true });

                assertSelectedRowsByIndex([5], api);
            });

            test('By default, prevents row from being selected when clicked', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([], api);
            });

            test('enableClickSelection allows row to be selected when clicked', async () => {
                const [api, actions] = await createGridAndWait({
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

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([2], api);
            });

            test('enableClickSelection="enableDeselection" allows deselection via CTRL-clicking', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'multiRow', enableClickSelection: 'enableDeselection' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowElementsById(['2'], api);

                actions.clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
            });

            test('un-selectable row cannot be selected', async () => {
                const [api, actions] = await createGridAndWait({
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

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
            });
        });

        describe('Multiple Row Selection', () => {
            test('un-selectable row cannot be selected', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data.sport !== 'football' },
                });

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { metaKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { shiftKey: true });
                assertSelectedRowsByIndex([], api);
            });

            test('row-clicks are ignored by default', async () => {
                const [api, actions] = await createGridAndWait({
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
                actions.selectRowsByIndex([2, 3], false);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([2, 3], api);
            });

            test('row-click on selected row clears previous selection', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: true,
                    },
                });

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([1, 3, 5], false);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([3], api);
            });

            test('row-click on unselected row clears previous selection', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: true,
                    },
                });

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([1, 3, 5], false);

                actions.clickRowByIndex(6);

                // Both rows should still be selected
                assertSelectedRowsByIndex([6], api);
            });

            test('must de-select with CTRL when `enableClickSelection: true`', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: true,
                    },
                });

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);

                actions.clickRowByIndex(3, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click selects multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                });

                test('Single click after multiple selection clears previous selection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.selectRowsByIndex([1, 3, 5], true);

                    actions.clickRowByIndex(2);

                    assertSelectedRowsByIndex([2], api);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.selectRowsByIndex([1, 3], false);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                });

                test('SHIFT-click within range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5], api);
                });

                test('SHIFT-click below range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5, 6], api);
                });

                test('SHIFT-click above range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);
                });

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test('SHIFT-click after select all selects range between clicked row and last clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.toggleHeaderCheckboxByIndex(0);

                    assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowElementsById(['2', '3', '4', '5'], api);
                });

                test('SHIFT-click after select all on pristine grid selects range between first row and clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.toggleHeaderCheckboxByIndex(0);

                    assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                    actions.clickRowByIndex(3, { shiftKey: true });

                    assertSelectedRowElementsById(['0', '1', '2', '3'], api);
                });

                test('SHIFT-click after select all behaves consistently', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(4, { shiftKey: true });

                    assertSelectedRowElementsById(['2', '3', '4'], api);

                    actions.toggleHeaderCheckboxByIndex(0);

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowElementsById(['2', '3', '4', '5', '6'], api);
                });

                test('Select all, then de-select, then SHIFT-click goes back to normal behaviour', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.toggleHeaderCheckboxByIndex(0);

                    // De-select a single row
                    actions.clickRowByIndex(3, { ctrlKey: true });

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowElementsById(['3', '4', '5', '6'], api);
                });
            });
        });

        describe('Multiple Row Selection with Click', () => {
            test('Select multiple rows without modifier keys', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });

                actions.clickRowByIndex(2);
                actions.clickRowByIndex(5);
                actions.clickRowByIndex(3);

                assertSelectedRowsByIndex([2, 5, 3], api);
            });

            test('De-select row with click', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });

                actions.selectRowsByIndex([1, 2, 3], true);

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([1, 3], api);
            });
        });

        describe('Checkbox selection', () => {
            test('Checkbox can be toggled on and off', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([1], api);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
            });

            test('Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([1], api);

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowsByIndex([1, 2], api);
            });

            test('Clicking a row selects it when `enableClickSelection` is false', async () => {
                const [api, actions] = await createGridAndWait({
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
                actions.clickRowByIndex(1);
                assertSelectedRowsByIndex([1], api);

                // toggle, not click, to assert inter-op
                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
            });

            test('Clicking a row does nothing when `enableClickSelection` is false', async () => {
                const [api, actions] = await createGridAndWait({
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
                actions.clickRowByIndex(1);
                assertSelectedRowsByIndex([], api);
            });

            test('Un-selectable checkboxes cannot be toggled', async () => {
                const [api, actions] = await createGridAndWait({
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

                actions.toggleCheckboxByIndex(4);

                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(5);
                assertSelectedRowsByIndex([5], api);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.selectRowsByIndex([1, 3], false);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range selection is preserved on checkbox toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                });

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });
            });
        });

        describe('Header checkbox selection', () => {
            test('can be used to select and deselect all rows', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            test('can select multiple pages of data', async () => {
                const [api, actions] = await createGridAndWait({
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

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            test('indeterminate selection state transitions to select all', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });

                actions.toggleCheckboxByIndex(3);
                assertSelectedRowElementsById(['3'], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['3', '0', '1', '2', '4', '5', '6'], api);
            });

            test('un-selectable rows are not part of the selection', async () => {
                const [api, actions] = await createGridAndWait({
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

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['1', '2', '3', '4', '5', '6'], api);
            });
        });

        describe('Group selection', () => {
            function getRowIdRaw(params: Pick<GetRowIdParams, 'api' | 'data' | 'parentKeys'>) {
                return getRowId({ ...params, level: -1, context: {} });
            }
            function getRowId(params: GetRowIdParams): string {
                return (params.parentKeys ?? []).join('-') + ':' + JSON.stringify(params.data);
            }
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
                getRowId,
            };

            test('clicking group row selects only that row', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow' },
                });

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
            });

            test('clicking group row with `groupSelects = "descendants"` enabled selects that row and all its children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                await actions.expandGroupRowByIndex(0);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((p) => getRowIdRaw({ ...p, api })),
                    api
                );

                // Can un-select child row
                actions.toggleCheckboxByIndex(1);

                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Gymnastics' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );

                // Toggling group row from indeterminate state selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );

                // Toggle group row again de-selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            // This behaviour is actually explicitly disabled because it doesn't work in CSRM
            // however, keep the test because it works (at time of writing) in SSRM and we may want
            // to bring this behaviour back
            test.skip('deselect group row with `groupSelects = "descendants"` and `enableClickSelection`', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants', enableClickSelection: true },
                });

                actions.clickRowByIndex(0);
                await actions.expandGroupRowByIndex(0);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );

                actions.clickRowByIndex(1, { ctrlKey: true });
                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Gymnastics' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "self"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Swimming' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "descendants"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
            });

            test('Selection state does not change when `isRowSelectable` changes', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Swimming' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    groupSelects: 'descendants',
                    isRowSelectable: (node) => node.data?.sport === 'Gymnastics',
                });

                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Swimming' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
            });

            test('Selection when `enableSelectionWithoutKeys` for defaultStrategy', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });

                await actions.expandGroupRowByIndex(0);

                actions.clickRowByIndex(1);
                actions.clickRowByIndex(2);

                assertSelectedRowElementsById(
                    [
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
            });

            // This behaviour is actually explicitly disabled because it doesn't work in CSRM
            // however, keep the test because it works (at time of writing) in SSRM and we may want
            // to bring this behaviour back
            test.skip('Selection when `enableSelectionWithoutKeys` for `groupSelects = "descendants"`', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        enableSelectionWithoutKeys: true,
                        enableClickSelection: true,
                    },
                });

                await actions.expandGroupRowByIndex(0);

                actions.clickRowByIndex(1);
                actions.clickRowByIndex(2);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
            });

            test('selecting footer node selects sibling (i.e. group node)', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    groupTotalRow: 'bottom',
                    rowSelection: {
                        mode: 'multiRow',
                    },
                });

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(3);

                assertSelectedRowElementsById([':{"country":"United States"}'], api);
            });

            test('selecting footer node selects sibling (i.e. group node) when `groupSelects = "descendants"`', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    groupTotalRow: 'bottom',
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                    },
                });

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(3);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.selectRowsByIndex([1, 3], false);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range selection is preserved on checkbox toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                });

                test('Range is extended upwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                });

                test('Range can be inverted', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                });

                test('Range spanning across groups when `groupSelects = "descendants"', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });

                    await actions.expandGroupRowByIndex(0);
                    await actions.expandGroupRowByIndex(3);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowElementsById(
                        [
                            { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                            { data: { country: 'Russia' } },
                            { parentKeys: ['Russia'], data: { sport: 'Gymnastics' } },
                        ].map((o) => getRowIdRaw({ ...o, api })),
                        api
                    );
                });

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                });

                test('CTRL+SHIFT-click defaults to selection when root is selected', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });

                test('CTRL+SHIFT-click within range allows batch deselection when `groupSelects: "descendants"`', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                });

                test('CTRL+SHIFT-click defaults to selection when root is selected when `groupSelects = "descendants"`', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                });
            });
        });
    });
});
