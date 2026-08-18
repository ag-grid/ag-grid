import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, NumberEditorModule } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

describe('showValuesAs with batch editing', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, BatchEditModule, NumberEditorModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('transforms the pending batch value and marks the staged cell as batch edited', async () => {
        const api = await gridsManager.createGridAndWait('sva-batch-edit', {
            columnDefs: [
                {
                    field: 'amount',
                    editable: true,
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 150 },
                { id: '2', amount: 50 }, // grand total 200 → row 1 transforms to 150/200 = 0.75
            ],
        });
        const rowNode = api.getRowNode('1')!;
        const cell = () => document.querySelector<HTMLElement>('#sva-batch-edit [row-index="0"] [col-id="amount"]')!;

        expect(api.getCellValue({ rowNode, colKey: 'amount', transformValues: true })).toBe(0.75);
        expect(cell()).not.toHaveClass('ag-cell-batch-edit');

        api.startBatchEdit();
        rowNode.setDataValue('amount', 200);
        // The cell rendered "75.00%" before the staged edit, so this cannot pass before it lands.
        await waitFor(() => expect(cell()).toHaveTextContent('100.00%'));

        // Batch edit stages the value without re-aggregating: the transform divides the pending 200 by the
        // original grand total of 200 → 1.0 (100%).
        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'data' })).toBe(150);
        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'edit' })).toBe(200);
        expect(api.getCellValue({ rowNode, colKey: 'amount', transformValues: true })).toBe(1);
        expect(cell()).toHaveTextContent('100.00%');
        expect(cell()).toHaveClass('ag-cell-batch-edit');

        api.cancelBatchEdit();
        // The cell rendered "100.00%" while the edit was staged, so this cannot pass before the cancel lands.
        await waitFor(() => expect(cell()).toHaveTextContent('75.00%'));

        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'data' })).toBe(150);
        expect(api.getCellValue({ rowNode, colKey: 'amount', transformValues: true })).toBe(0.75);
        expect(cell()).toHaveTextContent('75.00%');
        expect(cell()).not.toHaveClass('ag-cell-batch-edit');
    });
});
