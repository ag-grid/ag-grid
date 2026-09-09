import { GridColumns, GridRows, assertSelectedRowsById, assertSelectedRowsByIndex } from 'ag-test-utils';

import {
    columnDefs,
    createGridAndWait,
    rowData,
    setupServerSideRowSelectionSuite,
} from './serverSideRowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('User Interactions', () => {
        describe('Multiple Row Selection', () => {
            setupServerSideRowSelectionSuite();

            // Near-identical to the `checkboxes: true` sibling suite because `multiRow` renders checkboxes by
            // default: this half pins the default, that half pins the option, and only the pair catches them
            // drifting apart.
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
                    await new GridColumns(api, `CTRL-click and CMD-click selects multiple rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `CTRL-click and CMD-click selects multiple rows setup`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(api, `CTRL-click and CMD-click selects multiple rows final state`).check(`
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
                    await new GridRows(
                        api,
                        `Single click after multiple selection clears previous selection final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF selected id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
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
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `);
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
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF selected id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
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
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
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
                    await new GridRows(api, `Range is extended downwards from selection root final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
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
                    await new GridRows(api, `Range is extended upwards from selection root final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
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
                    await new GridRows(api, `Range can be inverted final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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
                    await new GridRows(
                        api,
                        `SHIFT-click within range after de-selection resets root and clears previous sele final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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
                    await new GridRows(
                        api,
                        `SHIFT-click below range after de-selection resets root and clears previous selec final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
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
                    await new GridRows(
                        api,
                        `SHIFT-click above range after de-selection resets root and clears previous selec final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
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
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
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
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
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
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
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
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
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
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
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

                    assertSelectedRowsById(['0', '1', '2', '3', '4', '5', '6'], api);

                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowsById(['2', '3', '4', '5'], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all selects range between clicked row and last clicked  final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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

                    assertSelectedRowsById(['0', '1', '2', '3', '4', '5', '6'], api);

                    actions.clickRowByIndex(3, { shiftKey: true });

                    assertSelectedRowsById(['0', '1', '2', '3'], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all on pristine grid selects range between first row an final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF selected id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
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

                    assertSelectedRowsById(['2', '3', '4'], api);

                    actions.toggleHeaderCheckboxByIndex(0);

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowsById(['2', '3', '4', '5', '6'], api);
                    await new GridRows(api, `SHIFT-click after select all behaves consistently final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
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

                    assertSelectedRowsById(['3', '4', '5', '6'], api);
                    await new GridRows(
                        api,
                        `Select all, then de-select, then SHIFT-click goes back to normal behaviour final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
                });
            });
        });
    });
});
