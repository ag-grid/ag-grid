import { GridRows, TestGridsManager, waitForEvent, waitForNoLoadingRows } from 'ag-test-utils';

import type { GridApi, GridOptions, ServerSideTransaction } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM group total rows after transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ServerSideRowModelApiModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const LEAVES = [
        { id: 'uk-alice', country: 'UK', athlete: 'Alice', sales: 1 },
        { id: 'uk-bob', country: 'UK', athlete: 'Bob', sales: 2 },
        { id: 'us-frank', country: 'US', athlete: 'Frank', sales: 3 },
    ];
    const GROUP = (country: string, sales: number) => ({ country, sales });

    async function createGroupedGrid(): Promise<GridApi> {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sales', aggFunc: 'sum' },
            ],
            rowModelType: 'serverSide',
            groupTotalRow: 'bottom',
            getRowId: (params) => params.data.id ?? `group-${params.data.country}`,
            serverSideDatasource: {
                getRows: (params) => {
                    const keys = params.request.groupKeys;
                    const rowData = keys.length
                        ? LEAVES.filter((leaf) => leaf.country === keys[0])
                        : [GROUP('UK', 3), GROUP('US', 3)];
                    params.success({ rowData, rowCount: rowData.length });
                },
            },
        };
        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('group-UK')!, true);
        await waitForNoLoadingRows(api);
        return api;
    }

    async function applyAsync(api: GridApi, transactions: ServerSideTransaction[]) {
        let applied = 0;
        for (const transaction of transactions) {
            api.applyServerSideTransactionAsync(transaction, () => applied++);
        }
        api.flushServerSideAsyncTransactions();
        await vi.waitFor(() => expect(applied).toBe(transactions.length));
    }

    test('the total row is rendered below a leaf added in the same flush as group updates and shows the latest group data', async () => {
        const api = await createGroupedGrid();

        await applyAsync(api, [
            { update: [GROUP('UK', 10)] },
            { route: ['UK'], update: [{ ...LEAVES[0], sales: 8 }] },
            { update: [GROUP('UK', 11)] },
            { route: ['UK'], add: [{ id: 'uk-zed', country: 'UK', athlete: 'Zed', sales: 1 }] },
        ]);

        await new GridRows(api, 'after flush').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ ├── LEAF id:uk-alice country:"UK" athlete:"Alice" sales:8
            │ ├── LEAF id:uk-bob country:"UK" athlete:"Bob" sales:2
            │ ├── LEAF id:uk-zed country:"UK" athlete:"Zed" sales:1
            │ └─ footer collapsed id:rowGroupFooter_group-UK ag-Grid-AutoColumn:"Total UK" country:"UK" sales:11
            └── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US" sales:3
        `);
    });

    test('updating a group keeps its existing total row node', async () => {
        const api = await createGroupedGrid();
        const totalRow = api.getRowNode('group-UK')!.sibling;

        await applyAsync(api, [{ update: [GROUP('UK', 10)] }]);

        expect(api.getRowNode('group-UK')!.sibling).toBe(totalRow);
        expect(totalRow.data).toEqual(GROUP('UK', 10));
    });
});
