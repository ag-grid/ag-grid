import type { GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

// Characterizes sort behaviour when sorting BY A PIVOT RESULT COLUMN in pivot mode.
// UX contract: the visible group rows reorder by that pivot column's aggregate.
// The hidden leaf rows are not part of the contract (leaves are never displayed in pivot).
describe('pivot: sorting by a pivot result column', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });
    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    test('group rows order by the pivot aggregate; hidden leaf order is not by the pivot column', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            getRowId: ({ data }) => data.id,
        };
        const api: GridApi = gridsManager.createGrid('pivotSort', gridOptions);

        applyTransactionChecked(api, {
            add: [
                // USA has two 2020 leaves in ascending-sales insertion order (id u1=300 before u2=1700).
                { id: 'u1', country: 'USA', year: 2020, sales: 300 },
                { id: 'u2', country: 'USA', year: 2020, sales: 1700 },
                { id: 'ie', country: 'Ireland', year: 2020, sales: 1000 },
                { id: 'de', country: 'Germany', year: 2020, sales: 1500 },
            ],
        });
        await asyncSetTimeout(10);

        // Sort by the 2020 sales pivot result column, descending.
        api.applyColumnState({ state: [{ colId: 'pivot_year_2020_sales', sort: 'desc' }] });
        await asyncSetTimeout(10);

        // Group rows are ordered by the pivot aggregate; USA's leaves keep insertion order (u1 before u2).
        await new GridRows(api, `sorted by pivot result column desc`).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:4500
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000
            │ ├── LEAF hidden id:u1 pivot_year_2020_sales:300
            │ └── LEAF hidden id:u2 pivot_year_2020_sales:1700
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500
            │ └── LEAF hidden id:de pivot_year_2020_sales:1500
            └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1000
            · └── LEAF hidden id:ie pivot_year_2020_sales:1000
        `);

        // UX contract: visible GROUP rows reorder by the pivot aggregate (USA 2000 > Germany 1500 > Ireland 1000).
        const displayedGroups: string[] = [];
        const usaLeafOrder: string[] = [];
        api.forEachNodeAfterFilterAndSort((node: IRowNode) => {
            if (node.group) {
                displayedGroups.push(node.key as string);
            } else if (node.data?.country === 'USA') {
                usaLeafOrder.push(node.id as string);
            }
        });
        expect(displayedGroups).toEqual(['USA', 'Germany', 'Ireland']);

        // Hidden leaves are NOT sorted by the pivot column: they keep insertion order (u1 then u2),
        // not sales-descending (which would be u2 then u1). Leaves are never displayed in pivot, so
        // their order carries no UX contract — this locks in the lean (no pivot redirect) behaviour.
        expect(usaLeafOrder).toEqual(['u1', 'u2']);
    });
});
