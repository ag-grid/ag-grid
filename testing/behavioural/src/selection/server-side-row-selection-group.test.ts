import { GridColumns, GridRows, assertSelectedRowsById, assertSelectedRowsByIndex } from 'ag-test-utils';

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

            test('checking a group row selects only that row', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow' },
                });
                await new GridColumns(api, `checking a group row selects only that row setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(api, `checking a group row selects only that row setup`).check(`
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

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
                await new GridRows(api, `checking a group row selects only that row final state`).check(`
                    ROOT id:<no-id>
                    ├── GROUP selected collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });

            test('clicking group row with `groupSelects = "descendants"` enabled selects that row and all its children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                await actions.expandGroupRowByIndex(0);

                assertSelectedRowsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((p) => getRowIdRaw({ ...p, api })),
                    api
                );

                // Can un-select child row
                actions.toggleCheckboxByIndex(1);

                assertSelectedRowsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Gymnastics' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );

                // Toggling group row from indeterminate state selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );

                // Toggle group row again de-selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById([], api);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "descendants"_ enabled selects that row  final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });

            test('de/select group row with `groupSelects = "descendants"` and `enableClickSelection`', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants', enableClickSelection: true },
                });

                actions.clickRowByIndex(0);
                await actions.expandGroupRowByIndex(0);

                assertSelectedRowsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );

                actions.clickRowByIndex(1, { ctrlKey: true });
                assertSelectedRowsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Gymnastics' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
                await new GridRows(
                    api,
                    `de/select group row with _groupSelects = "descendants"_ and _enableClickSelectio final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP indeterminate id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "self"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects setup`
                ).check(`
                    ROOT id:<no-id>
                    ├── GROUP 🚫 collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById([], api);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Swimming' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP 🚫 id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup 🚫 collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
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
                assertSelectedRowsById([], api);
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP 🚫 id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup 🚫 collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
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
                assertSelectedRowsById(
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
                await new GridColumns(
                    api,
                    `Selection state does not change when _isRowSelectable_ changes after setGridOption rowSelection`
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
                    `Selection state does not change when _isRowSelectable_ changes after setGridOption rowSelection`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP indeterminate 🚫 id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup selected 🚫 collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                assertSelectedRowsById(
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

                assertSelectedRowsById(
                    [
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
                await new GridRows(api, `Selection when _enableSelectionWithoutKeys_ for defaultStrategy final state`)
                    .check(`
                        ROOT id:<no-id>
                        ├─┬ GROUP id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                        │ └── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
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

                assertSelectedRowsById(
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

                assertSelectedRowsById([':{"country":"United States"}'], api);
                await new GridRows(api, `selecting footer node selects sibling (i.e. group node) final state`).check(
                    `
                        ROOT id:<no-id>
                        ├─┬ GROUP selected id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                        │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        │ └─ footer selected collapsed id:'rowGroupFooter_:{"country":"United States"}' ag-Grid-AutoColumn:"Total United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `
                );
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

                assertSelectedRowsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
                await new GridRows(
                    api,
                    `selecting footer node selects sibling (i.e. group node) when _groupSelects = "de final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP selected id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    │ └─ footer selected collapsed id:'rowGroupFooter_:{"country":"United States"}' ag-Grid-AutoColumn:"Total United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });
        });
    });
});
