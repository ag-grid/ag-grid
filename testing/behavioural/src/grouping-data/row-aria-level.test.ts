import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForNoLoadingRows } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('row hierarchy ARIA levels', () => {
    const grids = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const rowData = [
        { id: 'a', country: 'Ireland', sport: 'Swimming' },
        { id: 'b', country: 'Ireland', sport: 'Swimming' },
    ];

    afterEach(() => grids.reset());

    function getLevels(api: GridApi): (string | null)[] {
        const grid = getGridElement(api)!;
        return Array.from({ length: api.getDisplayedRowCount() }, (_, index) => {
            const id = api.getDisplayedRowAtIndex(index)!.id;
            const row = grid.querySelector(`[role="row"][row-id="${id}"]`);
            expect(row).not.toBeNull();
            return row!.getAttribute('aria-level');
        });
    }

    test.each(['singleColumn', 'multipleColumns', 'groupRows'] as const)(
        'exposes group and leaf levels with %s',
        async (groupDisplayType) => {
            const api = await grids.createGridAndWait('group-levels', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', rowGroup: true },
                ],
                getRowId: ({ data }) => data.id,
                rowData,
                groupDisplayType,
                groupDefaultExpanded: -1,
            });

            expect(getLevels(api)).toEqual(['1', '2', '3', '3']);

            api.setRowGroupColumns(['sport']);
            expect(getLevels(api)).toEqual(['1', '2', '2']);

            api.setRowGroupColumns([]);
            expect(getLevels(api)).toEqual([null, null]);
        }
    );

    test('updates levels when single-child groups are hidden and restored', async () => {
        const api = await grids.createGridAndWait('hidden-group-levels', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', rowGroup: true },
            ],
            rowData,
            groupDefaultExpanded: -1,
            groupHideParentOfSingleChild: true,
        });

        expect(getLevels(api)).toEqual(['1', '2', '2']);
        api.setGridOption('groupHideParentOfSingleChild', false);
        expect(getLevels(api)).toEqual(['1', '2', '3', '3']);
        api.setGridOption('groupHideParentOfSingleChild', true);
        expect(getLevels(api)).toEqual(['1', '2', '2']);
    });

    test('preserves logical depth when open parents are hidden', async () => {
        const api = await grids.createGridAndWait('hidden-open-levels', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', rowGroup: true },
            ],
            rowData,
            groupDefaultExpanded: -1,
            groupHideOpenParents: true,
        });

        expect(getLevels(api)).toEqual(['3', '3']);
        api.collapseAll();
        expect(getLevels(api)).toEqual(['1']);
    });

    test('promotes children of removed leaf groups with multiple group columns', async () => {
        const api = await grids.createGridAndWait('hidden-leaf-group-levels', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', rowGroup: true },
            ],
            rowData: [rowData[0], { ...rowData[1], sport: 'Running' }],
            groupDefaultExpanded: -1,
            groupDisplayType: 'multipleColumns',
            groupHideParentOfSingleChild: 'leafGroupsOnly',
        });

        expect(getLevels(api)).toEqual(['1', '2', '2']);
        api.setGridOption('groupHideParentOfSingleChild', false);
        expect(getLevels(api)).toEqual(['1', '2', '3', '2', '3']);
    });

    test('updates Tree Data levels when a leaf moves to a different parent', async () => {
        const api = await grids.createGridAndWait('tree-levels', {
            columnDefs: [{ field: 'id' }],
            treeData: true,
            getDataPath: (data) => data.path,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: 'parent', path: ['parent'] },
                { id: 'child', path: ['parent', 'child'] },
                { id: 'leaf', path: ['parent', 'child', 'leaf'] },
            ],
            groupDefaultExpanded: -1,
        });

        expect(getLevels(api)).toEqual(['1', '2', '3']);
        api.applyTransaction({ update: [{ id: 'leaf', path: ['parent', 'leaf'] }] });
        expect(getLevels(api)).toEqual(['1', '2', '2']);
    });

    test('omits levels in a flat grid and a single-level pivot, but adds them for nested pivot groups', async () => {
        const api = await grids.createGridAndWait('pivot-levels', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }],
            rowData,
            groupDefaultExpanded: -1,
        });

        expect(getLevels(api)).toEqual([null, null]);
        api.setGridOption('pivotMode', true);
        api.setRowGroupColumns(['country']);
        expect(getLevels(api)).toEqual([null]);
        api.setRowGroupColumns(['country', 'sport']);
        expect(getLevels(api)).toEqual(['1', '2']);
    });

    test.each([false, true])('exposes server-side group and leaf levels (treeData=%s)', async (treeData) => {
        const api = grids.createGrid('server-levels', {
            columnDefs: [{ field: 'country', rowGroup: !treeData }, { field: 'id' }],
            rowModelType: 'serverSide',
            treeData,
            isServerSideGroup: treeData ? (data) => data.id === 'Ireland' : undefined,
            getServerSideGroupKey: treeData ? (data) => data.country : undefined,
            serverSideDatasource: {
                getRows: ({ request, success }) => {
                    const data = request.groupKeys.length ? rowData : [{ id: 'Ireland', country: 'Ireland' }];
                    success({ rowData: data, rowCount: data.length });
                },
            },
        });

        await waitForNoLoadingRows(api);
        expect(getLevels(api)).toEqual(['1']);
        api.getDisplayedRowAtIndex(0)!.setExpanded(true);
        await waitFor(() => expect(getLevels(api)).toEqual(['1', '2', '2']));
    });

    test.each([false, true])(
        'preserves server-side depth except for unbalanced groups (unbalanced=%s)',
        async (unbalanced) => {
            const api = grids.createGrid('server-hidden-levels', {
                columnDefs: [{ field: 'country', rowGroup: true }, { field: 'id' }],
                rowModelType: 'serverSide',
                groupHideOpenParents: !unbalanced,
                groupAllowUnbalanced: unbalanced,
                serverSideDatasource: {
                    getRows: ({ request, success }) => {
                        const data = request.groupKeys.length ? rowData : [{ country: unbalanced ? '' : 'Ireland' }];
                        success({ rowData: data, rowCount: data.length });
                    },
                },
            });

            await waitForNoLoadingRows(api);
            if (!unbalanced) {
                api.getDisplayedRowAtIndex(0)!.setExpanded(true);
            }
            await waitFor(() => expect(getLevels(api)).toEqual(unbalanced ? ['1', '1'] : ['2', '2']));
        }
    );
});
