import type { GridOptions } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

describe('SSRM Client-Side Sorting', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function getDisplayedValues(api: any, field: string): any[] {
        const values: any[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); i++) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node && !node.stub) {
                values.push(node.data?.[field]);
            }
        }
        return values;
    }

    test('purge refresh re-sorts rows client-side when serverSideEnableClientSideSort is enabled', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Apply ascending sort on 'value'
        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Verify rows are sorted
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Purge refresh
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Rows should still be sorted after purge refresh
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
    });

    test('purge refresh re-sorts rows with descending sort', async () => {
        const rowData = [
            { id: '1', name: 'Alice', value: 1 },
            { id: '2', name: 'Bob', value: 2 },
            { id: '3', name: 'Charlie', value: 3 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
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

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: false,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Purge refresh
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

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value', sort: 'asc' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
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

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    const groupKeys = params.request.groupKeys as string[];
                    if (groupKeys.length === 0) {
                        params.success({ rowData: [...rootData], rowCount: rootData.length });
                    } else {
                        const rows = childData[groupKeys[0]] ?? [];
                        params.success({ rowData: [...rows], rowCount: rows.length });
                    }
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Apply sort before expanding
        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Expand the UK group — child store is a fresh cache with !wasRefreshing
        const ukNode = api.getRowNode('uk')!;
        api.setRowNodeExpanded(ukNode, true);
        await waitForNoLoadingRows(api);

        // Child leaf rows should be client-side sorted on initial load
        const childValues: number[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); i++) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node && !node.stub && !node.group && node.data?.value != null) {
                childValues.push(node.data.value);
            }
        }
        expect(childValues).toEqual([10, 20, 30]);
    });

    test('tree data: purge refresh re-sorts rows client-side', async () => {
        const treeData = [
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

        function extractRows(groupKeys: string[], data: any[]): any[] {
            if (groupKeys.length === 0) {
                return data.map((d) => ({
                    group: !!d.underlings,
                    employeeId: d.employeeId,
                    name: d.name,
                    experience: d.experience,
                }));
            }
            const key = groupKeys[0];
            for (const d of data) {
                if (d.name === key) {
                    return extractRows(groupKeys.slice(1), d.underlings ?? []);
                }
            }
            return [];
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'employeeId', hide: true }, { field: 'name', hide: true }, { field: 'experience' }],
            autoGroupColumnDef: { field: 'name' },
            rowModelType: 'serverSide' as const,
            treeData: true,
            serverSideEnableClientSideSort: true,
            isServerSideGroup: (dataItem: any) => dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.name,
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rows = extractRows(params.request.groupKeys ?? [], treeData);
                    params.success({ rowData: [...rows], rowCount: rows.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Expand Alice's group (auto-generated row ID, find by key)
        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        expect(aliceNode.key).toBe('Alice');
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        // Sort by experience ascending
        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Verify child rows are sorted
        const getChildExperience = () => {
            const values: number[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); i++) {
                const node = api.getDisplayedRowAtIndex(i);
                if (node && !node.stub && node.level === 1 && node.data?.experience != null) {
                    values.push(node.data.experience);
                }
            }
            return values;
        };
        expect(getChildExperience()).toEqual([1, 3, 7]);

        // Purge refresh at root
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Root rows should be sorted; re-expand Alice (find by key since IDs are auto-generated)
        let aliceAfterPurge = null;
        for (let i = 0; i < api.getDisplayedRowCount(); i++) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node?.key === 'Alice') {
                aliceAfterPurge = node;
                break;
            }
        }
        expect(aliceAfterPurge).not.toBeNull();
        if (!aliceAfterPurge!.expanded) {
            api.setRowNodeExpanded(aliceAfterPurge!, true);
            await waitForNoLoadingRows(api);
        }

        // Child rows should be client-side sorted after purge reload
        expect(getChildExperience()).toEqual([1, 3, 7]);

        // Root-level experience values should also be sorted
        const rootExperience: number[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); i++) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node && !node.stub && node.level === 0 && node.data?.experience != null) {
                rootExperience.push(node.data.experience);
            }
        }
        expect(rootExperience).toEqual([5, 10]);
    });

    test('tree data: non-purge refresh on child route re-sorts rows client-side', async () => {
        const treeData = [
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

        function extractRows(groupKeys: string[], data: any[]): any[] {
            if (groupKeys.length === 0) {
                return data.map((d) => ({
                    group: !!d.underlings,
                    employeeId: d.employeeId,
                    name: d.name,
                    experience: d.experience,
                }));
            }
            const key = groupKeys[0];
            for (const d of data) {
                if (d.name === key) {
                    return extractRows(groupKeys.slice(1), d.underlings ?? []);
                }
            }
            return [];
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'employeeId', hide: true }, { field: 'name', hide: true }, { field: 'experience' }],
            autoGroupColumnDef: { field: 'name' },
            rowModelType: 'serverSide' as const,
            treeData: true,
            serverSideEnableClientSideSort: true,
            isServerSideGroup: (dataItem: any) => dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.name,
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rows = extractRows(params.request.groupKeys ?? [], treeData);
                    params.success({ rowData: [...rows], rowCount: rows.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Expand Alice's group
        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        expect(aliceNode.key).toBe('Alice');
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        // Sort by experience ascending
        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        const getChildExperience = () => {
            const values: number[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); i++) {
                const node = api.getDisplayedRowAtIndex(i);
                if (node && !node.stub && node.level === 1 && node.data?.experience != null) {
                    values.push(node.data.experience);
                }
            }
            return values;
        };
        expect(getChildExperience()).toEqual([1, 3, 7]);

        // Non-purge refresh on the child route (the "Refresh Oiddwv" scenario)
        api.refreshServerSide({ route: ['Alice'], purge: false });
        await waitForNoLoadingRows(api);

        // Child rows should still be sorted after non-purge refresh
        expect(getChildExperience()).toEqual([1, 3, 7]);
    });

    test('tree data: purge refresh re-sorts with async datasource', async () => {
        const treeData = [
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

        function extractRows(groupKeys: string[], data: any[]): any[] {
            if (groupKeys.length === 0) {
                return data.map((d) => ({
                    group: !!d.underlings,
                    employeeId: d.employeeId,
                    name: d.name,
                    experience: d.experience,
                }));
            }
            const key = groupKeys[0];
            for (const d of data) {
                if (d.name === key) {
                    return extractRows(groupKeys.slice(1), d.underlings ?? []);
                }
            }
            return [];
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'employeeId', hide: true }, { field: 'name', hide: true }, { field: 'experience' }],
            autoGroupColumnDef: { field: 'name' },
            rowModelType: 'serverSide' as const,
            treeData: true,
            serverSideEnableClientSideSort: true,
            isServerSideGroup: (dataItem: any) => dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.name,
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rows = extractRows(params.request.groupKeys ?? [], treeData);
                    // Async datasource — mirrors real-world usage with network delay
                    setTimeout(() => {
                        params.success({ rowData: [...rows], rowCount: rows.length });
                    }, 50);
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Expand Alice's group
        const aliceNode = api.getDisplayedRowAtIndex(0)!;
        expect(aliceNode.key).toBe('Alice');
        api.setRowNodeExpanded(aliceNode, true);
        await waitForNoLoadingRows(api);

        // Sort by experience ascending
        api.applyColumnState({ state: [{ colId: 'experience', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        const getChildExperience = () => {
            const values: number[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); i++) {
                const node = api.getDisplayedRowAtIndex(i);
                if (node && !node.stub && node.level === 1 && node.data?.experience != null) {
                    values.push(node.data.experience);
                }
            }
            return values;
        };
        expect(getChildExperience()).toEqual([1, 3, 7]);

        // Purge refresh at root
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Re-expand Alice
        let aliceAfterPurge = null;
        for (let i = 0; i < api.getDisplayedRowCount(); i++) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node?.key === 'Alice') {
                aliceAfterPurge = node;
                break;
            }
        }
        expect(aliceAfterPurge).not.toBeNull();
        if (!aliceAfterPurge!.expanded) {
            api.setRowNodeExpanded(aliceAfterPurge!, true);
            await waitForNoLoadingRows(api);
        }

        // Child rows should be client-side sorted after async purge reload
        expect(getChildExperience()).toEqual([1, 3, 7]);
    });

    test('non-purge refresh re-sorts rows client-side', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Non-purge refresh
        api.refreshServerSide({ purge: false });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
    });
});
