import type { GridOptions } from 'ag-grid-community';
import { CellStyleModule, ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../../../../test-utils';

describe('ag-grid groupCellRenderer', () => {
    const gridsManager = new TestGridsManager({ modules: [CellStyleModule, ScrollApiModule, RowGroupingModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('bigint valueFormatter is used for group totals', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                {
                    field: 'amount',
                    cellDataType: 'bigint',
                    aggFunc: 'sum',
                    valueFormatter: (params) => `formatted-${params.value}`,
                },
            ],
            autoGroupColumnDef: {
                cellClass: 'ag-cell-group',
            },
            rowData: [
                { category: 'A', amount: 5n },
                { category: 'A', amount: 7n },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
        };

        const div = document.createElement('div');
        document.body.appendChild(div);
        vi.useFakeTimers();
        const api = gridsManager.createGrid(div, gridOptions);
        await new GridColumns(api, `bigint valueFormatter is used for group totals setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
        await new GridRows(api, `bigint valueFormatter is used for group totals setup`).check(`
            ROOT id:ROOT_NODE_ID amount:"formatted-undefined"
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:"formatted-undefined"
            · ├── LEAF id:0 category:"A" amount:"formatted-5"
            · ├── LEAF id:1 category:"A" amount:"formatted-7"
            · └─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"Total A" amount:"formatted-12"
        `);
        vi.runAllTimers();
        vi.useRealTimers();

        api.ensureIndexVisible(2);
        await new Promise((resolve) => setTimeout(resolve, 0));

        const totalValueCell = div.querySelector<HTMLElement>('.ag-row-footer [col-id="amount"]');
        expect(totalValueCell?.textContent ?? '').toContain('formatted-12');
        await new GridRows(api, `bigint valueFormatter is used for group totals final state`).check(`
            ROOT id:ROOT_NODE_ID amount:"formatted-undefined"
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:"formatted-undefined"
            · ├── LEAF id:0 category:"A" amount:"formatted-5"
            · ├── LEAF id:1 category:"A" amount:"formatted-7"
            · └─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"Total A" amount:"formatted-12"
        `);
    });
});
