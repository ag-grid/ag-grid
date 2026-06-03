import type { GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

type Employee = {
    name: string;
    employeeId: string;
    experience: number;
    group: boolean;
    underlings?: Employee[];
};

type FlatEmployee = Omit<Employee, 'underlings'>;

const TREE_EMPLOYEES: Employee[] = [
    {
        name: 'Alice',
        employeeId: '1',
        experience: 5,
        group: true,
        underlings: [
            { name: 'Charlie', employeeId: '3', experience: 3, group: false },
            { name: 'Dave', employeeId: '4', experience: 1, group: false },
            { name: 'Bob', employeeId: '5', experience: 7, group: false },
        ],
    },
    { name: 'Eve', employeeId: '2', experience: 10, group: false },
];

function extractTreeRows(groupKeys: string[], data: Employee[]): FlatEmployee[] {
    if (groupKeys.length === 0) {
        return data.map((d) => ({
            group: !!d.underlings,
            employeeId: d.employeeId,
            name: d.name,
            experience: d.experience,
        }));
    }
    const parent = data.find((d) => d.name === groupKeys[0]);
    return parent ? extractTreeRows(groupKeys.slice(1), parent.underlings ?? []) : [];
}

function createTreeGridOptions({ async = false }: { async?: boolean } = {}): GridOptions {
    return {
        columnDefs: [{ field: 'employeeId', hide: true }, { field: 'name', hide: true }, { field: 'experience' }],
        autoGroupColumnDef: { field: 'name' },
        rowModelType: 'serverSide',
        treeData: true,
        serverSideEnableClientSideSort: true,
        isServerSideGroup: (d) => d.group,
        getServerSideGroupKey: (d) => d.name,
        serverSideDatasource: {
            getRows: (params: IServerSideGetRowsParams) => {
                const rows = extractTreeRows(params.request.groupKeys ?? [], TREE_EMPLOYEES);
                const send = () => params.success({ rowData: [...rows], rowCount: rows.length });
                if (async) {
                    setTimeout(send, 50);
                } else {
                    send();
                }
            },
        },
    };
}

function getDisplayedValues<T = unknown>(api: GridApi, field: string): T[] {
    const values: T[] = [];
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        const node = api.getDisplayedRowAtIndex(i);
        if (node && !node.stub) {
            values.push(node.data?.[field]);
        }
    }
    return values;
}

async function expandGroupByKey(api: GridApi, key: string): Promise<void> {
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        const node = api.getDisplayedRowAtIndex(i);
        if (node?.key === key && !node.expanded) {
            api.setRowNodeExpanded(node, true);
            await waitForNoLoadingRows(api);
            return;
        }
    }
}

// Mirrors QA TC1 — row grouping + aggregation.
// UK sum=10, US sum=8, FR sum=6 — clear ordering for asc-sort assertions.
const OLYMPIC_LEAF_ROWS = [
    { country: 'UK', athlete: 'Alice', gold: 3 },
    { country: 'UK', athlete: 'Bob', gold: 7 },
    { country: 'US', athlete: 'Carol', gold: 5 },
    { country: 'US', athlete: 'Dan', gold: 3 },
    { country: 'FR', athlete: 'Eve', gold: 2 },
    { country: 'FR', athlete: 'Frank', gold: 4 },
];

function createOlympicGridOptions(): GridOptions {
    return {
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'athlete' },
            { field: 'gold', aggFunc: 'sum' },
        ],
        autoGroupColumnDef: { field: 'athlete' },
        rowModelType: 'serverSide',
        serverSideEnableClientSideSort: true,
        cacheBlockSize: 500000,
        getRowId: (p) => (p.data.athlete ? `${p.data.country}-${p.data.athlete}` : `group-${p.data.country}`),
        serverSideDatasource: {
            getRows: (params: IServerSideGetRowsParams) => {
                const groupKeys = params.request.groupKeys ?? [];
                if (groupKeys.length === 0) {
                    const countries = Array.from(new Set(OLYMPIC_LEAF_ROWS.map((r) => r.country)));
                    const rows = countries.map((country) => ({
                        country,
                        gold: OLYMPIC_LEAF_ROWS.filter((r) => r.country === country).reduce((s, r) => s + r.gold, 0),
                    }));
                    params.success({ rowData: [...rows], rowCount: rows.length });
                    return;
                }
                const country = groupKeys[0];
                const rows = OLYMPIC_LEAF_ROWS.filter((r) => r.country === country);
                params.success({ rowData: [...rows], rowCount: rows.length });
            },
        },
    };
}

describe('SSRM Client-Side Sorting', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('purge refresh re-sorts rows client-side when serverSideEnableClientSideSort is enabled', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(
            api,
            `purge refresh re-sorts rows client-side when serverSideEnableClientSideSort is e setup`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `purge refresh re-sorts rows client-side when serverSideEnableClientSideSort is e setup`
        ).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(
            api,
            `purge refresh re-sorts rows client-side when serverSideEnableClientSideSort is e after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200 sort:asc
        `);
        await new GridRows(
            api,
            `purge refresh re-sorts rows client-side when serverSideEnableClientSideSort is e after applyColumnState`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" name:"Alice" value:1
            ├── LEAF id:3 id:"3" name:"Bob" value:2
            └── LEAF id:1 id:"1" name:"Charlie" value:3
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
        // Column sort state is preserved across refresh — refreshServerSide should never
        // touch column state, so the sort indicator stays rendered on the header.
        expect(api.getColumnState().find((c) => c.colId === 'value')?.sort).toBe('asc');
    });

    test('purge refresh re-sorts rows with descending sort', async () => {
        const rowData = [
            { id: '1', name: 'Alice', value: 1 },
            { id: '2', name: 'Bob', value: 2 },
            { id: '3', name: 'Charlie', value: 3 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `purge refresh re-sorts rows with descending sort setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `purge refresh re-sorts rows with descending sort setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
        await new GridColumns(api, `purge refresh re-sorts rows with descending sort after applyColumnState`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200 sort:desc
            `);
        await new GridRows(api, `purge refresh re-sorts rows with descending sort after applyColumnState`).check(`
            ROOT id:<no-id>
            ├── LEAF id:3 id:"3" name:"Charlie" value:3
            ├── LEAF id:2 id:"2" name:"Bob" value:2
            └── LEAF id:1 id:"1" name:"Alice" value:1
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([3, 2, 1]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([3, 2, 1]);
    });

    test('purge refresh does not sort when serverSideEnableClientSideSort is disabled', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: false,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `purge refresh does not sort when serverSideEnableClientSideSort is disabled setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `purge refresh does not sort when serverSideEnableClientSideSort is disabled setup`)
            .check(`
                ROOT id:<no-id>
                └── filler id:rowIndex:0
            `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(
            api,
            `purge refresh does not sort when serverSideEnableClientSideSort is disabled after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200 sort:asc
        `);
        await new GridRows(
            api,
            `purge refresh does not sort when serverSideEnableClientSideSort is disabled after applyColumnState`
        ).check(`
            ROOT id:<no-id>
            ├── filler id:rowIndex:0
            ├── filler id:rowIndex:1
            └── filler id:rowIndex:2
        `);
        await waitForNoLoadingRows(api);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Rows stay in server order when client-side sort is disabled
        expect(getDisplayedValues(api, 'value')).toEqual([3, 1, 2]);
    });

    test('initial load sorts rows client-side when sort is pre-configured', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value', sort: 'asc' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `initial load sorts rows client-side when sort is pre-configured setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200 sort:asc
            `);
        await new GridRows(api, `initial load sorts rows client-side when sort is pre-configured setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        // Rows should be sorted on initial load without any explicit applyColumnState call
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
        await new GridRows(api, `initial load sorts rows client-side when sort is pre-configured final state`).check(
            `
                ROOT id:<no-id>
                ├── LEAF id:2 id:"2" name:"Alice" value:1
                ├── LEAF id:3 id:"3" name:"Bob" value:2
                └── LEAF id:1 id:"1" name:"Charlie" value:3
            `
        );
    });

    test('child store sorts rows client-side on initial group expansion', async () => {
        const rootData = [
            { id: 'uk', country: 'United Kingdom' },
            { id: 'fr', country: 'France' },
        ];
        const childData: Record<string, Array<{ id: string; country: string; value: number }>> = {
            'United Kingdom': [
                { id: 'uk-3', country: 'United Kingdom', value: 30 },
                { id: 'uk-1', country: 'United Kingdom', value: 10 },
                { id: 'uk-2', country: 'United Kingdom', value: 20 },
            ],
        };

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    const groupKeys = params.request.groupKeys as string[];
                    if (groupKeys.length === 0) {
                        params.success({ rowData: [...rootData], rowCount: rootData.length });
                    } else {
                        const rows = childData[groupKeys[0]] ?? [];
                        params.success({ rowData: [...rows], rowCount: rows.length });
                    }
                },
            },
        });
        await waitForEvent('firstDataRendered', api);

        // Apply sort before expanding
        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Expand the UK group — child store is a fresh cache with !wasRefreshing
        const ukNode = api.getRowNode('uk')!;
        api.setRowNodeExpanded(ukNode, true);
        await waitForNoLoadingRows(api);

        // Child leaf rows should be client-side sorted on initial load
        await new GridRows(api, 'child store initial sort').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:uk ag-Grid-AutoColumn:"United Kingdom" country:"United Kingdom"
            │ ├── LEAF id:uk-1 country:"United Kingdom" value:10
            │ ├── LEAF id:uk-2 country:"United Kingdom" value:20
            │ └── LEAF id:uk-3 country:"United Kingdom" value:30
            └── GROUP-leafGroup collapsed id:fr ag-Grid-AutoColumn:"France" country:"France"
        `);
    });

    test('tree data: purge refresh re-sorts rows client-side', async () => {
        const api = gridsManager.createGrid(null, createTreeGridOptions());
        await waitForEvent('firstDataRendered', api);

        // Expand Alice's group (auto-generated row ID, find by key)
        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        expect(aliceNode.key).toBe('Alice');
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        // Sort by experience ascending
        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'tree sorted before purge').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:0 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice" experience:5
            │ ├── LEAF id:Alice-1 ag-Grid-AutoColumn:"Dave" employeeId:"4" name:"Dave" experience:1
            │ ├── LEAF id:Alice-0 ag-Grid-AutoColumn:"Charlie" employeeId:"3" name:"Charlie" experience:3
            │ └── LEAF id:Alice-2 ag-Grid-AutoColumn:"Bob" employeeId:"5" name:"Bob" experience:7
            └── LEAF id:1 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve" experience:10
        `);

        // Purge refresh at root
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Re-expand Alice (row IDs are auto-generated on purge)
        await expandGroupByKey(api, 'Alice');

        await new GridRows(api, 'tree sorted after purge').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:2 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice" experience:5
            │ ├── LEAF id:Alice-1 ag-Grid-AutoColumn:"Dave" employeeId:"4" name:"Dave" experience:1
            │ ├── LEAF id:Alice-0 ag-Grid-AutoColumn:"Charlie" employeeId:"3" name:"Charlie" experience:3
            │ └── LEAF id:Alice-2 ag-Grid-AutoColumn:"Bob" employeeId:"5" name:"Bob" experience:7
            └── LEAF id:3 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve" experience:10
        `);
    });

    test('tree data: non-purge refresh on child route re-sorts rows client-side', async () => {
        const api = gridsManager.createGrid(null, createTreeGridOptions());
        await waitForEvent('firstDataRendered', api);

        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        expect(aliceNode.key).toBe('Alice');
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Non-purge refresh on the child route. Use storeRefreshed rather than
        // waitForNoLoadingRows: non-purge doesn't stub rows, so the loading-rows wait
        // resolves instantly and would miss an async datasource.
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ route: ['Alice'], purge: false });
        await refreshed;

        await new GridRows(api, 'tree sorted after non-purge child refresh').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:0 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice" experience:5
            │ ├── LEAF id:Alice-4 ag-Grid-AutoColumn:"Dave" employeeId:"4" name:"Dave" experience:1
            │ ├── LEAF id:Alice-3 ag-Grid-AutoColumn:"Charlie" employeeId:"3" name:"Charlie" experience:3
            │ └── LEAF id:Alice-5 ag-Grid-AutoColumn:"Bob" employeeId:"5" name:"Bob" experience:7
            └── LEAF id:1 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve" experience:10
        `);
    });

    test('tree data: purge refresh re-sorts with async datasource', async () => {
        const api = gridsManager.createGrid(null, createTreeGridOptions({ async: true }));
        await waitForEvent('firstDataRendered', api);

        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        expect(aliceNode.key).toBe('Alice');
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        await expandGroupByKey(api, 'Alice');

        await new GridRows(api, 'tree sorted after async purge').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:2 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice" experience:5
            │ ├── LEAF id:Alice-1 ag-Grid-AutoColumn:"Dave" employeeId:"4" name:"Dave" experience:1
            │ ├── LEAF id:Alice-0 ag-Grid-AutoColumn:"Charlie" employeeId:"3" name:"Charlie" experience:3
            │ └── LEAF id:Alice-2 ag-Grid-AutoColumn:"Bob" employeeId:"5" name:"Bob" experience:7
            └── LEAF id:3 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve" experience:10
        `);
    });

    test('non-purge refresh re-sorts rows client-side', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `non-purge refresh re-sorts rows client-side setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `non-purge refresh re-sorts rows client-side setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(api, `non-purge refresh re-sorts rows client-side after applyColumnState`).checkColumns(
            `
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200 sort:asc
            `
        );
        await new GridRows(api, `non-purge refresh re-sorts rows client-side after applyColumnState`).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" name:"Alice" value:1
            ├── LEAF id:3 id:"3" name:"Bob" value:2
            └── LEAF id:1 id:"1" name:"Charlie" value:3
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Non-purge refresh — storeRefreshed, because non-purge doesn't stub rows.
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
        // Column sort state is preserved across refresh — refreshServerSide should never
        // touch column state, so the sort indicator stays rendered on the header.
        expect(api.getColumnState().find((c) => c.colId === 'value')?.sort).toBe('asc');
    });

    test('tree data: purge on child route re-sorts child rows', async () => {
        const api = gridsManager.createGrid(null, createTreeGridOptions());
        await waitForEvent('firstDataRendered', api);

        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Purge only the child route — destroys and recreates only Alice's child cache
        api.refreshServerSide({ route: ['Alice'], purge: true });
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'tree sorted after child-route purge').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:0 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice" experience:5
            │ ├── LEAF id:Alice-4 ag-Grid-AutoColumn:"Dave" employeeId:"4" name:"Dave" experience:1
            │ ├── LEAF id:Alice-3 ag-Grid-AutoColumn:"Charlie" employeeId:"3" name:"Charlie" experience:3
            │ └── LEAF id:Alice-5 ag-Grid-AutoColumn:"Bob" employeeId:"5" name:"Bob" experience:7
            └── LEAF id:1 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve" experience:10
        `);
    });

    test('tree data: non-purge refresh at root re-sorts rows client-side', async () => {
        // Mirrors QA TC2 — "Refresh Everything" button
        // issues refreshServerSide({ purge: false }) on the root of a tree-data grid.
        const api = gridsManager.createGrid(null, createTreeGridOptions());
        await waitForEvent('firstDataRendered', api);

        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Non-purge refresh at root (no `route`) — refreshes root store without destroying it.
        // storeRefreshed, because non-purge doesn't stub rows.
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        await new GridRows(api, 'tree sorted after root non-purge refresh').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:0 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice" experience:5
            │ ├── LEAF id:Alice-1 ag-Grid-AutoColumn:"Dave" employeeId:"4" name:"Dave" experience:1
            │ ├── LEAF id:Alice-0 ag-Grid-AutoColumn:"Charlie" employeeId:"3" name:"Charlie" experience:3
            │ └── LEAF id:Alice-2 ag-Grid-AutoColumn:"Bob" employeeId:"5" name:"Bob" experience:7
            └── LEAF id:2 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve" experience:10
        `);
    });

    test('non-purge refresh re-sorts when server returns rows in different order', async () => {
        let callCount = 0;
        const rowDataByCall = [
            // First call: initial load
            [
                { id: '1', name: 'Charlie', value: 3 },
                { id: '2', name: 'Alice', value: 1 },
                { id: '3', name: 'Bob', value: 2 },
            ],
            // Second call: non-purge refresh returns same rows in different order
            [
                { id: '3', name: 'Bob', value: 2 },
                { id: '1', name: 'Charlie', value: 3 },
                { id: '2', name: 'Alice', value: 1 },
            ],
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    const data = rowDataByCall[Math.min(callCount, rowDataByCall.length - 1)];
                    callCount++;
                    params.success({ rowData: [...data], rowCount: data.length });
                },
            },
        });
        await new GridColumns(api, `non-purge refresh re-sorts when server returns rows in different order setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `non-purge refresh re-sorts when server returns rows in different order setup`).check(
            `
                ROOT id:<no-id>
                └── filler id:rowIndex:0
            `
        );
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(
            api,
            `non-purge refresh re-sorts when server returns rows in different order after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200 sort:asc
        `);
        await new GridRows(
            api,
            `non-purge refresh re-sorts when server returns rows in different order after applyColumnState`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" name:"Alice" value:1
            ├── LEAF id:3 id:"3" name:"Bob" value:2
            └── LEAF id:1 id:"1" name:"Charlie" value:3
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Non-purge refresh — server now returns rows in a different order.
        // storeRefreshed, because non-purge doesn't stub rows.
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        // Should still be sorted despite server returning in different order
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
    });

    test('non-purge refresh re-sorts when row values change', async () => {
        let callCount = 0;
        const rowDataByCall = [
            // First call: initial load
            [
                { id: '1', name: 'Charlie', value: 3 },
                { id: '2', name: 'Alice', value: 1 },
                { id: '3', name: 'Bob', value: 2 },
            ],
            // Second call: non-purge refresh returns same IDs but Alice's value changed
            [
                { id: '1', name: 'Charlie', value: 3 },
                { id: '2', name: 'Alice', value: 5 },
                { id: '3', name: 'Bob', value: 2 },
            ],
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    const data = rowDataByCall[Math.min(callCount, rowDataByCall.length - 1)];
                    callCount++;
                    // Server ignores params.request.sortModel and returns unsorted data
                    params.success({ rowData: [...data], rowCount: data.length });
                },
            },
        });
        await new GridColumns(api, `non-purge refresh re-sorts when row values change setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `non-purge refresh re-sorts when row values change setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(api, `non-purge refresh re-sorts when row values change after applyColumnState`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200 sort:asc
            `);
        await new GridRows(api, `non-purge refresh re-sorts when row values change after applyColumnState`).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" name:"Alice" value:1
            ├── LEAF id:3 id:"3" name:"Bob" value:2
            └── LEAF id:1 id:"1" name:"Charlie" value:3
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Non-purge refresh — server returns updated but unsorted data despite
        // receiving sortModel (server ignores it, relying on client-side sort)
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        // Should re-sort with updated values: Bob(2), Charlie(3), Alice(5)
        expect(getDisplayedValues(api, 'value')).toEqual([2, 3, 5]);
    });

    test('purge refresh without getRowId re-sorts rows', async () => {
        const rowData = [
            { name: 'Charlie', value: 3 },
            { name: 'Alice', value: 1 },
            { name: 'Bob', value: 2 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            // No getRowId — auto-generated IDs
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `purge refresh without getRowId re-sorts rows setup`).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `purge refresh without getRowId re-sorts rows setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(api, `purge refresh without getRowId re-sorts rows after applyColumnState`).checkColumns(
            `
                CENTER
                ├── name "Name" width:200
                └── value "Value" width:200 sort:asc
            `
        );
        await new GridRows(api, `purge refresh without getRowId re-sorts rows after applyColumnState`).check(`
            ROOT id:<no-id>
            ├── LEAF id:1 name:"Alice" value:1
            ├── LEAF id:2 name:"Bob" value:2
            └── LEAF id:0 name:"Charlie" value:3
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
    });

    test('purge refresh with multi-column sort re-sorts correctly', async () => {
        const rowData = [
            { id: '1', name: 'Alice', category: 'B', value: 2 },
            { id: '2', name: 'Bob', category: 'A', value: 1 },
            { id: '3', name: 'Charlie', category: 'A', value: 3 },
            { id: '4', name: 'Diana', category: 'B', value: 1 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'category' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `purge refresh with multi-column sort re-sorts correctly setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            ├── category "Category" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `purge refresh with multi-column sort re-sorts correctly setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        // Multi-column sort: category asc, then value asc
        api.applyColumnState({
            state: [
                { colId: 'category', sort: 'asc', sortIndex: 0 },
                { colId: 'value', sort: 'asc', sortIndex: 1 },
            ],
        });
        await new GridColumns(api, `purge refresh with multi-column sort re-sorts correctly after applyColumnState`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── category "Category" width:200 sort:asc sortIndex:0
                └── value "Value" width:200 sort:asc sortIndex:1
            `);
        await new GridRows(api, `purge refresh with multi-column sort re-sorts correctly after applyColumnState`).check(
            `
                ROOT id:<no-id>
                ├── LEAF id:2 id:"2" name:"Bob" category:"A" value:1
                ├── LEAF id:3 id:"3" name:"Charlie" category:"A" value:3
                ├── LEAF id:4 id:"4" name:"Diana" category:"B" value:1
                └── LEAF id:1 id:"1" name:"Alice" category:"B" value:2
            `
        );
        await waitForNoLoadingRows(api);

        // A(1), A(3), B(1), B(2)
        expect(getDisplayedValues(api, 'category')).toEqual(['A', 'A', 'B', 'B']);
        expect(getDisplayedValues(api, 'value')).toEqual([1, 3, 1, 2]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'category')).toEqual(['A', 'A', 'B', 'B']);
        expect(getDisplayedValues(api, 'value')).toEqual([1, 3, 1, 2]);
    });

    test('purge refresh with no active sort does not re-order rows', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `purge refresh with no active sort does not re-order rows setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `purge refresh with no active sort does not re-order rows setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        // Apply a sort then clear it
        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(api, `purge refresh with no active sort does not re-order rows after applyColumnState`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200 sort:asc
            `);
        await new GridRows(api, `purge refresh with no active sort does not re-order rows after applyColumnState`)
            .check(`
                ROOT id:<no-id>
                ├── LEAF id:2 id:"2" name:"Alice" value:1
                ├── LEAF id:3 id:"3" name:"Bob" value:2
                └── LEAF id:1 id:"1" name:"Charlie" value:3
            `);
        await waitForNoLoadingRows(api);
        api.applyColumnState({ state: [{ colId: 'value', sort: null }] });
        await new GridColumns(api, `purge refresh with no active sort does not re-order rows after applyColumnState #2`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `purge refresh with no active sort does not re-order rows after applyColumnState #2`)
            .check(`
                ROOT id:<no-id>
                ├── LEAF id:2 id:"2" name:"Alice" value:1
                ├── LEAF id:3 id:"3" name:"Bob" value:2
                └── LEAF id:1 id:"1" name:"Charlie" value:3
            `);
        await waitForNoLoadingRows(api);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // No sort active — rows should be in server order
        expect(getDisplayedValues(api, 'value')).toEqual([3, 1, 2]);
    });

    test('purge refresh with paginated loading sorts only after all blocks load', async () => {
        const allRows = [
            { id: '1', name: 'Charlie', value: 5 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 3 },
            { id: '4', name: 'Diana', value: 2 },
            { id: '5', name: 'Eve', value: 4 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            cacheBlockSize: 2, // Load 2 rows at a time
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    const start = params.request.startRow ?? 0;
                    const end = params.request.endRow ?? allRows.length;
                    const page = allRows.slice(start, end);
                    params.success({ rowData: [...page], rowCount: allRows.length });
                },
            },
        });
        await new GridColumns(api, `purge refresh with paginated loading sorts only after all blocks load setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `purge refresh with paginated loading sorts only after all blocks load setup`).check(
            `
                ROOT id:<no-id>
                └── filler id:rowIndex:0
            `
        );
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(
            api,
            `purge refresh with paginated loading sorts only after all blocks load after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200 sort:asc
        `);
        await new GridRows(
            api,
            `purge refresh with paginated loading sorts only after all blocks load after applyColumnState`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" name:"Alice" value:1
            ├── LEAF id:4 id:"4" name:"Diana" value:2
            ├── LEAF id:3 id:"3" name:"Bob" value:3
            ├── LEAF id:5 id:"5" name:"Eve" value:4
            └── LEAF id:1 id:"1" name:"Charlie" value:5
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3, 4, 5]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // All blocks should have loaded and then sorted
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3, 4, 5]);
    });

    test('child store with paginated loading sorts once fully loaded', async () => {
        const rootData = [
            { id: 'uk', country: 'United Kingdom' },
            { id: 'fr', country: 'France' },
        ];
        const childRows = [
            { id: 'uk-1', country: 'United Kingdom', value: 50 },
            { id: 'uk-2', country: 'United Kingdom', value: 10 },
            { id: 'uk-3', country: 'United Kingdom', value: 40 },
            { id: 'uk-4', country: 'United Kingdom', value: 20 },
            { id: 'uk-5', country: 'United Kingdom', value: 30 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            cacheBlockSize: 2, // Child store loads 2 rows at a time
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    const groupKeys = params.request.groupKeys as string[];
                    if (groupKeys.length === 0) {
                        params.success({ rowData: [...rootData], rowCount: rootData.length });
                        return;
                    }
                    const start = params.request.startRow ?? 0;
                    const end = params.request.endRow ?? childRows.length;
                    const page = childRows.slice(start, end);
                    params.success({ rowData: [...page], rowCount: childRows.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        const ukNode = api.getRowNode('uk')!;
        api.setRowNodeExpanded(ukNode, true);
        await waitForNoLoadingRows(api);

        // After all blocks load, child rows should be sorted
        await new GridRows(api, 'child store paginated sort').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:uk ag-Grid-AutoColumn:"United Kingdom" country:"United Kingdom"
            │ ├── LEAF id:uk-2 country:"United Kingdom" value:10
            │ ├── LEAF id:uk-4 country:"United Kingdom" value:20
            │ ├── LEAF id:uk-5 country:"United Kingdom" value:30
            │ ├── LEAF id:uk-3 country:"United Kingdom" value:40
            │ └── LEAF id:uk-1 country:"United Kingdom" value:50
            └── GROUP-leafGroup collapsed id:fr ag-Grid-AutoColumn:"France" country:"France"
        `);
    });

    test('row grouping: purge refresh re-sorts groups at root and child route', async () => {
        // Mirrors QA TC1 — "Purge Everything" then
        // "Purge ['US']". Row grouping + aggregation are exercised together
        const api = gridsManager.createGrid(null, createOlympicGridOptions());
        await waitForEvent('firstDataRendered', api);

        // Expand US so the child store loads and participates in later refresh.
        await expandGroupByKey(api, 'US');

        api.applyColumnState({ state: [{ colId: 'gold', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'row grouping: sorted before purge').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR" gold:6
            ├─┬ GROUP-leafGroup id:group-US ag-Grid-AutoColumn:"US" country:"US" gold:8
            │ ├── LEAF id:US-Dan ag-Grid-AutoColumn:"Dan" country:"US" athlete:"Dan" gold:3
            │ └── LEAF id:US-Carol ag-Grid-AutoColumn:"Carol" country:"US" athlete:"Carol" gold:5
            └── GROUP-leafGroup collapsed id:group-UK ag-Grid-AutoColumn:"UK" country:"UK" gold:10
        `);

        // Purge Everything — destroys the root cache.
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Re-expand US (group IDs are regenerated on purge).
        await expandGroupByKey(api, 'US');

        await new GridRows(api, 'row grouping: sorted after root purge').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR" gold:6
            ├─┬ GROUP-leafGroup id:group-US ag-Grid-AutoColumn:"US" country:"US" gold:8
            │ ├── LEAF id:US-Dan ag-Grid-AutoColumn:"Dan" country:"US" athlete:"Dan" gold:3
            │ └── LEAF id:US-Carol ag-Grid-AutoColumn:"Carol" country:"US" athlete:"Carol" gold:5
            └── GROUP-leafGroup collapsed id:group-UK ag-Grid-AutoColumn:"UK" country:"UK" gold:10
        `);

        // Purge ['US'] — destroys only the US child cache.
        api.refreshServerSide({ route: ['US'], purge: true });
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'row grouping: sorted after child-route purge').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR" gold:6
            ├─┬ GROUP-leafGroup id:group-US ag-Grid-AutoColumn:"US" country:"US" gold:8
            │ ├── LEAF id:US-Dan ag-Grid-AutoColumn:"Dan" country:"US" athlete:"Dan" gold:3
            │ └── LEAF id:US-Carol ag-Grid-AutoColumn:"Carol" country:"US" athlete:"Carol" gold:5
            └── GROUP-leafGroup collapsed id:group-UK ag-Grid-AutoColumn:"UK" country:"UK" gold:10
        `);
    });

    test('row grouping: non-purge refresh re-sorts groups at root and child route', async () => {
        // Mirrors QA TC1 — "Refresh Everything" then
        // "Refresh ['US']". Non-purge doesn't stub rows, so use storeRefreshed.
        const api = gridsManager.createGrid(null, createOlympicGridOptions());
        await waitForEvent('firstDataRendered', api);

        await expandGroupByKey(api, 'US');

        api.applyColumnState({ state: [{ colId: 'gold', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Refresh Everything — non-purge at root.
        let refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        await new GridRows(api, 'row grouping: sorted after root non-purge').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR" gold:6
            ├─┬ GROUP-leafGroup id:group-US ag-Grid-AutoColumn:"US" country:"US" gold:8
            │ ├── LEAF id:US-Dan ag-Grid-AutoColumn:"Dan" country:"US" athlete:"Dan" gold:3
            │ └── LEAF id:US-Carol ag-Grid-AutoColumn:"Carol" country:"US" athlete:"Carol" gold:5
            └── GROUP-leafGroup collapsed id:group-UK ag-Grid-AutoColumn:"UK" country:"UK" gold:10
        `);

        // Refresh ['US'] — non-purge at child route.
        refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ route: ['US'], purge: false });
        await refreshed;

        await new GridRows(api, 'row grouping: sorted after child-route non-purge').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR" gold:6
            ├─┬ GROUP-leafGroup id:group-US ag-Grid-AutoColumn:"US" country:"US" gold:8
            │ ├── LEAF id:US-Dan ag-Grid-AutoColumn:"Dan" country:"US" athlete:"Dan" gold:3
            │ └── LEAF id:US-Carol ag-Grid-AutoColumn:"Carol" country:"US" athlete:"Carol" gold:5
            └── GROUP-leafGroup collapsed id:group-UK ag-Grid-AutoColumn:"UK" country:"UK" gold:10
        `);
    });

    test('grand total row: non-purge refresh re-sorts leaves and preserves grand total', async () => {
        // The client-side sort block in onLoadSuccess sits right after grand-total handling.
        // Verify the grand total isn't swept into the sort (should stay pinned below leaves).
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            grandTotalRow: 'bottom',
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({
                        rowData: [...rowData],
                        rowCount: rowData.length,
                        grandTotalData: { id: 'grand', name: 'Total', value: 6 },
                    });
                },
            },
        });
        await new GridColumns(api, `grand total row: non-purge refresh re-sorts leaves and preserves grand total setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `grand total row: non-purge refresh re-sorts leaves and preserves grand total setup`)
            .check(`
                ROOT id:<no-id>
                └── filler id:rowIndex:0
            `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(
            api,
            `grand total row: non-purge refresh re-sorts leaves and preserves grand total after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200 sort:asc
        `);
        await new GridRows(
            api,
            `grand total row: non-purge refresh re-sorts leaves and preserves grand total after applyColumnState`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" name:"Alice" value:1
            ├── LEAF id:3 id:"3" name:"Bob" value:2
            ├── LEAF id:1 id:"1" name:"Charlie" value:3
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"grand" name:"Total" value:6
        `);
        await waitForNoLoadingRows(api);

        // Non-purge refresh — server returns unsorted data again plus grand total.
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        // Leaves sorted asc; grand total still present and not interleaved.
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3, 6]);
        const lastNode = api.getDisplayedRowAtIndex(api.getDisplayedRowCount() - 1);
        expect(lastNode?.footer).toBe(true);
    });

    test('changing sort column between refreshes updates ordering to latest sort', async () => {
        // Previously the PR only covered "same sort, re-applied after refresh". This verifies
        // that switching to a different sort column and refreshing uses the NEW sort, not
        // stale options from the prior sort.
        const rowData = [
            { id: '1', a: 3, b: 10 },
            { id: '2', a: 1, b: 30 },
            { id: '3', a: 2, b: 20 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'a' }, { field: 'b' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `changing sort column between refreshes updates ordering to latest sort setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── a "A" width:200
                └── b "B" width:200
            `);
        await new GridRows(api, `changing sort column between refreshes updates ordering to latest sort setup`).check(
            `
                ROOT id:<no-id>
                └── filler id:rowIndex:0
            `
        );
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
        await new GridColumns(
            api,
            `changing sort column between refreshes updates ordering to latest sort after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── a "A" width:200 sort:asc
            └── b "B" width:200
        `);
        await new GridRows(
            api,
            `changing sort column between refreshes updates ordering to latest sort after applyColumnState`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" a:1 b:30
            ├── LEAF id:3 id:"3" a:2 b:20
            └── LEAF id:1 id:"1" a:3 b:10
        `);
        await waitForNoLoadingRows(api);

        let refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        // Sort by a asc: [1, 2, 3]
        expect(getDisplayedValues(api, 'a')).toEqual([1, 2, 3]);

        // Switch sort to b desc, refresh.
        api.applyColumnState({
            state: [
                { colId: 'a', sort: null },
                { colId: 'b', sort: 'desc' },
            ],
        });
        await new GridColumns(
            api,
            `changing sort column between refreshes updates ordering to latest sort after applyColumnState #2`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── a "A" width:200
            └── b "B" width:200 sort:desc
        `);
        await new GridRows(
            api,
            `changing sort column between refreshes updates ordering to latest sort after applyColumnState #2`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" a:1 b:30
            ├── LEAF id:3 id:"3" a:2 b:20
            └── LEAF id:1 id:"1" a:3 b:10
        `);
        await waitForNoLoadingRows(api);

        refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        // Sort now by b desc: b=[30, 20, 10] → ids=[2, 3, 1] → a=[1, 2, 3]
        expect(getDisplayedValues(api, 'b')).toEqual([30, 20, 10]);
        expect(getDisplayedValues(api, 'a')).toEqual([1, 2, 3]);
    });

    test('row grouping: purge refresh on child route with paginated loading re-sorts all blocks', async () => {
        // Combines pagination (cacheBlockSize: 2) + row grouping + child-route purge refresh.
        // Ensures the fix waits for all blocks to reload before sorting, and that child-store
        // pagination doesn't race the sort.
        const rootData = [{ id: 'uk', country: 'United Kingdom' }];
        const childRows = [
            { id: 'uk-1', country: 'United Kingdom', value: 50 },
            { id: 'uk-2', country: 'United Kingdom', value: 10 },
            { id: 'uk-3', country: 'United Kingdom', value: 40 },
            { id: 'uk-4', country: 'United Kingdom', value: 20 },
            { id: 'uk-5', country: 'United Kingdom', value: 30 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            cacheBlockSize: 2,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    const groupKeys = params.request.groupKeys as string[];
                    if (groupKeys.length === 0) {
                        params.success({ rowData: [...rootData], rowCount: rootData.length });
                        return;
                    }
                    const start = params.request.startRow ?? 0;
                    const end = params.request.endRow ?? childRows.length;
                    const page = childRows.slice(start, end);
                    params.success({ rowData: [...page], rowCount: childRows.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        const ukNode = api.getRowNode('uk')!;
        api.setRowNodeExpanded(ukNode, true);
        await waitForNoLoadingRows(api);

        // Purge the child route — destroys and reloads all 5 children in 3 paginated blocks.
        api.refreshServerSide({ route: ['United Kingdom'], purge: true });
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'row grouping: paginated child sorted after child-route purge').check(`
            ROOT id:<no-id>
            └─┬ GROUP-leafGroup id:uk ag-Grid-AutoColumn:"United Kingdom" country:"United Kingdom"
            · ├── LEAF id:uk-2 country:"United Kingdom" value:10
            · ├── LEAF id:uk-4 country:"United Kingdom" value:20
            · ├── LEAF id:uk-5 country:"United Kingdom" value:30
            · ├── LEAF id:uk-3 country:"United Kingdom" value:40
            · └── LEAF id:uk-1 country:"United Kingdom" value:50
        `);
    });

    test('transaction add: out-of-order row is placed at its sorted position', async () => {
        // applyServerSideTransaction sorts client-side when serverSideEnableClientSideSort is
        // enabled and the store is fully loaded. A row added with a value that belongs between
        // existing rows should land in its sorted slot, not at the tail where it was appended.
        const rowData = [
            { id: '1', name: 'Alice', value: 1 },
            { id: '2', name: 'Bob', value: 3 },
            { id: '3', name: 'Charlie', value: 5 },
        ];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        });
        await new GridColumns(api, `transaction add: out-of-order row is placed at its sorted position setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `transaction add: out-of-order row is placed at its sorted position setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await new GridColumns(
            api,
            `transaction add: out-of-order row is placed at its sorted position after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            └── value "Value" width:200 sort:asc
        `);
        await new GridRows(
            api,
            `transaction add: out-of-order row is placed at its sorted position after applyColumnState`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" name:"Alice" value:1
            ├── LEAF id:2 id:"2" name:"Bob" value:3
            └── LEAF id:3 id:"3" name:"Charlie" value:5
        `);
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 3, 5]);

        // Value 2 belongs between Alice (1) and Bob (3). Without client-side sort it would
        // appear last; with the sort it takes its natural position.
        api.applyServerSideTransaction({ add: [{ id: '4', name: 'Dora', value: 2 }] });
        await new GridRows(
            api,
            `transaction add: out-of-order row is placed at its sorted position after applyServerSideTransaction`
        ).check(`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" name:"Alice" value:1
            ├── LEAF id:4 id:"4" name:"Dora" value:2
            ├── LEAF id:2 id:"2" name:"Bob" value:3
            └── LEAF id:3 id:"3" name:"Charlie" value:5
        `);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3, 5]);
        expect(getDisplayedValues(api, 'name')).toEqual(['Alice', 'Dora', 'Bob', 'Charlie']);
    });
});
