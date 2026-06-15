import { ClientSideRowModelModule, NumberEditorModule } from 'ag-grid-community';
import { BatchEditModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('showValueAs with batch editing', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, BatchEditModule, NumberEditorModule, ShowValueAsModule],
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
                    showValueAs: { type: 'differenceFrom', params: { base: { value: 100 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', amount: 150 }],
        });
        const rowNode = api.getRowNode('1')!;
        const cell = () => document.querySelector<HTMLElement>('#sva-batch-edit [row-index="0"] [col-id="amount"]')!;

        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'transformed' })).toBe(50);
        expect(cell()).not.toHaveClass('ag-cell-batch-edit');

        api.startBatchEdit();
        rowNode.setDataValue('amount', 200);
        await asyncSetTimeout(1);

        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'data' })).toBe(150);
        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'edit' })).toBe(200);
        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'transformed' })).toBe(100);
        expect(cell()).toHaveTextContent('100');
        expect(cell()).toHaveClass('ag-cell-batch-edit');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'data' })).toBe(150);
        expect(api.getCellValue({ rowNode, colKey: 'amount', from: 'transformed' })).toBe(50);
        expect(cell()).toHaveTextContent('50');
        expect(cell()).not.toHaveClass('ag-cell-batch-edit');
    });
});
