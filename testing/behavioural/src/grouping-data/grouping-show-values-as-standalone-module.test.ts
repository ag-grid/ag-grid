import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ShowValuesAsModule } from 'ag-grid-enterprise';

/**
 * The transform reads aggData, which only AggregationStage writes, so registering ShowValuesAsModule
 * without the module that provides the stage transformed every cell to blank.
 */
describe('showValuesAs registered without a grouping module', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ShowValuesAsModule],
    });

    afterEach(() => gridsManager.reset());

    test('percentOfGrandTotal transforms on a flat grid', async () => {
        await gridsManager.createGridAndWait('sva-standalone', {
            columnDefs: [{ field: 'name' }, { field: 'amount', showValuesAs: 'percentOfGrandTotal' }],
            rowData: [
                { name: 'a', amount: 25 },
                { name: 'b', amount: 75 },
            ],
        });

        const amountAt = (row: number) =>
            document.querySelector(`#sva-standalone [row-index="${row}"] [col-id="amount"]`)?.textContent?.trim();

        await waitFor(() => expect(amountAt(0)).toBe('25.00%'));
        expect(amountAt(1)).toBe('75.00%');
    });
});
