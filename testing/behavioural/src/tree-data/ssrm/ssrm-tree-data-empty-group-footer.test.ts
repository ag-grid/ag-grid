import type { GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

describe('ag-grid SSRM tree data empty group with groupTotalRow', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createDatasource() {
        const tracker = { loadCount: 0 };

        const datasource: IServerSideDatasource = {
            getRows: (params: IServerSideGetRowsParams) => {
                tracker.loadCount++;
                const groupKeys = params.request.groupKeys ?? [];

                if (groupKeys.length === 0) {
                    setTimeout(() => {
                        params.success({
                            rowData: [{ id: 'A', name: 'Node A', group: true }],
                        });
                    }, 1);
                } else {
                    setTimeout(() => {
                        params.success({ rowData: [] });
                    }, 1);
                }
            },
        };

        return { datasource, tracker };
    }

    async function waitForLoadCount(tracker: { loadCount: number }, target: number, timeoutMs = 500) {
        for (let elapsed = 0; elapsed < timeoutMs && tracker.loadCount < target; elapsed += 5) {
            await asyncSetTimeout(5);
        }
    }

    test('expanding group with empty children and groupTotalRow bottom does not cause infinite requests', async () => {
        const { datasource, tracker } = createDatasource();

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id', hide: true }, { field: 'name' }],
            autoGroupColumnDef: { field: 'name' },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            groupTotalRow: 'bottom',
            getRowId: ({ data }) => data.id,
            isServerSideGroup: (data: any) => data.group,
            getServerSideGroupKey: (data: any) => data.id,
            serverSideDatasource: datasource,
        };

        const api = gridsManager.createGrid('ssrmEmptyGroupFooter', gridOptions);
        await new GridColumns(
            api,
            `expanding group with empty children and groupTotalRow bottom does not cause infi setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── name "Name" width:200
        `);
        await new GridRows(
            api,
            `expanding group with empty children and groupTotalRow bottom does not cause infi setup`
        ).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);

        // Wait for root load (1 request)
        await waitForLoadCount(tracker, 1);
        await waitForNoLoadingRows(api);
        expect(tracker.loadCount).toBe(1);

        // Expand Node A (which has group: true but empty children)
        api.getRowNode('A')!.setExpanded(true);

        // Wait for children load (2nd request)
        await waitForLoadCount(tracker, 2);
        await asyncSetTimeout(20);
        expect(tracker.loadCount).toBe(2);

        // Wait more — if there's an infinite loop, loadCount will keep growing
        await asyncSetTimeout(200);

        expect(tracker.loadCount).toBe(2);
        await new GridRows(
            api,
            `expanding group with empty children and groupTotalRow bottom does not cause infi final state`
        ).check(`
            ROOT id:<no-id>
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"Node A" id:"A" name:"Node A"
            · └─ footer id:rowGroupFooter_A ag-Grid-AutoColumn:"Total Node A" id:"A" name:"Node A"
        `);
    });

    test('expanding empty group with groupHideOpenParents and groupTotalRow bottom does not cause infinite requests', async () => {
        const tracker = { loadCount: 0, active: true };

        const datasource: IServerSideDatasource = {
            getRows: (params: IServerSideGetRowsParams) => {
                tracker.loadCount++;
                const groupKeys = params.request.groupKeys ?? [];

                let rowData: any[];
                if (groupKeys.length === 0) {
                    rowData = [{ id: 'A', name: 'Node A', group: true }];
                } else if (groupKeys.length === 1 && groupKeys[0] === 'A') {
                    rowData = [{ id: 'B', name: 'Node B', group: true }];
                } else {
                    rowData = [];
                }

                setTimeout(() => {
                    if (tracker.active) {
                        params.success({ rowData });
                    }
                }, 1);
            },
        };

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id', hide: true }, { field: 'name' }],
            autoGroupColumnDef: { field: 'name' },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            groupTotalRow: 'bottom',
            groupHideOpenParents: true,
            getRowId: ({ data }) => data.id,
            isServerSideGroup: (data: any) => data?.group,
            getServerSideGroupKey: (data: any) => data?.id,
            serverSideDatasource: datasource,
        };

        // This config combination legitimately logs validation warnings — silence the noise.
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        const api = gridsManager.createGrid('ssrmHideOpenParents', gridOptions);
        await new GridColumns(
            api,
            `expanding empty group with groupHideOpenParents and groupTotalRow bottom does no setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── name "Name" width:200
        `);
        await new GridRows(
            api,
            `expanding empty group with groupHideOpenParents and groupTotalRow bottom does no setup`
        ).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        consoleWarnSpy.mockRestore();

        // Wait for root load
        await waitForLoadCount(tracker, 1);
        await waitForNoLoadingRows(api);
        expect(tracker.loadCount).toBe(1);

        // Expand Node A — its row becomes hidden due to groupHideOpenParents
        api.getRowNode('A')!.setExpanded(true);

        // Wait for Node A's children to load (Node B)
        await waitForLoadCount(tracker, 2);
        await waitForNoLoadingRows(api);
        expect(tracker.loadCount).toBe(2);

        // Expand Node B — also hidden, its child store loads empty
        api.getRowNode('B')!.setExpanded(true);

        // Wait for Node B's children to load (empty)
        await waitForLoadCount(tracker, 3);
        await asyncSetTimeout(20);
        expect(tracker.loadCount).toBe(3);

        // The footer for Node B's empty store must be resolved via the
        // groupHideOpenParents DFS path (lazyCache.ts:180-186), not the
        // contiguous-previous-node shortcut, because Node B is hidden.
        // Before the fix, isDisplayIndexInStore returned false for the
        // footer index, causing the parent cache to create a spurious stub.
        await asyncSetTimeout(200);

        expect(tracker.loadCount).toBe(3);

        tracker.active = false;
        await asyncSetTimeout(10);
        await new GridRows(
            api,
            `expanding empty group with groupHideOpenParents and groupTotalRow bottom does no final state`
        ).check(`
            ROOT id:<no-id>
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"Node A" id:"A" name:"Node A"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"Node B" id:"B" name:"Node B"
            · │ └─ footer id:rowGroupFooter_B ag-Grid-AutoColumn:"Total Node B" id:"B" name:"Node B"
            · └─ footer id:rowGroupFooter_A ag-Grid-AutoColumn:"Total Node A" id:"A" name:"Node A"
        `);
    });

    test('expanding group with empty children without groupTotalRow does not cause infinite requests', async () => {
        const { datasource, tracker } = createDatasource();

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id', hide: true }, { field: 'name' }],
            autoGroupColumnDef: { field: 'name' },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            getRowId: ({ data }) => data.id,
            isServerSideGroup: (data: any) => data.group,
            getServerSideGroupKey: (data: any) => data.id,
            serverSideDatasource: datasource,
        };

        const api = gridsManager.createGrid('ssrmEmptyGroupNoFooter', gridOptions);
        await new GridColumns(
            api,
            `expanding group with empty children without groupTotalRow does not cause infinit setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── name "Name" width:200
        `);
        await new GridRows(
            api,
            `expanding group with empty children without groupTotalRow does not cause infinit setup`
        ).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);

        // Wait for root load
        await waitForLoadCount(tracker, 1);
        await waitForNoLoadingRows(api);
        expect(tracker.loadCount).toBe(1);

        // Expand Node A
        api.getRowNode('A')!.setExpanded(true);

        // Wait for children load
        await waitForLoadCount(tracker, 2);
        await asyncSetTimeout(20);
        expect(tracker.loadCount).toBe(2);

        // Wait more
        await asyncSetTimeout(200);

        expect(tracker.loadCount).toBe(2);
        await new GridRows(
            api,
            `expanding group with empty children without groupTotalRow does not cause infinit final state`
        ).check(`
            ROOT id:<no-id>
            └── A GROUP id:A ag-Grid-AutoColumn:"Node A" id:"A" name:"Node A"
        `);
    });
});
