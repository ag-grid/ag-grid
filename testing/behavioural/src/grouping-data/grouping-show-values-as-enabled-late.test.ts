import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

/**
 * Turning a mode on writes `column.showValuesAs` and leaves the displayed-column array identity alone,
 * so nothing keyed on that ref can notice the grid gained its first aggregate-dependent column.
 */
describe('showValuesAs enabled after the grid was built without one', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => gridsManager.reset());

    test('the transform follows a later transaction', async () => {
        const api = await gridsManager.createGridAndWait('sva-late', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum' },
            ],
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'B', amount: 70 },
            ],
        });

        const groupCell = (key: string) =>
            document
                .querySelector(`#sva-late [row-id="row-group-country-${key}"] [col-id="amount"]`)
                ?.textContent?.trim();

        expect(groupCell('A')).toBe('30');

        // First aggregate-dependent column in this grid's life.
        api.applyColumnState({ state: [{ colId: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' }] });
        await waitFor(() => expect(groupCell('A')).toBe('30.00%'));

        // A becomes 150 of 220, so the transform must move without the column set changing.
        api.applyTransaction({ update: [{ id: '1', country: 'A', amount: 150 }] });

        await waitFor(() => expect(groupCell('A')).toBe('68.18%'));
    });
});
