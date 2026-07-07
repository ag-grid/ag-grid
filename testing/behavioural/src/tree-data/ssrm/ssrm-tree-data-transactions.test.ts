import type { GridOptions } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../../test-utils';
import { ssrmExpandAndLoadAll, waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';
import { createFakeServer, createServerSideDatasource, getSmallTreeDataSet } from './ssrmSmallTreeDataSet';

/**
 * Characterization (golden-master) tests pinning the CURRENT behaviour of
 * `api.applyServerSideTransaction(...)` (add / remove / update) and its async
 * variant against tree-data server-side row groups.
 *
 * These tests document mechanics as they are today; any assertion that encodes
 * a bug is intentional and should be treated as the baseline to compare future
 * changes against, not as desired behaviour.
 */
describe('ag-grid SSRM treeData transactions (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Shared inline grid options for tree-data SSRM. `group` from the fake server
    // drives `isServerSideGroup`; group keys are the employeeId route segments.
    function createTreeDataGridOptions(): GridOptions {
        return {
            columnDefs: [
                { field: 'employeeId', hide: true },
                { field: 'employeeName', hide: true },
                { field: 'jobTitle' },
                { field: 'employmentType' },
            ],
            autoGroupColumnDef: {
                field: 'employeeName',
            },
            defaultColDef: { flex: 1 },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            getRowId: ({ data }) => data.employeeId,
            isServerSideGroup: (dataItem: any) => dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.employeeId,
        };
    }

    test('ADD a child to an expanded tree group appears under the routed parent', async () => {
        const api = gridsManager.createGrid('ssrmTxAdd', createTreeDataGridOptions());

        const fakeServer = createFakeServer(getSmallTreeDataSet());
        api.setGridOption('serverSideDatasource', createServerSideDatasource(fakeServer));

        await waitForEvent('firstDataRendered', api);
        // Expand and load every group so the target route ['101','102','108'] is a loaded store.
        await ssrmExpandAndLoadAll(api);

        const countBeforeAdd = api.getDisplayedRowCount();

        // Add a new child under Francis Strickland (VP Sales) whose children are 109-112.
        const result = api.applyServerSideTransaction({
            route: ['101', '102', '108'],
            add: [
                {
                    group: false,
                    employeeId: '999',
                    employeeName: 'New Hire',
                    jobTitle: 'Sales Executive',
                    employmentType: 'Contract',
                },
            ],
        });

        await waitForNoLoadingRows(api);

        // Pin: the applied status string, that the node now exists and displayed count grew.
        expect(result?.status).toBe('Applied');
        expect(!!api.getRowNode('999')).toBe(true);
        expect(api.getDisplayedRowCount()).toBe(countBeforeAdd + 1);

        await new GridRows(api, 'ssrm tx add child').check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├─┬ 103 GROUP id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ │ ├─┬ 104 GROUP id:104 ag-Grid-AutoColumn:"Brittany Hanson" employeeId:"104" employeeName:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · │ │ │ ├── LEAF id:105 ag-Grid-AutoColumn:"Leah Flowers" employeeId:"105" employeeName:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · │ │ │ └── LEAF id:106 ag-Grid-AutoColumn:"Tammy Sutton" employeeId:"106" employeeName:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · │ │ └── LEAF id:107 ag-Grid-AutoColumn:"Derek Paul" employeeId:"107" employeeName:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · │ └─┬ 108 GROUP id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ · ├── LEAF id:109 ag-Grid-AutoColumn:"Morris Hanson" employeeId:"109" employeeName:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · │ · ├── LEAF id:110 ag-Grid-AutoColumn:"Todd Tyler" employeeId:"110" employeeName:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ · ├── LEAF id:111 ag-Grid-AutoColumn:"Bennie Wise" employeeId:"111" employeeName:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ · ├── LEAF id:112 ag-Grid-AutoColumn:"Joel Cooper" employeeId:"112" employeeName:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
            · │ · └── LEAF id:999 ag-Grid-AutoColumn:"New Hire" employeeId:"999" employeeName:"New Hire" jobTitle:"Sales Executive" employmentType:"Contract"
            · └─┬ 113 GROUP id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · · ├─┬ 114 GROUP id:114 ag-Grid-AutoColumn:"Sarah Baker" employeeId:"114" employeeName:"Sarah Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · · │ ├─┬ 115 GROUP id:115 ag-Grid-AutoColumn:"Mason Hanson" employeeId:"115" employeeName:"Mason Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · · │ │ ├── LEAF id:116 ag-Grid-AutoColumn:"Hannah Flowers" employeeId:"116" employeeName:"Hannah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · · │ │ └── LEAF id:117 ag-Grid-AutoColumn:"Rob Sutton" employeeId:"117" employeeName:"Rob Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · · │ └── LEAF id:118 ag-Grid-AutoColumn:"Paul Smith" employeeId:"118" employeeName:"Paul Smith" jobTitle:"Inventory Control" employmentType:"Permanent"
            · · └─┬ 119 GROUP id:119 ag-Grid-AutoColumn:"Adam Newman" employeeId:"119" employeeName:"Adam Newman" jobTitle:"VP Sales" employmentType:"Permanent"
            · · · ├── LEAF id:120 ag-Grid-AutoColumn:"John Smith" employeeId:"120" employeeName:"John Smith" jobTitle:"Sales Manager" employmentType:"Permanent"
            · · · ├── LEAF id:121 ag-Grid-AutoColumn:"Alice Grant" employeeId:"121" employeeName:"Alice Grant" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · ├── LEAF id:122 ag-Grid-AutoColumn:"Ben Hill" employeeId:"122" employeeName:"Ben Hill" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · └── LEAF id:123 ag-Grid-AutoColumn:"Joe Cooper" employeeId:"123" employeeName:"Joe Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
        `);
    });

    test('REMOVE a leaf tree node removes it from the routed store', async () => {
        const api = gridsManager.createGrid('ssrmTxRemoveLeaf', createTreeDataGridOptions());

        const fakeServer = createFakeServer(getSmallTreeDataSet());
        api.setGridOption('serverSideDatasource', createServerSideDatasource(fakeServer));

        await waitForEvent('firstDataRendered', api);
        await ssrmExpandAndLoadAll(api);

        const countBeforeRemove = api.getDisplayedRowCount();
        expect(!!api.getRowNode('112')).toBe(true);

        // Remove leaf Joel Cooper (112) from the VP Sales (108) child store.
        const result = api.applyServerSideTransaction({
            route: ['101', '102', '108'],
            remove: [{ employeeId: '112' }],
        });

        await waitForNoLoadingRows(api);

        // Pin: applied status, node gone, displayed count shrank.
        expect(result?.status).toBe('Applied');
        expect(!!api.getRowNode('112')).toBe(false);
        expect(api.getDisplayedRowCount()).toBe(countBeforeRemove - 1);
    });

    test('REMOVE a parent group node removes the group and its loaded descendants', async () => {
        const api = gridsManager.createGrid('ssrmTxRemoveParent', createTreeDataGridOptions());

        const fakeServer = createFakeServer(getSmallTreeDataSet());
        api.setGridOption('serverSideDatasource', createServerSideDatasource(fakeServer));

        await waitForEvent('firstDataRendered', api);
        await ssrmExpandAndLoadAll(api);

        const countBeforeRemove = api.getDisplayedRowCount();
        expect(!!api.getRowNode('108')).toBe(true);
        expect(!!api.getRowNode('109')).toBe(true);

        // Remove the VP Sales group (108) from the Malcolm Barrett (102) child store.
        const result = api.applyServerSideTransaction({
            route: ['101', '102'],
            remove: [{ employeeId: '108' }],
        });

        await waitForNoLoadingRows(api);

        // Pin: applied status, group node gone. Children row nodes' fate is pinned below.
        expect(result?.status).toBe('Applied');
        expect(!!api.getRowNode('108')).toBe(false);

        // Characterization: what happens to the removed group's children (109-112)?
        // Characterization: removing the group also drops its loaded child row nodes.
        const child109StillPresent = !!api.getRowNode('109');
        const displayedAfterRemove = api.getDisplayedRowCount();
        expect(child109StillPresent).toBe(false);
        expect(displayedAfterRemove).toBe(countBeforeRemove - 5);
    });

    test('UPDATE a tree node reflects the changed data', async () => {
        const api = gridsManager.createGrid('ssrmTxUpdate', createTreeDataGridOptions());

        const fakeServer = createFakeServer(getSmallTreeDataSet());
        api.setGridOption('serverSideDatasource', createServerSideDatasource(fakeServer));

        await waitForEvent('firstDataRendered', api);
        await ssrmExpandAndLoadAll(api);

        const countBeforeUpdate = api.getDisplayedRowCount();

        // Update leaf Joel Cooper (112) in the VP Sales (108) child store.
        const result = api.applyServerSideTransaction({
            route: ['101', '102', '108'],
            update: [
                {
                    group: false,
                    employeeId: '112',
                    employeeName: 'Joel Cooper',
                    jobTitle: 'Head of Sales',
                    employmentType: 'Permanent',
                },
            ],
        });

        await waitForNoLoadingRows(api);

        // Pin: applied status, count unchanged, and the new field value is reflected on the node.
        expect(result?.status).toBe('Applied');
        expect(api.getDisplayedRowCount()).toBe(countBeforeUpdate);
        expect(api.getRowNode('112')?.data.jobTitle).toBe('Head of Sales');
    });

    test('transaction targeting an UNLOADED / unknown route yields StoreNotFound and changes nothing', async () => {
        const api = gridsManager.createGrid('ssrmTxUnknownRoute', createTreeDataGridOptions());

        const fakeServer = createFakeServer(getSmallTreeDataSet());
        api.setGridOption('serverSideDatasource', createServerSideDatasource(fakeServer));

        await waitForEvent('firstDataRendered', api);
        await ssrmExpandAndLoadAll(api);

        const countBefore = api.getDisplayedRowCount();

        // Route through a group key that does not exist -> store cannot be found.
        const result = api.applyServerSideTransaction({
            route: ['101', 'does-not-exist'],
            add: [
                {
                    group: false,
                    employeeId: '888',
                    employeeName: 'Ghost',
                    jobTitle: 'Phantom',
                    employmentType: 'Contract',
                },
            ],
        });

        await waitForNoLoadingRows(api);

        // Pin: StoreNotFound status, nothing added, count unchanged.
        expect(result?.status).toBe('StoreNotFound');
        expect(!!api.getRowNode('888')).toBe(false);
        expect(api.getDisplayedRowCount()).toBe(countBefore);
    });

    test('async variant applyServerSideTransactionAsync applies an add via its callback', async () => {
        const api = gridsManager.createGrid('ssrmTxAsync', createTreeDataGridOptions());

        const fakeServer = createFakeServer(getSmallTreeDataSet());
        api.setGridOption('serverSideDatasource', createServerSideDatasource(fakeServer));

        await waitForEvent('firstDataRendered', api);
        await ssrmExpandAndLoadAll(api);

        const countBefore = api.getDisplayedRowCount();

        let callbackStatus: string | undefined;
        api.applyServerSideTransactionAsync(
            {
                route: ['101', '102', '108'],
                add: [
                    {
                        group: false,
                        employeeId: '777',
                        employeeName: 'Async Hire',
                        jobTitle: 'Sales Executive',
                        employmentType: 'Contract',
                    },
                ],
            },
            (res) => {
                callbackStatus = res.status;
            }
        );

        // Async transactions are batched; force the batch to flush synchronously so the
        // callback runs deterministically rather than depending on the batch timer, then
        // wait for any resulting loads.
        api.flushServerSideAsyncTransactions();
        await waitForNoLoadingRows(api);

        // Pin: callback fires with the applied status and the node lands under the parent.
        expect(callbackStatus).toBe('Applied');
        expect(!!api.getRowNode('777')).toBe(true);
        expect(api.getDisplayedRowCount()).toBe(countBefore + 1);
    });
});
