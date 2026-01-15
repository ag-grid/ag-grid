import type { GridOptions } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';

describe('ag-grid groupCellRenderer', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

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
        vi.runAllTimers();
        vi.useRealTimers();

        api.ensureIndexVisible(2);
        await new Promise((resolve) => setTimeout(resolve, 0));

        const totalValueCell = div.querySelector<HTMLElement>('.ag-row-footer [col-id="amount"]');
        expect(totalValueCell?.textContent ?? '').toContain('formatted-12');
    });
});
