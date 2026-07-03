import type { IServerSideDatasource, IServerSideGetRowsParams, RowNode } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../../test-utils';

describe('SSRM grouping sticky collapse', () => {
    const gridsManager = new TestGridsManager({
        modules: [RowGroupingModule, ServerSideRowModelModule, ScrollApiModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const CHILDREN_PER_GROUP = 40;
    const GROUPS = ['A', 'B', 'C'];

    function createSingleLevelDatasource(): IServerSideDatasource {
        return {
            getRows(params: IServerSideGetRowsParams) {
                const { groupKeys } = params.request;
                setTimeout(() => {
                    if (groupKeys.length === 0) {
                        params.success({
                            rowData: GROUPS.map((key) => ({ group: key, value: null })),
                            rowCount: GROUPS.length,
                        });
                    } else {
                        const parent = groupKeys[0];
                        params.success({
                            rowData: Array.from({ length: CHILDREN_PER_GROUP }, (_, i) => ({
                                id: `${parent}-${i}`,
                                group: parent,
                                value: i,
                            })),
                            rowCount: CHILDREN_PER_GROUP,
                        });
                    }
                }, 0);
            },
        };
    }

    // Mirrors the CSRM regression test in ../grouping-sticky-collapse.test.ts,
    // but exercises the SSRM code path — ServerSideExpansionService.setExpanded
    // routes through BaseExpansionService.setExpanded where the sticky scroll
    // compensation now lives. The bug was originally reported against SSRM.
    test('collapsing a sticky SSRM group via setExpanded leaves the group row visible', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createSingleLevelDatasource(),
            getRowId: (params) => {
                if (params.data.id) {
                    return params.data.id;
                }
                return `g-${params.data.group}`;
            },
            suppressRowVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await new GridColumns(api, `collapsing a sticky SSRM group via setExpanded leaves the group row visible setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `collapsing a sticky SSRM group via setExpanded leaves the group row visible setup`)
            .check(`
                ROOT id:<no-id>
                └── LEAF_GROUP collapsed id:rowIndex:0
            `);

        await waitForNoLoadingRows(api);

        const groupNode = api.getRowNode('g-A')!;
        expect(groupNode).toBeDefined();

        // Expand group A and wait for children to load.
        groupNode.setExpanded(true);
        await waitForNoLoadingRows(api);

        // Scroll deep into group A's children so A's row falls off the top of
        // the rendered range — the condition under which the bug manifests.
        api.ensureIndexVisible(30, 'top');
        await asyncSetTimeout(0);

        expect(groupNode.rowIndex).toBeLessThan(api.getFirstDisplayedRowIndex());

        // Mimic a custom group cell renderer collapsing the group under SSRM.
        // The call traverses ServerSideExpansionService → BaseExpansionService
        // and must leave the group row within the rendered range.
        groupNode.setExpanded(false);
        await asyncSetTimeout(0);

        expect(groupNode.expanded).toBe(false);
        expect(groupNode.rowIndex).toBeGreaterThanOrEqual(api.getFirstDisplayedRowIndex());
        expect(groupNode.rowIndex).toBeLessThanOrEqual(api.getLastDisplayedRowIndex());
        await new GridRows(
            api,
            `collapsing a sticky SSRM group via setExpanded leaves the group row visible final state`
        ).check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:g-A ag-Grid-AutoColumn:"A" group:"A" value:null
            ├── GROUP-leafGroup collapsed id:g-B ag-Grid-AutoColumn:"B" group:"B" value:null
            └── GROUP-leafGroup collapsed id:g-C ag-Grid-AutoColumn:"C" group:"C" value:null
        `);
    });

    // Documents the batch-collapse behaviour change introduced by moving the
    // sticky scroll compensation into BaseExpansionService.setExpanded:
    //
    // SSRM's ServerSideExpansionService.collapseAll / setExpansionState /
    // resetExpansion all funnel through updateAllNodes → super.setExpanded(node, …)
    // for every node. Any currently-sticky row being collapsed triggers the new
    // compensation. Before this PR, api.collapseAll() on SSRM left scrollTop
    // untouched; after this PR it jumps to the outermost sticky ancestor's
    // natural row position.
    //
    // With multiple nested sticky ancestors, every ancestor's compensated
    // scrollTop computes to the same value (the outermost ancestor's rowTop),
    // so the outcome is deterministic regardless of traversal order.
    const SUBGROUPS = ['1', '2', '3'];

    function createNestedDatasource(): IServerSideDatasource {
        return {
            getRows(params: IServerSideGetRowsParams) {
                const { groupKeys } = params.request;
                setTimeout(() => {
                    if (groupKeys.length === 0) {
                        params.success({
                            rowData: GROUPS.map((g) => ({ id: `g-${g}`, group: g, subgroup: null, value: null })),
                            rowCount: GROUPS.length,
                        });
                    } else if (groupKeys.length === 1) {
                        const g = groupKeys[0];
                        params.success({
                            rowData: SUBGROUPS.map((s) => ({
                                id: `sg-${g}-${s}`,
                                group: g,
                                subgroup: `${g}-${s}`,
                                value: null,
                            })),
                            rowCount: SUBGROUPS.length,
                        });
                    } else {
                        const sub = groupKeys[1];
                        params.success({
                            rowData: Array.from({ length: CHILDREN_PER_GROUP }, (_, i) => ({
                                id: `leaf-${sub}-${i}`,
                                group: groupKeys[0],
                                subgroup: sub,
                                value: i,
                            })),
                            rowCount: CHILDREN_PER_GROUP,
                        });
                    }
                }, 0);
            },
        };
    }

    test('api.collapseAll() with nested sticky groups moves the viewport to the outermost ancestor', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'subgroup', rowGroup: true, hide: true },
                { field: 'value' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createNestedDatasource(),
            getRowId: (params) => params.data.id,
            suppressRowVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await new GridColumns(
            api,
            `api.collapseAll() with nested sticky groups moves the viewport to the outermost  setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `api.collapseAll() with nested sticky groups moves the viewport to the outermost  setup`
        ).check(`
            ROOT id:<no-id>
            └── filler collapsed id:rowIndex:0
        `);

        await waitForNoLoadingRows(api);

        // Expand A, then A-1, and wait for each batch of children.
        const groupA = api.getRowNode('g-A')!;
        groupA.setExpanded(true);
        await waitForNoLoadingRows(api);

        const subgroupA1 = api.getRowNode('sg-A-1')!;
        subgroupA1.setExpanded(true);
        await waitForNoLoadingRows(api);

        // Scroll deep into A-1's leaves so both A and A-1 are pinned as sticky
        // rows at the top of the viewport.
        api.ensureIndexVisible(30, 'top');
        await asyncSetTimeout(0);

        // Pre-condition: both ancestor groups are above the rendered range, i.e.
        // they have scrolled out of flow and into the sticky header stack.
        expect(groupA.rowIndex).toBeLessThan(api.getFirstDisplayedRowIndex());
        expect(subgroupA1.rowIndex).toBeLessThan(api.getFirstDisplayedRowIndex());

        const scrollBefore = api.getVerticalPixelRange().top;
        expect(scrollBefore).toBeGreaterThan(0);

        // The compensated scrollTop for any sticky ancestor is (rowTop − stickyRowTop).
        // For an ancestor chain, this collapses to the outermost ancestor's rowTop
        // regardless of chain position, so the batch outcome is deterministic.
        const expectedScrollTop = groupA.rowTop! - (groupA as RowNode).stickyRowTop;

        // Bulk collapse via the public SSRM api. Internally this runs
        // updateAllNodes → super.setExpanded per node; the sticky check in the
        // base service fires for every currently-sticky group being collapsed.
        api.collapseAll();
        await new GridRows(
            api,
            `api.collapseAll() with nested sticky groups moves the viewport to the outermost  after collapseAll`
        ).check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:g-A ag-Grid-AutoColumn:"A" group:"A" subgroup:null value:null
            ├── GROUP collapsed id:g-B ag-Grid-AutoColumn:"B" group:"B" subgroup:null value:null
            └── GROUP collapsed id:g-C ag-Grid-AutoColumn:"C" group:"C" subgroup:null value:null
        `);
        await asyncSetTimeout(0);

        const scrollAfter = api.getVerticalPixelRange().top;

        // Before this PR, scrollAfter would equal scrollBefore (≈1176). After,
        // it lands on the outermost sticky ancestor's natural position.
        expect(scrollAfter).not.toBe(scrollBefore);
        expect(scrollAfter).toBe(expectedScrollTop);
        expect(groupA.expanded).toBe(false);
        expect(subgroupA1.expanded).toBe(false);
    });
});
