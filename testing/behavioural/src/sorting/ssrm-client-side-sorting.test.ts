import type { GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';
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

async function expandAliceByKey(api: GridApi): Promise<void> {
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        const node = api.getDisplayedRowAtIndex(i);
        if (node?.key === 'Alice' && !node.expanded) {
            api.setRowNodeExpanded(node, true);
            await waitForNoLoadingRows(api);
            return;
        }
    }
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
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
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
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
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
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
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
        await waitForEvent('firstDataRendered', api);

        // Rows should be sorted on initial load without any explicit applyColumnState call
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
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
        await expandAliceByKey(api);

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

        await expandAliceByKey(api);

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
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Non-purge refresh — storeRefreshed, because non-purge doesn't stub rows.
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
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
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
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
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
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
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
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
        await waitForEvent('firstDataRendered', api);

        // Multi-column sort: category asc, then value asc
        api.applyColumnState({
            state: [
                { colId: 'category', sort: 'asc', sortIndex: 0 },
                { colId: 'value', sort: 'asc', sortIndex: 1 },
            ],
        });
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
        await waitForEvent('firstDataRendered', api);

        // Apply a sort then clear it
        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);
        api.applyColumnState({ state: [{ colId: 'value', sort: null }] });
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
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
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
});
