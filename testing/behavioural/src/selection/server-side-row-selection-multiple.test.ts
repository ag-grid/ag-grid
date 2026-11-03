import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, assertSelectedRowsByIndex, clipboardUtils, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, IRowNode, RowSelectedEvent } from 'ag-grid-community';
import { TextEditorModule, _createInternalFeatureFlagsModule } from 'ag-grid-community';
import { CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import {
    columnDefs,
    createGridAndWait,
    rowData,
    setupServerSideRowSelectionSuite,
} from './serverSideRowSelectionHarness';

const clickToggleSelection = { modules: [_createInternalFeatureFlagsModule({ clickToggleSelection: true })] };

describe('Row Selection Grid Options', () => {
    describe('User Interactions', () => {
        setupServerSideRowSelectionSuite();

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
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable row cannot be selected setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { metaKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { shiftKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `un-selectable row cannot be selected final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('selecting only un-selectable rows through the API emits no selectionChanged', async () => {
                const [api] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data.sport !== 'football' },
                });
                const sources: string[] = [];
                api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                api.setNodesSelected({ nodes: [api.getRowNode('0')!], newValue: true, source: 'api' });
                api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true, source: 'checkboxSelected' });

                await waitFor(() => expect(sources).toEqual(['checkboxSelected']));
                assertSelectedRowsByIndex([1], api);
            });

            const turnsUnselectable = [
                'an isRowSelectable change',
                'a cell edit',
                'a transaction',
                'a reload',
            ] as const;
            describe.each(['self', 'descendants'] as const)('groupSelects %s', (groupSelects) => {
                async function createSportsGrid(isRowSelectable: (node: IRowNode) => boolean) {
                    const serverRows = [
                        { id: 'a', sport: 'rugby' },
                        { id: 'b', sport: 'tennis' },
                        { id: 'c', sport: 'golf' },
                    ];
                    const [api] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        getRowId: (params) => params.data.id,
                        serverSideDatasource: {
                            getRows(params) {
                                const rows = serverRows.map((row) => ({ ...row }));
                                setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 0);
                            },
                        },
                        rowSelection: { mode: 'multiRow', groupSelects, isRowSelectable },
                    });
                    await waitForNoLoadingRows(api);
                    return { api, serverRows };
                }

                async function makeRugbyUnselectable(
                    path: (typeof turnsUnselectable)[number],
                    api: GridApi,
                    serverRows: { id: string; sport: string }[]
                ) {
                    if (path === 'an isRowSelectable change') {
                        api.setGridOption('rowSelection', {
                            mode: 'multiRow',
                            groupSelects,
                            isRowSelectable: (node) => node.data.sport !== 'rugby',
                        });
                    } else if (path === 'a cell edit') {
                        api.getRowNode('a')!.setDataValue('sport', 'football');
                    } else if (path === 'a transaction') {
                        api.applyServerSideTransaction({ update: [{ id: 'a', sport: 'football' }] });
                    } else {
                        serverRows[0].sport = 'football';
                        api.refreshServerSide({ purge: true });
                        await waitFor(() => expect(api.getRowNode('a')?.data.sport).toBe('football'));
                    }
                }

                test.each(turnsUnselectable)(
                    'a selected row is deselected when %s makes it un-selectable',
                    async (path) => {
                        const { api, serverRows } = await createSportsGrid((node) => node.data.sport !== 'football');
                        api.setNodesSelected({ nodes: [api.getRowNode('a')!, api.getRowNode('b')!], newValue: true });
                        const sources: string[] = [];
                        api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                        await makeRugbyUnselectable(path, api, serverRows);

                        await waitFor(() => expect(sources).toEqual(['selectableChanged']));
                        expect(api.getRowNode('a')!.isSelected()).toBe(false);
                        expect(api.getRowNode('b')!.isSelected()).toBe(true);
                    }
                );

                test('a reload that makes a selected row un-selectable emits no rowSelected for the reloaded rows', async () => {
                    const grid = await createSportsGrid((node) => node.data.sport !== 'football');
                    const api = grid.api;
                    api.setNodesSelected({ nodes: [api.getRowNode('a')!, api.getRowNode('b')!], newValue: true });
                    const sources: string[] = [];
                    api.addEventListener('selectionChanged', (event) => sources.push(event.source));
                    const rowSelectedIds: (string | undefined)[] = [];
                    api.addEventListener('rowSelected', (event) => rowSelectedIds.push(event.node.id));

                    await makeRugbyUnselectable('a reload', api, grid.serverRows);

                    await waitFor(() => expect(sources).toEqual(['selectableChanged']));
                    expect(rowSelectedIds).toEqual([]);
                });

                test('an isRowSelectable change that makes two selected rows un-selectable deselects both and emits one selectionChanged', async () => {
                    const api = (await createSportsGrid((node) => node.data.sport !== 'football')).api;
                    api.setNodesSelected({ nodes: [api.getRowNode('c')!], newValue: true });
                    const stateWithOnlyGolf = api.getServerSideSelectionState();
                    api.setNodesSelected({ nodes: ['a', 'b'].map((id) => api.getRowNode(id)!), newValue: true });
                    const sources: string[] = [];
                    api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                    api.setGridOption('rowSelection', {
                        mode: 'multiRow',
                        groupSelects,
                        isRowSelectable: (node) => node.data.sport === 'golf',
                    });

                    await waitFor(() => expect(sources).toEqual(['selectableChanged']));
                    expect(['a', 'b', 'c'].map((id) => api.getRowNode(id)!.isSelected())).toEqual([false, false, true]);
                    expect(api.getServerSideSelectionState()).toEqual(stateWithOnlyGolf);
                });

                test('after select all, a row an edit makes un-selectable is deselected', async () => {
                    const api = (await createSportsGrid((node) => node.data.sport !== 'football')).api;
                    api.selectAll();
                    const selectionState = api.getServerSideSelectionState();
                    const sources: string[] = [];
                    api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                    api.getRowNode('a')!.setDataValue('sport', 'football');

                    await waitFor(() => expect(sources).toEqual(['selectableChanged']));
                    expect(['a', 'b', 'c'].map((id) => api.getRowNode(id)!.isSelected())).toEqual([false, true, true]);
                    expect(api.getServerSideSelectionState()).toEqual(selectionState);
                });

                test('after select all, a row an edit makes selectable again shows selected again', async () => {
                    const api = (await createSportsGrid((node) => node.data.sport !== 'football')).api;
                    api.selectAll();
                    api.getRowNode('a')!.setDataValue('sport', 'football');
                    const sources: string[] = [];
                    api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                    api.getRowNode('a')!.setDataValue('sport', 'rugby');

                    await waitFor(() => expect(sources).toEqual(['selectableChanged']));
                    expect(['a', 'b', 'c'].map((id) => api.getRowNode(id)!.isSelected())).toEqual([true, true, true]);
                });

                test('after select all, deselecting a row again once it is un-selectable keeps it deselected', async () => {
                    const api = (await createSportsGrid((node) => node.data.sport !== 'football')).api;
                    api.selectAll();
                    api.setNodesSelected({ nodes: [api.getRowNode('a')!], newValue: false });
                    api.getRowNode('a')!.setDataValue('sport', 'football');
                    const selectionState = api.getServerSideSelectionState();

                    api.setNodesSelected({ nodes: [api.getRowNode('a')!], newValue: false });

                    expect(api.getServerSideSelectionState()).toEqual(selectionState);
                    api.getRowNode('a')!.setDataValue('sport', 'rugby');
                    expect(api.getRowNode('a')!.isSelected()).toBe(false);
                });

                test('a selection state naming a loaded row isRowSelectable rejects does not select it', async () => {
                    const api = (await createSportsGrid((node) => node.data.sport !== 'football')).api;
                    api.setNodesSelected({ nodes: [api.getRowNode('a')!, api.getRowNode('b')!], newValue: true });
                    const stateWithRugby = api.getServerSideSelectionState()!;
                    api.setNodesSelected({ nodes: [api.getRowNode('a')!], newValue: false });
                    const stateWithoutRugby = api.getServerSideSelectionState();
                    api.deselectAll();
                    api.getRowNode('a')!.setDataValue('sport', 'football');

                    const sources: string[] = [];
                    api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                    api.setServerSideSelectionState(stateWithRugby);

                    await waitFor(() => expect(sources).toEqual(['api']));
                    expect(api.getServerSideSelectionState()).toEqual(stateWithoutRugby);
                    expect(api.getRowNode('a')!.isSelected()).toBe(false);
                    expect(api.getRowNode('b')!.isSelected()).toBe(true);
                });

                test('a paste whose first cell rejects a selected row and whose last accepts it again keeps it selected', async () => {
                    const [api] = await createGridAndWait(
                        {
                            columnDefs: [
                                { field: 'sport', editable: true },
                                { field: 'country', editable: true },
                            ],
                            cellSelection: true,
                            rowModelType: 'serverSide',
                            getRowId: (params) => params.data.id,
                            serverSideDatasource: {
                                getRows(params) {
                                    const rows = [
                                        { id: 'a', sport: 'rugby', country: 'Wales' },
                                        { id: 'b', sport: 'tennis', country: 'Spain' },
                                    ];
                                    setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 0);
                                },
                            },
                            rowSelection: {
                                mode: 'multiRow',
                                groupSelects,
                                isRowSelectable: (node) =>
                                    (node.data.sport === 'none') === (node.data.country === 'none'),
                            },
                        },
                        { modules: [ClipboardModule, CellSelectionModule, TextEditorModule] }
                    );
                    await waitForNoLoadingRows(api);
                    const rowA = api.getRowNode('a')!;
                    api.setNodesSelected({ nodes: [rowA], newValue: true });
                    const selectionState = api.getServerSideSelectionState();

                    clipboardUtils.init();
                    clipboardUtils.setText('none\tnone');
                    api.setFocusedCell(0, 'sport');
                    const pasteEnd = waitForEvent('pasteEnd', api);
                    api.pasteFromClipboard();
                    await pasteEnd;
                    clipboardUtils.reset();

                    expect(rowA.data).toEqual({ id: 'a', sport: 'none', country: 'none' });
                    expect(rowA.isSelected()).toBe(true);
                    expect(api.getServerSideSelectionState()).toEqual(selectionState);
                });

                test('a transaction removing a selected row and making another un-selectable emits one rowDataChanged', async () => {
                    const api = (await createSportsGrid((node) => node.data.sport !== 'football')).api;
                    api.setNodesSelected({ nodes: ['a', 'b', 'c'].map((id) => api.getRowNode(id)!), newValue: true });
                    const sources: string[] = [];
                    api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                    api.applyServerSideTransaction({ update: [{ id: 'a', sport: 'football' }], remove: [{ id: 'c' }] });

                    await waitFor(() => expect(sources).toEqual(['rowDataChanged']));
                    expect(['a', 'b'].map((id) => api.getRowNode(id)!.isSelected())).toEqual([false, true]);
                });
            });

            test('one rowSelection change switching groupSelects and rejecting a selected row emits one selectionChanged', async () => {
                const [api] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    getRowId: (params) => params.data.id,
                    serverSideDatasource: {
                        getRows(params) {
                            const rows = [
                                { id: 'a', sport: 'rugby' },
                                { id: 'b', sport: 'tennis' },
                            ];
                            return params.success({ rowData: rows, rowCount: rows.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow' },
                });
                api.setNodesSelected({ nodes: [api.getRowNode('a')!, api.getRowNode('b')!], newValue: true });
                const sources: string[] = [];
                api.addEventListener('selectionChanged', (event) => sources.push(event.source));

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    groupSelects: 'descendants',
                    isRowSelectable: (node) => node.data.sport !== 'rugby',
                });

                await waitFor(() => expect(sources).toEqual(['api']));
                expect(['a', 'b'].map((id) => api.getRowNode(id)!.isSelected())).toEqual([false, false]);
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
                await new GridRows(api, `row-clicks are ignored by default setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([2, 3], false);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([2, 3], api);
                await new GridRows(api, `row-clicks are ignored by default final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
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
                await new GridRows(api, `row-click on selected row clears previous selection final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
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
                await new GridRows(api, `row-click on unselected row clears previous selection final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF selected id:6 sport:"rowing"
                `);
            });

            test('with click toggle, clicking the only selected row deselects it', async () => {
                const [api, actions] = await createGridAndWait(
                    {
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
                    },
                    clickToggleSelection
                );

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([], api);
            });

            test('with click toggle, clicking a selected row still reduces a wider selection to it', async () => {
                const [api, actions] = await createGridAndWait(
                    {
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
                    },
                    clickToggleSelection
                );

                actions.selectRowsByIndex([1, 3, 5], false);

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);
                await new GridRows(
                    api,
                    `with click toggle, clicking a selected row still reduces a wider selection to it after reducing`
                ).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([], api);
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
                await new GridRows(api, `must de-select with CTRL when _enableClickSelection: true_ final state`).check(
                    `
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `
                );
            });

            // Multi-row is where deselect-by-click has to leave the *other* selections alone; the single-row
            // suite covers the option's one-row case.
            test('enableClickSelection="enableDeselection" deselects only the clicked row', async () => {
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
                actions.toggleCheckboxByIndex(5);
                assertSelectedRowsByIndex([2, 5], api);

                actions.clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([5], api);

                // An unselected row still cannot be selected by clicking, which is what separates
                // `enableDeselection` from `enableClickSelection: true`.
                actions.clickRowByIndex(3, { ctrlKey: true });
                assertSelectedRowsByIndex([5], api);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" deselects only the clicked row final state`
                ).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
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
                await new GridColumns(api, `Select multiple rows without modifier keys setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Select multiple rows without modifier keys setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2);
                actions.clickRowByIndex(5);
                actions.clickRowByIndex(3);

                assertSelectedRowsByIndex([2, 5, 3], api);
                await new GridRows(api, `Select multiple rows without modifier keys final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
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
                await new GridRows(api, `De-select row with click final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('rowSelected reports the originating browser event', async () => {
                const events: RowSelectedEvent[] = [];
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    onRowSelected: (event) => events.push(event),
                });

                const rowClick = actions.clickRowByIndex(1);
                const checkboxClick = actions.toggleCheckboxByIndex(3);

                // gridOptions callbacks are dispatched asynchronously via setTimeout
                await new Promise((resolve) => setTimeout(resolve, 0));

                assertSelectedRowsByIndex([1, 3], api);
                expect(events.map(({ event }) => event)).toEqual([rowClick, checkboxClick]);
            });
        });
    });
});
