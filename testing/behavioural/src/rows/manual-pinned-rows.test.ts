import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, RowNode, RowPinnedType } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

function assertPinnedRows(api: GridApi, floating: NonNullable<RowPinnedType>, ids: any[]): void {
    const pinnedNodes: RowNode[] = [];
    api.forEachPinnedRow(floating, (node) => {
        pinnedNodes.push(node as RowNode);
    });

    expect(pinnedNodes).toHaveLength(ids.length);
    expect(pinnedNodes.map((p) => p.id)).toEqual(ids);
}

describe('Manual pinned rows', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowGroupingModule] });

    const columnDefs = [{ field: 'sport' }];
    const rowData = [
        { sport: 'football' },
        { sport: 'rugby' },
        { sport: 'tennis' },
        { sport: 'cricket' },
        { sport: 'golf' },
        { sport: 'swimming' },
        { sport: 'rowing' },
    ];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Setting `grandTotalRow` to non-pinned value does not reset pinned row state', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'bottom',
        });

        await asyncSetTimeout(5);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        api.setGridOption('grandTotalRow', 'top');

        await asyncSetTimeout(5);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);
    });

    test('Setting `grandTotalRow` to pinned value does not reset pinned row state', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'bottom',
        });

        await asyncSetTimeout(5);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        api.setGridOption('grandTotalRow', 'pinnedTop');

        await asyncSetTimeout(5);

        assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID', 't-top-0-rugby']);
    });

    test('grand total row can be pinned without `enableRowPinning`', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            grandTotalRow: 'pinnedBottom',
        });

        await asyncSetTimeout(5);

        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
    });

    test('can move position of pinned grand total row with `grandTotalRow`', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'pinnedBottom',
        });
        await asyncSetTimeout(5);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);
        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);

        api.setGridOption('grandTotalRow', 'pinnedTop');
        await asyncSetTimeout(5);

        assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID', 't-top-0-rugby']);
    });
});
