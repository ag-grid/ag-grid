import type { GridApi, IRowNode, RowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../columnToolPanel/deferredPivotModeFakeServer';
import { GridRows, TestGridsManager, waitForNoLoadingRows } from '../test-utils';

// In pivot mode the deepest row-group level is a leaf group: node.isExpandable() returns false and no
// chevron is shown. The write paths (setExpanded / expandAll) must respect this too, so expansion behaves
// identically for manual interaction, expandAll() and setExpanded(), and matches CSRM<->SSRM.
describe('pivot leaf group expansion', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, PivotModule, RowGroupingModule, ServerSideRowModelModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const rowData = [
        { country: 'USA', year: 2000, gold: 1 },
        { country: 'USA', year: 2004, gold: 2 },
        { country: 'Russia', year: 2000, gold: 3 },
        { country: 'Russia', year: 2004, gold: 4 },
    ];

    const columnDefs = [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold', aggFunc: 'sum' },
    ];

    // SSRM grouping requires a getRowId callback; ids are built from the group key at each level.
    const getRowId = ({ data, level, parentKeys }: { data: any; level: number; parentKeys?: string[] }): string => {
        const key = level === 0 ? data.country : data.year;
        return [...(parentKeys ?? []), key].join('-');
    };

    const yearNodes = (api: GridApi): IRowNode[] => {
        const nodes: IRowNode[] = [];
        api.forEachNode((node) => {
            if (node.group && node.level === 1) {
                nodes.push(node);
            }
        });
        return nodes;
    };

    describe('CSRM', () => {
        test('year leaf groups are not expandable and stay collapsed under expandAll / setExpanded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pivotMode: true,
                rowData,
            });

            api.expandAll();
            const years = yearNodes(api);
            expect(years.length).toBe(4);
            for (const year of years) {
                expect(year.leafGroup).toBe(true);
                expect(year.isExpandable()).toBe(false);
                expect(year.expanded).toBe(false);
            }

            // setExpanded(true) directly on a leaf group must be a no-op.
            years[0].setExpanded(true);
            expect(years[0].expanded).toBe(false);

            await new GridRows(api, 'CSRM pivot expandAll').check(`
                ROOT id:ROOT_NODE_ID gold:10
                ├─┬ filler id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:3
                │ ├─┬ LEAF_GROUP collapsed id:row-group-country-USA-year-2000 ag-Grid-AutoColumn:2000 gold:1
                │ │ └── LEAF hidden id:0 country:"USA" year:2000 gold:1
                │ └─┬ LEAF_GROUP collapsed id:row-group-country-USA-year-2004 ag-Grid-AutoColumn:2004 gold:2
                │ · └── LEAF hidden id:1 country:"USA" year:2004 gold:2
                └─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:7
                · ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia-year-2000 ag-Grid-AutoColumn:2000 gold:3
                · │ └── LEAF hidden id:2 country:"Russia" year:2000 gold:3
                · └─┬ LEAF_GROUP collapsed id:row-group-country-Russia-year-2004 ag-Grid-AutoColumn:2004 gold:4
                · · └── LEAF hidden id:3 country:"Russia" year:2004 gold:4
            `);
        });
    });

    describe('SSRM', () => {
        test.each([false, true])(
            'year leaf groups stay collapsed under expandAll (ssrmExpandAllAffectsAllRows=%s)',
            async (ssrmExpandAllAffectsAllRows) => {
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    pivotMode: true,
                    rowModelType: 'serverSide',
                    serverSideDatasource: createServerSideDatasource(createFakeServer(rowData as any)),
                    getRowId,
                    ssrmExpandAllAffectsAllRows,
                });
                await waitForNoLoadingRows(api);

                // Pre-expand both countries so their year leaf groups are already loaded when expandAll runs;
                // this exercises the updateAllNodes / strategy.expandAll write paths directly (not just
                // open-by-default on freshly-loaded nodes).
                api.getRowNode('USA')!.setExpanded(true);
                api.getRowNode('Russia')!.setExpanded(true);
                await waitForNoLoadingRows(api);
                expect(yearNodes(api).length).toBe(4);

                api.expandAll();
                await waitForNoLoadingRows(api);

                const years = yearNodes(api);
                expect(years.length).toBe(4);
                for (const year of years) {
                    expect(year.leafGroup).toBe(true);
                    expect(year.isExpandable()).toBe(false);
                    expect(year.expanded).toBe(false);
                    expect((year as RowNode).childStore).toBeFalsy();
                }

                // country groups expanded, year leaf groups collapsed with no children loaded.
                await new GridRows(api, 'SSRM pivot expandAll').check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP id:Russia ag-Grid-AutoColumn:"Russia" country:"Russia" gold:7
                    │ ├── GROUP-leafGroup collapsed id:Russia-2000 ag-Grid-AutoColumn:"2000" year:"2000" gold:3
                    │ └── GROUP-leafGroup collapsed id:Russia-2004 ag-Grid-AutoColumn:"2004" year:"2004" gold:4
                    └─┬ GROUP id:USA ag-Grid-AutoColumn:"USA" country:"USA" gold:3
                    · ├── GROUP-leafGroup collapsed id:USA-2000 ag-Grid-AutoColumn:"2000" year:"2000" gold:1
                    · └── GROUP-leafGroup collapsed id:USA-2004 ag-Grid-AutoColumn:"2004" year:"2004" gold:2
                `);
            }
        );

        test('setExpanded(true) on a year leaf group is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pivotMode: true,
                rowModelType: 'serverSide',
                serverSideDatasource: createServerSideDatasource(createFakeServer(rowData as any)),
                getRowId,
            });
            await waitForNoLoadingRows(api);

            const usa = api.getRowNode('USA')!;
            usa.setExpanded(true);
            await waitForNoLoadingRows(api);

            const years = yearNodes(api);
            expect(years.length).toBeGreaterThan(0);
            const year = years[0];
            expect(year.isExpandable()).toBe(false);

            year.setExpanded(true);
            await waitForNoLoadingRows(api);

            expect(year.expanded).toBe(false);
            expect((year as RowNode).childStore).toBeFalsy();

            // The no-op records no intent: the leaf group must not leak into the serialized expansion state.
            const expandedIds = api.getState().rowGroupExpansion?.expandedRowGroupIds ?? [];
            expect(expandedIds).toContain('USA');
            expect(expandedIds).not.toContain(year.id);

            // USA expanded, its year leaf groups collapsed; Russia still collapsed.
            await new GridRows(api, 'SSRM pivot setExpanded on leaf group').check(`
                ROOT id:<no-id>
                ├── GROUP collapsed id:Russia ag-Grid-AutoColumn:"Russia" country:"Russia" gold:7
                └─┬ GROUP id:USA ag-Grid-AutoColumn:"USA" country:"USA" gold:3
                · ├── GROUP-leafGroup collapsed id:USA-2000 ag-Grid-AutoColumn:"2000" year:"2000" gold:1
                · └── GROUP-leafGroup collapsed id:USA-2004 ag-Grid-AutoColumn:"2004" year:"2004" gold:2
            `);
        });
    });
});
