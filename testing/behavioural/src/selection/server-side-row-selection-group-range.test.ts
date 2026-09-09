import {
    GridColumns,
    GridRows,
    assertSelectedRowsById,
    assertSelectedRowsByIndex,
    assertSelectedRowsByIndexFromNodes,
} from 'ag-test-utils';

import type { GetRowIdParams, GridOptions } from 'ag-grid-community';

import { fakeFetch } from './group-data';
import { createGridAndWait, setupServerSideRowSelectionSuite } from './serverSideRowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('User Interactions', () => {
        describe('Group selection', () => {
            setupServerSideRowSelectionSuite();

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

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
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
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);
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
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);
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
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);
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
                    await new GridRows(api, `Range selection is preserved on checkbox toggle final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
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
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);
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
                    await new GridRows(api, `Range members can be un-selected with toggle final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
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
                    await new GridRows(api, `Range is extended downwards from selection root final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
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
                    await new GridRows(api, `Range is extended upwards from selection root final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
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
                    await new GridRows(api, `Range can be inverted final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
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
                    assertSelectedRowsById(
                        [
                            { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                            { data: { country: 'Russia' } },
                            { parentKeys: ['Russia'], data: { sport: 'Gymnastics' } },
                        ].map((o) => getRowIdRaw({ ...o, api })),
                        api
                    );
                    await new GridRows(
                        api,
                        `Range spanning across groups when _groupSelects = "descendants" final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├─┬ GROUP indeterminate id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                        │ └── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        ├─┬ GROUP selected id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        │ └── GROUP-leafGroup selected collapsed id:'Russia:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
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
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );
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
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );
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
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );
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
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );
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
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );
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
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );
                });

                test('CTRL+SHIFT-click defaults to selection when root is selected', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click defaults to selection when root is selected final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);
                });

                test('CTRL+SHIFT-click within range allows batch deselection when `groupSelects: "descendants"`', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndexFromNodes([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndexFromNodes([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndexFromNodes([2, 6], api);
                    await new GridRows(
                        api,
                        `CTRL+SHIFT-click within range allows batch deselection when _groupSelects: "desc final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });

                test('CTRL+SHIFT-click defaults to selection when root is selected when `groupSelects = "descendants"`', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndexFromNodes([2, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `CTRL+SHIFT-click defaults to selection when root is selected when _groupSelects  final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });
            });
        });
    });
});
